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

    this.worker.onmessage = (e) => {
      if (e.data.task === 'loadCellSets') {
        this.cellSetsStored = true;
      } else if (e.data.task === 'countCells') {
        const { id, payload } = e.data;
        this.taskSubscriber[id].resolve(payload);
      }
    };

    this.worker.onerror = (error) => {
      // const { id, payload } = e.data;
      // this.taskSubscriber.reject(error);
    };
  }

  static getInstance() {
    if (!CellSetsWorker.instance) {
      CellSetsWorker.instance = new CellSetsWorker();
    }

    return CellSetsWorker.instance;
  }

  storeCellSets(arrayBuffer) {
    this.worker.postMessage({
      task: 'loadCellSets',
      payload: {
        cellSetsData: arrayBuffer,
      },
    });
  }

  async countCells(cellSetKeys) {
    return new Promise((resolve, reject) => {
      // TODO Check that the cellSets are stored before sending count request

      const id = uuidv4();
      this.taskSubscriber[id] = { resolve, reject };

      this.worker.postMessage({
        task: 'countCells',
        id,
        payload: {
          cellSetKeys,
        },
      });
    });
  }
}

export default CellSetsWorker;
