import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';

const { Text } = Typography;

const Tooltipped = ({ text }) => (
  <Text ellipsis={{ tooltip: text }}>
    {text}
  </Text>
);

Tooltipped.defaultProps = {
  text: '',
};

Tooltipped.propTypes = {
  text: PropTypes.string,
};

export default Tooltipped;
