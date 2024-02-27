const getFilesByType = (files, type) => {
  if (!Object.keys(files).length) return {};
  const filteredFiles = {};
  Object.entries(files)
    .forEach(([key, value]) => {
      if (value?.type === type) {
        filteredFiles[key] = value;
      }
    });
  return filteredFiles;
};

export default getFilesByType;
