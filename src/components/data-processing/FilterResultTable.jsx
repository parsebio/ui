import React from 'react';
import PropTypes from 'prop-types';

import filterResultWarningMessages from 'utils/filterResultWarningMessages';

import { Table, Empty, Alert } from 'antd';

const FilterResultTable = (props) => {
  const { tableData, warnings = [] } = props;

  const renderTable = () => {
    // loadPlotConfig returns an empty array in case plot data does not exist
    // Meanwhile, this data for this table is an object. So if tableData is an array
    // That means table data does not exist
    if (Array.isArray(tableData)
        || !tableData?.after
        || !tableData?.before
    ) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
    }

    const { before, after } = tableData;

    // Rearrange data to fit table
    const titles = {
      num_cells: 'Number of barcodes',
      total_genes: 'Total number of genes',
      median_genes: 'Median number of genes per cell',
      median_umis: 'Median transcripts per cell',
    };

    const percentChanged = (number, total, decimalPoints = 2) => {
      const ratio = Math.round((number / total) * (10 ** decimalPoints)) / (10 ** decimalPoints);
      const percent = ratio * 100;
      const fixedDecimal = percent.toFixed(3);
      return fixedDecimal > 0 ? `+${fixedDecimal}` : `${fixedDecimal}`;
    };

    const dataSource = Object.keys(before).map((key) => ({
      key,
      title: titles[key],
      before: before[key],
      after: after[key],
      percentChanged: percentChanged(after[key] - before[key], before[key], 5),
    }));

    const columns = [
      {
        fixed: 'left',
        title: 'Statistics',
        dataIndex: 'title',
        key: 'title',
      },
      {
        title: '# before',
        dataIndex: 'before',
        key: 'before',
      },
      {
        title: '# after',
        dataIndex: 'after',
        key: 'after',
      },
      {
        title: '% changed',
        dataIndex: 'percentChanged',
        key: 'percentChanged',
      },
    ];
    return (
      <div>
        {warnings.length > 0 && (
          warnings.map((warning) => (
            <Alert
              message={filterResultWarningMessages[warning]}
              type='info'
              showIcon
            />
          )))}
        <Table
          bordered
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          size='small'
        />
      </div>
    );
  };

  return renderTable();
};

const filterTableDataShape = PropTypes.shape({
  before: PropTypes.object,
  after: PropTypes.object,
}).isRequired;

FilterResultTable.propTypes = {
  tableData: PropTypes.oneOfType([
    PropTypes.array,
    filterTableDataShape,
  ]).isRequired,
};

export default FilterResultTable;
