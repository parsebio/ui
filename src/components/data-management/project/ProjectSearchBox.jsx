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

      let searchRegex = new RegExp(value, 'i');

      if (value.startsWith(userPrefix)) {
        const searchBy = value.slice(userPrefix.length).trim();
        searchRegex = await getUserSearchRegex(searchBy, projectType);
      }

      onChange(searchRegex);
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

const fetchProjectsByUser = async (userId, projectType) => {
  // mismatch between UI and db conventions.
  const projectTypeDb = projectType === 'secondaryAnalyses' ? 'secondary' : 'tertiary';

  try {
    const response = await fetchAPI(`/v2/user/${userId}/projects/${projectTypeDb}`, { method: 'GET' });
    return response;
  } catch (e) {
    console.error(e);
  }
};

const getUserSearchRegex = async (searchBy, projectType) => {
  // filter by user id or email
  if (
    !(validateInput(searchBy, rules.VALID_UUID).isValid
      || validateInput(searchBy, rules.VALID_EMAIL).isValid)
  ) {
    return;
  }

  try {
    const projectIds = await fetchProjectsByUser(searchBy, projectType);
    if (projectIds.length > 0) {
      return new RegExp(projectIds.join('|'), 'i');
    }
    // if empty list, match nothing (instead of matching everything)
    return /^(?!x)x/;
  } catch (e) {
    if (e.response && e.response.status === 403) {
      // if unauthorized revert to default behaviour
      return new RegExp(searchBy, 'i');
    }
    console.error(e);
  }
};

ProjectSearchBox.defaultProps = {
  projectType: null,
};

ProjectSearchBox.propTypes = {
  onChange: PropTypes.func.isRequired,
  projectType: PropTypes.string,
};

export default ProjectSearchBox;
