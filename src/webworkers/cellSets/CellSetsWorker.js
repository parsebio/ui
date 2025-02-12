class CellSetsWorker {
  constructor() {
    this.worker = new Worker(
      new URL('./worker.js', import.meta.url),
    );

    this.cellSetsStored = false;

    // TODO expand this to support subscribers to different tasks
    // once we have more tasks
    this.cellsCountSubscriber = null;

    this.worker.onmessage = (e) => {
      if (e.data.task === 'loadCellSets') {
        this.cellSetsStored = true;
      } else if (e.data.task === 'countCells') {
        this.cellsCountSubscriber.resolve(e.data.payload);
      }
    };

    this.worker.onerror = (error) => {
      this.cellsCountSubscriber.reject(error);
    };
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

      this.cellsCountSubscriber = { resolve, reject };

      this.worker.postMessage({
        task: 'countCells',
        payload: {
          cellSetKeys,
        },
      });
    });
  }
}

export default CellSetsWorker;
