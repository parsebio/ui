import React from 'react';

import _ from 'lodash';
import { Typography, Button, Card } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import Disabler from 'utils/Disabler';

const { Text } = Typography;

const OverviewMenu = ({ wizardSteps, setCurrentStep, editable }) => {
  const renderCard = (step, index, span, style) => (
    <div key={step.key} style={style}>
      <Disabler disable={step.getIsDisabled()} tooltipText='This step is disabled until the previous steps are completed.'>
        <Card
          bordered
          style={{ width: '100%', height: '100%' }}
          loading={step.isLoading}
          size='small'
          title={(
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text
                strong
                style={{
                  fontSize: '1.62vh',
                  overflowX: 'auto',
                }}
              >
                {step.key}
              </Text>
              <div>
                {step.isValid ? (
                  <CheckCircleOutlined style={{ color: 'green', marginLeft: '10px', fontSize: '17px' }} />
                ) : (
                  <CloseCircleOutlined style={{ color: 'red', marginLeft: '10px', fontSize: '17px' }} />
                )}
              </div>
            </div>
          )}
          extra={editable && (
            <Button
              data-testid={`edit-button-${step.key}`}
              icon={<EditOutlined />}
              onClick={(event) => {
                event.stopPropagation();
                setCurrentStep(index);
              }}
              type='link'
            />
          )}
        >
          {step.getIsDisabled() ? null : step.renderMainScreenDetails()}
        </Card>
      </Disabler>
    </div>
  );

  const firstRowSteps = ['Experimental setup', 'Sample loading table', 'Reference genome'];
  const firstRowStepsData = Object.values(_.pick(wizardSteps, firstRowSteps));
  const leftoverStepsData = Object.values(_.omit(wizardSteps, firstRowSteps));

  return (
    <Card style={{ maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden' }} size='small'>
      <div style={{ display: 'flex', marginBottom: '1vh' }}>
        {firstRowStepsData.map((step, index) => renderCard(step, index, 8, { flex: 0.5, display: 'flex', marginRight: '1vh' }))}
      </div>
      <div>
        {leftoverStepsData.map((step, index) => renderCard(step, index + 3, 24, { marginBottom: '1vh', width: '100%' }))}
      </div>
    </Card>
  );
};

OverviewMenu.propTypes = {
  wizardSteps: PropTypes.object.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
  editable: PropTypes.bool.isRequired,
};

export default OverviewMenu;
