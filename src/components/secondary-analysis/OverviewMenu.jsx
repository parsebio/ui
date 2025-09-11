import React from 'react';

import {
  Typography, Button, Card, Row,
  Col,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import Disabler from 'utils/Disabler';

const { Text } = Typography;

const OverviewMenu = ({
  wizardSteps, setCurrentStep, activeStepsGrid, editable,
}) => {
  const renderCard = (step, wizardIndex, style) => {
    const disableText = step.getDisableText?.() ?? 'This step is disabled until the previous steps are completed.';

    return (
      <div key={step.key} style={style}>
        <Disabler disable={step.getIsDisabled()} tooltipText={disableText}>
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
                data-testid={`edit-button-${step.key} `}
                icon={<EditOutlined />}
                onClick={(event) => {
                  event.stopPropagation();
                  setCurrentStep(wizardIndex);
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
  };

  let wizardIndex = -1;
  const getWizardIndex = () => {
    wizardIndex += 1;
    return wizardIndex;
  };

  const renderGrid = (grid, steps, isRow = true) => {
    if (Array.isArray(grid)) {
      if (isRow) {
        return (
          grid.map((col) => (
            <Row gutter={[2, 2]} key={col} style={{ height: `${100 / grid.length}%` }}>
              {renderGrid(col, steps, !isRow)}
            </Row>
          ))
        );
      }

      return (
        grid.map((col) => (
          <Col flex={1} key={col} style={{ width: `${100 / grid.length}%` }}>
            {renderGrid(col, steps, !isRow)}
          </Col>
        ))
      );
    }

    return renderCard(steps[grid], getWizardIndex(), { width: '100%', height: '100%' });
  };

  return renderGrid(activeStepsGrid, wizardSteps);
};

OverviewMenu.propTypes = {
  wizardSteps: PropTypes.object.isRequired,
  activeStepsGrid: PropTypes.array.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
  editable: PropTypes.bool.isRequired,
};

export default OverviewMenu;
