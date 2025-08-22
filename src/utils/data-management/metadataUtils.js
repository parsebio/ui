/* eslint-disable no-param-reassign */
const metadataKeyToName = (key) => key.replaceAll('_', ' ');

const metadataNameToKey = (name) => `${name.trim().replaceAll(' ', '_')}`;

export {
  metadataKeyToName,
  metadataNameToKey,
};
