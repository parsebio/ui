import fetchAPI from 'utils/http/fetchAPI';
import pushNotificationMessage from 'utils/pushNotificationMessage';
import { SECONDARY_ANALYSIS_FILES_ERROR, SECONDARY_ANALYSIS_FILES_LOADED } from 'redux/actionTypes/secondaryAnalyses';
import UploadStatus from 'utils/upload/UploadStatus';
import dayjs from 'dayjs';
import cache from 'utils/cache';

const createSecondaryAnalysisFile = (
  secondaryAnalysisId, file, type, fileHandle = null,
) => async (dispatch) => {
  const { name, size } = file;
  try {
    const uploadUrlParams = await fetchAPI(`/v2/secondaryAnalysis/${secondaryAnalysisId}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, size, type }),
    });

    // Not exactly as with redux, the status has .current inside
    const fileRecord = {
      id: uploadUrlParams.fileId,
      name: file.name,
      size: file.size,
      type,
      createdAt: dayjs().toISOString(),
      upload: {
        status: UploadStatus.QUEUED,
        progress: 0,
      },
    };

    dispatch({
      type: SECONDARY_ANALYSIS_FILES_LOADED,
      payload: {
        secondaryAnalysisId,
        files: [fileRecord],
      },
    });

    if (fileHandle) {
      const fileRecordCache = {
        fileHandle,
        uploadUrlParams,
      };

      // saving file to cache for 1 week to be able to retrieve it later for resume upload
      await cache.set(uploadUrlParams.fileId, fileRecordCache, 168 * 3600);
    }
    return uploadUrlParams;
  } catch (e) {
    pushNotificationMessage('error', 'Something went wrong while uploading your file.');
    dispatch({
      type: SECONDARY_ANALYSIS_FILES_ERROR,
      payload: {
        secondaryAnalysisId,
        error: e,
      },
    });
    console.log(e);
  }
};
export default createSecondaryAnalysisFile;
