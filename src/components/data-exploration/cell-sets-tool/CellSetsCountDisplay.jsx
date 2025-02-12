import React, { useEffect, useState } from 'react';

import { Typography } from 'antd';
import { countCells } from 'utils/cellSetOperations';
import { getCellSets } from 'redux/selectors';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const { Text } = Typography;

const CellsCountDisplay = (props) => {
  const { selectedCellSetKeys } = props;

  const { properties } = useSelector(getCellSets());

  const [selectedCellsCount, setSelectedCellsCount] = useState(0);

  useEffect(() => {
    setSelectedCellsCount(null);
    countCells(selectedCellSetKeys, properties).then(setSelectedCellsCount);
  }, [selectedCellSetKeys, properties]);

  return (
    <Text type='primary' id='selectedCellSets'>

      {selectedCellsCount === null
        ? 'Counting cells...'
        : `${selectedCellsCount} cell${selectedCellsCount === 1 ? '' : 's'} selected`}

    </Text>
  );
};

CellsCountDisplay.defaultProps = {};

CellsCountDisplay.propTypes = {
  selectedCellSetKeys: PropTypes.array.isRequired,
};

export default CellsCountDisplay;
