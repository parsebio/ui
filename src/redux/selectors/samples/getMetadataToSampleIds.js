const getMetadataToSampleIds = () => (samples) => {
  const metadataToSampleIds = {};
  Object.entries(samples).forEach(([key, entry]) => {
    if (key === 'meta') {
      return;
    }
    Object.entries(entry.metadata)?.forEach(([metadataKey, metadataValue]) => {
      if (!metadataToSampleIds[metadataKey]) {
        metadataToSampleIds[metadataKey] = {};
      }
      if (!metadataToSampleIds[metadataKey][metadataValue]) {
        metadataToSampleIds[metadataKey][metadataValue] = [];
      }
      metadataToSampleIds[metadataKey][metadataValue].push(key);
    });
  });

  return metadataToSampleIds;
};

export default getMetadataToSampleIds;
