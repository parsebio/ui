import React, { useEffect, useState } from 'react';
import {
  Space, Typography,
} from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import {
  deleteSamples, updateSample,
} from 'redux/actions/samples';
import integrationTestConstants from 'utils/integrationTestConstants';

import UploadStatus from 'utils/upload/UploadStatus';
import downloadSampleFile from 'utils/data-management/downloadSampleFile';
import { createAndUploadSampleFile } from 'utils/upload/processSampleUpload';
import { fileTypeToDisplay } from 'utils/sampleFileType';
import UploadStatusView from 'components/UploadStatusView';
import EditableField from '../../EditableField';
import UploadDetailsModal from '../UploadDetailsModal';

const { Text } = Typography;

const UploadCell = (props) => {
  const { columnId, sampleUuid } = props;
  const dispatch = useDispatch();
  const sample = useSelector((state) => state.samples[sampleUuid]);
  const file = sample?.files[columnId];
  const selectedTech = sample?.type;
  const { activeExperimentId } = useSelector((state) => state.experiments.meta);

  const [uploadDetailsModalVisible, setUploadDetailsModalVisible] = useState(false);
  const [uploadDetailsModalData, setUploadDetailsModalData] = useState(null);

  useEffect(() => {
    setUploadDetailsModalData(file);
  }, [file, file?.upload]);

  const { progress = null, status = null } = uploadDetailsModalData?.upload
    ?? { status: UploadStatus.FILE_NOT_FOUND };

  const showDetails = () => {
    setUploadDetailsModalData({
      sampleUuid,
      fileCategory: columnId,
      lastModified: sample.lastModified,
      ...uploadDetailsModalData,
    });
    setUploadDetailsModalVisible(true);
  };

  const onDownload = () => {
    downloadSampleFile(activeExperimentId, sampleUuid, uploadDetailsModalData.fileCategory);
  };

  const onRetry = () => {
    const fileType = uploadDetailsModalData.fileCategory;

    // if retrying an upload we dont need to revalidate the file since it was done before
    createAndUploadSampleFile(
      file,
      fileType,
      activeExperimentId,
      sampleUuid,
      dispatch,
      selectedTech,
    );

    setUploadDetailsModalVisible(false);
  };

  return (
    <>
      <center>
        <UploadStatusView
          status={status}
          progress={progress}
          showDetails={showDetails}
        />
      </center>
      {uploadDetailsModalVisible && (
        <UploadDetailsModal
          data={uploadDetailsModalData}
          onCancel={() => setUploadDetailsModalVisible(false)}
          onDownload={onDownload}
          onDelete={() => dispatch(deleteSamples([sampleUuid]))}
          onRetry={() => onRetry()}
          extraFields={{
            Sample: sample?.name,
            Category: fileTypeToDisplay[uploadDetailsModalData.fileCategory],
          }}
        />
      )}
    </>
  );
};

UploadCell.propTypes = {
  columnId: PropTypes.string.isRequired,
  sampleUuid: PropTypes.string.isRequired,
};

const EditableFieldCell = (props) => {
  const {
    sampleUuid,
    dataIndex: trackKey,
    rowIdx,
    onAfterSubmit,
  } = props;

  const value = useSelector((state) => state.samples[sampleUuid]?.metadata[trackKey]);

  return (
    <div key={`cell-${trackKey}-${rowIdx}`} style={{ whiteSpace: 'nowrap' }}>
      <Space>
        <EditableField
          deleteEnabled={false}
          value={value}
          onAfterSubmit={(newValue) => onAfterSubmit(newValue)}
          formatter={(rawValue) => rawValue.trim()}
        />
      </Space>
    </div>
  );
};

EditableFieldCell.propTypes = {
  sampleUuid: PropTypes.string.isRequired,
  dataIndex: PropTypes.string.isRequired,
  rowIdx: PropTypes.number.isRequired,
  onAfterSubmit: PropTypes.func.isRequired,
};

const SampleNameCell = (props) => {
  const { cellInfo } = props;
  const { record: { uuid: sampleId }, idx } = cellInfo;

  const name = useSelector((state) => state.samples[sampleId]?.name);

  const dispatch = useDispatch();

  return (
    <Text className={integrationTestConstants.classes.SAMPLES_TABLE_NAME_CELL} strong key={`sample-cell-${idx}`}>
      <EditableField
        deleteEnabled
        confirmDelete='Are you sure you want to delete this sample'
        value={name}
        onAfterSubmit={(newName) => dispatch(updateSample(sampleId, { name: newName }))}
        onDelete={() => dispatch(deleteSamples([sampleId]))}
      />
    </Text>
  );
};
SampleNameCell.propTypes = {
  cellInfo: PropTypes.object.isRequired,
};

export {
  UploadCell, EditableFieldCell, SampleNameCell,
};
