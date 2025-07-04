import React from 'react';
import PropTypes from 'prop-types';
import { kitCategories, isKitCategory } from 'utils/secondary-analysis/kitOptions';

// Simple JSX variables for reuse
const supportArticleLink = (
  <a
    target='_blank'
    href='https://support.parsebiosciences.com/hc/en-us/articles/33176662802708-How-to-handle-multiple-pairs-of-FASTQ-files-per-sublibrary'
    rel='noreferrer'
  >
    this support article
  </a>
);

const concatenateGuidance = (
  <>
    If you have more FASTQ file pairs than sublibraries,
    it is likely that some sublibraries were split over multiple sequencing lanes.
    Those FASTQ files will share identical Illumina indexes and must
    be concatenated
    {' '}
    <b>before</b>
    {' '}
    uploading to Trailmaker.
    Guidance on how to concatenate your files is in
    {' '}
    {supportArticleLink}
    .
    <br />
    <br />
  </>
);

const uploadNotice = (
  <>
    Uploading large FASTQ files can take multiple hours or even days.
    You must keep your computer running and your browser tab open for the duration
    of the upload.
    If your internet connection fails, file upload will resume from the last checkpoint.
    <br />
    <br />
  </>
);

const expiryNoticeBase = (
  <>
    Note that FASTQ files are deleted from Trailmaker 30 days after upload.
    After this time, your Pipeline Run Details and any Outputs will continue to
    be available but the FASTQ files will be marked as &apos;Expired&apos;.
  </>
);

const UploadFastqSupportText = ({ kit, pairedWt }) => {
  console.log('UploadFastqSupportText', kit, pairedWt, isKitCategory(kit, kitCategories.TCR), isKitCategory(kit, kitCategories.BCR));
  if (isKitCategory(kit, kitCategories.TCR) || isKitCategory(kit, kitCategories.BCR)) {
    if (pairedWt) {
      return (
        <div>
          <b>You must upload exactly four FASTQ files per sublibrary:</b>
          <br />
          <ul>
            <li>
              <b>
                1 pair of FASTQ files (R1 and R2) corresponding to the whole transcriptome data (WT)
              </b>
            </li>
            <li>
              <b>
                1 pair of FASTQ files (R1 and R2) corresponding to the immune profiling data
              </b>
            </li>
          </ul>
          <b>
            Drag and drop the WT FASTQ files to the left box, and the immune profiling FASTQ files
            to the right box, then click Upload.
          </b>
          <br />
          <br />
          {concatenateGuidance}
          {uploadNotice}
          <p>
            After FASTQ file selection, you will be asked to match the whole transcriptome files to
            their corresponding immune profiling files.
          </p>
          <br />
          {expiryNoticeBase}
          You cannot run the pipeline with expired FASTQ files.
          <br />
          <br />
        </div>
      );
    }

    return (
      <div>
        <b>You must upload exactly two FASTQ files per sublibrary.</b>
        <br />
        <br />
        Drag and drop the immune profiling FASTQ files to the box below, then click Upload.
        <br />
        <br />
        {concatenateGuidance}
        {uploadNotice}
        <p>
          After FASTQ file selection, you will be asked to match the whole transcriptome files to
          their corresponding immune profiling files.
        </p>
        {expiryNoticeBase}
        You cannot run the pipeline with expired FASTQ files.
        <br />
        <br />
      </div>
    );
  }
  return (
    <div>
      <b>You must upload exactly one pair of FASTQ files (R1 and R2) per sublibrary.</b>
      <br />
      <br />
      {concatenateGuidance}
      {uploadNotice}
      {expiryNoticeBase}
      <br />
      <br />
    </div>
  );
};

UploadFastqSupportText.propTypes = {
  kit: PropTypes.string.isRequired,
  pairedWt: PropTypes.bool.isRequired,
};

export default UploadFastqSupportText;
