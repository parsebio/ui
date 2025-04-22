/* eslint-disable no-param-reassign */
const metadataKeyToName = (key) => key.replace('_', ' ');

const metadataNameToKey = (name) => `${name.trim().replace(/\s+/g, '_')}`;

export {
  metadataKeyToName,
  metadataNameToKey,
};
