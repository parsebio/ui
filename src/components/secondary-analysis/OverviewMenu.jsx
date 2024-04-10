import React from 'react';
import {
  Typography, Button, Card, Row, Col,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Text } = Typography;

const OverviewMenu = ({ wizardSteps, setCurrentStep, editable }) => (
  <Card style={{ maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden' }} size='small'>
    {/* Wrap the first three cards in a div with display: flex */}
    <div style={{ display: 'flex', marginBottom: '1vh' }}>
      {wizardSteps.slice(0, 3).map((step, index) => (
        <Col key={step.key} span={8} style={{ flex: 1, display: 'flex' }}>
          <Card
            bordered
            style={{ width: '100%', marginRight: '1vh' }}
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
                icon={<EditOutlined />}
                onClick={(event) => {
                  event.stopPropagation();
                  setCurrentStep(index);
                }}
                type='link'
              />
            )}
          >
            {step.renderMainScreenDetails()}
          </Card>
        </Col>
      ))}
    </div>
    <Row gutter={[16, 16]}>
      {wizardSteps.slice(3).map((step, index) => (
        <Col key={step.key} span={24}>
          <Card
            bordered
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
                icon={<EditOutlined />}
                onClick={(event) => {
                  event.stopPropagation();
                  setCurrentStep(index + 3); // Adjust index for the rest of the cards
                }}
                type='link'
              />
            )}
          >
            {step.renderMainScreenDetails()}
          </Card>
        </Col>
      ))}
    </Row>
  </Card>
);

OverviewMenu.propTypes = {
  wizardSteps: PropTypes.array.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
  editable: PropTypes.bool.isRequired,
};

export default OverviewMenu;
