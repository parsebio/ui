import React, { useMemo } from 'react';

import { Table } from 'antd';
import { useSelector } from 'react-redux';
import { getPairsForFiles } from 'utils/fastqUtils';
import FastqFileType from 'const/enums/FastqFileType';
import FastqImmuneSelect from './FastqImmuneSelect';

const columns = [
  {
    title: 'Sublibrary',
    dataIndex: 'sublibrary',
    key: 'sublibrary',
    width: '20%',
    minWidth: 80,
  },
  {
    title: 'WT FASTQ file pairs',
    dataIndex: 'wtPairs',
    key: 'wtPairs',
    width: '40%',
    minWidth: 160,
  },
  {
    title: 'Immune profiling FASTQ file pairs',
    dataIndex: 'immunePairs',
    key: 'immunePairs',
    width: '40%',
    minWidth: 160,
  },
];

const FastqPairsMatcher = () => {
  const { files, numOfSublibraries } = useSelector((state) => {
    const { activeSecondaryAnalysisId } = state.secondaryAnalyses.meta;
    return state.secondaryAnalyses[activeSecondaryAnalysisId];
  });

  const pairs = useMemo(
    () => getPairsForFiles(files.data),
    [files.data],
  );

  const data = useMemo(() => {
    const rows = [];

    // We rely on the order to determine the sublibrary index,
    // So sorting is VERY important here.
    const sortedWtFastqs = Object.entries(pairs[FastqFileType.WT_FASTQ]).sort(
      ([pairNameA], [pairNameB]) => pairNameA.localeCompare(pairNameB),
    );

    sortedWtFastqs.forEach(([wtPairName], i) => {
      const sublibraryIndex = i + 1;

      rows.push({
        key: sublibraryIndex,
        sublibrary: sublibraryIndex,
        wtPairs: wtPairName,
        immunePairs: (
          <FastqImmuneSelect
            wtPairName={wtPairName}
            pairs={pairs}
          />
        ),
      });
    });

    return rows;
  }, [pairs, numOfSublibraries]);

  return <Table tableLayout='auto' columns={columns} dataSource={data} pagination={false} />;
};

FastqPairsMatcher.propTypes = {};

export default FastqPairsMatcher;
