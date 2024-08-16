import { isNil } from 'lodash';

const downloadFromUrl = (url, options = {}) => {
  const { fileName = null, newTab = false } = options;

  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;

  if (newTab) link.target = '_blank';

  if (!isNil(fileName)) link.download = fileName;

  document.body.appendChild(link);
  link.click();

  // Delay the revocation of the object URL to ensure the download starts
  setTimeout(() => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(link.href);
    }
    link.parentNode.removeChild(link);
  }, 1000); // Increased delay to 1000ms
};

export default downloadFromUrl;
