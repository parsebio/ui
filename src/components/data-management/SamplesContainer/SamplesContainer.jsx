import { Alert, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadSamples } from 'redux/actions/samples';
import useConditionalEffect from 'utils/customHooks/useConditionalEffect';
import SamplesLoader from './SamplesLoader';

const SamplesContainer = (props) => {
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

  const [samplesLoaded, setSamplesLoaded] = useState(false);

  useConditionalEffect(() => {
    setSamplesLoaded(false);

    dispatch(loadSamples(activeExperimentId));
  }, [activeExperimentId]);

  useEffect(() => {
    const newSamplesLoaded = activeExperiment?.sampleIds.every((sampleId) => samples[sampleId]);

    if (newSamplesLoaded === true && samplesLoaded === false) {
      setSamplesLoaded(true);
    }
  }, [activeExperiment, samples]);

  return (
    <>
      {
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
            ? <SamplesLoader samplesLoading samplesValidating />
            : renderSamplesTable()
      }
    </>
  );
};

export default SamplesContainer;
