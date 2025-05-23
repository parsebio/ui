import React, { useState, useCallback } from 'react';
import { Card } from 'antd';
import PropTypes from 'prop-types';
import getCellInfoCoordinates from 'utils/data-exploration/getCellInfoCoordinates';

const cellInfoStyle = { fontSize: '0.75rem' };

const HeatmapCellInfo = (props) => {
  const {
    containerWidth, containerHeight,
    cellId, geneName,
    geneExpression, coordinates,
  } = props;

  const [tooltipDimensions, setTooltipDimensions] = useState({ width: 0, height: 0 });

  const getTooltipElement = useCallback((el) => {
    if (!el) return;

    setTooltipDimensions({
      width: el.firstChild.offsetWidth,
      height: el.firstChild.offsetHeight,
    });
  }, []);

  const { left, top } = getCellInfoCoordinates(
    coordinates,
    tooltipDimensions,
    containerWidth,
    containerHeight,
  );

  const renderCellInfo = () => (
    // We have to wrap the <Card> in a <div> because Antd does not correctly set the ref
    // https://github.com/ant-design/ant-design/issues/28582
    <div ref={getTooltipElement}>
      <Card
        size='small'
        style={{
          zIndex: 6,
          border: 0,
          position: 'absolute',
          left,
          top,
          pointerEvents: 'none',
        }}
      >
        {cellId ? (
          <div style={cellInfoStyle}>
            {`Cell id: ${cellId}`}
          </div>
        ) : null}
        {geneName ? (
          <div style={cellInfoStyle}>
            {`Gene name: ${geneName}`}
          </div>
        ) : null}
        {geneExpression !== undefined ? (
          <div style={cellInfoStyle}>
            Expression:&nbsp;
            {geneExpression}
          </div>
        ) : null}
      </Card>
    </div>
  );

  if (cellId) {
    return renderCellInfo();
  }

  return null;
};

HeatmapCellInfo.defaultProps = {
  geneExpression: undefined,
};

HeatmapCellInfo.propTypes = {
  containerWidth: PropTypes.number.isRequired,
  containerHeight: PropTypes.number.isRequired,
  cellId: PropTypes.string.isRequired,
  geneName: PropTypes.string.isRequired,
  geneExpression: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.oneOf([undefined, null]),
  ]),
  coordinates: PropTypes.object.isRequired,
};

export default HeatmapCellInfo;
