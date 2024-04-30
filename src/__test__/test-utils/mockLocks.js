const setupNavigatorLocks = () => {
  const mockLockRequest = jest.fn((lock, func) => func());
  global.navigator.locks = {
    request: mockLockRequest,
  };

  return mockLockRequest;
};

const teardownNavigatorLocks = () => {
  delete global.navigator.locks;
};

export { setupNavigatorLocks, teardownNavigatorLocks };
