export default {
  SCDBLFINDER_NOT_ENOUGH_CELLS: '\u26A0\uFE0F This sample does not contain enough cells with more than 200 transcripts to compute doublet scores. Therefore, no barcodes will be filtered out from this sample at this step. Check previous steps to make sure no overfiltering has occurred.',
  FILTERED_TOO_MANY_CELLS: '\u26A0\uFE0F Too many cells have been filtered from this sample, and this might cause issues with downstream analysis. Please verify the filtering thresholds that have been applied. ',
  CLUSTERING_BAD_ALLOC: '\u26A0\uFE0F The clustering step failed due to a memory allocation error. To resolve this, switch to Scanpy in the Data Integration step.',
};
