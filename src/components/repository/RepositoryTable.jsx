import React from 'react';

import {
  Button,
  Card,
  Empty,
  Space,
  Table,
  Typography,
} from 'antd';
import {
  CloseOutlined,
} from '@ant-design/icons';

import PropTypes from 'prop-types';

import ExploreSelect from 'components/repository/ExploreSelect';
import { modules } from 'const';
import { useAppRouter } from 'utils/AppRouteProvider';
import { techNamesToDisplay } from 'utils/upload/fileUploadUtils';

const { Paragraph } = Typography;

const RepositoryTable = (props) => {
  // Make ready-to-use rows for the table
  // e.g. turn sourceTitle+sourceUrl into a single <a> tag, etc.
  const formatData = (data) => data.map((row) => ({
    key: row.id,
    name: row.name,
    explore: (
      <ExploreSelect experiment={row} />
    ),
    publication: <a href={row.publicationUrl}>{row.publicationTitle}</a>,
    dataSource: <a href={row.dataSourceUrl}>{row.dataSourceTitle}</a>,
    species: row.species,
    sampleCount: row.sampleCount,
    cellCount: row.cellCount,
    sampleTechnology: techNamesToDisplay[row.sampleTechnology],
    description: row.description,
  }));

  const { data } = props;
  const formattedData = formatData(data);

  const { navigateTo } = useAppRouter();

  const onCloseTable = () => {
    navigateTo(modules.DATA_MANAGEMENT);
  };

  const locale = {
    emptyText: (
      <Empty
        imageStyle={{ height: 60 }}
        description={(
          <Space size='middle' direction='vertical'>
            <Paragraph>
              There are no experiments in the repository yet.
            </Paragraph>
          </Space>
        )}
      />
    ),
  };

  return (
    <Card
      title='Public Datasets Repository'
      extra={(
        <Button onClick={onCloseTable}>
          <CloseOutlined />
        </Button>
      )}
    >
      <Table
        dataSource={formattedData}
        columns={TABLE_COLUMNS}
        locale={locale}
        showHeader={formattedData.length > 0}
        pagination={false}
      />
    </Card>

  );
};

RepositoryTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.exact({
      id: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
      publicationTitle: PropTypes.string,
      publicationUrl: PropTypes.string,
      dataSourceTitle: PropTypes.string,
      dataSourceUrl: PropTypes.string,
      species: PropTypes.string,
      sampleCount: PropTypes.string,
      cellCount: PropTypes.number,
      sampleTechnology: PropTypes.string,
    }),
  ),
};

RepositoryTable.defaultProps = {
  data: [],
};

const TABLE_COLUMNS = [
  {
    title: '',
    dataIndex: 'explore',
    key: 'explore',
  },
  {
    title: 'Dataset name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Publication',
    dataIndex: 'publication',
    key: 'publication',
  },
  {
    title: 'Data Source',
    dataIndex: 'dataSource',
    key: 'dataSource',
  },
  {
    title: 'Species',
    dataIndex: 'species',
    key: 'species',
  },
  {
    title: 'Sample Count',
    dataIndex: 'sampleCount',
    key: 'sampleCount',
  },
  {
    title: 'Cell Count Estimate',
    dataIndex: 'cellCount',
    key: 'cellCount',
  },
  {
    title: 'Technology',
    dataIndex: 'sampleTechnology',
    key: 'sampleTechnology',
  },
  {
    title: 'Short description',
    dataIndex: 'description',
    key: 'description',
  },
];

export default RepositoryTable;
