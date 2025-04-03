import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { loadGeneExpression } from 'redux/actions/genes';
import ContinuousEmbeddingPlot from './ContinuousEmbeddingPlot';

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

  if (!config) { return <></>; }

  const geneExpression = config.truncatedValues
    ? expressions.matrix.getTruncatedExpression(config?.shownGene)
    : expressions.matrix.getRawExpression(config?.shownGene);

  return (
    <ContinuousEmbeddingPlot
      experimentId={experimentId}
      config={config}
      coloringByCell={geneExpression}
      actions={actions}
      loading={expressions.loading.length > 0}
      error={expressions.error}
      reloadPlotData={() => dispatch(loadGeneExpression(
        experimentId, [config?.shownGene], plotUuid,
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
