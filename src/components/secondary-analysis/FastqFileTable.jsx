import React, { useEffect } from 'react';
import { Table, Space, Popconfirm } from 'antd';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { deleteSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';
import bytesToSize from 'utils/styling/bytesToSize';
import { DeleteOutlined } from '@ant-design/icons';
import UploadStatusView from 'components/UploadStatusView';
import uploadSecondaryAnalysisFile from 'utils/secondary-analysis/uploadSecondaryAnalysisFile';
import cache from 'utils/cache';

const FastqFileTable = (props) => {
  const dispatch = useDispatch();
  const { files, canEditTable, secondaryAnalysisId } = props;

  const dataSource = Object.values(files).map((file) => ({
    key: file.id,
    name: file.name,
    size: bytesToSize(file.size),
    status: file.upload.status,
    progress: file.upload.percentProgress,
  }));

  const resumeUpload = async (fileId) => {
    const cachedFile = await cache.get(fileId);
    const { file, uploadUrlParams } = cachedFile;
    await uploadSecondaryAnalysisFile(
      file, secondaryAnalysisId, { ...uploadUrlParams, resumeUpload: true }, dispatch,
    );
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'name',
      width: '55%',
      render: (text, record) => (
        <div>
          {text}
          {' '}
          {canEditTable && (
            <Popconfirm
              title='Are you sure to delete this file?'
              onConfirm={() => handleDelete(record.key)}
              okText='Yes'
              cancelText='No'
            >
              <DeleteOutlined style={{ color: 'red' }} />
            </Popconfirm>
          )}
        </div>
      ),
    }, {
      title: 'Size',
      dataIndex: 'size',
      width: '20%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '25%',
      render: (status, record) => (
        <UploadStatusView
          status={status}
          progress={record.progress}
          resumeUpload={async () => await resumeUpload(record.key)}
        />
      ),
    },
  ];

  const handleDelete = (key) => {
    dispatch(deleteSecondaryAnalysisFile(secondaryAnalysisId, key));
  };

  return (
    <Table
      size='small'
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      scroll={{ y: 200 }}
    />
  );
};

FastqFileTable.propTypes = {
  files: PropTypes.object.isRequired,
  canEditTable: PropTypes.bool.isRequired,
  secondaryAnalysisId: PropTypes.string.isRequired,
};

export default FastqFileTable;
