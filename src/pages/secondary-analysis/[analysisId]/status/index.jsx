/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useState } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Tabs, TabsProps } from 'antd';
import {
  BlobReader, BlobWriter, TextWriter, ZipReader,
} from '@zip.js/zip.js';

import { loadSecondaryAnalyses, loadSecondaryAnalysisStatus } from 'redux/actions/secondaryAnalyses';

import { layout } from 'utils/constants';
import fetchAPI from 'utils/http/fetchAPI';
import downloadFromUrl from 'utils/downloadFromUrl';

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

const AnalysisDetails = ({ analysisId }) => {
  const dispatch = useDispatch();

  console.log('analysisIdDebug');
  console.log(analysisId);

  const [reportHtmls, setReportHtmls] = useState(null);

  const [reportHeight, setReportHeight] = useState(null);

  // useEffect(() => {
  //   if (!analysisId) return;

  //   dispatch(loadSecondaryAnalysisStatus(analysisId));
  // }, [analysisId]);

  const getReports = useCallback(async () => {
    const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${analysisId}/reports`);

    const response = await fetch(signedUrl);
    const zip = await response.blob();
    const htmls = await getHtmlsFromZip(zip);
    setReportHtmls(htmls);
  }, [analysisId]);

  useEffect(() => {
    if (!analysisId) return;

    getReports();
  }, [analysisId]);

  const downloadAllOutputs = useCallback(async () => {
    if (!analysisId) return;

    const signedUrl = await fetchAPI(`/v2/secondaryAnalysis/${analysisId}/output`);

    downloadFromUrl(signedUrl, 'all_outputs.zip');
  }, [analysisId]);

  const items = reportHtmls?.map(({ fileName, data }) => (
    {
      key: fileName,
      label: fileName,
      children: (<iframe srcDoc={data} title='My Document' style={{ height: reportHeight, width: '100%' }} />),
    }
  ));

  return (
    <>
      <Button type='primary' onClick={downloadAllOutputs} style={{ width: '200px', marginLeft: 'auto' }}>
        Download all outputs
      </Button>
      <ReactResizeDetector
        handleHeight
        refreshMode='throttle'
        refreshRate={500}
        onResize={(height) => { setReportHeight(height); }}
      >

        {items && <Tabs centered defaultActiveKey='1' items={items} style={{ width: '100%' }} />}

      </ReactResizeDetector>
    </>
  );

  // return (
  //   // The height of this div has to be fixed to enable sample scrolling
  //   <div
  //     id='secondary-analysis-details'
  //     style={{
  //       width: width - paddingLeft - paddingRight,
  //       height: height - layout.PANEL_HEADING_HEIGHT - paddingTop - paddingBottom,
  //     }}
  //   >

  //     {
  //       items && <Tabs defaultActiveKey='1' items={items} style={{ height: '100%' }} />
  //     }
  //     {/* <div style={{
  //       display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
  //     }}
  //     >
  //     </div> */}
  //   </div>
  // );
};

AnalysisDetails.propTypes = {
  analysisId: PropTypes.string.isRequired,
};

export default AnalysisDetails;
