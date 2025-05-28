import React, {
  forwardRef,
  useEffect, useMemo, useState,
} from 'react';
import _ from 'lodash';
import { Alert, Tabs } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import ReactResizeDetector from 'react-resize-detector';

import { loadSamples } from 'redux/actions/samples';
import useConditionalEffect from 'utils/customHooks/useConditionalEffect';
import { techNamesToDisplay } from 'utils/upload/fileUploadUtils';

import SamplesLoader from 'components/data-management/SamplesContainer/SamplesLoader';
import SamplesTable from 'components/data-management/SamplesContainer/SamplesTable';
import { getSamples } from 'redux/selectors';
import { createMetadataTrack, updateValuesInMetadataTrack } from 'redux/actions/experiments';

const SamplesContainer = forwardRef((props, ref) => {
  const dispatch = useDispatch();

  const activeExperimentId = useSelector((state) => state.experiments.meta.activeExperimentId);
  const activeExperiment = useSelector((state) => state.experiments[activeExperimentId]);
  const parentExperimentName = useSelector(
    (state) => state.experiments[activeExperiment?.parentExperimentId]?.name,
  );

  const samples = useSelector((state) => state.samples);
  const samplesLoading = useSelector((state) => state.samples.meta.loading);
  const samplesValidating = useSelector(
    (state) => state.samples.meta.validating.includes(activeExperimentId),
  );

  const experimentSamples = useSelector(getSamples(activeExperimentId));

  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [selectedTable, setSelectedTable] = useState('All');

  useConditionalEffect(() => {
    setSamplesLoaded(false);
    setSelectedTable('All');

    dispatch(loadSamples(activeExperimentId));
  }, [activeExperimentId]);

  useEffect(() => {
    // TODO Look into improving this a bit, cna probably be done in a more simple way
    const newSamplesLoaded = activeExperiment?.sampleIds.every((sampleId) => samples[sampleId]);
    if (newSamplesLoaded === true && samplesLoaded === false) {
      setSamplesLoaded(true);
    }
  }, [activeExperiment, samples]);

  useEffect(() => {
    if (_.isNil(experimentSamples)) return;

    const typesSet = new Set(Object.values(experimentSamples).map(({ type }) => type));

    // If selectedTable has no samples, select 'All'
    // This happens when all samples of a tech get deleted
    if (selectedTable !== 'All' && !typesSet.has(selectedTable)) {
      setSelectedTable('All');
    }
  }, [experimentSamples]);

  const selectedTechs = useMemo(() => (
    Array.from(new Set(
      activeExperiment?.sampleIds.map((sampleId) => samples[sampleId]?.type).filter((type) => type),
    )).sort((a, b) => {
      if (a === 'parse') return -1;
      return a.localeCompare(b);
    })
  ), [activeExperiment, samples]);

  const renderTabs = () => {
    const technologyTabs = [{
      key: 'All',
      label: 'All',
    }];

    selectedTechs.forEach((tech) => {
      technologyTabs.push({
        key: tech,
        label: techNamesToDisplay[tech],
      });
    });

    return (
      <ReactResizeDetector
        handleHeight
        refreshMode='throttle'
        refreshRate={500}
        onResize={(height) => { setSize({ height }); }}
      >
        {() => (
          <>
            <Tabs defaultActiveKey='All' activeKey={selectedTable} items={technologyTabs} onChange={(key) => setSelectedTable(key)} />
            <SamplesTable
              ref={ref}
              size={size}
              selectedTable={selectedTable}
              selectedTechs={selectedTechs}
            />
          </>
        )}
      </ReactResizeDetector>
    );
  };

  return (
    activeExperiment?.isSubsetted ? (
      <center>
        <Alert
          type='info'
          message='Subsetted experiment'
          description={(
            <>
              This is a subset of
              {' '}
              <b>{parentExperimentName || ' a deleted experiment'}</b>
              .
              <br />
              You can  see remaining samples after subsetting in
              the data processing and data exploration pages.
            </>
          )}
        />
      </center>
    )
      : !samplesLoaded || samplesLoading || samplesValidating
        ? (
          <SamplesLoader
            samplesLoading={samplesLoading}
            samplesValidating={samplesValidating}
          />
        )
        : renderTabs()
  );
});

export default SamplesContainer;
