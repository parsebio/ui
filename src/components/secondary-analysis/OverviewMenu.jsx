import React from 'react';
import { Typography, Button, Card } from 'antd';

const { Title } = Typography;

const OverviewMenu = (props) => {
  const { wizardSteps, setCurrentStep } = props;

  const editStep = (stepId) => {
    setCurrentStep(stepId);
  };

  return (
    <Card style={{ width: '45%' }}>
      {Object.keys(wizardSteps).map((key) => (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1%', width: '100%',
        }}
        >
          <Title level={5} style={{ marginRight: '10px', marginBottom: 0, lineHeight: 'normal' }}>
            {wizardSteps[key].title}
          </Title>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              Status:
              <span style={{ color: 'green', marginRight: '10px' }}> complete</span>
            </div>
            <Button onClick={() => editStep(key)} type='primary'>Edit</Button>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Button type='primary' size='large' style={{ width: '30%' }}>Run the pipeline</Button>
      </div>
    </Card>
  );
};

export default OverviewMenu;
