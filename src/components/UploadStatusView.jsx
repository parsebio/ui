import React from 'react';
import UploadStatus, { messageForStatus } from 'utils/upload/UploadStatus';
import {
  Typography, Progress, Tooltip, Button,
} from 'antd';
import styles from 'components/data-management/SamplesTableCells.module.css';
import {
  UploadOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Text } = Typography;
const uploadDivStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  verticalAlign: 'middle',
};

const UploadStatusView = ({
  status, progress, showDetails, resumeUpload,
}) => {
  // todo use file id to determine if file is in cache and can be resumed
  if (status === UploadStatus.QUEUED) {
    return (
      <div style={uploadDivStyle}>
        <Text type='secondary'>{messageForStatus(status)}</Text>
      </div>
    );
  }
  if (status === UploadStatus.UPLOADED) {
    return (
      <div
        className={styles.hoverSelectCursor}
        onClick={showDetails}
        onKeyDown={showDetails}
        style={{ ...uploadDivStyle, flexDirection: 'column' }}
      >
        <Text type='success'>{messageForStatus(status)}</Text>
      </div>
    );
  }

  if (
    [
      UploadStatus.UPLOADING,
      UploadStatus.COMPRESSING,
    ].includes(status)
  ) {
    return (
      <div
        style={{
          ...uploadDivStyle,
          flexDirection: 'column',
        }}
      >
        <Text type='warning'>{`${messageForStatus(status)}`}</Text>
        {progress ? (<Progress style={{ marginLeft: '10%', width: '50%' }} percent={progress} size='small' />) : <div />}
      </div>
    );
  }
  if (
    [
      UploadStatus.UPLOAD_ERROR,
      UploadStatus.DROP_AGAIN,
    ].includes(status)
  ) {
    return (
      <div
        className={styles.hoverSelectCursor}
        style={{ ...uploadDivStyle, flexDirection: 'column' }}
        onClick={showDetails}
        onKeyDown={showDetails}
      >
        <Text type='danger'>{messageForStatus(status)}</Text>
      </div>
    );
  }
  if (
    [
      UploadStatus.FILE_NOT_FOUND,
      UploadStatus.FILE_READ_ABORTED,
      UploadStatus.FILE_READ_ERROR,
    ].includes(status)
  ) {
    return (
      <div style={uploadDivStyle}>
        <Text type='danger'>{messageForStatus(status)}</Text>
        {showDetails && (
          <Tooltip placement='bottom' title='Upload missing' mouseLeaveDelay={0}>
            <Button
              size='large'
              shape='link'
              icon={<UploadOutlined />}
              onClick={showDetails}
            />
          </Tooltip>
        )}
      </div>
    );
  }
  if (![
    UploadStatus.UPLOADING,
    UploadStatus.UPLOADED,
  ].includes(status) && resumeUpload) {
    return (
      <div style={uploadDivStyle}>
        <Text type='warning'>{messageForStatus(status)}</Text>
        <Button
          size='large'
          shape='link'
          icon={<UploadOutlined />}
          onClick={resumeUpload}
        />
      </div>
    );
  }
};

UploadStatusView.defaultProps = {
  progress: undefined,
  showDetails: null,
  resumeUpload: null,
};

UploadStatusView.propTypes = {
  status: PropTypes.string.isRequired,
  progress: PropTypes.number,
  showDetails: PropTypes.func,
  resumeUpload: PropTypes.func,
};

export default UploadStatusView;
