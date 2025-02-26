const webWorkerFactory = (absolutePath) => new Worker(
  new URL(absolutePath, import.meta.url),
);

export default webWorkerFactory;
