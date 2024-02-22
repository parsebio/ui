import React from 'react';
import {
  Typography, Button, Card, Row, Col, Space,
} from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Text } = Typography;

const OverviewMenu = ({ wizardSteps, setCurrentStep }) => (
  <Card style={{ width: '100%', overflowY: 'auto' }}>
    <Row gutter={[16, 16]}>
      {wizardSteps.map((step, index) => (
        <Col key={step.key} span={12}>
          <Card
            bordered
            title={(
              <>
                <Text strong>{step.key}</Text>
                {step.isValid ? (
                  <CheckCircleOutlined style={{ color: 'green', marginLeft: '10px' }} />
                ) : (
                  <CloseCircleOutlined style={{ color: 'red', marginLeft: '10px' }} />
                )}
              </>
            )}
            extra={(
              <Button
                icon={<EditOutlined />}
                onClick={(event) => {
                  event.stopPropagation(); // This line is now redundant but kept for consistency
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
      ))}
    </Row>
  </Card>
);

OverviewMenu.propTypes = {
  wizardSteps: PropTypes.array.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
};

export default OverviewMenu;
