import argparse
import requests
import os
import sys
import time
import math
import json
import glob

import typing
from typing import List, Tuple

# 5 mb parts
PART_SIZE: int = 64 * 1024 * 1024
MAX_RETRIES = 8 # Max number of retries to upload each PART_SIZE part
# MAX_RETRIES = 8 # Max number of retries to upload each PART_SIZE part

# base_url = "https://api-martinfosco-ui76-api51-db.scp-staging.biomage.net/v2"
# base_url = "http://localhost:3000/v2"

default_prod_api_url = "https://api.scp.biomage.net/v2"

base_url = os.environ.get('PARSE_API_URL') or default_prod_api_url

RESUME_PARAMS_PATH = "resume_params.txt"
ETAGS_PATH = "part_etags.txt"

CURSOR_UP_ONE = "\x1b[1A" 
ERASE_LINE = "\x1b[2K"
FLUSH_TWO_LINES = CURSOR_UP_ONE + ERASE_LINE

def wipe_file(file_path):
    with open(file_path, "w"):
        pass

def get_resume_params_from_file():
    if not os.path.exists(RESUME_PARAMS_PATH):
        raise Exception(f"No resume params file {RESUME_PARAMS_PATH} found")

    with open(RESUME_PARAMS_PATH, 'r') as file:
        lines = file.read().splitlines()

        if len(lines) != 6:
            raise Exception(f"Resume params file {RESUME_PARAMS_PATH} corrupted")

        analysis_id = lines[0]
        upload_params = json.loads(lines[1])
        current_file_created = bool(lines[2])
        file_paths = lines[3].split(',')
        current_file_index = int(lines[4])
        parts_offset = int(lines[5])

        return (analysis_id, upload_params, file_paths, current_file_index, parts_offset, current_file_created)

# Manages 
# - the parameters required for upload,
# - the upload progress (both parts and files)
# - persisting the current upload so that it is resumable
class UploadTracker:
    def __init__(self, analysis_id: str, file_paths: list[str], current_file_index: int, parts_offset: int, upload_params, current_file_created, api_token) -> None:
        self.analysis_id = analysis_id
        self.file_paths = file_paths
        self.current_file_index = current_file_index
        self.current_file_created = current_file_created
        self.parts_offset = parts_offset
        self.upload_params = upload_params
        self.api_token = api_token

    @classmethod
    def fromScratch(cls, analysis_id, file_paths, api_token):
        # Starting from scratch, so wipe files
        cls.wipe_current_upload()

        return cls(analysis_id, file_paths, 0, 0, None, False, api_token)

    @classmethod
    def fromResumeFile(cls, api_token):
        (
            analysis_id,
            upload_params,
            file_paths,
            current_file_index,
            parts_offset,
            current_file_created
        ) = get_resume_params_from_file()
        
        return cls(analysis_id, file_paths, current_file_index, parts_offset, upload_params, current_file_created, api_token)

    @classmethod
    def wipe_current_upload(cls):
        wipe_file(ETAGS_PATH)
        wipe_file(RESUME_PARAMS_PATH)

    def save_progress(self):
        with open(RESUME_PARAMS_PATH, 'w') as file:
            file.write('\n'.join([
                f"{self.analysis_id}",
                json.dumps(self.upload_params),
                str(self.current_file_created),
                f"{','.join(self.file_paths)}",
                f"{self.current_file_index}",
                f"{self.parts_offset}"
            ]))

    def get_upload_params(self) -> dict:
        if (self.upload_params == None or not self.current_file_created):
            self.upload_params = begin_multipart_upload(self.analysis_id, self.file_paths[self.current_file_index], self.api_token)
            self.current_file_created = True
            self.save_progress()

        return self.upload_params

    def get_current_progress(self):
        return (self.analysis_id, self.file_paths[self.current_file_index], self.parts_offset)
    
    def get_parts_etags(self):
        if not os.path.exists(ETAGS_PATH):
            raise Exception(f"File {ETAGS_PATH} doesn't exist")

        with open(ETAGS_PATH, 'r') as file:
            lines = file.read().splitlines()
            return [{'PartNumber': int(line.split(',')[0]), 'ETag': line.split(',')[1].strip("")} for line in lines]
    
    def get_finished(self):
        return self.current_file_index >= len(self.file_paths)

    def file_uploaded(self):
        self.current_file_index += 1
        self.parts_offset = 0
        self.current_file_created = False

        self.save_progress()
        
        # Wipe PART_ETAGS_PATH file, upload was completed 
        with open(ETAGS_PATH, 'w'):
            pass

    def part_uploaded(self, part_number, etag):
        with open(ETAGS_PATH, "a") as file:
            # write etag without the double commas
            file.write(f"{part_number},{etag}")
            file.write('\n')

        self.parts_offset = self.parts_offset + 1

        self.save_progress()

class ProgressDisplayer:
    def __init__(self, total: int, progress: int, file_path: str):
        self.total = total
        self.progress = progress
        self.file_path = file_path

    def begin(self):
        self._display_progress()

    def increment(self):
        self.progress += 1
        self._display_progress()

    def finish(self):
        self.progress = self.total
        self._display_progress()
        
        sys.stdout.write(FLUSH_TWO_LINES)
        sys.stdout.write(f"\rUploaded file {self.file_path}\n")
        print()  # Move to the next line

    def _display_progress(self):
        percentage = (self.progress / self.total) * 100 
        progress_bar = '#' * int(percentage // 2)

        sys.stdout.write(FLUSH_TWO_LINES)
        
        sys.stdout.write(f"\rUploading file {self.file_path}\n")
        sys.stdout.write(f"\rProgress: [{progress_bar:<50}] {percentage:.2f}%")

# Manages the upload of a single file
class FileUploader:
    def __init__(self, analysis_id, api_token, upload_tracker: UploadTracker) -> None:
        self.analysis_id = analysis_id
        self.api_token = api_token
        self.upload_tracker = upload_tracker

        # These will be obtained from begin_multipart_upload()
        self.upload_id = None
        self.key = None
        self.file_id = None

    def get_signed_url_for_part(self, part_number) -> str:
        response = requests.post(
            f"{base_url}/analysis/{self.analysis_id}/cliUpload/{self.upload_id}/part/{part_number}/signedUrl",
            headers={"x-api-token": f"Bearer {self.api_token}"},
            json={"key": self.key},
        )
        
        if response.status_code != 200:
            # TODO Add retry mechanic
            raise Exception(f"Failed to get signed url for part {part_number}: {response.text}")

        signed_url = response.json()
        return signed_url

    def complete_multipart_upload(self, parts) -> None:
        sys.stdout.flush()
        sys.stdout.write(f"\r\033[KCompleting upload, this could take a few minutes with larger files")
        
        response = requests.post(
            f"{base_url}/analysis/{self.analysis_id}/cliUpload/CompleteMultipartUpload",
            headers={"X-Api-Token": f"Bearer {self.api_token}"},
            json={
                "key": self.key,
                "uploadId": self.upload_id,
                "parts": parts,
                "fileId": self.file_id,
            },
        )

        if response.status_code != 200:
            # TODO Add retry mechanic
            raise Exception(f"Failed to complete upload for file {self.file_id}: {response.text}")

    def upload_part(self, part, part_number, try_number = 0) -> str:
        try:
            signed_url = self.get_signed_url_for_part(part_number)

            response = requests.put(signed_url, data=part)

            if response.status_code != 200:
                raise Exception(f"Failed to upload part {part_number}: {response.text}")

            return response.headers['ETag']

        except Exception as e:
            if try_number >= MAX_RETRIES:
                raise e

            wait_seconds = 2**try_number

            sys.stdout.flush()
            sys.stdout.write(f"\r\033[KError uploading, retrying in {wait_seconds} seconds")
            sys.stdout.flush()

            time.sleep(wait_seconds)

            etag = self.upload_part(part, part_number, try_number + 1)

            # Clear the error message
            sys.stdout.write("\r\033[K")
            sys.stdout.flush()

            return etag
            
    # Uploads a file in parts, beginning from the parts_offset
    def upload_file(self, file_path: str, parts_offset: int) -> None:
        file_size = os.path.getsize(file_path)
        amount_of_parts = math.ceil(file_size/PART_SIZE)
        
        progress_displayer = ProgressDisplayer(amount_of_parts, parts_offset, file_path)
        progress_displayer.begin()


        upload_params = self.upload_tracker.get_upload_params()

        self.upload_id = upload_params["uploadId"]
        self.key = upload_params["key"]
        self.file_id = upload_params["fileId"]

        with open(file_path, 'rb') as file:
            file.seek(parts_offset * PART_SIZE)
            part = file.read(PART_SIZE)

            # part_number is 1-indexed
            part_number = parts_offset + 1

            while part:
                etag = self.upload_part(part, part_number)

                self.upload_tracker.part_uploaded(part_number, etag)
                progress_displayer.increment()

                part = file.read(PART_SIZE)
                part_number += 1

        progress_displayer.finish()
        self.complete_multipart_upload(self.upload_tracker.get_parts_etags())

def upload_all_files(api_token: str, upload_tracker: UploadTracker) -> None:
    while not upload_tracker.get_finished():
        (analysis_id, current_file, parts_offset) = upload_tracker.get_current_progress()
        
        uploader = FileUploader(analysis_id, api_token, upload_tracker)
        uploader.upload_file(current_file, parts_offset)

        upload_tracker.file_uploaded()
    
    # Finished upload, so wipe the resume files
    UploadTracker.wipe_current_upload()
    print()
    print("Upload completed successfully!")

def begin_multipart_upload(analysis_id, file_path, api_token) -> dict:
        file_name = os.path.basename(file_path)
        file_size = os.path.getsize(file_path)

        url = f"{base_url}/analysis/{analysis_id}/cliUpload/begin"

        response = requests.post(
            url,
            headers={"X-Api-Token": f"Bearer {api_token}"},
            json={"name": file_name, "size": file_size},
        )

        if response.status_code != 200:
            if (response.status_code == 409):
                raise Exception(f"File {file_path} already exists in the pipeline, please remove the existing one before uploading a new one")

            raise Exception(f"Failed to begin upload for file {file_path}: {response.text}")

        upload_params = response.json()

        return upload_params

# Show a warning if there is a previous upload that can be resumed
def show_resume_option():
    if os.path.exists(RESUME_PARAMS_PATH):
        (analysis_id, upload_params, file_paths, current_file_index, parts_offset) = None, None, None, None, None

        try:
            (
                analysis_id,
                upload_params,
                file_paths,
                current_file_index,
                parts_offset,
                current_file_created
            ) = get_resume_params_from_file()

        # Ignore file if it is corrupted
        except Exception as e:
           return False 

        # analysis_id, upload_params, file_paths, current_file_index, parts_offset
        print(f"It seems an interrupted upload for analysis id: {analysis_id} can be resumed, or will be lost if a new upload is started")
        print()
        print(f"It included the following files:")
        print("\n".join(file_paths))
        print("")

        # Prompt the user to confirm that they want to overwrite the previous upload that can be resumed
        
        the_input = input("Write 'resume' and press ENTER to resume this analysis instead of starting a new one, otherwise just press ENTER to continue with the new upload: ")
        if the_input == "resume":
            return True

    return False

def show_files_to_upload_warning(file_paths):
    # Print the files that will be uploaded dand wait for the user to say "yes
    print("New upload: the following files will be uploaded:")
    print("\n".join(file_paths))
    print("")
    print("If these are the correct files, press ENTER. Otherwise write \"no\" and press ENTER to cancel the upload.")
    the_input = input()
    if the_input == "no":
        raise Exception("Upload cancelled")

# Performs all of the pre-upload validation and parameter checks
def prepare_upload(args) -> UploadTracker:
    non_resumable_args = args.run_id or args.file
    
    if (non_resumable_args and args.resume):
        raise Exception("If resuming a previous upload, only -r / --resume flag and -t / --token are needed, nothing else is allowed")

    if (not args.token):
        raise Exception("No token provided. Please specify the token with the --token option or the PARSE_CLOUD_TOKEN environment variable.")

    resume = args.resume or show_resume_option()

    if (not resume):
        if not args.run_id:
            raise Exception("Analysis ID is required")
        
        if not args.file:
            raise Exception("At least one file is required")

    upload_tracker = None
    if (resume):
        upload_tracker = UploadTracker.fromResumeFile(args.token)
    else:
        # Take list of glob patterns and expand and flatten them into a list of files
        files = [file for glob_pattern in args.file for file in glob.glob(glob_pattern)]

        upload_tracker = UploadTracker.fromScratch(args.run_id, files, args.token)

    # Check that the files look like fastqs
    for file_path in upload_tracker.file_paths:
        if (not file_path.endswith(".fastq.gz")):
            raise Exception(f"File {file_path} does not end with .fastq.gz, only gzip compressed fastq files are supported")

    if (not resume):
        show_files_to_upload_warning(upload_tracker.file_paths)

    return upload_tracker

def main():
    parser = argparse.ArgumentParser(description='Perform a multipart upload to S3.')
    parser.add_argument('-id', '--run_id', required=False, help='The run id')
    parser.add_argument('-t', '--token', required=False, default=os.environ.get('PARSE_CLOUD_TOKEN'), help='The upload token, can be obtained from the browser application')
    parser.add_argument('-f', '--file', nargs='*', required=False, help='A space-separated list of files, glob patterns are accepted')
    parser.add_argument('-r', '--resume', action='store_true', help='Resume an interrupted upload')
    
    args = parser.parse_args()

    try :
        upload_tracker = prepare_upload(args)
        
        upload_all_files(args.token, upload_tracker)
    except Exception as e:
        print()
        print(e)
        sys.exit(1)

if __name__ == '__main__':
    main()
