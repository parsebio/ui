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

import { resumeUploads } from 'redux/actions/secondaryAnalyses';

const { Text } = Typography;
const uploadDivStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  verticalAlign: 'middle',
  height: '2vh',
};

const UploadStatusView = ({
  status, progress, showDetails, fileId, secondaryAnalysisId,
}) => {
  const dispatch = useDispatch();

  const [fileInCache, setFileInCache] = useState(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (fileId && secondaryAnalysisId && [
        UploadStatus.UPLOAD_ERROR,
        UploadStatus.PAUSED,
      ].includes(status)) {
        const file = await cache.get(fileId) ?? null;
        setFileInCache(file);
      }
    };

    fetchFile();
  }, [fileId, status]);

  if (fileInCache && [
    UploadStatus.UPLOAD_ERROR,
    UploadStatus.PAUSED,
  ].includes(status)) {
    return (
      <div style={uploadDivStyle}>
        <Text type='warning'>{messageForStatus(status)}</Text>
        <Tooltip
          title='Click to resume'
        >
          <Button
            size='large'
            shape='link'
            icon={<CaretRightFilled />}
            onClick={() => dispatch(resumeUploads(secondaryAnalysisId))}
          />
        </Tooltip>
      </div>
    );
  }
  if (status === UploadStatus.EXPIRED) {
    return (
      <Tooltip title='Fastq files expire after 30 days. Delete or re-upload expired files to run the pipeline.'>
        <div style={uploadDivStyle}>
          <Text type='danger'>{messageForStatus(status)}</Text>
        </div>
      </Tooltip>
    );
  }

  if ([UploadStatus.UPLOADING_FROM_CLI, UploadStatus.QUEUED].includes(status)) {
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
  if (
    status === UploadStatus.INCOMPLETE
  ) {
    return (
      <div style={uploadDivStyle}>
        <Text type='warning'>{messageForStatus(status)}</Text>
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
  status: PropTypes.string.isRequired,
  progress: PropTypes.number,
  showDetails: PropTypes.func,
  fileId: PropTypes.string,
  secondaryAnalysisId: PropTypes.string,
};

export default UploadStatusView;
