import React from 'react';

const moduleTooltips = {
  SECONDARY_PROJECT: (
    <>
      Process FASTQ files from Parse Biosciences Evercode WT kits
      to generate pipeline output files including reports,
      metrics and count matrices.
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/36214328983828-Guided-walkthrough-Pipeline-module-set-up' target='_blank' rel='noreferrer'>Guided Walkthrough: Pipeline module set-up</a>
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/27076682137236-Trailmaker-User-Guide#h_01HZ4VDNQ8SPEWG1JFT5GHTXKC' target='_blank' rel='noreferrer'>User Guide - Pipeline module</a>
    </>
  ),
  SECONDARY_OUTPUT: (
    <>
      View Pipeline Run reports and download Pipeline output files
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/36215329630228-Guided-walkthrough-Pipeline-Outputs' target='_blank' rel='noreferrer'>Guided Walkthrough: Pipeline Outputs</a>
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/27076682137236-Trailmaker-User-Guide#h_01HZ4VDNQ8QEZSTRDHST7BK3DZ' target='_blank' rel='noreferrer'>User Guide - Pipeline Outputs</a>
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/31579430276372-How-to-troubleshoot-Pipeline-failures-in-Trailmaker' target='_blank' rel='noreferrer'>How to troubleshoot Pipeline failures in Trailmaker</a>
      {' '}
      (requires support suite login)
    </>
  ),
};

export default moduleTooltips;
