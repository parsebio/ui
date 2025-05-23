import React from 'react';
import { Modal } from 'antd';
import PropTypes from 'prop-types';

import { fastLoad } from 'components/Loader';

const IframeModal = (props) => {
  const { onClose, blobToDisplay } = props;

  return (
    <Modal
      title={null}
      open
      width={1200}
      footer={null}
      onOk={onClose}
      onCancel={onClose}
      bodyStyle={{ height: '90vh' }}
      style={{ top: '2vh' }}
    >
      {blobToDisplay
        ? <iframe src={URL.createObjectURL(blobToDisplay)} title='My Document' style={{ width: '100%', height: '100%' }} />
        : fastLoad()}
    </Modal>
  );
};

IframeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  blobToDisplay: PropTypes.string.isRequired,
};

export default IframeModal;
