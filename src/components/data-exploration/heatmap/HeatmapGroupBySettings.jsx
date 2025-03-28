import React, {
  useEffect, useState, useRef, useCallback,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  PlusOutlined,
  MinusOutlined,
  DownOutlined,
} from '@ant-design/icons';

import {
  Button, Space, Dropdown,
} from 'antd';
import PropTypes from 'prop-types';
import { ClipLoader } from 'react-spinners';
import _ from 'lodash';

import { updatePlotConfig } from 'redux/actions/componentConfig';
import { getCellSets, getCellSetsHierarchy } from 'redux/selectors';

import ReorderableList from 'components/ReorderableList';
import colors from 'utils/styling/colors';

const HeatmapGroupBySettings = (props) => {
  const dispatch = useDispatch();

  const { componentType, managedConfig = true, onUserChange = () => { } } = props;

  const groupedTracksKeys = useSelector(
    (state) => state.componentConfig[componentType].config.groupedTracks,
  );
  const { accessible: cellSetsAccessible } = useSelector(getCellSets());
  const allCellSetsGroupBys = useSelector(getCellSetsHierarchy());

  const userCausedChange = useCallback((cellSetsOrder) => {
    const cellSetKeys = cellSetsOrder.map((cellSet) => cellSet.key);
    onUserChange(cellSetKeys);
    setCellSetsOrder(cellSetsOrder);
  }, [onUserChange]);

  const getCellSetsOrder = () => {
    const groupedCellSets = [];

    // from the enabled cell sets keys we get, find their corresponding information
    groupedTracksKeys
      .forEach((trackKey) => {
        const groupBy = allCellSetsGroupBys
          .find((cellSetGroupBy) => cellSetGroupBy.key === trackKey);

        groupedCellSets.push(groupBy);
      });

    // About the filtering: If we have failed to find some of the groupbys information,
    // then ignore those (this is useful for groupbys that sometimes dont show up, like 'samples')
    return groupedCellSets.filter((groupedCellSet) => groupedCellSet !== undefined);
  };

  const isInitialRenderRef = useRef(true);
  const [cellSetsOrder, setCellSetsOrder] = useState(getCellSetsOrder());
  const previousGroupedKeys = () => cellSetsOrder.map((cellSet) => cellSet.key);

  useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }

    if (!managedConfig || cellSetsOrder.length === 0) {
      return;
    }

    const cellSetKeys = cellSetsOrder.map((cellSet) => cellSet.key);

    dispatch(
      updatePlotConfig(componentType, {
        groupedTracks: cellSetKeys,
      }),
    );
  }, [cellSetsOrder]);

  useEffect(() => {
    if (!cellSetsAccessible) return;

    if (!_.isEqual(previousGroupedKeys(), groupedTracksKeys)) {
      const newOrder = getCellSetsOrder();
      // This change is not from this component, it's coming from redux,
      // so we don't want to trigger the onUserChange callback
      setCellSetsOrder(newOrder);
    }
  }, [groupedTracksKeys, cellSetsAccessible]);
  const indexOfCellSet = (cellSet) => cellSetsOrder.findIndex((elem) => (elem.key === cellSet.key));

  // This is so that a click on + or - buttons doesn't close the menu
  const stopPropagationEvent = (e) => e.stopPropagation();
  const menuItems = allCellSetsGroupBys
    .map((cellSet, indx) => {
      const positionInCellSetOrder = indexOfCellSet(cellSet);

      return {
        label: (
          <div onClick={stopPropagationEvent} onKeyDown={stopPropagationEvent}>
            <Button
              shape='square'
              size='small'
              style={{ marginRight: '5px' }}
              icon={positionInCellSetOrder > -1 ? <MinusOutlined /> : <PlusOutlined />}
              onClick={() => {
                const newCellSetsOrder = [...cellSetsOrder];
                if (positionInCellSetOrder > -1) {
                  newCellSetsOrder.splice(positionInCellSetOrder, 1);
                } else {
                  newCellSetsOrder.push(cellSet);
                }

                userCausedChange(newCellSetsOrder);
              }}
            />
            {cellSet.name}
          </div>
        ),
        key: indx.toString(),
      };
    });

  return (
    <div style={{ padding: '5px' }} key='dropdown'>
      <Space direction='vertical'>
        <Dropdown menu={{ items: menuItems }} trigger='click hover'>
          <div style={{ padding: '7px', border: '1px solid rgb(238,238,238)' }}>
            Select the parameters to group by
            <DownOutlined style={{ marginLeft: '5px' }} />
          </div>
        </Dropdown>

        {cellSetsAccessible
          ? (
            <ReorderableList
              onChange={userCausedChange}
              listData={cellSetsOrder}
              rightItem={(cellSet) => cellSet.name}
            />
          ) : <center><ClipLoader size={20} color={colors.darkRed} /></center>}
      </Space>
    </div>
  );
};

HeatmapGroupBySettings.defaultProps = {
  managedConfig: undefined,
  onUserChange: undefined,
};

HeatmapGroupBySettings.propTypes = {
  componentType: PropTypes.string.isRequired,
  managedConfig: PropTypes.bool,
  onUserChange: PropTypes.func,
};

export default HeatmapGroupBySettings;
