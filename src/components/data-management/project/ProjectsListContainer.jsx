import {
  Button,
  Dropdown,
  Menu,
  Space,
} from 'antd';
import React, { useState } from 'react';
import { useAppRouter } from 'utils/AppRouteProvider';

import PropTypes from 'prop-types';
import integrationTestConstants from 'utils/integrationTestConstants';
import { modules } from 'utils/constants';
import ProjectsList from './ProjectsList';
import ProjectSearchBox from './ProjectSearchBox';

const ProjectsListContainer = (props) => {
  const { height, onCreateNewProject, projectType } = props;

  const { navigateTo } = useAppRouter();
  const [filterParam, setFilterParam] = useState(new RegExp('.*', 'i'));

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

  return (
    <Space direction='vertical' style={{ width: '100%' }}>
      <Dropdown
        menu={{ items: menuItems }}
        trigger={['click']}
        placement='bottomRight'
      >
        <Button
          data-test-id={integrationTestConstants.ids.CREATE_NEW_PROJECT_BUTTON}
          type='primary'
          block
        >
          Create New
          {' '}
          {projectType === 'secondary' ? 'Run' : 'Project'}
        </Button>
      </Dropdown>
      <ProjectSearchBox projectType={projectType} onChange={(searchRegex) => setFilterParam(searchRegex)} />
      {projectType !== 'secondary' ? <ProjectsList height={height} filter={filterParam} />
        : <></>}
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
