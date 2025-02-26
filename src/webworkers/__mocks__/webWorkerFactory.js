/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-restricted-globals */
class MockedWorker {
  constructor(path) {
    try {
      require(path);

      this.webWorker = {
        onmessage: self.onmessage,
        postMessage: self.postMessage,
      };

      delete self.onmessage;
      delete self.postMessage;

      this.onmessageHandler = () => { };
      this.onerrorHandler = () => { };
    } catch (e) {
      console.error('erroDebug');
      console.error(e);
    }
    console.log('thiswebWorkerDebug');
    console.log(this.webWorker);

    console.log('selfpostMessageDebug');
    // eslint-disable-next-line no-restricted-globals
    console.log(self.postMessage);
    this.webWorker.postMessage = (data) => {
      this.onmessageHandler({ data });
    };
  }

  onmessage = (cb) => {
    this.onmessageHandler = cb;
  }

  onerror = (cb) => {
    this.onerrorHandler = cb;
  }

  postMessage = async (data) => {
    try {
      await this.webWorker.onmessage({ data });
    } catch (e) {
      this.onerrorHandler(e);
    }
  }
}

const webWorkerFactory = (workerPath) => new MockedWorker(workerPath);

export default webWorkerFactory;
