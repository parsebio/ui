import React from 'react';
import { Typography, Button, Card } from 'antd';
import PropTypes from 'prop-types';

const { Title } = Typography;

const OverviewMenu = (props) => {
  const { wizardSteps, setCurrentStep } = props;

  return (
    <Card style={{ width: '45%' }} title='The project title here'>
      {wizardSteps.map((step, indx) => (
        <div
          key={step.key}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1%', width: '100%',
          }}
        >
          <Title level={5} style={{ marginRight: '10px', marginBottom: 0, lineHeight: 'normal' }}>
            {step.key}
          </Title>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              Status:
              <span style={{ color: 'green', marginRight: '10px' }}> complete</span>
            </div>
            <Button onClick={() => setCurrentStep(indx)} type='primary'>Edit</Button>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Button type='primary' size='large' style={{ width: '30%' }}>Run the pipeline</Button>
      </div>
    </Card>
  );
};

OverviewMenu.propTypes = {
  wizardSteps: PropTypes.array.isRequired,
  setCurrentStep: PropTypes.func.isRequired,
};

export default OverviewMenu;
