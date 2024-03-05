/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import {
  BlobReader, BlobWriter, TextWriter, ZipReader,
} from '@zip.js/zip.js';

import { loadSecondaryAnalysisStatus } from 'redux/actions/secondaryAnalyses';

import { layout } from 'utils/constants';
import fetchAPI from 'utils/http/fetchAPI';
import downloadFromUrl from 'utils/downloadFromUrl';

const paddingTop = layout.PANEL_PADDING;
const paddingBottom = layout.PANEL_PADDING;
const paddingRight = layout.PANEL_PADDING;
const paddingLeft = layout.PANEL_PADDING;

const getHtmlsFromZip = async (fileBlob) => {
  const zipReader = new ZipReader(new BlobReader(fileBlob));
  const entries = await zipReader.getEntries();
  console.log('entriesDebug');
  console.log(entries);

  const htmlEntries = entries.filter(({ filename }) => filename.endsWith('.html'));
  const htmls = await Promise.all(htmlEntries.map((entry) => entry.getData(new TextWriter())));

  return htmls;
};

const AnalysisDetails = ({ width, height }) => {
  const dispatch = useDispatch();

  const {
    activeSecondaryAnalysisId: activeAnalysisId,
  } = useSelector((state) => state.secondaryAnalyses.meta);

  const [reportHtmls, setReportHtmls] = useState(null);

  useEffect(() => {
    if (!activeAnalysisId) return;

    dispatch(loadSecondaryAnalysisStatus(activeAnalysisId));
  }, [activeAnalysisId]);

  useEffect(async () => {
    if (!activeAnalysisId) return;

    const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${activeAnalysisId}/reports`);

    const response = await fetch(signedUrl);
    const zip = await response.blob();
    const htmls = await getHtmlsFromZip(zip);
    setReportHtmls(htmls);
  }, [activeAnalysisId]);

  const downloadAllOutputs = useCallback(async () => {
    if (!activeAnalysisId) return;

    const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${activeAnalysisId}/output`);

    downloadFromUrl(signedUrl, 'all_outputs.zip');
  }, [activeAnalysisId]);

  return (
    // The height of this div has to be fixed to enable sample scrolling
    <div
      id='secondary-analysis-details'
      style={{
        width: width - paddingLeft - paddingRight,
        height: height - layout.PANEL_HEADING_HEIGHT - paddingTop - paddingBottom,
      }}
    >
      <Button type='primary' onClick={downloadAllOutputs}>
        Download all outputs
      </Button>
      {
        reportHtmls && reportHtmls.map((html) => (
          <iframe srcDoc={html} title='My Document' />
        ))
      }
      {/* <div style={{
        display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
      }}
      >
      </div> */}
    </div>
  );
};

AnalysisDetails.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default AnalysisDetails;
