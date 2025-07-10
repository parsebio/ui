import React from 'react';
import {
  Typography, Button, Card, Row, Col,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import Disabler from 'utils/Disabler';

const { Text } = Typography;

const OverviewMenu = ({ wizardSteps, setCurrentStep, editable }) => {
  const renderCard = (step, index, isFlex = false) => (
    <Col key={step.key} span={isFlex ? 8 : 24} style={isFlex ? { flex: 0.5, display: 'flex', marginRight: '1vh' } : {}}>
      <Disabler disable={step.getIsDisabled()} tooltipText='This step is disabled until the previous steps are completed.'>
        <Card
          bordered
          style={{ width: '100%' }}
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
          {
            step.getIsDisabled()
              ? null
              : step.renderMainScreenDetails()
          }
        </Card>
      </Disabler>
    </Col>
  );

  return (
    <Card style={{ maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden' }} size='small'>
      <div style={{ display: 'flex', marginBottom: '1vh' }}>
        {wizardSteps.slice(0, 3).map((step, index) => renderCard(step, index, true))}
      </div>
      <Row gutter={[16, 16]}>
        {wizardSteps.slice(3).map((step) => renderCard(step, 3))}
      </Row>
    </Card>
  );
};

OverviewMenu.propTypes = {
  wizardSteps: PropTypes.array.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
  editable: PropTypes.bool.isRequired,
};

export default OverviewMenu;
