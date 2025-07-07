import React, { useMemo } from 'react';
import _ from 'lodash';

import { Table } from 'antd';
import { useSelector } from 'react-redux';
import { getPairs } from 'utils/fastqUtils';
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

    Array.from({ length: numOfSublibraries }).forEach((_val, i) => {
      const entry = Object.entries(pairs[FastqFileType.WT_FASTQ])[i];

      if (_.isNil(entry)) {
        return;
      }

      const [pairName, fileIds] = entry;

      rows.push({
        key: i,
        sublibrary: i,
        wtPairs: pairName,
        immunePairs: (
          <FastqImmuneSelect
            sublibraryIndex={i}
            pairs={pairs[FastqFileType.IMMUNE_FASTQ]}
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
