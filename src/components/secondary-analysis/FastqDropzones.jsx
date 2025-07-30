import React, { useEffect } from 'react';
import { Empty, Space, Typography } from 'antd';
import PropTypes from 'prop-types';
import integrationTestConstants from 'utils/integrationTestConstants';
import KitCategory, { isKitCategory } from 'const/enums/KitCategory';

const { Title } = Typography;

const FastqDropzones = ({
  kit, pairedWt, onDrop, handleFileSelection,
}) => {
  useEffect(() => {
    const wtDropzone = document.getElementById('wtFastqDropzone');
    const immuneDropzone = document.getElementById('immuneFastqDropzone');

    wtDropzone?.addEventListener('drop', (e) => onDrop(e, 'wtFastq'));
    immuneDropzone?.addEventListener('drop', (e) => onDrop(e, 'immuneFastq'));

    return () => {
      wtDropzone?.removeEventListener('drop', onDrop);
      immuneDropzone?.removeEventListener('drop', onDrop);
    };
  }, [onDrop]);

  const dropzoneComponent = (type) => (
    <div
      onClick={() => handleFileSelection(type)}
      onKeyDown={() => handleFileSelection(type)}
      data-test-id={integrationTestConstants.ids.FILE_UPLOAD_DROPZONE}
      style={{ border: '1px solid #ccc', padding: '2rem 0' }}
      className='dropzone'
      id={`${type}Dropzone`}
    >
      <Empty description='Drag and drop files here or click to browse' image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );

  if (isKitCategory(kit, KitCategory.TCR) || isKitCategory(kit, KitCategory.BCR)) {
    if (pairedWt) {
      return (
        <Space direction='horizontal' style={{ width: '100%', marginBottom: '1rem' }}>
          <Space direction='vertical'>
            <Title level={4} style={{ textAlign: 'center' }}>WT</Title>
            <div style={{ width: '22.5vw' }}>
              {dropzoneComponent('wtFastq')}
            </div>
          </Space>
          <Space direction='vertical'>
            <Title level={4} style={{ textAlign: 'center' }}>Immune</Title>
            <div style={{ width: '22.5vw' }}>
              {dropzoneComponent('immuneFastq')}
            </div>
          </Space>
        </Space>
      );
    }
    return dropzoneComponent('immuneFastq');
  }

  return dropzoneComponent('wtFastq');
};

FastqDropzones.propTypes = {
  kit: PropTypes.oneOfType([() => null, PropTypes.string]).isRequired,
  pairedWt: PropTypes.oneOfType([() => null, PropTypes.bool]).isRequired,
  onDrop: PropTypes.func.isRequired,
  handleFileSelection: PropTypes.func.isRequired,
};

export default FastqDropzones;
