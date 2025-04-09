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
  const { experimentId } = props;

  const { navigateTo } = useAppRouter();
  const dispatch = useDispatch();

  const userEmail = useSelector((state) => state.user.current.attributes.email);

  const [experimentCloning, setExperimentCloning] = useState(false);

  const cloneExperiment = useCallback(async () => {
    if (experimentId === 'c26b1fc8-e207-4a45-90ae-51b730617bee') {
      // for this specific experiment, just share it as explorer and go to data exploration
      await sendInvites(
        [userEmail],
        {
          id: experimentId,
          name: 'Valentine day challenge',
          role: 'explorer',
        },
        true,
      );
      await dispatch(loadExperiments());
      await dispatch(setActiveExperiment(experimentId));
      navigateTo(modules.DATA_EXPLORATION, { experimentId });
      return;
    }

    setExperimentCloning(true);
    const url = `/v2/experiments/${experimentId}/clone`;

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
  }, [experimentId]);

  const menuItems = [
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
  experimentId: PropTypes.string.isRequired,
};

ExploreSelect.defaultProps = {};

export default ExploreSelect;
