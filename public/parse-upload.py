import argparse
import urllib.request
import urllib.error
import os
import sys
import time
import math
import json
import glob

from concurrent.futures import ThreadPoolExecutor
from threading import Lock, Event

from typing import List, Tuple
from concurrent.futures import wait

PART_SIZE: int = 5 * 1024 * 1024
# MAX_RETRIES = 8 # Max number of retries to upload each PART_SIZE part
MAX_RETRIES = 4 # Max number of retries to upload each PART_SIZE part
THREADS_COUNT = 20

# To run other than in production, run the following environment command: export PARSE_API_URL=<api-base-url>
# Possible values for <api-base-url> include:
# -     Locally: "http://localhost:3000/v2"
# -     current staging: "https://api-martinfosco-ui76-api51-db.scp-staging.biomage.net/v2"
# -     staging secondary master: "https://api-secondary-analysis-master.scp-staging.biomage.net/v2"
# -     staging default: "https://api-default.scp-staging.biomage.net/v2"

default_prod_api_url = "https://api.scp.biomage.net/v2"

base_url = os.environ.get('PARSE_API_URL') or default_prod_api_url

RESUME_PARAMS_PATH = "resume_params.txt"
ETAGS_PATH = "part_etags.txt"

CURSOR_UP_ONE = "\x1b[1A" 
# ERASE_CURRENT_LINE = ""
# ERASE_UPPER_LINE = ""
ERASE_CURRENT_LINE = "\x1b[2K"
ERASE_UPPER_LINE = CURSOR_UP_ONE + ERASE_CURRENT_LINE

def wipe_file(file_path):
    with open(file_path, "w"):
        pass

def get_resume_params_from_file():
    if not os.path.exists(RESUME_PARAMS_PATH):
        raise Exception(f"No resume params file {RESUME_PARAMS_PATH} found")

    with open(RESUME_PARAMS_PATH, 'r') as file:
        lines = file.read().splitlines()

        if len(lines) != 6:
            raise Exception(f"Resume params file {RESUME_PARAMS_PATH} corrupted. Delete the files that didn't finish and upload them without resume")

        analysis_id = lines[0]
        upload_params = json.loads(lines[1])
        current_file_created = lines[2] == "True"
        file_paths = lines[3].split(',')
        current_file_index = int(lines[4])
        completed_parts_by_thread = [int(offset_str) for offset_str in lines[5].split(',')]

        return (analysis_id, upload_params, file_paths, current_file_index, completed_parts_by_thread, current_file_created)

def with_retry(func, try_number = 0):
    try:
        return func()
    except Exception as e:
        if try_number >= MAX_RETRIES:
            raise e
        
        wait_seconds = 2**try_number

        time.sleep(wait_seconds)
        
        return with_retry(func, try_number + 1)

class HTTPResponse:
    def __init__(self, response, response_data: bytes | None = None) -> None:
        self._response = response
        self._response_data = response_data
        self._is_error = isinstance(self._response, Exception)
    
    def json(self):
        if (self._response_data == None):
            raise Exception("No data to parse into json")

        return json.loads(self._response_data)
    
    @property 
    def text(self):
        return self._response.reason

    @property
    def headers(self):
        return dict(self._response.getheaders())

    @property
    def status_code(self):
        if (self._is_error):
            if (isinstance(self._response, urllib.error.HTTPError)):
                return self._response.code
            
            return None

        return self._response.status

def http_put_part(signed_url, data):
    headers = {"Content-Type": "application/octet-stream"}
    request = urllib.request.Request(signed_url, data=data, headers=headers, method="PUT")

    try:
        with urllib.request.urlopen(request) as response:
            return HTTPResponse(response)

    except Exception as e:
        return HTTPResponse(e)
    
def http_post(url, headers, json_data = {}) -> HTTPResponse:
    headers["Content-Type"] = "application/json"
    data = json.dumps(json_data).encode("utf-8")
    
    try:
        request = urllib.request.Request(url, data=data, headers=headers, method="POST")
        response = urllib.request.urlopen(request)

        # with urllib.request.urlopen(request) as response:
        return HTTPResponse(response, response.read())

    except Exception as e:
        return HTTPResponse(e)

# Manages 
# - the parameters required for upload,
# - the upload progress (both parts and files)
# - persisting the current upload so that it is resumable
class UploadTracker:
    def __init__(self, analysis_id: str, file_paths: list[str], current_file_index: int, completed_parts_by_thread: list[int], upload_params, current_file_created, api_token) -> None:
        self.analysis_id = analysis_id
        self.file_paths = file_paths
        self.current_file_index = current_file_index
        self.current_file_created = current_file_created
        self.completed_parts_by_thread = completed_parts_by_thread
        self.upload_params = upload_params
        self.api_token = api_token

        self.files_lock = Lock()

    @classmethod
    def fromScratch(cls, analysis_id, file_paths, threads_count, api_token):
        # Starting from scratch, so wipe files
        cls.wipe_current_upload()

        completed_parts_by_thread = [0] * threads_count

        return cls(analysis_id, file_paths, 0, completed_parts_by_thread, None, False, api_token)

    @classmethod
    def fromResumeFile(cls, api_token):
        (
            analysis_id,
            upload_params,
            file_paths,
            current_file_index,
            completed_parts_by_thread,
            current_file_created,
        ) = get_resume_params_from_file()

        return cls(analysis_id, file_paths, current_file_index, completed_parts_by_thread, upload_params, current_file_created, api_token)

    @classmethod
    def delete_temp_files(cls):
        os.remove(ETAGS_PATH)
        os.remove(RESUME_PARAMS_PATH)

    # Keeps the files but leaves them empty
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
                f"{','.join([str(offset) for offset in self.completed_parts_by_thread])}"
            ]))

    def get_upload_params(self) -> dict:
        if (not self.current_file_created):
            self.upload_params = begin_multipart_upload(self.analysis_id, self.file_paths[self.current_file_index], self.api_token)
            self.current_file_created = True
            self.save_progress()

        return self.upload_params

    def get_current_progress(self):
        return (self.analysis_id, self.file_paths[self.current_file_index], self.completed_parts_by_thread)
    
    def get_parts_etags(self):
        if not os.path.exists(ETAGS_PATH):
            raise Exception(f"File {ETAGS_PATH} doesn't exist")

        with open(ETAGS_PATH, 'r') as file:
            lines = file.read().splitlines()
            return [{'PartNumber': int(line.split(',')[0]), 'ETag': line.split(',')[1].strip("")} for line in lines]
    
    def is_finished(self):
        return self.current_file_index >= len(self.file_paths)

    def file_uploaded(self):
        self.current_file_index += 1
        self.completed_parts_by_thread = [0] * len(self.completed_parts_by_thread)
        self.current_file_created = False

        self.save_progress()
        
        # Wipe PART_ETAGS_PATH file, upload was completed 
        with open(ETAGS_PATH, 'w'):
            pass

    def part_uploaded(self, thread_index, part_number, etag):
        with self.files_lock:
            with open(ETAGS_PATH, "a") as file:
                # write etag without the double commas
                file.write(f"{part_number},{etag}")
                file.write('\n')

            self.completed_parts_by_thread[thread_index] += 1

            self.save_progress()

class ProgressDisplayer():
    def __init__(self, total: int, progress: int, file_path: str):
        super().__init__()

        self.total = total
        self.progress = progress
        self.file_path = file_path
        self.increase_lock = Lock()

    def begin(self):
        self._display_progress()

    def increment(self):
        with self.increase_lock:
            self.progress += 1
            self._display_progress()

    def show_completing(self):
        sys.stdout.write(f"\r\033[KCompleting upload, this could take a few minutes with larger files")

    def finish(self):
        sys.stdout.write(ERASE_CURRENT_LINE)
        sys.stdout.write(ERASE_UPPER_LINE)
        sys.stdout.write(f"\rUploaded file {self.file_path}\n")
        print()  # Move to the next line

    def _display_progress(self):
        percentage = (self.progress / self.total) * 100 
        progress_bar = '#' * int(percentage // 2)

        sys.stdout.write(ERASE_UPPER_LINE)
        
        sys.stdout.write(f"\rUploading file {self.file_path}\n")
        sys.stdout.write(f"\rProgress: [{progress_bar:<50}] {percentage:.2f}%")

# Manages the upload of a single file
class FileUploader:
    def __init__(self, upload_tracker: UploadTracker) -> None:        
        (analysis_id, current_file, completed_parts_by_thread) = upload_tracker.get_current_progress()

        self.analysis_id = analysis_id
        self.api_token = upload_tracker.api_token
        self.upload_tracker = upload_tracker

        self.file_path = current_file
        self.completed_parts_by_thread = completed_parts_by_thread

        file_size = os.path.getsize(self.file_path)
        
        self.number_of_parts = math.ceil(file_size/PART_SIZE)

        self.progress_displayer = ProgressDisplayer(self.number_of_parts, sum(completed_parts_by_thread), current_file)

        # These will be obtained from begin_multipart_upload()
        self.upload_id = None
        self.key = None
        self.file_id = None

    def get_signed_url_for_part(self, part_number) -> str:
        try:
            response = http_post(
                f"{base_url}/analysis/{self.analysis_id}/cliUpload/{self.upload_id}/part/{part_number}/signedUrl",
                {"x-api-token": f"Bearer {self.api_token}"},
                json_data={"key": self.key},
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to get signed url for part {part_number}: {response.text}")
        except Exception as e:
            raise e

        return response.json()

    def complete_multipart_upload(self, parts) -> None:        
        self.progress_displayer.show_completing()

        sorted_parts = sorted(parts, key=lambda part: part["PartNumber"])

        response = http_post(
            f"{base_url}/analysis/{self.analysis_id}/cliUpload/CompleteMultipartUpload",
            {"X-Api-Token": f"Bearer {self.api_token}"},
            json_data={
                "key": self.key,
                "uploadId": self.upload_id,
                "parts": sorted_parts,
                "fileId": self.file_id,
            },
        )

        if response.status_code != 200:
            raise Exception(f"Failed to complete upload for file {self.file_id}: {response.text}")

    def upload_part(self, part, part_number) -> str:
        signed_url = self.get_signed_url_for_part(part_number)

        response = http_put_part(signed_url, part)

        if response.status_code != 200:
            raise Exception(f"Failed to upload part {part_number}: {response.text}")
        
        # With localstack the ETag is returned lowercase for some reason
        etag = response.headers.get("ETag", response.headers.get("etag"))
        if (etag == None):
            raise Exception("ETag not found in response headers")
        
        return etag
    
    def upload_file_section(self, thread_index, from_part_index, to_part_index, abort_event) -> None:
        try:
            # Offset start point by the number of already completed parts
            # (in case we are resuming and already completed is > 0)
            part_index = from_part_index + self.completed_parts_by_thread[thread_index]

            with open(self.file_path, 'rb') as file:
                file.seek(part_index * PART_SIZE)
                part = file.read(PART_SIZE)

                while part_index < to_part_index:
                    if (abort_event.is_set()):
                        return

                    # part_number is 1-indexed
                    # part_index is same number but 0-indexed (calculate offset in file)
                    part_number = part_index + 1

                    etag = with_retry(lambda: self.upload_part(part, part_number))

                    self.upload_tracker.part_uploaded(thread_index, part_number, etag)
                    self.progress_displayer.increment()

                    part = file.read(PART_SIZE)
                    part_index += 1

        except Exception as e:
            # If an exception occurs, set the abort event to that the other threads stop too
            abort_event.set()
            raise e

    def upload_file(self) -> None:
        self.progress_displayer.begin()

        upload_params = self.upload_tracker.get_upload_params()

        self.upload_id = upload_params["uploadId"]
        self.key = upload_params["key"]
        self.file_id = upload_params["fileId"]

        threads_count = len(self.completed_parts_by_thread)

        parts_per_thread = math.floor(self.number_of_parts / threads_count)

        # If not a perfect division, then some leftover parts will need to be distributed among the threads
        leftover_parts = self.number_of_parts - parts_per_thread * threads_count

        abort_event = Event()

        with ThreadPoolExecutor(threads_count) as executor:
            futures = []

            to_part_index = 0
            thread_index = 0
            while to_part_index < self.number_of_parts:
                # Start from previous thread's limit
                from_part_index = to_part_index

                # If still have leftovers, then add it to the current thread
                extra_part = 1 if leftover_parts > 0 else 0
                leftover_parts -= 1

                to_part_index += parts_per_thread + extra_part

                futures.append(executor.submit(self.upload_file_section, thread_index, from_part_index, to_part_index, abort_event))
                
                thread_index += 1
            
            # not_done will always be empty because wait doesn't have a timeout.
            done, not_done = wait(futures)

            for future in done:
                future.result()

        etags = self.upload_tracker.get_parts_etags()
        with_retry(lambda: self.complete_multipart_upload(etags))
        
        self.upload_tracker.file_uploaded()
        self.progress_displayer.finish()

def upload_all_files(upload_tracker: UploadTracker) -> None:
    while not upload_tracker.is_finished():
        uploader = FileUploader(upload_tracker)
        uploader.upload_file()
    
    # Finished upload, so wipe the resume files
    UploadTracker.delete_temp_files()
    print()
    print("Upload completed successfully!")

def begin_multipart_upload(analysis_id, file_path, api_token) -> dict:
        file_name = os.path.basename(file_path)
        file_size = os.path.getsize(file_path)

        url = f"{base_url}/analysis/{analysis_id}/cliUpload/begin"

        response = http_post(
            url,
            {"X-Api-Token": f"Bearer {api_token}"},
            json_data={"name": file_name, "size": file_size},
        )

        if response.status_code != 200:
            if (response.status_code == 409):
                raise Exception(f"File {file_path} already exists in the pipeline, please remove the existing one before uploading a new one")
            if (response.status_code == 404):
                raise Exception(f"Analysis {analysis_id} not found")

            raise Exception(f"Failed to begin upload for file {file_path}: {response.text}")

        upload_params = response.json()

        return upload_params

# Show a warning if there is a previous upload that can be resumed
def show_resume_option():
    if os.path.exists(RESUME_PARAMS_PATH):
        (analysis_id, upload_params, file_paths, current_file_index, completed_parts_by_thread, current_file_created) = None, None, None, None, None, None

        try:
            (
                analysis_id,
                upload_params,
                file_paths,
                current_file_index,
                completed_parts_by_thread,
                current_file_created
            ) = get_resume_params_from_file()

        # Ignore file if it is corrupted
        except Exception as e:
           return False 

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
    if len(file_paths) == 0:
        raise Exception("No valid files found to upload, please check the --file parameter values or use --help for more information")

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

        # Check that the files look like fastqs
        for file in files:
            if (not file.endswith(".fastq.gz")):
                raise Exception(f"File {file} does not end with .fastq.gz, only gzip compressed fastq files are supported")

        upload_tracker = UploadTracker.fromScratch(args.run_id, files, THREADS_COUNT, args.token)


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
        
        upload_all_files(upload_tracker)
    except Exception as e:
        print()
        print(e)
        sys.exit(1)

if __name__ == '__main__':
    main()
