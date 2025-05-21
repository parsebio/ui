import { Row, Typography } from 'antd';
import React from 'react';
import PropTypes from 'prop-types';
import { ClipLoader } from 'react-spinners';

const { Text } = Typography;

const SamplesLoader = (props) => {
  const { samplesLoading, samplesValidating } = props;

  return (
    <>
      <Row justify='center'>
        <ClipLoader
          size={50}
          color='#8f0b10'
        />
      </Row>

      <Row justify='center'>
        <Text>
          {
            samplesLoading ? 'We\'re getting your samples ...'
              : samplesValidating ? 'We\'re validating your samples ...'
                : ''
          }
        </Text>
      </Row>
    </>
  );
};
SamplesLoader.propTypes = {
  samplesLoading: PropTypes.bool.isRequired,
  samplesValidating: PropTypes.bool.isRequired,
};

export default SamplesLoader;
