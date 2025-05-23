import React, { useState } from 'react';
import {
  Button,
  Dropdown,
  Menu,
  Space,
} from 'antd';
import PropTypes from 'prop-types';
import { useAppRouter } from 'utils/AppRouteProvider';
import integrationTestConstants from 'utils/integrationTestConstants';
import { modules } from 'utils/constants';

import ProjectsList from './ProjectsList';
import ProjectSearchBox from './ProjectSearchBox';

const ProjectsListContainer = (props) => {
  const { height, onCreateNewProject, projectType } = props;

  const { navigateTo } = useAppRouter();
  const [filterParam, setFilterParam] = useState(/.*/i);

  const menuItems = [
    {
      label: 'Upload Project',
      key: 'upload_project',
      onClick: () => onCreateNewProject(),
    },
    {
      label: 'Select from Dataset Repository',
      key: 'copy_from_repository',
      onClick: () => { navigateTo(modules.REPOSITORY); },
    },
  ];

  // Conditionally render button based on projectType
  const createButton = projectType === 'secondaryAnalyses' ? (
    <Button
      data-test-id={integrationTestConstants.ids.CREATE_NEW_PROJECT_BUTTON}
      type='primary'
      block
      onClick={onCreateNewProject}
    >
      Create New Run
    </Button>
  ) : (
    <Dropdown
      overlay={<Menu items={menuItems} />}
      trigger={['click']}
      placement='bottomRight'
    >
      <Button
        data-test-id={integrationTestConstants.ids.CREATE_NEW_PROJECT_BUTTON}
        type='primary'
        block
      >
        Create New Project
      </Button>
    </Dropdown>
  );

  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      {createButton}
      <ProjectSearchBox
        projectType={projectType}
        onChange={(searchRegex) => setFilterParam(searchRegex)}
      />
      <ProjectsList height={height} filter={filterParam} projectType={projectType} />
    </Space>
  );
};

ProjectsListContainer.defaultProps = {
  projectType: null,
};

ProjectsListContainer.propTypes = {
  height: PropTypes.number.isRequired,
  onCreateNewProject: PropTypes.func.isRequired,
  projectType: PropTypes.string,
};

export default ProjectsListContainer;
