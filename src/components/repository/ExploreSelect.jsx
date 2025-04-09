import React, { useCallback, useState } from 'react';
import { Button, Dropdown } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { loadExperiments, setActiveExperiment } from 'redux/actions/experiments';

import { modules } from 'utils/constants';
import { useAppRouter } from 'utils/AppRouteProvider';
import fetchAPI from 'utils/http/fetchAPI';
import sendInvites from 'utils/data-management/experimentSharing/sendInvites';

const ExploreSelect = (props) => {
  const { experiment } = props;

  const { navigateTo } = useAppRouter();
  const dispatch = useDispatch();

  const userEmail = useSelector((state) => state.user.current.attributes.email);

  const [experimentCloning, setExperimentCloning] = useState(false);

  const addAsViewer = useCallback(async () => {
    // for this specific experiment, just share it as explorer and go to data exploration
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
      label: <div aria-label='view'>View</div>,
    },
    {
      key: 'explore',
      onClick: cloneExperiment,
      label: <div aria-label='clone'>Copy</div>,
    },
  ];

  return (
    <Dropdown
      menu={{
        items: menuItems,
      }}
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
