import React from 'react';
import { Table } from 'antd';

const FileTable = (props) => {
  const { files } = props;
  console.log('FILESI N THE TABLE ARE ', files);
  const columns = [
    {
      Header: 'File Name',
      accessor: 'name',
    },
    {
      Header: 'Size',
      accessor: 'size',
    },
    {
      Header: 'Status',
      accessor: 'status',
    },
  ];

  return (
    <Table columns={columns} data={files} />
  );
};

export default FileTable;
