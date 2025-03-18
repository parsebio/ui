import React, { useState, useEffect, useRef } from 'react';
import {
  useSelector,
  useDispatch,
} from 'react-redux';
import {
  Space, Button, Alert, Tooltip,
} from 'antd';
import Link from 'next/link';
import { LeftOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { getCellSets } from 'redux/selectors';
import loadDifferentialExpression from 'redux/actions/differentialExpression/loadDifferentialExpression';

import GeneTable from 'components/data-exploration/generic-gene-table/GeneTable';

import AdvancedFilteringModal from 'components/data-exploration/differential-expression-tool/AdvancedFilteringModal';
import LaunchPathwayAnalysisModal from 'components/data-exploration/differential-expression-tool/LaunchPathwayAnalysisModal';
import { setGeneOrdering } from 'redux/actions/differentialExpression';

import {
  loadProcessingSettings,
} from 'redux/actions/experimentSettings';

const DiffExprResults = (props) => {
  const {
    experimentId, onGoBack, width, height,
  } = props;

  const dispatch = useDispatch();
  const {
    data, error, loading,
  } = useSelector((state) => state.differentialExpression.properties);
  const {
    type: comparisonType,
    group: comparisonGroup,
    advancedFilters,
  } = useSelector((state) => state.differentialExpression.comparison);
  const { properties } = useSelector(getCellSets());

  const [dataShown, setDataShown] = useState(data);
  const [exportAlert, setExportAlert] = useState(false);
  const [settingsListed, setSettingsListed] = useState(false);
  const [advancedFilteringModalVisible, setAdvancedFilteringModalVisible] = useState(false);
  const [pathwayAnalysisModalVisible, setPathwayAnalysisModalVisible] = useState(false);
  const [columns, setColumns] = useState([]);
  const geneTableState = useRef({});

  const processingConfig = useSelector((state) => state.experimentSettings.processing);
  if (Object.keys(processingConfig).length <= 1) {
    dispatch(loadProcessingSettings(experimentId));
  }

  const buildColumns = (rowData) => {
    const rowDataKeys = Object.keys(rowData[0]);
    return columnDefinitions.filter(({ key }) => rowDataKeys.includes(key));
  };

  useEffect(() => {
    if (!data.length || !Object.keys(properties).length) return;
    setColumns(buildColumns(data));
    setDataShown(data);
  }, [data, properties]);

  const loadData = (loadAllState) => {
    geneTableState.current = loadAllState;
    const { sorter } = loadAllState;

    const sortOrder = sorter.order === 'ascend' ? 'ASC' : 'DESC';
    dispatch(setGeneOrdering(sorter.field, sortOrder));

    dispatch(
      loadDifferentialExpression(
        experimentId,
        comparisonGroup[comparisonType],
        comparisonType,
        loadAllState,
      ),
    );
  };

  const applyAdvancedFilters = (filters) => {
    dispatch(loadDifferentialExpression(
      experimentId,
      comparisonGroup[comparisonType],
      comparisonType,
      geneTableState.current,
      filters,
    ));
  };

  const renderOptionName = (key) => {
    let printString = '';

    const isNode = properties[key];

    if (key === 'rest') {
      const parentName = properties[properties[cellSet].parentNodeKey].name;
      printString = `Rest of ${parentName}`;
    } else if (!isNode) {
      printString = _.capitalize(key);
    } else {
      printString = properties[key]?.name;
    }

    return <strong>{printString}</strong>;
  };

  const { basis, cellSet, compareWith } = comparisonGroup[comparisonType];

  const renderExportAlert = () => {
    if (!exportAlert) return null;
    return (
      <Alert
        message={(
          <span>
            Exporting to CSV is not currently available here. Use the&nbsp;
            <Link
              target='_blank'
              as={`/experiments/${experimentId}/plots-and-tables/volcano`}
              href='/experiments/[experimentId]/plots-and-tables/volcano'
              passHref
            >
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a target='_blank'>volcano plot</a>
            </Link>
            &nbsp;in Plots and Tables to export results (opens in new tab).
          </span>
        )}
        type='info'
        showIcon
        closable
        onClose={() => {
          setExportAlert(false);
        }}
      />
    );
  };

  return (
    <Space direction='vertical' style={{ width: '100%' }}>

      {/* This is needed so changes to the export alert don't cause the table to re-render. */}
      <Space direction='vertical' style={{ width: '100%' }}>
        <Button size='small' onClick={onGoBack}>
          <span>
            <LeftOutlined />
            Go back
          </span>
        </Button>
        {renderExportAlert()}
        <Space direction='horizontal'>
          <Button id='settingsButton' onClick={() => setSettingsListed(!settingsListed)}>
            {settingsListed ? 'Hide' : 'Show'}
            {' '}
            settings
          </Button>
          <Button onClick={() => setAdvancedFilteringModalVisible(!advancedFilteringModalVisible)}>
            Advanced filtering
          </Button>
        </Space>
      </Space>
      {advancedFilteringModalVisible && (
        <AdvancedFilteringModal
          onLaunch={(filters) => {
            applyAdvancedFilters(filters);
            setAdvancedFilteringModalVisible(false);
          }}
          onCancel={() => setAdvancedFilteringModalVisible(false)}
        />
      )}
      {settingsListed
        ? (
          <div id='settingsText'>
            {renderOptionName(cellSet)}
            {' '}
            vs.
            {' '}
            {renderOptionName(compareWith)}
            {' '}
            in
            {' '}
            {renderOptionName(basis)}
          </div>
        ) : <div />}
      {' '}
      <Alert message='Only the 5000 most variable genes are shown.' type='info' showIcon />
      {' '}
      <GeneTable
        experimentId={experimentId}
        initialTableState={{
          sorter: {
            field: 'logFC',
            columnKey: 'logFC',
            order: 'descend',
          },
        }}
        columns={columns}
        loading={loading}
        error={error}
        width={width}
        height={height - 70 - (exportAlert ? 70 : 0) - (settingsListed ? 70 : 0)}
        propData={dataShown}
        loadData={loadData}
        extraOptions={(
          <>
            <Button type='link' size='small' onClick={() => setExportAlert(true)}>Export as CSV</Button>
            <Button type='link' size='small' onClick={() => setPathwayAnalysisModalVisible(!pathwayAnalysisModalVisible)}>Pathway analysis</Button>
          </>
        )}
        geneColumnTooltipText='All genes present in the dataset are shown in the differential expression results table. Note that a gene is typically considered ‘differentially expressed’ based on established thresholds on adjusted p-value and/or log fold change. You should apply your own criteria and thresholds to filter the resulting list of genes using the "Advanced filtering" button.'
      />
      {
        pathwayAnalysisModalVisible && (
          <LaunchPathwayAnalysisModal
            onOpenAdvancedFilters={() => setAdvancedFilteringModalVisible(true)}
            onCancel={() => setPathwayAnalysisModalVisible(false)}
            advancedFiltersAdded={advancedFilters.length > 0}
          />
        )
      }
    </Space>
  );
};

const columnDefinitions = [
  {
    title: 'logFC',
    key: 'logFC',
    sorter: true,
    showSorterTooltip: false,
  },
  {
    title: 'adj p-value',
    key: 'p_val_adj',
    sorter: true,
    showSorterTooltip: false,
    render: (score, record) => <Tooltip title={`adj p-value: ${record.p_val_adj}`}>{score}</Tooltip>,
  },
  {
    title: 'Pct 1',
    key: 'pct_1',
    sorter: true,
    showSorterTooltip: {
      title: 'The percentage of cells where the feature is detected in the first group',
    },
  },
  {
    title: 'Pct 2',
    key: 'pct_2',
    sorter: true,
    showSorterTooltip: {
      title: 'The percentage of cells where the feature is detected in the second group',
    },
  },
  {
    title: 'AUC',
    key: 'auc',
    sorter: true,
    showSorterTooltip: {
      title: 'Area under the ROC curve',
    },
  },
];

DiffExprResults.defaultProps = {};

DiffExprResults.propTypes = {
  experimentId: PropTypes.string.isRequired,
  onGoBack: PropTypes.func.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

export default DiffExprResults;
