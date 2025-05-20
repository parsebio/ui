import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import Loader from 'components/Loader';
import ContinuousEmbeddingPlot from 'components/plots/ContinuousEmbeddingPlot';

import { loadGeneExpression } from 'redux/actions/genes';
import { getFilteredCellIds } from 'redux/selectors';

// wrapper component used in plots and tables
// where the data for the embedding needs to be derived from redux
// on change rerendering the component
const ContinuousEmbeddingReduxWrapper = (props) => {
  const {
    experimentId, actions, plotUuid,
  } = props;
  const dispatch = useDispatch();
  const config = useSelector((state) => state.componentConfig[plotUuid]?.config);
  const expressions = useSelector((state) => state.genes.expression.full);
  const filteredCellIds = useSelector(getFilteredCellIds());

  if (!config) return <Loader experimentId={experimentId} />;

  const geneExpression = config.truncatedValues
    ? expressions.matrix.getTruncatedExpressionSparse(config?.shownGene, filteredCellIds)
    : expressions.matrix.getRawExpressionSparse(config?.shownGene, filteredCellIds);

  return (
    <ContinuousEmbeddingPlot
      experimentId={experimentId}
      config={config}
      coloringByCell={geneExpression}
      actions={actions}
      loading={expressions.loading.length > 0}
      error={expressions.error}
      reloadPlotData={() => dispatch(loadGeneExpression(
        experimentId,
        [config?.shownGene],
        plotUuid,
      ))}
    />
  );
};
ContinuousEmbeddingReduxWrapper.defaultProps = {
  actions: true,
};
ContinuousEmbeddingReduxWrapper.propTypes = {
  experimentId: PropTypes.string.isRequired,
  actions: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
  plotUuid: PropTypes.string.isRequired,
};
export default ContinuousEmbeddingReduxWrapper;
