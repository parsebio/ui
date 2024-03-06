/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Tabs, TabsProps } from 'antd';
import {
  BlobReader, BlobWriter, TextWriter, ZipReader,
} from '@zip.js/zip.js';

import { loadSecondaryAnalysisStatus } from 'redux/actions/secondaryAnalyses';
import 'components/data-management/project/AnalysisDetails.module.css';

import { layout } from 'utils/constants';
import fetchAPI from 'utils/http/fetchAPI';
import downloadFromUrl from 'utils/downloadFromUrl';
import _ from 'lodash';

const paddingTop = layout.PANEL_PADDING;
const paddingBottom = layout.PANEL_PADDING;
const paddingRight = layout.PANEL_PADDING;
const paddingLeft = layout.PANEL_PADDING;

const getHtmlsFromZip = async (fileBlob) => {
  const zipReader = new ZipReader(new BlobReader(fileBlob));
  const entries = await zipReader.getEntries();

  const htmlEntries = entries.filter(({ filename }) => filename.endsWith('.html'));
  const htmls = await Promise.all(htmlEntries.map(async (entry) => ({
    fileName: entry.filename,
    data: await entry.getData(new TextWriter()),
  })));

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

    const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${activeAnalysisId}/status`);

    downloadFromUrl(signedUrl, 'all_outputs.zip');
  }, [activeAnalysisId]);

  const reportHeight = height - layout.PANEL_HEADING_HEIGHT - paddingTop - paddingBottom;

  const items = reportHtmls?.map(({ fileName, data }) => (
    {
      key: fileName,
      label: fileName,
      children: (<iframe srcDoc={data} title='My Document' style={{ width: '100%', height: reportHeight }} />),
    }
  ));

  return (
    // The height of this div has to be fixed to enable sample scrolling
    <div
      id='secondary-analysis-details'
      style={{
        width: width - paddingLeft - paddingRight,
        height: height - layout.PANEL_HEADING_HEIGHT - paddingTop - paddingBottom,
      }}
    >
      {/* <Button type='primary' onClick={downloadAllOutputs}>
        Download all outputs
      </Button> */}
      {
        items && <Tabs defaultActiveKey='1' items={items} style={{ height: '100%' }} />
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
