import React, { useEffect, useRef, useState } from 'react';

import { Typography } from 'antd';
import { countCells, unionByCellClass } from 'utils/cellSetOperations';
import { getCellSets } from 'redux/selectors';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const { Text } = Typography;

const CellSetsCountDisplay = (props) => {
  const { selectedCellSetKeys } = props;

  const { accessible, hierarchy, properties } = useSelector(getCellSets());

  const filteredCellIds = useRef(new Set());
  useEffect(() => {
    if (accessible && filteredCellIds.current.size === 0) {
      filteredCellIds.current = unionByCellClass('louvain', hierarchy, properties);
    }
  }, [accessible, hierarchy]);

  const [selectedCellsCount, setSelectedCellsCount] = useState(0);

  useEffect(() => {
    const cellsCount = countCells(selectedCellSetKeys, filteredCellIds.current, properties);

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
