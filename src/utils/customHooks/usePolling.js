import { useCallback, useEffect, useRef } from 'react';

const usePolling = (callback, dependencies, interval = 30000) => {
  const timerRef = useRef(null);

  const scheduleCallback = useCallback(() => {
    timerRef.current = setTimeout(async () => {
      // Wait until current fetch finished before starting the timer for the next one
      await callback();
      scheduleCallback();
    }, interval);
  }, dependencies);

  useEffect(() => {
    scheduleCallback();

    // On destroy, stop polling
    return () => clearTimeout(timerRef.current);
  }, dependencies);
};

export default usePolling;
