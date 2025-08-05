import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'antd';

const LinkButton = ({
  icon, link, text, collapsed,
}) => (
  <a href={link} target='_blank' rel='noopener noreferrer' style={{ textDecoration: 'none' }}>
    <Button
      type='text'
      icon={icon}
      style={{ color: 'hsla(0, 0%, 100%, .65)' }}
    >
      {!collapsed && text}
    </Button>
  </a>
);

LinkButton.propTypes = {
  icon: PropTypes.node.isRequired,
  link: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  collapsed: PropTypes.bool.isRequired,
};

export default LinkButton;
