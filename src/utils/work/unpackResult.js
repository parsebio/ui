import { decompress } from 'fflate';
import CellSetsWorker from 'webworkers/cellSets/CellSetsWorker';

const unpackResult = async (storageResp, taskName = null) => {
  // SeuratObject can fail to download when loaded into memory
  if (taskName === 'DownloadAnnotSeuratObject' || taskName === 'GetNormalizedExpression') {
    const blob = await storageResp.blob();
    return (blob);
  }

  if (taskName === 'CellSets') {
    const arrayBuffer = await storageResp.arrayBuffer();

    const uint8Arr = new Uint8Array(arrayBuffer);

    CellSetsWorker.getInstance().storeCellSets(arrayBuffer);

    // cell sets dont come compressed
    if (taskName === 'CellSets') {
      return uint8Arr;
    }
  }

  const arrayBuf = new Uint8Array(await storageResp.arrayBuffer());

  // cell sets dont come compressed
  if (taskName === 'CellSets') {
    return arrayBuf;
  }

  return decompressUint8Array(arrayBuf);
};

const decompressUint8Array = async (array) => (
  new Promise((resolve, reject) => {
    decompress(array, (err, decompressed) => {
      if (err) {
        reject(err);
      } else {
        resolve(decompressed);
      }
    });
  })
);

export { decompressUint8Array };
export default unpackResult;
