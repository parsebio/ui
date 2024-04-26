import React, { useCallback } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Tooltip, Input } from 'antd';
import fetchAPI from '../../../utils/http/fetchAPI';

const ProjectSearchBox = (props) => {
  const { onChange, projectType } = props;

  const debouncedSetFilterParam = useCallback(
    _.debounce(async (value) => {
      const userPrefix = 'user:';
      if (value.startsWith(userPrefix)) {
        const uuid = value.slice(userPrefix.length).trim();

        if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(uuid)) {
          // mismatch between UI and db conventions.
          const projectTypeDb = projectType === 'secondaryAnalyses' ? 'secondary' : 'tertiary';
          const projectIds = await fetchProjectsByUser(uuid, projectTypeDb);
          console.log(projectIds);
          return;
        }
      }
      onChange(new RegExp(value, 'i'));
    }, 400),
    [],
  );
  const tooltipText = projectType === 'secondaryAnalyses' ? 'run' : 'project';

  return (

    <Tooltip title={`To search, insert ${tooltipText} name or ${tooltipText} ID here`} placement='right'>
      <Input
        placeholder={`Filter by ${tooltipText} name or ${tooltipText} ID`}
        onChange={(e) => debouncedSetFilterParam(e.target.value)}
      />
    </Tooltip>
  );
};

async function fetchProjectsByUser(uuid, projectType) {
  try {
    const response = await fetchAPI(`/v2/user/${uuid}/projects/${projectType}`, { method: 'GET' });
    console.log('RESPONSE');
    console.log(response);
    return response;
  } catch (e) {
    console.error(e);
  }
}

ProjectSearchBox.defaultProps = {
  projectType: null,
};

ProjectSearchBox.propTypes = {
  onChange: PropTypes.func.isRequired,
  projectType: PropTypes.string,
};

export default ProjectSearchBox;
