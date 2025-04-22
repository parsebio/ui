import React, { useCallback, useState } from 'react';
import { Button, Dropdown } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { loadExperiments, setActiveExperiment } from 'redux/actions/experiments';

import { modules } from 'utils/constants';
import { useAppRouter } from 'utils/AppRouteProvider';
import fetchAPI from 'utils/http/fetchAPI';
import sendInvites from 'utils/data-management/experimentSharing/sendInvites';

// eslint-disable-next-line react/prop-types
const DropdownLabel = ({ title, description, key }) => (
  <div
    aria-label={key}
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      maxWidth: '450px',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
    }}
  >
    <span>{title}</span>
    <span
      style={{
        marginLeft: '10px',
        color: 'gray',
      }}
    >
      {description}
    </span>
  </div>
);

const ExploreSelect = (props) => {
  const { experiment } = props;

  const { navigateTo } = useAppRouter();
  const dispatch = useDispatch();

  const userEmail = useSelector((state) => state.user.current.attributes.email);

  const [experimentCloning, setExperimentCloning] = useState(false);
  const disableCloneForExperiments = ['879080ff-e0a1-4dd4-9244-6b1bdc6e8514',
    'ce0fa9ed-aed5-4f77-8d9d-3a108abc326f', '4810d1c9-c205-4711-acb3-294b229ddd42', 'cf3fe02e-1279-4176-84e4-a3611a602882'];

  const addAsViewer = useCallback(async () => {
    await sendInvites(
      [userEmail],
      {
        id: experiment.id,
        name: experiment.name,
        role: 'viewer',
      },
      true,
    );
    await dispatch(loadExperiments());
    await dispatch(setActiveExperiment(experiment.id));
    navigateTo(modules.DATA_EXPLORATION, { experimentId: experiment.id });
  });

  const cloneExperiment = useCallback(async () => {
    setExperimentCloning(true);
    const url = `/v2/experiments/${experiment.id}/clone`;

    const newExperimentId = await fetchAPI(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await dispatch(loadExperiments());
    await dispatch(setActiveExperiment(newExperimentId));
    setExperimentCloning(false);
    navigateTo(modules.DATA_MANAGEMENT, { experimentId: newExperimentId });
  }, [experiment.id]);

  const menuItems = [
    {
      key: 'view',
      onClick: addAsViewer,
      label: (
        <DropdownLabel
          key='view'
          title='View'
          description={
            'Viewers can explore all aspects of the project including '
            + 'data processing settings and plots, clusters and UMAPs, '
            + 'differential expression and a variety of plot visualizations. '
            + 'However, Viewers cannot change settings or clusters.'
          }
        />
      ),
    },
    {
      key: 'copy',
      onClick: cloneExperiment,
      disabled: disableCloneForExperiments.includes(experiment.id),
      label: (
        <DropdownLabel
          key='clone'
          title='Copy'
          description={
            'By creating a copy, you will become the project Owner. '
            + 'Owners have full control over data processing settings, '
            + 'clusters including the generation of custom clusters, '
            + 'and all changes are saved. Note that copying large projects '
            + 'can take some time.'
          }
        />
      ),
    },
  ];

  return (
    <Dropdown
      menu={{
        items: menuItems,
      }}
      trigger={['click']}
    >
      <Button type='primary' disabled={experimentCloning}>
        Explore
      </Button>
    </Dropdown>
  );
};

ExploreSelect.propTypes = {
  experiment: PropTypes.object.isRequired,
};

ExploreSelect.defaultProps = {};

export default ExploreSelect;
