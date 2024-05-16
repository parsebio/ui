import React, { useCallback } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Tooltip, Input } from 'antd';
import fetchAPI from '../../../utils/http/fetchAPI';
import validateInput, { rules } from '../../../utils/validateInputs';

const ProjectSearchBox = (props) => {
  const { onChange, projectType } = props;

  const debouncedSetFilterParam = useCallback(
    _.debounce(async (value) => {
      const userPrefix = 'user:';
      if (value.startsWith(userPrefix)) {
        const userId = value.slice(userPrefix.length).trim();

        // filter by user id or email
        if (
          !(validateInput(userId, rules.VALID_UUID).isValid
            || validateInput(userId, rules.VALID_EMAIL).isValid)
        ) {
          return;
        }

        const projectIds = await fetchProjectsByUser(userId, projectType);
        if (projectIds && projectIds.length > 0) {
          onChange(new RegExp(projectIds.join('|'), 'i'));
        } else {
          // match nothing
          onChange(new RegExp('^(?!x)x'));
          console.log('No projects found for the specified user and project type.');
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

async function fetchProjectsByUser(userId, projectType) {
  // mismatch between UI and db conventions.
  const projectTypeDb = projectType === 'secondaryAnalyses' ? 'secondary' : 'tertiary';

  try {
    const response = await fetchAPI(`/v2/user/${userId}/projects/${projectTypeDb}`, { method: 'GET' });
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
