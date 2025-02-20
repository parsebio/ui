import { v4 as uuidv4 } from 'uuid';

class CellSetsWorker {
  constructor() {
    this.worker = new Worker(
      new URL('./worker.js', import.meta.url),
    );

    // TODO expand this to support subscribers to different tasks
    // once we have more tasks
    this.taskSubscriber = {};

    this.activeIdByTask = {
      countCells: null,
    };

    this.worker.onmessage = (e) => {
      const {
        id, task, payload, error,
      } = e.data;

      if (error) {
        this.taskSubscriber[id].reject(error);
      }

      if (this.activeIdByTask[task] === id) {
        this.taskSubscriber[id].resolve(payload);
      }

      delete this.taskSubscriber[id];
    };

    this.worker.onerror = (error) => {
      // An unhandled error took place, reject everything because we don't know what failed
      Object.keys(this.taskSubscriber).forEach((id) => {
        this.taskSubscriber[id].reject(error);
        delete this.taskSubscriber[id];
      });
    };
  }

  static getInstance() {
    if (!CellSetsWorker.instance) {
      CellSetsWorker.instance = new CellSetsWorker();
    }

    return CellSetsWorker.instance;
  }

  async cellSetCreated(cellSet) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();

      this.activeIdByTask.cellSetCreated = id;
      this.taskSubscriber[id] = { resolve, reject };

      this.worker.postMessage({
        id,
        task: 'cellSetCreated',
        payload: {
          cellSet,
        },
      });
    });
  }

  async storeCellSets(arrayBuffer) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();

      this.activeIdByTask.storeCellSets = id;
      this.taskSubscriber[id] = { resolve, reject };

      this.worker.postMessage({
        id,
        task: 'storeCellSets',
        payload: {
          cellSetsData: arrayBuffer,
        },
      }, [arrayBuffer]);
    });
  }

  async countCells(cellSetKeys) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();

      this.activeIdByTask.countCells = id;
      this.taskSubscriber[id] = { resolve, reject };

      this.worker.postMessage({
        id,
        task: 'countCells',
        payload: {
          cellSetKeys,
        },
      });
    });
  }
}

export default CellSetsWorker;
