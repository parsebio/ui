import PropTypes from 'prop-types';
import { ClipLoader, BounceLoader } from 'react-spinners';
import { Typography } from 'antd';
import useSWR from 'swr';
import React from 'react';
import { useSelector } from 'react-redux';
import fetchAPI from 'utils/http/fetchAPI';

const { Text } = Typography;

const slowLoad = () => (
  <>
    <div style={{ padding: 25 }}>
      <center>
        <BounceLoader
          size={50}
          color='#8f0b10'
          css={{ display: 'block' }}
        />
      </center>
    </div>
    <p>
      <Text>
        This will take a few minutes...
      </Text>
    </p>
    <p>
      <Text type='secondary'>
        We&apos;re setting up your analysis after a period of inactivity. Please wait.
      </Text>
    </p>
  </>
);

const fastLoad = (message) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  }}
  >
    <div style={{ padding: 25 }}>
      <ClipLoader
        size={50}
        color='#8f0b10'
      />
    </div>
    <p style={{ textAlign: 'center' }}>
      <Text>
        {message ?? "We're getting your data ..."}
      </Text>
    </p>
  </div>
);

const Loader = ({ experimentId }) => {
  console.log('DEB Loader component rendered with experimentId:', experimentId);

  const backendStatus = useSelector((state) => state.backendStatus);
  console.log('DEB backendStatus:', backendStatus);

  const workerInfo = backendStatus?.[experimentId]?.status?.worker;
  console.log('DEB workerInfo:', workerInfo);


  const { data: workerStatus } = useSWR(
    () => (experimentId ? `/v2/experiments/${experimentId}/backendStatus` : null),
    fetchAPI,
  );
  console.log('DEB workerStatus:', workerStatus);


  if (!workerStatus) {
    console.log('DEB Displaying fastLoad: Assigning a worker to your analysis');
    return (
      <div>
        {fastLoad('Assigning a worker to your analysis')}
      </div>
    );
  }

  if (workerInfo && workerInfo.userMessage) {
    console.log('DEB Displaying fastLoad with userMessage:', workerInfo.userMessage);

    const { userMessage } = workerInfo;
    return (
      <div>
        {fastLoad(userMessage)}
      </div>
    );
  }

  const { worker: { started, ready } } = workerStatus;
  console.log('DEB Worker status - started:', started, 'ready:', ready);

  if (started && ready) {
    console.log('DEB Displaying fastLoad: Assigning a worker to your analysis (worker started and ready)');
    return (
      <div>
        {fastLoad('Assigning a worker to your analysis')}
      </div>
    );
  }

  console.log('DEB Displaying slowLoad');
  return (
    <div>
      {slowLoad()}
    </div>
  );
};

Loader.propTypes = {
  experimentId: PropTypes.string.isRequired,
};

export default Loader;
export { fastLoad, slowLoad };
