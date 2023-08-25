import { decompress } from 'fflate';

const logWithDate = (logStr) => {
  const date = new Date();
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();

  console.log(
    `[${(hour < 10) ? `0${hour}` : hour
    }:${(minutes < 10) ? `0${minutes}` : minutes
    }:${(seconds < 10) ? `0${seconds}` : seconds
    }.${(`00${milliseconds}`).slice(-3)
    }] ${logStr}`,
  );
};

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
  logWithDate('arrayBufDebug');
  return (
    new Promise((resolve, reject) => {
      // const uint8array = new Uint8Array(arrayBuf);
      const uint8array = arrayBuf;

      decompress(uint8array, (err, decompressed) => {
        logWithDate('decompressedDebug');

        logWithDate('errDebug');
        logWithDate(err);
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
