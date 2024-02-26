import React from 'react';
import { Table, Space } from 'antd'; // Import Space for better layout of the delete icon
import PropTypes from 'prop-types';
import bytesToSize from 'utils/styling/bytesToSize';
import { DeleteOutlined } from '@ant-design/icons';

const FileTable = (props) => {
  const { files, canEditTable } = props;
  const dataSource = Object.values(files).map((file) => ({
    key: file.id,
    name: file.name,
    size: bytesToSize(file.size),
    status: file.upload.status,
  }));

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'name',
      render: (text, record) => (
        <Space size='middle'>
          {text}
          {canEditTable && (
            <DeleteOutlined
              style={{ color: 'red' }}
              onClick={() => handleDelete(record.key)}
            />
          )}
        </Space>
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
  ];

  const handleDelete = (key) => {
    // Implement the delete functionality here
    console.log('Deleting file with key:', key);
    // You might want to update the 'files' prop or state depending on your data structure and state management
  };

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      scroll={{ y: 200 }}
    />
  );
};

FileTable.propTypes = {
  files: PropTypes.object.isRequired,
  canEditTable: PropTypes.bool.isRequired, // Make sure to define the prop type for canEditTable
};

export default FileTable;
