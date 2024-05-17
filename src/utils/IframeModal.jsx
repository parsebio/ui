import React from 'react';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import { fastLoad } from 'components/Loader';

const IframeModal = (props) => {
  const { onClose, blobToDisplay } = props;

  return (
    <Modal
      title=':'
      open
      centered
      width={700}
      footer={null}
      onOk={onClose}
      onCancel={onClose}
    >
      {blobToDisplay
        ? <iframe src={URL.createObjectURL(blobToDisplay)} title='My Document' style={{ height: '100%', width: '100%' }} />
        : fastLoad()}
    </Modal>
  );
};

IframeModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  blobToDisplay: PropTypes.string.isRequired,
};

export default IframeModal;
