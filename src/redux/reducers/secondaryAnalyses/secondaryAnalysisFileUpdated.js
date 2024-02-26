const secondaryAnalysisFileUpdated = (state, action) => {
  const {
    uploadStatus, percentProgress, fileId, secondaryAnalysisId,
  } = action.payload;
  return {
    ...state,
    [secondaryAnalysisId]: {
      ...state[secondaryAnalysisId],
      files: {
        ...state[secondaryAnalysisId].files,
        [fileId]: {
          ...state[secondaryAnalysisId].files[fileId],
          upload: { status: uploadStatus, percentProgress },
        },
      },
    },
  };
};

export default secondaryAnalysisFileUpdated;
