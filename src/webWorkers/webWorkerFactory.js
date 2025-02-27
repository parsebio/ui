const CELL_SETS = 'cellSets';

// Have to do this because URL can't receive variables without failing
// Similar issue happened with the new Worker call
const workers = {
  [CELL_SETS]: () => new Worker(new URL('webWorkers/cellSets/worker.js', import.meta.url)),
};

const webWorkerFactory = (key) => workers[key]();

export default webWorkerFactory;

export { CELL_SETS };
