import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import {
  Form, Empty, Divider, List, Space, Typography, Button, Tabs, Alert,
  Tooltip,
} from 'antd';
import Paragraph from 'antd/lib/typography/Paragraph';
import {
  CheckCircleTwoTone, CloseCircleTwoTone, DeleteOutlined, WarningOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import UploadStatus from 'utils/upload/UploadStatus';

import integrationTestConstants from 'utils/integrationTestConstants';
import _ from 'lodash';
import PropTypes from 'prop-types';

import ExpandableList from 'components/ExpandableList';
import endUserMessages from 'utils/endUserMessages';

import { isKitCategory, kitCategories } from 'utils/secondary-analysis/kitOptions';

import { getFastqFiles } from 'redux/selectors';
import { deleteSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';
import getApiTokenExists from 'utils/apiToken/getApiTokenExists';
import generateApiToken from 'utils/apiToken/generateApiToken';
import { createAndUploadSecondaryAnalysisFiles } from 'utils/upload/processSecondaryUpload';
import UploadFastqSupportText from './UploadFastqSupportText';

const { Text, Title } = Typography;
const emptyFilesByType = {
  wtFastq: { valid: [], invalid: [] },
  immuneFastq: { valid: [], invalid: [] },
};

const rReadRegex = /_R([12])/;
const underscoreReadRegex = /_([12])\.(fastq|fq)\.gz$/;

const hasReadPair = (fileName) => (
  rReadRegex.test(fileName) || underscoreReadRegex.test(fileName)
);

const getMatchingPairFor = (fileName) => {
  const matcher = fileName.match(rReadRegex) ? rReadRegex : underscoreReadRegex;

  const matchingPair = fileName.replace(matcher, (match, group1) => {
    const otherNumber = group1 === '1' ? '2' : '1';

    return match.replace(group1, otherNumber);
  });

  return matchingPair;
};

const parseUploadScriptVersion = '1.0.0';

const UploadFastqForm = (props) => {
  const {
    secondaryAnalysisId, renderFastqFilesTable, setFilesNotUploaded,
  } = props;
  const dispatch = useDispatch();

  const [fileHandles, setFileHandles] = useState(emptyFilesByType);
  const [tokenExists, setTokenExists] = useState(null);
  const [newToken, setNewToken] = useState(null);
  console.log('FILE HANDLES ', fileHandles);
  const secondaryAnalysisFiles = useSelector(getFastqFiles(secondaryAnalysisId));

  const { numOfSublibraries, kit, pairedWt } = useSelector(
    (state) => state.secondaryAnalyses[secondaryAnalysisId],
    _.isEqual,
  );

  const updateApiTokenStatus = useCallback(async () => {
    const exists = await getApiTokenExists();
    setTokenExists(exists);
  }, []);

  const generateNewToken = useCallback(async () => {
    const token = await generateApiToken();
    setNewToken(token);
  }, []);

  const fastqsCount = Object.keys(secondaryAnalysisFiles).length;

  const warning = useMemo(() => {
    if (fastqsCount > 0 && fastqsCount < numOfSublibraries * 2) {
      return endUserMessages.ERROR_LESS_FILES_THAN_SUBLIBRARIES;
    }

    if (fastqsCount > numOfSublibraries * 2) {
      return endUserMessages.ERROR_MORE_FILES_THAN_SUBLIBRARIES;
    }

    return null;
  }, [fastqsCount]);

  const validFiles = Object.values(fileHandles).flatMap(({ valid }) => valid) || [];
  const invalidFiles = Object.values(fileHandles).flatMap(({ invalid }) => invalid) || [];

  useEffect(() => {
    setFilesNotUploaded(Boolean(validFiles.length));
  }, [fileHandles]);

  useEffect(() => {
    const wtDropzone = document.getElementById('wtFastqDropzone');
    const immuneDropzone = document.getElementById('immuneFastqDropzone');

    wtDropzone.addEventListener('drop', (e) => onDrop(e, 'wtFastq'));
    immuneDropzone.addEventListener('drop', (e) => onDrop(e, 'immuneFastq'));
    return () => {
      wtDropzone.removeEventListener('drop', onDrop);
      immuneDropzone.removeEventListener('drop', onDrop);
    };
  }, [secondaryAnalysisFiles]);

  useEffect(() => {
    updateApiTokenStatus();
  }, []);

  const beginUpload = async () => {
    Object.keys(fileHandles).forEach(async (type) => {
      const filesList = await Promise.all(
        fileHandles[type].valid.map(async (handle) => handle.getFile()),
      );

      // Delete already uploaded files before uploading new ones
      await Promise.all(filesList.map(async (file) => {
        const uploadedFileId = Object.keys(secondaryAnalysisFiles)
          .find((key) => secondaryAnalysisFiles[key].name === file.name);
        if (uploadedFileId) {
          await dispatch(deleteSecondaryAnalysisFile(secondaryAnalysisId, uploadedFileId));
        }
      }));

      await createAndUploadSecondaryAnalysisFiles(
        secondaryAnalysisId,
        filesList,
        fileHandles[type].valid,
        type,
        dispatch,
      );
    });
  };

  const nonMatchingFastqPairs = useMemo(() => {
    const fileNames = validFiles.map((file) => file.name);
    console.log('FILE NAMES ', fileNames);
    const fileNamesSet = new Set(fileNames);

    // Files already in process of being uploaded (or already uploaded)
    const alreadyAddedFileNames = new Set(
      Object.values(secondaryAnalysisFiles).map((file) => file.name),
    );

    return fileNames.filter((fileName) => {
      const matchingPair = getMatchingPairFor(fileName);

      // Matching pair needs to be ready to be added too
      return !fileNamesSet.has(matchingPair)
        // Or be already added
        && !alreadyAddedFileNames.has(matchingPair);
    });
  }, [fileHandles, secondaryAnalysisFiles]);

  // Passing secondaryAnalysisFilesUpdated because secondaryAnalysisFiles
  // is not updated when used inside a event listener
  const validateAndSetFiles = async (fileHandlesList, type) => {
    const countOccurrences = (subStr, str) => {
      const matches = str.match(new RegExp(subStr, 'g'));
      return matches ? matches.length : 0;
    };

    const validators = [
      {
        validate: (file) => !file.name.startsWith('.') && !file.name.startsWith('__MACOSX'),
        rejectReason: endUserMessages.ERROR_HIDDEN_FILE,
      },
      {
        validate: (file) => ['.fastq', '.fastq.gz', '.fq', '.fq.gz'].some((ext) => file.name.endsWith(ext)),
        rejectReason: endUserMessages.ERROR_NOT_FASTQ,
      },
      {
        validate: (file) => ['.gz'].some((ext) => file.name.endsWith(ext)),
        rejectReason: endUserMessages.ERROR_FASTQ_NOT_GZIPPED,
      },
      {
        validate: (file) => {
          // file is invalid if its already uploaded or uploading
          const uploadedFileId = Object.keys(secondaryAnalysisFiles)
            .find((key) => secondaryAnalysisFiles[key].name === file.name);
          const uploadedFileStatus = secondaryAnalysisFiles[uploadedFileId]?.upload?.status.current;
          return !(uploadedFileId
            && [UploadStatus.UPLOADING, UploadStatus.UPLOADED, UploadStatus.QUEUED]
              .includes(uploadedFileStatus));
        },
        rejectReason: endUserMessages.ERROR_ALREADY_UPLOADED,
      },
      {
        validate: (file) => hasReadPair(file.name),
        rejectReason: endUserMessages.ERROR_READ_PAIR_NOT_IN_NAME,
      },
      {
        validate: (file) => countOccurrences('_R1', file.name) + countOccurrences('_R2', file.name) <= 1,
        rejectReason: endUserMessages.ERROR_TOO_MANY_READS_IN_NAME,
      },
    ];

    const newInvalidFiles = [];
    const newValidFiles = fileHandlesList.filter((newFile) => {
      const rejectedValidator = validators.find((validator) => !validator.validate(newFile));
      if (rejectedValidator) {
        newInvalidFiles.push({ rejectReason: rejectedValidator.rejectReason, name: newFile.name });
        return false;
      }
      return true;
    });

    setFileHandles((prevState) => ({
      ...prevState,
      [type]: {
        valid: _.uniqBy([...prevState[type].valid, ...newValidFiles], 'name'),
        invalid: _.uniqBy([...prevState[type].invalid, ...newInvalidFiles], 'name'),
      },
    }));
  };

  const handleFileSelection = async (type) => {
    try {
      const opts = { multiple: true };
      const handles = await window.showOpenFilePicker(opts);
      document.getElementById('uploadButton').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return validateAndSetFiles(handles, type);
    } catch (err) {
      console.error('Error picking files:', err);
    }
  };

  const renderDropzoneElements = () => {
    // todo handle both uploads, use type argument to differentiate
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
    if (isKitCategory(kit, kitCategories.TCR) || isKitCategory(kit, kitCategories.BCR)) {
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

  // we save the file handles to the cache
  // The dropzone component couldn't be used as it doesn't support file handle
  const getAllFiles = async (entry) => {
    const subFiles = [];
    if (entry.kind === 'file') {
      subFiles.push(entry);
    } else if (entry.kind === 'directory') {
      // eslint-disable-next-line no-restricted-syntax, no-unused-vars
      for await (const currEntry of entry.values()) {
        const nestedFiles = await getAllFiles(currEntry);
        subFiles.push(...nestedFiles);
      }
    }
    return subFiles;
  };

  const onDrop = async (e, type) => {
    e.preventDefault();
    const { items } = e.dataTransfer;
    const newFiles = await Promise.all(Array.from(items).map(async (item) => {
      const entry = await item.getAsFileSystemHandle();
      const subFiles = await getAllFiles(entry);
      return subFiles;
    }));

    document.getElementById('uploadButton').scrollIntoView({ behavior: 'smooth', block: 'start' });

    return validateAndSetFiles(newFiles.flat(), type);
  };

  const removeFile = (fileName) => {
    setFileHandles((prevState) => {
      const newState = {};
      Object.entries(prevState).forEach(([type, { valid, invalid }]) => {
        newState[type] = {
          valid: valid.filter((file) => file.name !== fileName),
          invalid: invalid.filter((file) => file.name !== fileName),
        };
      });
      return newState;
    });
  };

  const uploadTabItems = [
    {
      key: 'ui',
      label: 'Browser upload',
      children: (
        <Form
          layout='vertical'
          size='middle'
          style={{ width: '100%', margin: '0 auto' }}
        >
          <Form.Item
            name='projectName'
          >
            <UploadFastqSupportText
              kit={kit}
              pairedWt={pairedWt}
            />
            {warning && (
              <div>
                <br />
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

                <br />
                <br />
              </div>
            )}
            {renderDropzoneElements()}
            {
              invalidFiles.length > 0 && (
                <div>
                  <ExpandableList
                    expandedTitle='Ignored files'
                    dataSource={invalidFiles}
                    getItemText={(file) => file.name}
                    getItemExplanation={(file) => file.rejectReason}
                    collapsedExplanation={(
                      <>
                        {invalidFiles.length}
                        {' '}
                        file
                        {invalidFiles.length > 1 ? 's were' : ' was'}
                        {' '}
                        ignored, click to display
                      </>
                    )}
                  />
                </div>
              )
            }
            {
              nonMatchingFastqPairs.length > 0 && (
                <ExpandableList
                  expandedTitle='Files without read pair'
                  dataSource={nonMatchingFastqPairs}
                  getItemText={(fileName) => fileName}
                  getItemExplanation={(fileName) => `Either remove this file or add ${getMatchingPairFor(fileName)}.`}
                  collapsedExplanation='Files without read pair, click to display'
                />
              )
            }
            {
              validFiles.length > 0 && (
                <>
                  <Divider orientation='center'>To upload</Divider>
                  <List
                    dataSource={validFiles}
                    size='small'
                    itemLayout='horizontal'
                    grid='{column: 4}'
                    renderItem={(file) => (
                      <List.Item
                        key={file.name}
                        style={{ width: '100%' }}
                      >
                        <Space>
                          {!file.errors
                            ? (
                              <CheckCircleTwoTone twoToneColor='#52c41a' />
                            ) : (
                              <CloseCircleTwoTone twoToneColor='#f5222d' />
                            )}
                          <Text
                            style={{ width: '200px' }}
                          >
                            {file.name}
                          </Text>
                          <DeleteOutlined style={{ color: 'crimson' }} onClick={() => { removeFile(file.name); }} />
                        </Space>
                      </List.Item>
                    )}
                  />
                </>
              )
            }
            <br />
            <center>
              <Tooltip title={nonMatchingFastqPairs.length > 0 ? 'Please fix the files without read pair' : null}>
                <Button
                  data-test-id={integrationTestConstants.ids.FILE_UPLOAD_BUTTON}
                  id='uploadButton'
                  type='primary'
                  key='create'
                  block
                  style={{ width: '30%' }}
                  disabled={!validFiles.length || nonMatchingFastqPairs.length > 0}
                  onClick={() => {
                    beginUpload(fileHandles.valid);
                    setFileHandles(emptyFilesByType);
                  }}
                >
                  Upload
                </Button>
              </Tooltip>
            </center>
            <br />
            {renderFastqFilesTable()}
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'cli',
      label: 'Console upload',
      children: (
        <Space direction='vertical' style={{ width: '95%' }}>
          <Text>
            {' '}
            Step-by-step instructions for console upload are
            available to Parse Biosciences customers via our
            {' '}
            <a target='_blank' href='https://support.parsebiosciences.com/hc/en-us/articles/27909567279508-How-to-upload-FASTQ-files-to-Trailmaker-using-command-line' rel='noreferrer'>support suite</a>
            .
            {' '}
          </Text>
          {newToken && (
            <Alert
              message={(
                <Text>
                  Token generated:
                  {' '}
                  <Text keyboard copyable>
                    {newToken}
                  </Text>
                </Text>
              )}
            />
          )}
          {tokenExists || newToken
            ? (
              <Text>
                To upload files via the command line, use the previously generated token.
                <br />
                If the previous token was lost, a new one can be generated by clicking the
                button below, this will invalidate the current token.
              </Text>
            )
            : 'To upload files via the command line, you need to generate a token.'}
          <Button loading={_.isNil(tokenExists)} onClick={generateNewToken}>{(tokenExists || newToken) ? 'Refresh token' : 'Generate token'}</Button>
          <Text>
            To perform a command-line upload, download this script:
            {' '}
            <a href={`/parse-upload-${parseUploadScriptVersion}.py`} download>{`parse-upload-${parseUploadScriptVersion}.py`}</a>

            <br />
            <br />

            And run the script with the following command:
            <br />
            <pre>
              <Paragraph copyable={{
                text: `python parse-upload-${parseUploadScriptVersion}.py \\
  --token ${newToken || 'YOUR_TOKEN'} \\
  --run_id ${secondaryAnalysisId} \\
  --file /path/to/fastq/file_1 /path/to/fastq/file_2 ...
  `,
              }}
              >
                {`python parse-upload-${parseUploadScriptVersion}.py \\
  --token ${newToken || 'YOUR_TOKEN'} \\
  --run_id ${secondaryAnalysisId} \\
  --file /path/to/fastq/file_1 /path/to/fastq/file_2 ...
  `}
              </Paragraph>
            </pre>
          </Text>
        </Space>
      ),
    },

  ];

  return (
    <Tabs
      size='small'
      defaultActiveKey='ui'
      items={uploadTabItems}
    />
  );
};
UploadFastqForm.propTypes = {
  secondaryAnalysisId: PropTypes.string.isRequired,
  renderFastqFilesTable: PropTypes.func.isRequired,
  setFilesNotUploaded: PropTypes.func.isRequired,
};

export default UploadFastqForm;
