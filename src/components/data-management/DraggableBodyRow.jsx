// TODO Fix the disable eslint rules here
import React, { useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const type = 'DraggableBodyRow';

const DraggableBodyRow = React.forwardRef((props, ref) => {
  const {
    // eslint-disable-next-line react/prop-types
    index, moveRow, className, style, ...restProps
  } = props;

  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};

      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
      };
    },
    drop: (item) => {
      moveRow((item).index, index);
    },
  }, [index]);

  const [, drag] = useDrag(() => ({
    type,
    item: { type, index },
  }), [index]);

  useEffect(() => {
    drop(drag((ref?.current)));
  }, []);

  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move', ...style }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
    />
  );
});

export default DraggableBodyRow;
