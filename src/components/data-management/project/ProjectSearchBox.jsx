import React, { useCallback } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Tooltip, Input } from 'antd';

const ProjectSearchBox = (props) => {
  const { onChange, projectType } = props;

  const debouncedSetFilterParam = useCallback(
    _.debounce((value) => {
      onChange(new RegExp(value, 'i'));
    }, 400),
    [],
  );
  const tooltipText = projectType === 'secondary' ? 'run' : 'project';

  return (

    <Tooltip title={`To search, insert ${tooltipText} name or ${tooltipText} ID here`} placement='right'>
      <Input
        placeholder={`Filter by ${tooltipText} name or ${tooltipText} ID`}
        onChange={(e) => debouncedSetFilterParam(e.target.value)}
      />
    </Tooltip>
  );
};

ProjectSearchBox.defaultProps = {
  projectType: null,
};

ProjectSearchBox.propTypes = {
  onChange: PropTypes.func.isRequired,
  projectType: PropTypes.string,
};

export default ProjectSearchBox;
