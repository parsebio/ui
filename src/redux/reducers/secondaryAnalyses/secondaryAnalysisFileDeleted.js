/* eslint-disable no-param-reassign */
import _ from 'lodash';

import FastqFileType from 'const/enums/FastqFileType';
import produce, { current } from 'immer';
import { getSublibraryName } from 'utils/fastqUtils';

const cleanupPairMatches = (draft, file, secondaryAnalysisId) => {
  const subName = getSublibraryName(file.name);

  let pairKey = null;
  if (file.type === FastqFileType.IMMUNE_FASTQ) {
    // immune are keys so easy to find
    pairKey = subName;
  } else if (file.type === FastqFileType.WT_FASTQ) {
    // wt are values so need to find the value that matches the subName
    pairKey = _.findKey(
      current(draft[secondaryAnalysisId].files.pairMatches),
      (currSubName) => currSubName === subName,
    );
  }

  if (pairKey === null) return;

  delete draft[secondaryAnalysisId].files.pairMatches[pairKey];
};

const secondaryAnalysisFileDeleted = produce((draft, action) => {
  const { secondaryAnalysisId, fileId } = action.payload;

  const file = current(draft[secondaryAnalysisId].files.data[fileId]);

  delete draft[secondaryAnalysisId].files.data[fileId];

  cleanupPairMatches(draft, file, secondaryAnalysisId);
});

export default secondaryAnalysisFileDeleted;
