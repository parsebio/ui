/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import dynamic from 'next/dynamic';

const Scatterplot = dynamic(
  () => import('../DynamicVitessceWrappers').then((mod) => mod.Scatterplot),
  { ssr: false },
);

const MemoizedScatterPlot = React.memo((props) => <Scatterplot {...props} />);

export default MemoizedScatterPlot;
