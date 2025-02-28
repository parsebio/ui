/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useState, useEffect,
} from 'react';
import readExcelFile from 'read-excel-file';
import {
  Form, Empty, Button,
  Typography,
  Space,
  Divider,
  List,
  Modal,
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
  // New state for pending file when duplicates exist and for showing review modal
  const [pendingFile, setPendingFile] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const getSampleNamesFromExcel = async (excelFile) => {
    const sheets = await readExcelFile(excelFile, { getSheets: true });

    const rows = await readExcelFile(excelFile, { sheet: sheets[0].name });

    if (sheets.length !== 3
        || !rows.some((row) => row.some((cell) => typeof cell === 'string'
            && (cell.includes('Evercode WT') || cell.includes('Parse Biosciences'))))) {
      throw new Error('Not a valid Parse Biosciences sample loading table.');
    }

    const isSampleNameCell = (cell) => typeof cell === 'string' && cell.includes('Sample Name');

    // Find the row where 'Sample Name' is mentioned
    const sampleNameRowIndex = rows.findIndex((row) => row.some(isSampleNameCell));
    if (sampleNameRowIndex === -1) {
      throw new Error('Sample Name column not found.');
    }

    const sampleNameColumnIndex = rows[sampleNameRowIndex].findIndex(isSampleNameCell);

    // Extract the number of samples from the cell "Number of Samples"
    const numberOfSamplesRow = rows.find((row) => row.some((cell) => typeof cell === 'string' && cell.includes('Number of Samples')));
    if (!numberOfSamplesRow) {
      throw new Error('Number of Samples not found.');
    }

    const numberOfSamples = numberOfSamplesRow.filter((cell) => typeof cell === 'number')[0];

    // Extract sample names from the rows following the 'Sample Name' row
    const extractedSampleNames = rows.slice(sampleNameRowIndex + 1)
      .map((row) => row[sampleNameColumnIndex])
      .slice(0, numberOfSamples)
      .filter((name) => name !== null);

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
          const sampleNamesAreUnique = new Set(names).size === names.length;
          if (sampleNamesAreUnique) {
            setFile(selectedFile);
          } else {
            warnings.push(`Your sample loading table includes ${names.length} samples in total,
              with ${names.length - new Set(names).size} duplicate names found. Duplicates will
              be treated as a single sample, merging the cells in the corresponding wells. Please review and confirm to proceed.`);
            setPendingFile(selectedFile);
            setFile(false);
          }
        }
      } catch (error) {
        warnings.push(`${selectedFile.name}: ${error.message}`);
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
    try {
      if (uploadedFileId) {
      // Important to wait before creating the new file, otherwise we break a unique constraint
        await dispatch(deleteSecondaryAnalysisFile(secondaryAnalysisId, uploadedFileId));
      }
      await createAndUploadSecondaryAnalysisFiles(secondaryAnalysisId, [file], [], 'samplelt', dispatch);
      dispatch(updateSecondaryAnalysis(secondaryAnalysisId, { sampleNames }));
    } catch (e) {
      console.error(e);
    }
  };

  const uploadButtonText = uploadedFileId ? 'Replace' : 'Upload';
  const buttonText = pendingFile && !file ? 'Review' : uploadButtonText;

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
          <Text>
            Upload your sample loading table in the .xlsm format.
            <br />
            You must use the Parse Biosciences official templates which
            can be accessed by Parse Biosciences customers via our
            <a href='https://support.parsebiosciences.com/hc/en-us/articles/9482740811924-Evercode-Sample-Loading-Tables' target='_blank' rel='noopener noreferrer'> support suite</a>
            .
            <br />
            Other excel files will not work.
          </Text>
          <br />
          <br />
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
              disabled={!(file || pendingFile)}
              onClick={() => {
                if (pendingFile && !file) {
                  setReviewModalVisible(true);
                } else {
                  beginUpload();
                  setFile(null);
                }
              }}
            >
              {buttonText}
            </Button>
          </center>
          {uploadedFileId && (<Divider orientation='center'>Previously uploaded file</Divider>)}
          {renderUploadedFileDetails()}
        </Form.Item>
      </Form>
      <Modal
        title='Review Duplicate Sample Names'
        open={reviewModalVisible}
        onCancel={() => {
          setReviewModalVisible(false);
          setSampleNames([]);
        }}
        footer={[
          <Button
            key='cancel'
            onClick={() => {
              setReviewModalVisible(false);
              setPendingFile(null);
              setSampleNames([]);
              setInvalidInputWarnings([]);
            }}
          >
            Cancel
          </Button>,
          <Button
            key='confirm'
            type='primary'
            onClick={() => {
              setFile(pendingFile);
              setPendingFile(null);
              setReviewModalVisible(false);
              setInvalidInputWarnings([]);
            }}
          >
            Confirm
          </Button>,
        ]}
      >
        <p>
          Duplicate sample names were detected. Duplicate entries will be merged.
          Please review the sample names below and click Confirm to proceed.
        </p>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          <List
            dataSource={sampleNames}
            renderItem={(item) => {
              const duplicateCount = sampleNames.filter((name) => name === item).length;
              const isDuplicate = duplicateCount > 1;
              return (
                <List.Item key={item}>
                  <Text style={isDuplicate ? { color: 'red', fontWeight: 'bold' } : {}}>
                    {item}
                    {' '}
                    {isDuplicate && <WarningOutlined style={{ color: 'red' }} />}
                  </Text>
                </List.Item>
              );
            }}
          />
        </div>
      </Modal>
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
