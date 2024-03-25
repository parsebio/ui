import * as React from 'react';

// Custom useEffect hook that skips on initial render (mount).
const useLazyEffect = (callback, dependencies) => {
  const initializeRef = React.useRef(false);

  React.useEffect((...args) => {
    if (initializeRef.current) {
      callback(...args);
    } else {
      initializeRef.current = true;
    }
  }, dependencies);
};

export default useLazyEffect;
