const { removeExperiment } = require('redux/actions/experiments');
const { removeSecondaryAnalysis } = require('redux/actions/secondaryAnalyses');

const removeProject = (projectId, projectType) => (dispatch) => {
  if (projectType === 'experiment') {
    dispatch(removeExperiment(projectId));
  } else if (projectType === 'secondaryAnalysis') {
    dispatch(removeSecondaryAnalysis(projectId));
  }
};

export default removeProject;
