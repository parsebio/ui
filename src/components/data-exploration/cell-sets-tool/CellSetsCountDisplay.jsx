import React, { useEffect, useState } from 'react';

import { Typography } from 'antd';
import { countCells } from 'utils/cellSetOperations';
import { getCellSets, getFilteredCellIds } from 'redux/selectors';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const { Text } = Typography;

const CellSetsCountDisplay = (props) => {
  const { selectedCellSetKeys } = props;

  const { properties } = useSelector(getCellSets());

  const filteredCellIds = useSelector(getFilteredCellIds({ asSet: true }));

  const [selectedCellsCount, setSelectedCellsCount] = useState(0);

  useEffect(() => {
    const cellsCount = countCells(selectedCellSetKeys, filteredCellIds, properties);

    setSelectedCellsCount(cellsCount);
  }, [selectedCellSetKeys, properties]);

  return (
    <Text type='primary' id='selectedCellSets'>
      {`${selectedCellsCount} cell${selectedCellsCount === 1 ? '' : 's'} selected`}
    </Text>
  );
};

CellSetsCountDisplay.defaultProps = {};

CellSetsCountDisplay.propTypes = {
  selectedCellSetKeys: PropTypes.array.isRequired,
};

export default CellSetsCountDisplay;
