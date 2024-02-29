import fetchAPI from 'utils/http/fetchAPI';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import uploadFileToS3 from 'utils/upload/multipartUpload';
import { SECONDARY_ANALYSES_ERROR, SECONDARY_ANALYSIS_FILES_LOADED } from 'redux/actionTypes/secondaryAnalyses';
import UploadStatus from 'utils/upload/UploadStatus';
import dayjs from 'dayjs';
import { shouldCompress } from 'utils/upload/fileInspector';
import updateSecondaryAnalysisFile from './updateSecondaryAnalysisFile';

const uploadSecondaryAnalysisFile = (secondaryAnalysisId, file, type) => async (dispatch) => {
  const { name, size } = file;
  try {
    const uploadUrlParams = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, size, type }),
    });

    const fileRecordRedux = {
      id: uploadUrlParams.fileId,
      name: file.name,
      size: file.size,
      type,
      createdAt: dayjs().toISOString(),
      upload: {
        status: UploadStatus.UPLOADING,
        progress: 0,
      },
    };

    dispatch({
      type: SECONDARY_ANALYSIS_FILES_LOADED,
      payload: {
        secondaryAnalysisId,
        files: [fileRecordRedux],
      },
    });

    const onUpdateUploadStatus = (status, percentProgress = 0) => {
      dispatch(updateSecondaryAnalysisFile(secondaryAnalysisId, uploadUrlParams.fileId, status, percentProgress));
    };
    const shouldCompressResponse = await shouldCompress(file);

    await uploadFileToS3(
      secondaryAnalysisId,
      file,
      shouldCompressResponse,
      uploadUrlParams,
      'secondaryAnalysis',
      new AbortController(),
      onUpdateUploadStatus,
      'exponentialBackoff',
    );
  } catch (e) {
    pushNotificationMessage('error', 'Something went wrong while uploading your file.');
    dispatch({
      type: SECONDARY_ANALYSES_ERROR,
      payload: {
        secondaryAnalysisId,
        error: e,
      },
    });
    console.log(e);
  }
};
export default uploadSecondaryAnalysisFile;
