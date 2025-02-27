/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */

import { CELL_SETS } from 'webWorkers/webWorkerFactory';

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

const workerPaths = {
  [CELL_SETS]: 'webWorkers/cellSets/worker.js',
};

const webWorkerFactory = (workerKey) => new MockedWorker(workerPaths[workerKey]);

export default webWorkerFactory;
