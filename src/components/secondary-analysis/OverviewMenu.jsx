import React from 'react';
import {
  Typography, Button, Card, Row, Col, Space,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Text } = Typography;

const OverviewMenu = ({ wizardSteps, setCurrentStep }) => (
  <Card style={{ maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden' }}>
    <Row gutter={[16, 16]}>
      {wizardSteps.map((step, index) => {
        const spanSize = index < 3 ? 8 : 24; // First three cards have span 8, fourth card has span 24
        const cardStyle = {
          height: index === 3 ? '350px' : '250px',
        };

        return (
          <Col key={step.key} span={spanSize}>
            <Card
              bordered
              style={cardStyle}
              title={(
                <div style={{ display: 'flex' }}>
                  <Text
                    strong
                    style={{
                      overflow: 'auto',
                    }}
                  >
                    {step.key}
                  </Text>
                  {step.isValid ? (
                    <CheckCircleOutlined style={{ color: 'green', marginLeft: '10px' }} />
                  ) : (
                    <CloseCircleOutlined style={{ color: 'red', marginLeft: '10px' }} />
                  )}
                </div>
              )}
              extra={(
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
              <Space direction='vertical' style={{ width: '100%' }}>
                {step.renderMainScreenDetails()}
              </Space>
            </Card>
          </Col>
        );
      })}
    </Row>
  </Card>
);

OverviewMenu.propTypes = {
  wizardSteps: PropTypes.array.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
};

export default OverviewMenu;
