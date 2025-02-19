import { v4 as uuidv4 } from 'uuid';

class CellSetsWorker {
  constructor() {
    this.worker = new Worker(
      new URL('./worker.js', import.meta.url),
    );

    this.cellSetsStored = false;

    // TODO expand this to support subscribers to different tasks
    // once we have more tasks
    this.taskSubscriber = {};

    this.activeIdByTask = {
      countCells: null,
    };

    this.worker.onmessage = (e) => {
      if (e.data.task === 'loadCellSets') {
        this.cellSetsStored = true;
      } else if (e.data.task === 'cellSetCreated') {
        const { id } = e.data;

        this.taskSubscriber[id].resolve();
      } else if (e.data.task === 'countCells') {
        const { id, payload } = e.data;

        if (this.activeIdByTask.countCells === id) {
          this.taskSubscriber[id].resolve(payload);
        }

        delete this.taskSubscriber[id];
      }
    };

    this.worker.onerror = () => {
      // this.worker.onerror = (error) => {
      // const { id, payload } = e.data;
      // this.taskSubscriber[id].reject(error);
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
      task: 'loadCellSets',
      payload: {
        cellSetsData: arrayBuffer,
      },
    }, [arrayBuffer]);
  }

  async countCells(cellSetKeys) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      this.taskSubscriber[id] = { resolve, reject };

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
}

export default CellSetsWorker;
