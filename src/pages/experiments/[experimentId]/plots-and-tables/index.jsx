import React from 'react';
import PropTypes from 'prop-types';

import PlotsTablesContainer from 'components/plots/PlotsTablesContainer';
import SingleTileContainer from 'components/SingleTileContainer';

const PlotsTablesHome = (props) => {
  const { experimentId, experimentData } = props;

  return (
    <>
      <SingleTileContainer>
        <PlotsTablesContainer experimentId={experimentId} />
      </SingleTileContainer>
    </>
  );
};

PlotsTablesHome.propTypes = {
  experimentId: PropTypes.string.isRequired,
  experimentData: PropTypes.object.isRequired,
};

export default PlotsTablesHome;
