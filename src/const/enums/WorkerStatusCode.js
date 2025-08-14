const WorkerStatusCode = {
  DOWNLOAD_EXPERIMENT: 'DOWNLOAD_EXPERIMENT',
  LOAD_EXPERIMENT: 'LOAD_TO_MEMORY',
  STARTED_TASK: 'STARTED_TASK',
  COMPRESSING_TASK_DATA: 'COMPRESSING_DATA',
  UPLOADING_TASK_DATA: 'UPLOADING_DATA',
  FINISHED_TASK: 'FINISHED_TASK',
};

const formattedTaskName = (taskName) => {
  if (typeof taskName !== 'string') return '';

  // Remove "Get" from the name
  const nameWithoutGet = taskName.replace('Get', '');

  // Insert a space before capital letters, then trim
  const finalName = nameWithoutGet.replace(/([A-Z])/g, ' $1').trim();

  return finalName;
};

const getTaskNameToDisplay = (taskName) => {
  if (taskName === 'ScTypeAnnotate') {
    return 'Annotate clusters';
  }

  return formattedTaskName(taskName);
};

const getDisplayText = (statusCode, taskName) => {
  const taskNameToDisplay = getTaskNameToDisplay(taskName);

  if (
    statusCode === WorkerStatusCode.DOWNLOAD_EXPERIMENT
    || statusCode === WorkerStatusCode.LOAD_EXPERIMENT
  ) {
    return 'Accessing the Adata object for your analysis';
  }
  if (statusCode === WorkerStatusCode.STARTED_TASK) {
    return `Working on the requested task ${taskNameToDisplay}`;
  }
  if (statusCode === WorkerStatusCode.COMPRESSING_TASK_DATA) {
    return `Compressing the results for the requested task ${taskNameToDisplay}`;
  }
  if (statusCode === WorkerStatusCode.UPLOADING_TASK_DATA) {
    return `Finalizing results for the requested task ${taskNameToDisplay}`;
  }
  if (statusCode === WorkerStatusCode.FINISHED_TASK) {
    return `Displaying results for the requested task ${taskNameToDisplay}`;
  }
};

export default WorkerStatusCode;
export { getDisplayText };
