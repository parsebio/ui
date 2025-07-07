import React, { useMemo } from 'react';

import { Table } from 'antd';
import { useSelector } from 'react-redux';
import { getPairs } from 'utils/fastqUtils';
import FastqFileType from 'const/enums/FastqFileType';

const columns = [
  {
    title: 'Sublibrary',
    dataIndex: 'sublibrary',
    key: 'sublibrary',
  },
  {
    title: 'WT FASTQ file pairs',
    dataIndex: 'wtPairs',
    key: 'wtPairs',
  },
  {
    title: 'Immune profiling FASTQ file pairs',
    dataIndex: 'immunePairs',
    key: 'immunePairs',
  },
];

const FastqPairsMatcher = () => {
  console.log('weriufneriufneiu');
  const { files, numOfSublibraries } = useSelector((state) => {
    const { activeSecondaryAnalysisId } = state.secondaryAnalyses.meta;
    return state.secondaryAnalyses[activeSecondaryAnalysisId];
  });

  const pairs = useMemo(
    () => getPairs(files.data),
    [files.data],
  );

  const data = useMemo(() => {
    const rows = [];

    Object.entries(pairs[FastqFileType.WT_FASTQ]).forEach(([pairName, fileIds], i) => {
      rows.push({
        key: i,
        sublibrary: i,
        wtPairs: pairName,
        immunePairs: null,
      });
    });

    return rows;
  }, [pairs]);

  return <Table columns={columns} dataSource={data} pagination={false} />;
};
FastqPairsMatcher.propTypes = {
};

export default FastqPairsMatcher;
