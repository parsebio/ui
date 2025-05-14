/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Space, Typography, Button, Select,
} from 'antd';
import {
  cloneExperiment, updateExperiment, loadExperiments, setActiveExperiment,
} from 'redux/actions/experiments';

import kitOptions from 'utils/secondary-analysis/kitOptions.json';

import SampleOptions from 'components/data-management/SamplesOptions';
import EditableParagraph from 'components/EditableParagraph';
import { layout, sampleTech } from 'utils/constants';

// import SamplesTable from 'components/data-management/SamplesContainer/SamplesTable';
import ExperimentMenu from 'components/data-management/ExperimentMenu';
import AddMetadataButton from 'components/data-management/metadata/AddMetadataButton';
import { bulkUpdateSampleKits } from 'redux/actions/samples';
import ScanpyDisabler from 'utils/ScanpyDisabler';
import SamplesContainer from '../SamplesContainer/SamplesContainer';

const { Text, Title } = Typography;

const paddingTop = layout.PANEL_PADDING;
const paddingBottom = layout.PANEL_PADDING;
const paddingRight = layout.PANEL_PADDING;
const paddingLeft = layout.PANEL_PADDING;

const ProjectDetails = ({ width, height }) => {
  const dispatch = useDispatch();

  const { activeExperimentId } = useSelector((state) => state.experiments.meta);
  const activeExperiment = useSelector((state) => state.experiments[activeExperimentId]);
  const samples = useSelector((state) => state.samples);

  const parseTechSample = activeExperiment.sampleIds.filter(
    (sampleId) => samples[sampleId]?.type === sampleTech.PARSE,
  )[0];

  const { kit } = samples[parseTechSample] ?? {};

  const samplesContainerRef = useRef();

  const clone = async () => {
    const newExperimentId = await dispatch(cloneExperiment(activeExperimentId, `Copy of ${activeExperiment.name}`));
    await dispatch(loadExperiments());
    dispatch(setActiveExperiment(newExperimentId));
  };

  console.log('samplesContainerRefDebug');
  console.log(samplesContainerRef);

  return (
    // The height of this div has to be fixed to enable sample scrolling
    <div
      id='project-details'
      style={{
        width: width - paddingLeft - paddingRight,
        height: height - layout.PANEL_HEADING_HEIGHT - paddingTop - paddingBottom,
      }}
    >
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
      }}
      >
        <Title level={3}>{activeExperiment.name}</Title>
        <Text type='secondary'>
          {`Project ID: ${activeExperimentId}`}
        </Text>
        <div style={{ flex: 'none', paddingBottom: '1em' }}>
          <div style={{ display: 'flex', justifyContent: 'right', flexWrap: 'wrap' }}>
            <Space style={{ flexWrap: 'wrap' }}>
              <ScanpyDisabler experimentId={activeExperimentId}>
                <Button onClick={clone}>
                  Copy
                </Button>
              </ScanpyDisabler>
              <AddMetadataButton samplesTableRef={samplesContainerRef.current?.samplesTableRef} />
              <ExperimentMenu />
            </Space>
          </div>

        </div>
        {parseTechSample && (
          <div>
            <Text strong>
              Parse Kit Type:
            </Text>
            {' '}
            <br />
            <Select
              value={kit}
              onChange={(newKit) => {
                if (newKit !== kit) {
                  dispatch(bulkUpdateSampleKits(activeExperiment.sampleIds, newKit));
                }
              }}
              options={kitOptions}
              style={{ paddingTop: '1em', paddingBottom: '1em', width: '15em' }}
              placeholder='Select the kit you used in your experiment'
            />
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Text strong>
            Description:
          </Text>
          <EditableParagraph
            value={activeExperiment.description}
            onUpdate={(text) => {
              if (text !== activeExperiment.description) {
                dispatch(updateExperiment(activeExperimentId, { description: text }));
              }
            }}
          />
          <SampleOptions />
          <SamplesContainer ref={samplesContainerRef} />
        </div>
      </div>
    </div>
  );
};

ProjectDetails.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default ProjectDetails;
