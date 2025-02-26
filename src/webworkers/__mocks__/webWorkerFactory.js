/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-restricted-globals */
class MockedWorker {
  constructor(path) {
    try {
      require(path);

      this.webWorker = {
        onmessage: self.onmessage,
      };

      self.postMessage = (data) => {
        this.onmessage({ data });
      };

      this.onmessage = null;
      this.onerror = null;
    } catch (e) {
      console.error('erroDebug');
      console.error(e);
    }
  }

  postMessage = async (data) => {
    try {
      await this.webWorker.onmessage({ data });
    } catch (e) {
      this.onerror(e);
    }
  }
}

const webWorkerFactory = (workerPath) => new MockedWorker(workerPath);

export default webWorkerFactory;
