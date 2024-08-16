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

  setTimeout(() => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(link.href);
    }
    link.parentNode.removeChild(link);
  }, 1000);
};

export default downloadFromUrl;
