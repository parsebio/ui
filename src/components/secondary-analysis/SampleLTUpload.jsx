/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from 'react';
import readExcelFile from 'read-excel-file';
import {
  Form, Empty, Button,
  Typography,
  Space,
  Divider,
  List,
} from 'antd';
import { useDispatch } from 'react-redux';
import Dropzone from 'react-dropzone';
import integrationTestConstants from 'utils/integrationTestConstants';
import { CheckCircleTwoTone, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import { deleteSecondaryAnalysisFile, updateSecondaryAnalysis } from 'redux/actions/secondaryAnalyses';
import PropTypes from 'prop-types';
import endUserMessages from 'utils/endUserMessages';
import { createAndUploadSecondaryAnalysisFiles } from 'utils/upload/processSecondaryUpload';

const { Text } = Typography;
const SampleLTUpload = (props) => {
  const dispatch = useDispatch();
  const {
    secondaryAnalysisId, renderUploadedFileDetails,
    uploadedFileId, setFilesNotUploaded,
  } = props;
  const [file, setFile] = useState(false);
  const [invalidInputWarnings, setInvalidInputWarnings] = useState([]);
  const [sampleNames, setSampleNames] = useState([]);

  const getSampleNamesFromExcel = async (excelFile) => {
    const rows = await readExcelFile(excelFile);
    const isSampleNameCell = (cell) => typeof cell === 'string' && cell.includes('Sample Name');

    // Find the row and column index where 'Sample Name' is mentioned
    // 'sample name' lowercase is located elsewhere and should not be found
    const sampleNameRowIndex = rows.findIndex((row) => row.some(isSampleNameCell));

    // Extract sample names from the rows following the 'Sample Name' row
    const sampleNameColumnIndex = rows[sampleNameRowIndex].findIndex(isSampleNameCell);

    const extractedSampleNames = rows.slice(sampleNameRowIndex + 1)
      .map((row) => row[sampleNameColumnIndex]).filter((name) => name !== null);

    return extractedSampleNames;
  };

  const onDrop = async (droppedFiles) => {
    const warnings = [];

    const validFiles = droppedFiles.filter((f) => f.name.endsWith('.xlsm'));

    if (validFiles.length === 0) {
      warnings.push(endUserMessages.ERROR_FAILED_SAMPLELT_FILE);
    }
    if (validFiles.length > 1) {
      warnings.push(endUserMessages.ERROR_MULTIPLE_SAMPLELT_FILES);
      validFiles.splice(1); // Keep only the first valid file
    }

    const selectedFile = validFiles.length > 0 ? validFiles[0] : false;
    if (selectedFile) {
      try {
        const names = await getSampleNamesFromExcel(selectedFile);
        if (names.length === 0) {
          warnings.push(`${selectedFile.name}: No sample names extracted from the file. Ensure the file is correctly formatted.`);
          setFile(false);
        } else {
          setSampleNames(names);
          setFile(selectedFile);
        }
      } catch (error) {
        warnings.push(`Failed to read ${selectedFile.name}: ${error.message}`);
        setFile(false);
      }
    } else {
      setFile(false);
    }

    setInvalidInputWarnings(warnings);
  };

  useEffect(() => {
    setFilesNotUploaded(Boolean(file));
  }, [file]);

  const beginUpload = async () => {
    if (uploadedFileId) {
      dispatch(deleteSecondaryAnalysisFile(secondaryAnalysisId, uploadedFileId));
    }
    await createAndUploadSecondaryAnalysisFiles(secondaryAnalysisId, [file], [], 'samplelt', dispatch);
    dispatch(updateSecondaryAnalysis(secondaryAnalysisId, { sampleNames }));
  };

  const uploadButtonText = uploadedFileId ? 'Replace' : 'Upload';

  return (
    <>
      <Form
        layout='vertical'
        size='middle'
        style={{ width: '100%', margin: '0 auto' }}
      >
        <Form.Item
          name='projectName'
        >
          <Dropzone onDrop={onDrop}>
            {({ getRootProps, getInputProps }) => (
              <div
                data-test-id={integrationTestConstants.ids.FILE_UPLOAD_DROPZONE}
                style={{ border: '1px solid #ccc', padding: '2rem 0' }}
                {...getRootProps({ className: 'dropzone' })}
                id='dropzone'
              >
                <input
                  data-test-id={integrationTestConstants.ids.FILE_UPLOAD_INPUT}
                  {...getInputProps()}
                />
                <Empty
                  description='Drag and drop xlsm file here or click to browse'
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </Dropzone>

          {(file || invalidInputWarnings.length > 0) && (<><Divider orientation='center'>To upload</Divider></>)}

          {(invalidInputWarnings.length > 0) && (
            <div>
              {invalidInputWarnings.map((warning) => (
                <center style={{ cursor: 'pointer' }}>
                  <Text type='danger'>
                    {' '}
                    <WarningOutlined />
                    {' '}
                  </Text>
                  <Text>
                    {' '}
                    {warning}
                    <br />
                  </Text>
                </center>
              ))}
              <br />
            </div>
          )}
          {file && (
            <center>
              <List
                size='small'
                itemLayout='horizontal'
                grid='{column: 4}'
              >
                <List.Item
                  key={file.name}
                  style={{ width: '100%' }}
                >
                  <Space>
                    <CheckCircleTwoTone twoToneColor='#52c41a' />
                    <Text
                      ellipsis={{ tooltip: file.name }}
                      style={{ width: '200px' }}
                    >
                      {file.name}
                    </Text>
                    <DeleteOutlined style={{ color: 'crimson' }} onClick={() => { setFile(false); }} />
                  </Space>
                </List.Item>
              </List>
            </center>
          )}
          <br />
          <center>
            <Button
              data-test-id={integrationTestConstants.ids.FILE_UPLOAD_BUTTON}
              type='primary'
              key='create'
              style={{ width: '30%' }}
              disabled={!file}
              onClick={() => {
                beginUpload();
                setFile(null);
              }}
            >
              {uploadButtonText}
            </Button>
          </center>
          {uploadedFileId && (<Divider orientation='center'>Previously uploaded file</Divider>)}
          {renderUploadedFileDetails()}
        </Form.Item>
      </Form>
    </>
  );
};
SampleLTUpload.defaultProps = {
  uploadedFileId: null,
};
SampleLTUpload.propTypes = {
  secondaryAnalysisId: PropTypes.string.isRequired,
  renderUploadedFileDetails: PropTypes.func.isRequired,
  uploadedFileId: PropTypes.string,
  setFilesNotUploaded: PropTypes.func.isRequired,
  onDetailsChanged: PropTypes.func.isRequired,
};
export default SampleLTUpload;
