import React, { useMemo } from 'react';

import { Table } from 'antd';
import { useSelector } from 'react-redux';
import { getPairs } from 'utils/fastqUtils';

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

  const pairs = useMemo(() => {
    const thepairs = getPairs(files.data);

    console.log('pairsDebug');
    console.log(thepairs);
  }, [files]);

  const wtPairs = useMemo(() => {

  });

  const immunePairs = useMemo(() => {
  });

  const data = [];
  // const data = [
  //  {
  //    key: '1',
  //    sublibrary: 'Sub1',
  //    wtPairs: 'file1_R1.fastq, file1_R2.fastq',
  //    immunePairs: 'file2_R1.fastq, file2_R2.fastq'
  //  },
  // ];

  return <Table columns={columns} dataSource={data} pagination={false} />;
};
FastqPairsMatcher.propTypes = {
};

export default FastqPairsMatcher;
