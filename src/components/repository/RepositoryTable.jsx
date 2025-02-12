import {
  Button,
  Card,
  Empty,
  Space,
  Table,
  Typography,
  Tooltip,
} from 'antd';
import {
  CloseOutlined,
} from '@ant-design/icons';
import { loadExperiments, setActiveExperiment } from 'redux/actions/experiments';

import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import React, { useState } from 'react';
import fetchAPI from 'utils/http/fetchAPI';
import { modules } from 'utils/constants';
import { useAppRouter } from 'utils/AppRouteProvider';
import { techNamesToDisplay } from 'utils/upload/fileUploadUtils';
import sendInvites from 'utils/data-management/experimentSharing/sendInvites';

const { Paragraph } = Typography;

const RepositoryTable = (props) => {
  const [experimentCloning, setExperimentCloning] = useState(false);

  const userEmail = useSelector((state) => state.user.current.attributes.email);

  const cloneExperiment = async (exampleExperimentId) => {
    if (exampleExperimentId === 'c26b1fc8-e207-4a45-90ae-51b730617bee') {
      // for this specific experiment, just share it as explorer and go to data exploration
      await sendInvites(
        [userEmail],
        {
          id: exampleExperimentId,
          name: 'Valentine day challenge',
          role: 'explorer',
        },
      );
      await dispatch(loadExperiments());
      await dispatch(setActiveExperiment(exampleExperimentId));
      navigateTo(modules.DATA_EXPLORATION, { experimentId: exampleExperimentId });
      return;
    }

    setExperimentCloning(true);
    const url = `/v2/experiments/${exampleExperimentId}/clone`;

    const newExperimentId = await fetchAPI(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    await dispatch(loadExperiments());
    await dispatch(setActiveExperiment(newExperimentId));
    setExperimentCloning(false);
    navigateTo(modules.DATA_MANAGEMENT, { experimentId: newExperimentId });
  };

  // Make ready-to-use rows for the table
  // e.g. turn sourceTitle+sourceUrl into a single <a> tag, etc.
  const formatData = (data) => data.map((row) => ({
    key: row.id,
    name: row.name,
    explore: <Tooltip title='Click to explore this project.'><Button type='primary' disabled={experimentCloning} aria-label='clone' onClick={() => cloneExperiment(row.id)}>Explore</Button></Tooltip>,
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
  const dispatch = useDispatch();

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
