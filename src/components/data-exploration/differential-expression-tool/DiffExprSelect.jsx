import React from 'react';
import _ from 'lodash';

import { composeTree } from 'utils/cellSets';
import PropTypes from 'prop-types';
import {
  Form, Select,
} from 'antd';

const { Option, OptGroup } = Select;

const DiffExprSelect = (props) => {
  const {
    title, option, filterTypes, onSelectCluster, selectedComparison, cellSets, value,
  } = props;

  // Depending on the cell set type specified, set the default name
  const placeholder = filterTypes.includes('metadataCategorical') ? 'sample/group' : 'cell set';
  const { hierarchy, properties } = cellSets;
  const tree = composeTree(hierarchy, properties, filterTypes);

  const renderChildren = (rootKey, children) => {
    if (!children || children.length === 0) { return null; }

    // If this is the `compareWith` option, we need to add `the rest`
    // under the group previously selected.
    if (option === 'compareWith' && properties[selectedComparison.cellSet]?.parentNodeKey === rootKey) {
      children.unshift({ key: 'rest', name: `Rest of ${properties[rootKey].name}` });
    }

    const shouldDisable = (key) => {
      // Should always disable something already selected.
      const isAlreadySelected = Object.values(selectedComparison)?.includes(key);

      // or a cell set that is not in the same group as selected previously in `cellSet`
      const parentGroup = properties[selectedComparison.cellSet]?.parentNodeKey;

      const isNotInTheSameGroup = rootKey !== parentGroup;

      // If the button is "rest of ..." then we should disable it if there is no rest available
      // (if selectedComparison.cellSet chose the only avilable cell set in that cell class)
      const noRestAvailable = option === 'compareWith' && key === 'rest' && _.find(hierarchy, { key: parentGroup }).children.length <= 1;

      return isAlreadySelected || (option === 'compareWith' && isNotInTheSameGroup) || noRestAvailable;
    };

    if (selectedComparison) {
      return children.map(({ key, name }) => (
        <Option key={key} disabled={shouldDisable(key)}>
          {name}
        </Option>
      ));
    }
  };

  return (
    <Form.Item label={title}>
      <Select
        placeholder={`Select a ${placeholder}...`}
        style={{ width: 200 }}
        onChange={(cellSet) => onSelectCluster(cellSet, option)}
        // if we are in the volcano plot, the values are stored in redux,
        //  so we can just use the object if we are in batch differential expression,
        //  the value is managed by state variables so we send it
        value={value ?? selectedComparison[option] ?? null}
        size='small'
        aria-label={title}
      >
        {
          option === 'basis'
          && (
            <Option key='all'>
              All
            </Option>
          )
        }
        {
          option === 'compareWith'
          && (
            <Option key='background'>
              All other cells
            </Option>
          )
        }
        {
          tree && tree.map(({ key, children }) => (
            <OptGroup label={properties[key]?.name} key={key}>
              {renderChildren(key, [...children])}
            </OptGroup>
          ))
        }
      </Select>
    </Form.Item>
  );
};

DiffExprSelect.defaultProps = {
  value: null,
};

DiffExprSelect.propTypes = {
  title: PropTypes.string.isRequired,
  selectedComparison: PropTypes.object.isRequired,
  cellSets: PropTypes.object.isRequired,
  option: PropTypes.string.isRequired,
  filterTypes: PropTypes.array.isRequired,
  onSelectCluster: PropTypes.func.isRequired,
  value: PropTypes.string,
};
export default DiffExprSelect;
