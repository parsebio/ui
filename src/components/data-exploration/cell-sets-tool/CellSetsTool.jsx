import React, {
  useEffect, useState, useCallback,
  useMemo,
} from 'react';
import { animateScroll, Element } from 'react-scroll';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Alert, Button, Skeleton, Space, Tabs,
} from 'antd';
import {
  BlockOutlined, MergeCellsOutlined, SplitCellsOutlined,
} from '@ant-design/icons';

import SubsetCellSetsOperation from 'components/data-exploration/cell-sets-tool/SubsetCellSetsOperation';
import CellSetOperation from 'components/data-exploration/cell-sets-tool/CellSetOperation';
import PlatformError from 'components/PlatformError';
import HierarchicalTree from 'components/data-exploration/hierarchical-tree/HierarchicalTree';
import AnnotateClustersTool from 'components/data-exploration/cell-sets-tool/AnnotateClustersTool';
import CellSetsCountDisplay from 'components/data-exploration/cell-sets-tool/CellSetsCountDisplay';

import {
  createCellSet,
  deleteCellSet,
  deleteCellClass,
  loadCellSets,
  unhideAllCellSets,
  reorderCellSet,
  updateCellSetProperty,
} from 'redux/actions/cellSets';
import { runSubsetExperiment } from 'redux/actions/pipeline';
import { getCellSets } from 'redux/selectors';

import { useAppRouter } from 'utils/AppRouteProvider';
import { modules, permissions } from 'utils/constants';
import { composeTree } from 'utils/cellSets';
import { complement, intersection, union } from 'utils/cellSetOperations';
import PermissionsChecker from 'utils/PermissionsChecker';

const FOCUS_TYPE = 'cellSets';

const CellSetsTool = (props) => {
  const { experimentId, width, height } = props;

  const dispatch = useDispatch();
  const { navigateTo } = useAppRouter();

  const cellSets = useSelector(getCellSets());

  const {
    accessible, error, hierarchy, properties, hidden,
  } = cellSets;

  const [activeTab, setActiveTab] = useState('cellSets');

  useEffect(() => {
    dispatch(loadCellSets(experimentId));
  }, []);

  const [treeData, setTreeData] = useState(null);

  useEffect(() => {
    const composedTree = composeTree(hierarchy, properties);

    setTreeData(composedTree);
  }, [hierarchy, properties]);

  const [selectedCellSetKeys, setSelectedCellSetKeys] = useState([]);

  useEffect(() => {
    const louvainClusters = hierarchy.find(({ key }) => key === 'louvain')?.children;
    const customClusters = hierarchy.find(({ key }) => key === 'scratchpad')?.children;
    const treeClusters = treeData?.find(({ key }) => key === 'scratchpad')?.children;

    if (!customClusters || !treeClusters) return;

    if (customClusters.length > treeClusters.length) {
      // scroll to bottom based on total number of cell sets, overshoot to show new cluster
      const newHeight = (louvainClusters.length + customClusters.length) * 30 + 200;
      animateScroll.scrollTo(newHeight, { containerId: 'cell-set-tool-container' });
    }
  }, [hierarchy]);

  const onNodeUpdate = useCallback((key, data) => {
    dispatch(updateCellSetProperty(experimentId, key, data));
  }, [experimentId]);

  const onNodeDelete = useCallback((key, isCellClass) => {
    if (isCellClass) {
      dispatch(deleteCellClass(experimentId, key));
    } else {
      dispatch(deleteCellSet(experimentId, key));
    }
  }, [experimentId]);

  const onCellSetReorder = useCallback((cellSetKey, newPosition) => {
    dispatch(reorderCellSet(experimentId, cellSetKey, newPosition));
  }, [experimentId]);

  const onCheck = useCallback((keys) => {
    setSelectedCellSetKeys(keys);
  }, [experimentId]);

  const subsetOnCreateHandler = useCallback(async (name) => {
    const newExperimentId = await dispatch(
      runSubsetExperiment(experimentId, name, selectedCellSetKeys),
    );

    navigateTo(modules.DATA_PROCESSING, { experimentId: newExperimentId }, false, true);
  }, [selectedCellSetKeys]);

  const cellSetUnionOnCreateHandler = useCallback((name, color) => {
    dispatch(
      createCellSet(experimentId, name, color, union(selectedCellSetKeys, properties)),
    );
  }, [experimentId, selectedCellSetKeys, properties]);

  const cellSetIntersectionOnCreateHandler = useCallback((name, color) => {
    dispatch(
      createCellSet(experimentId, name, color, intersection(selectedCellSetKeys, properties)),
    );
  }, [experimentId, selectedCellSetKeys, properties]);

  const cellSetComplementOnCreateHandler = useCallback((name, color) => {
    dispatch(createCellSet(
      experimentId,
      name,
      color,
      complement(selectedCellSetKeys, properties, hierarchy),
    ));
  }, [experimentId, selectedCellSetKeys, properties, hierarchy]);

  const showCellSetOperations = selectedCellSetKeys.length > 0;

  const hierarchicalTreeComp = useMemo(() => (
    <HierarchicalTree
      experimentId={experimentId}
      treeData={treeData}
      store={FOCUS_TYPE}
      onCheck={onCheck}
      onNodeUpdate={onNodeUpdate}
      onNodeDelete={onNodeDelete}
      onCellSetReorder={onCellSetReorder}
      showHideButton
    />
  ), [experimentId, treeData, onNodeUpdate, onNodeDelete, onCellSetReorder, onCheck]);

  /**
 * Renders the content inside the tool. Can be a skeleton during loading
 * or a hierarchical tree listing all cell sets.
 */
  const renderContent = () => {
    // Use display style so that components keep around their calculated values
    // If they re-render from scratch, we will see some freezing and have to recalculate stuff
    const displayStyle = showCellSetOperations ? {} : { display: 'none' };

    const operations = (
      <Space data-testid='cell-sets-tool-operations' style={{ marginBottom: '10px', ...displayStyle }}>
        <SubsetCellSetsOperation onCreate={subsetOnCreateHandler} />
        <CellSetOperation
          icon={<MergeCellsOutlined />}
          onCreate={cellSetUnionOnCreateHandler}
          ariaLabel='Union of selected'
          helpTitle='Create new cell set by combining selected sets in the current tab.'
        />
        <CellSetOperation
          icon={<BlockOutlined />}
          onCreate={cellSetIntersectionOnCreateHandler}
          ariaLabel='Intersection of selected'
          helpTitle='Create new cell set from intersection of selected sets in the current tab.'
        />
        <CellSetOperation
          icon={<SplitCellsOutlined />}
          onCreate={cellSetComplementOnCreateHandler}
          ariaLabel='Complement of selected'
          helpTitle='Create new cell set from the complement of the selected sets in the current tab.'
        />
        <CellSetsCountDisplay selectedCellSetKeys={selectedCellSetKeys} />
      </Space>
    );

    const tabItems = [
      {
        key: 'cellSets',
        label: 'Cell sets',
        children: (
          <>
            {operations}
            {hierarchicalTreeComp}
          </>
        ),
      },
      {
        key: 'annotateClusters',
        label: 'Annotate clusters',
        children: (
          <PermissionsChecker permissions={permissions.WRITE}>
            <AnnotateClustersTool
              experimentId={experimentId}
              onRunAnnotation={() => { setActiveTab('cellSets'); }}
            />
          </PermissionsChecker>
        ),
      },
    ];

    return (
      <Space direction='vertical'>
        <Tabs
          size='small'
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={tabItems}
        />
      </Space>
    );
  };

  if (!accessible) return <Skeleton active={false} title={false} />;
  if (!treeData) return <Skeleton active title={false} avatar />;

  if (error) {
    return (
      <PlatformError
        error={error}
        onClick={() => dispatch(loadCellSets(experimentId))}
      />
    );
  }

  return (
    <Element
      className='element'
      id='cell-set-tool-container'
      style={{
        position: 'relative',
        height: `${height - 40}px`,
        width: `${width - 8}px`,
        overflow: 'auto',
        paddingLeft: '5px',
        paddingRight: '5px',
      }}
    >
      <Space direction='vertical'>
        {hidden.size > 0 && (
          <Alert
            message={`${hidden.size} cell set${hidden.size > 1 ? 's are' : ' is'} currently hidden.`}
            type='warning'
            action={<Button type='link' size='small' onClick={() => dispatch(unhideAllCellSets(experimentId))}>Unhide all</Button>}
          />
        )}
        {renderContent()}
      </Space>
    </Element>
  );
};

CellSetsTool.defaultProps = {};

CellSetsTool.propTypes = {
  experimentId: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default CellSetsTool;
