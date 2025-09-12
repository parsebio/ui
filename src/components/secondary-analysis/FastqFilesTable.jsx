import React from 'react';
import PropTypes from 'prop-types';
import FilesUploadTable from 'components/secondary-analysis/FilesUploadTable';
import KitCategory, { isKitCategory } from 'const/enums/KitCategory';
import FastqFileType from 'const/enums/FastqFileType';

const { IMMUNE_FASTQ, WT_FASTQ } = FastqFileType;

const FastqFilesTable = (props) => {
  const {
    canEditTable, fastqFiles, secondaryAnalysisId, pairedWt, kit,
  } = props;
  if (Object?.keys(fastqFiles)?.length) {
    const getFastqIsActive = (fileType) => {
      if (isKitCategory(kit, [KitCategory.WT])) {
        return fileType === WT_FASTQ;
      } if (isKitCategory(kit, [KitCategory.TCR, KitCategory.BCR]) && !pairedWt) {
        return fileType === IMMUNE_FASTQ;
      }
      return true;
    };

    const filteredFiles = Object.values(fastqFiles).filter((file) => getFastqIsActive(file.type));

    filteredFiles.sort((a) => {
      if (a.type === WT_FASTQ) return -1;
      return 1;
    });
    return (
      <FilesUploadTable
        canEditTable={canEditTable}
        files={filteredFiles}
        secondaryAnalysisId={secondaryAnalysisId}
        pairedWt={pairedWt}
      />
    );
  }
  return null;
};

FastqFilesTable.defaultProps = {
  canEditTable: false,
};

FastqFilesTable.propTypes = {
  canEditTable: PropTypes.bool,
  fastqFiles: PropTypes.object.isRequired,
  secondaryAnalysisId: PropTypes.string.isRequired,
  pairedWt: PropTypes.bool.isRequired,
  kit: PropTypes.string.isRequired,
};

export default FastqFilesTable;
