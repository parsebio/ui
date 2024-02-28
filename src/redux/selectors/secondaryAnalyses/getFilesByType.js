import _ from 'lodash';

const getFilesByType = (files, type) => _.pickBy(files, (file) => file.type === type);

export default getFilesByType;
