import React from 'react';
import { Table, Popconfirm } from 'antd';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { deleteSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';
import bytesToSize from 'utils/styling/bytesToSize';
import FastqFileType from 'const/enums/FastqFileType';
import { DeleteOutlined } from '@ant-design/icons';
import UploadStatusView from 'components/UploadStatusView';
import UploadStatus from 'utils/upload/UploadStatus';
import PrettyTime from 'components/PrettyTime';
import KitCategory, { isKitCategory } from 'const/enums/KitCategory';
import FastqTypeButton from './FastqTypeButton';

const { IMMUNE_FASTQ, WT_FASTQ } = FastqFileType;
const FastqFilesTable = (props) => {
  const dispatch = useDispatch();
  const {
    files, canEditTable, secondaryAnalysisId, pairedWt, kit,
  } = props;

  const getFastqIsActive = (fileType) => {
    if (isKitCategory(kit, [KitCategory.WT])) {
      return fileType === WT_FASTQ;
    } if (isKitCategory(kit, [KitCategory.TCR, KitCategory.BCR]) && !pairedWt) {
      return fileType === IMMUNE_FASTQ;
    }
    return true;
  };

  const filteredFiles = Object.values(files).filter((file) => getFastqIsActive(file.type));

  filteredFiles.sort((a) => {
    if (a.type === WT_FASTQ) return -1;
    return 1;
  });

  const dataSource = filteredFiles.map((file) => ({
    key: file.id,
    name: file.name,
    size: bytesToSize(file.size),
    status: file.upload.status,
    createdAt: file.createdAt,
    progress: file.upload.percentProgress,
    type: pairedWt ? file.type : undefined,
  }));

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
            record.status.current !== UploadStatus.EXPIRED ? (
              <Popconfirm
                title='Are you sure you want to delete this file?'
                onConfirm={() => handleDelete(record.key)}
                okText='Yes'
                cancelText='No'
              >
                <DeleteOutlined style={{ color: 'red' }} />
              </Popconfirm>
            ) : (
              <DeleteOutlined style={{ color: 'red' }} onClick={() => handleDelete(record.key)} />
            )
          )}
        </div>
      ),
    },
    ...(pairedWt ? [
      {
        title: 'Type',
        dataIndex: 'type',
        width: '20%',
        render: (_, { key }) => (
          <FastqTypeButton
            secondaryAnalysisId={secondaryAnalysisId}
            fileId={key}
          />
        ),
      },
    ] : []),
    {
      title: 'Size',
      dataIndex: 'size',
      width: '20%',
    },
    {
      title: 'Date Uploaded',
      dataIndex: 'createdAt',
      render: (createdAt) => (
        <PrettyTime isoTime={createdAt} />
      ),
      width: '20%',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: '25%',
      render: (status, record) => (
        <UploadStatusView
          status={status.current}
          progress={record.progress}
          fileId={record.key}
          secondaryAnalysisId={secondaryAnalysisId}
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
      pagination={canEditTable ? false : { pageSize: pairedWt ? 4 : 8, hideOnSinglePage: true }}
      style={{ height: '100%' }}
      scroll={{ y: `calc(90vh - ${500}px)` }}
    />
  );
};

FastqFilesTable.propTypes = {
  files: PropTypes.object.isRequired,
  canEditTable: PropTypes.bool.isRequired,
  secondaryAnalysisId: PropTypes.string.isRequired,
  pairedWt: PropTypes.oneOfType([() => null, PropTypes.bool]).isRequired,
  kit: PropTypes.oneOfType([() => null, PropTypes.string]).isRequired,
};

export default FastqFilesTable;
