import CellSetsWorker from './cellSets/CellSetsWorker';

class WorkerPool {
  constructor() {
    this.cellSetsWorker = new CellSetsWorker();
  }

  static getInstance() {
    if (!WorkerPool.instance) {
      WorkerPool.instance = new WorkerPool();
    }

    return WorkerPool.instance;
  }
}

export default WorkerPool;
