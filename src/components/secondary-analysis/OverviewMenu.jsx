import React from 'react';
import {
  Typography, Button, Card, Row, Col,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Text } = Typography;

const OverviewMenu = ({ wizardSteps, setCurrentStep, editable }) => (
  <Card style={{ maxHeight: '80vh', overflowY: 'auto', overflowX: 'hidden' }} size='small'>
    <Row gutter={[16, 16]}>
      {wizardSteps.map((step, index) => {
        const spanSize = index < 3 ? 8 : 24; // First three cards have span 8, fourth card has span 24
        const cardStyle = {
          height: index === 3 ? '50vh' : '24vh',
        };

        return (
          <Col key={step.key} span={spanSize}>
            <Card
              bordered
              style={cardStyle}
              loading={step.isLoading}
              size='small'
              title={(
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Text
                    strong
                    style={{
                      fontSize: '17px',
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
        );
      })}
    </Row>
  </Card>
);

OverviewMenu.propTypes = {
  wizardSteps: PropTypes.array.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
  editable: PropTypes.bool.isRequired,
};

export default OverviewMenu;
