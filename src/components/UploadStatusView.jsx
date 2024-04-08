import React, { useEffect, useState } from 'react';
import UploadStatus, { messageForStatus } from 'utils/upload/UploadStatus';
import { useDispatch } from 'react-redux';
import {
  Typography, Progress, Tooltip, Button,
} from 'antd';
import styles from 'components/data-management/SamplesTableCells.module.css';
import {
  UploadOutlined, CaretRightFilled,

} from '@ant-design/icons';
import PropTypes from 'prop-types';
import cache from 'utils/cache';
import { resumeUpload } from 'utils/upload/processSecondaryUpload';

const { Text } = Typography;
const uploadDivStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  verticalAlign: 'middle',
};

const UploadStatusView = ({
  status, progress, showDetails, fileId, secondaryAnalysisId,
}) => {
  const dispatch = useDispatch();
  const [fileInCache, setFileInCache] = useState(null);

  useEffect(() => {
    if (fileId && secondaryAnalysisId && [
      UploadStatus.UPLOAD_ERROR,
      UploadStatus.PAUSED,
    ].includes(status.current)) {
      const file = cache.get(fileId) ?? null;
      setFileInCache(file);
    }
  }, [fileId, status.current]);

  if (fileInCache && [
    UploadStatus.UPLOAD_ERROR,
    UploadStatus.PAUSED,
  ].includes(status.current)) {
    return (
      <div style={uploadDivStyle}>
        <Text type='warning'>{messageForStatus(status.current)}</Text>
        <Tooltip
          title='Click to resume'
        >
          <Button
            size='large'
            shape='link'
            icon={<CaretRightFilled />}
            onClick={async () => await resumeUpload(secondaryAnalysisId, fileId, dispatch)}
          />
        </Tooltip>
      </div>
    );
  }

  if ([UploadStatus.UPLOADING_FROM_CLI, UploadStatus.QUEUED].includes(status)) {
    return (
      <div style={uploadDivStyle}>
        <Text type='secondary'>{messageForStatus(status.current)}</Text>
      </div>
    );
  }

  if (status.current === UploadStatus.UPLOADED) {
    return (
      <div
        className={styles.hoverSelectCursor}
        onClick={showDetails}
        onKeyDown={showDetails}
        style={{ ...uploadDivStyle, flexDirection: 'column' }}
      >
        <Text type='success'>{messageForStatus(status.current)}</Text>
      </div>
    );
  }

  if (
    [
      UploadStatus.UPLOADING,
      UploadStatus.COMPRESSING,
    ].includes(status.current)
  ) {
    return (
      <div
        style={{
          ...uploadDivStyle,
          flexDirection: 'column',
        }}
      >
        <Text type='warning'>{`${messageForStatus(status.current)}`}</Text>
        {progress ? (<Progress style={{ marginLeft: '10%', width: '50%' }} percent={progress} size='small' />) : <div />}
      </div>
    );
  }
  if (
    [
      UploadStatus.UPLOAD_ERROR,
      UploadStatus.DROP_AGAIN,
    ].includes(status.current)
  ) {
    return (
      <div
        className={styles.hoverSelectCursor}
        style={{ ...uploadDivStyle, flexDirection: 'column' }}
        onClick={showDetails}
        onKeyDown={showDetails}
      >
        <Text type='danger'>{messageForStatus(status.current)}</Text>
      </div>
    );
  }
  if (
    [
      UploadStatus.FILE_NOT_FOUND,
      UploadStatus.FILE_READ_ABORTED,
      UploadStatus.FILE_READ_ERROR,
    ].includes(status.current)
  ) {
    return (
      <div style={uploadDivStyle}>
        <Text type='danger'>{messageForStatus(status.current)}</Text>
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
};

UploadStatusView.defaultProps = {
  progress: undefined,
  showDetails: null,
  fileId: null,
  secondaryAnalysisId: null,
};

UploadStatusView.propTypes = {
  // Object with current status in .current
  status: PropTypes.object.isRequired,
  progress: PropTypes.number,
  showDetails: PropTypes.func,
  fileId: PropTypes.string,
  secondaryAnalysisId: PropTypes.string,
};

export default UploadStatusView;
