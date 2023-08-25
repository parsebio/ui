import { decompress } from 'fflate';

const unpackResult = async (storageResp, taskName = null) => {
  // SeuratObject can fail to download when loaded into memory
  if (taskName === 'DownloadAnnotSeuratObject') {
    const blob = await storageResp.blob();
    return (blob);
  }

  const arrayBuf = await storageResp.arrayBuffer();

  return decompressUint8Array(new Uint8Array(arrayBuf));
};

const decompressUint8Array = async (arrayBuf) => {
  console.log('arrayBufDebug');
  console.log(arrayBuf);
  return (
    new Promise((resolve, reject) => {
      // const uint8array = new Uint8Array(arrayBuf);
      const uint8array = arrayBuf;

      decompress(uint8array, (err, decompressed) => {
        console.log('decompressedDebug');
        console.log(decompressed);

        console.log('errDebug');
        console.log(err);
        if (err) {
          reject(err);
        } else {
          resolve(decompressed);
        }
      });
    })
  );
};

export { decompressUint8Array };
export default unpackResult;
