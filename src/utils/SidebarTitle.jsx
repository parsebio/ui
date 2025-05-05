import React from 'react';
import { Tooltip } from 'antd';
import PropTypes from 'prop-types';

// We can't match exactly the tooltips to the module keys because some of the tooltips
// appear on hover of non-module elements, like SECONDARY_ANALYSIS_PROJECT and TERTIARY_PROJECT
const sidebarTooltipTexts = {
  SECONDARY_ANALYSIS_PROJECT: (
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
  SECONDARY_ANALYSIS_OUTPUT: (
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
  TERTIARY_PROJECT: (
    <>
      Processed data files are input for downstream filtering, integration and cell type annotation,
      as well as deep dive visualization and exploration of gene expression and
      differential expression.
      A range of fully customizable plots enable the generation of publication-ready figures.
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/36215511478292-Guided-walkthrough-Insights-module-set-up' target='_blank' rel='noreferrer'>Guided Walkthrough: Insights module set-up</a>
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/27076682137236-Trailmaker-User-Guide#h_01HZ4VDNQ80HNKPV6CDAW8ZX16' target='_blank' rel='noreferrer'>User Guide - Insights module</a>
      <br />
      <br />
    </>
  ),
  TERTIARY_DATA_PROCESSING: (
    <>
      View quality control plots and adjust settings for filtering, integration and clustering.
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/36215974172692-Guided-walkthrough-Insights-Data-Processing' target='_blank' rel='noreferrer'>Guided Walkthrough: Insights Data Processing</a>
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/27076682137236-Trailmaker-User-Guide#h_01HZ4VDNQ9D1X142H65V6GHQ22' target='_blank' rel='noreferrer'>User Guide - Data Processing section</a>
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/31741233000468-How-to-adjust-data-processing-settings-to-fit-your-dataset-and-troubleshoot-data-processing-failures' target='_blank' rel='noreferrer'>How to adjust data processing settings to fit your dataset and troubleshoot data processing failures</a>
    </>
  ),
  TERTIARY_DATA_EXPLORATION: (
    <>
      Take a deep dive into your dataset: view marker heatmap and gene expression,
      customize and annotate clusters, and perform differential expression and pathway analysis.
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/36216095150484-Guided-walkthrough-Insights-Data-Exploration' target='_blank' rel='noreferrer'>Guided Walkthrough: Insights Data Exploration</a>
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/27076682137236-Trailmaker-User-Guide#h_01HZ4VDNQAYF2CF8PEDVNAXA7B' target='_blank' rel='noreferrer'>User Guide - Data Exploration section</a>
    </>
  ),
  TERTIARY_PLOTS_AND_TABLES: (
    <>
      A range of plot types are available to visualize your data, all of which can
      be customized to your design preferences and exported as high resolution images.
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/36216493945364-Guided-walkthrough-Insights-Plots-and-Tables' target='_blank' rel='noreferrer'>Guided Walkthrough: Insights Plots and Tables</a>
      <br />
      <br />
      <a href='https://support.parsebiosciences.com/hc/en-us/articles/27076682137236-Trailmaker-User-Guide#h_01HZ4VDNQBKY9VX7NF5XX1RTWT' target='_blank' rel='noreferrer'>User Guide - Plots and Tables section</a>
    </>
  ),
};

const SidebarTitle = (props) => {
  const { type, children } = props;

  console.log('typeDebug');
  console.log(type);

  return (
    <Tooltip
      title={sidebarTooltipTexts[type]}
      mouseEnterDelay={1.0}
    >
      {children}
    </Tooltip>
  );
};

SidebarTitle.propTypes = {
  type: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default SidebarTitle;
