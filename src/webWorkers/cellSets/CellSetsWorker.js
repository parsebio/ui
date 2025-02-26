import { v4 as uuidv4 } from 'uuid';
import hash from 'object-hash';
import webWorkerFactory from 'webworkers/webWorkerFactory';

class CellSetsWorker {
  constructor() {
    this.worker = webWorkerFactory('webworkers/cellSets/worker.js');

    this.cellSetsStored = false;

    // TODO expand this to support subscribers to different tasks
    // once we have more tasks
    this.taskSubscriber = {};

    this.taskCache = {
      countCells: {},
    };

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

      if (task === 'storeCellSets') {
        this.cellSetsStored = true;
      } else if (task === 'cellSetCreated') {
        this.taskSubscriber[id].resolve();
      } else if (task === 'countCells') {
        if (this.activeIdByTask.countCells === id) {
          this.taskSubscriber[id].resolve(payload);
        }

        delete this.taskSubscriber[id];
      }
    };

    this.worker.onerror = (error) => {
      // An unhandled error took place, reject everything because we don't know what failed
      console.error(error);

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

  cellSetCreated(cellSet) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
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

  storeCellSets(arrayBuffer) {
    const id = uuidv4();

    this.worker.postMessage({
      id,
      task: 'storeCellSets',
      payload: {
        cellSetsData: arrayBuffer,
      },
    }, [arrayBuffer]);

    this.invalidateCache();
  }

  async countCells(cellSetKeys) {
    return new Promise((resolve, reject) => {
      const inputHash = hash.MD5([...cellSetKeys].sort());
      const cachedResult = this.taskCache.countCells[inputHash];
      if (cachedResult) {
        resolve(cachedResult);
        return;
      }

      const id = uuidv4();

      this.taskSubscriber[id] = {
        resolve: (result) => {
          this.taskCache.countCells[inputHash] = result;
          return resolve(result);
        },
        reject,
      };

      this.activeIdByTask.countCells = id;

      this.worker.postMessage({
        id,
        task: 'countCells',
        payload: {
          cellSetKeys,
        },
      });
    });
  }

  invalidateCache() {
    Object.keys(this.taskCache).forEach((task) => {
      this.taskCache[task] = {};
    });
  }
}

export default CellSetsWorker;
