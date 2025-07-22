import React, {
  useState, useEffect, useCallback, useMemo,
} from 'react';
import {
  Form, Divider, List, Space, Typography, Button, Tabs, Alert,
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

import { getFastqFiles } from 'redux/selectors';
import { deleteSecondaryAnalysisFile } from 'redux/actions/secondaryAnalyses';
import getApiTokenExists from 'utils/apiToken/getApiTokenExists';
import generateApiToken from 'utils/apiToken/generateApiToken';
import { createAndUploadSecondaryAnalysisFiles } from 'utils/upload/processSecondaryUpload';
import { labelsByFastqType } from 'utils/secondary-analysis/kitOptions';

import { getMatchingPairFor, hasReadPair } from 'utils/fastqUtils';
import FastqFileType from 'const/enums/FastqFileType';
import { kitCategories, isKitCategory } from 'utils/secondary-analysis/kitOptions';
import UploadFastqSupportText from './UploadFastqSupportText';
import FastqDropzones from './FastqDropzones';

const { Text, Title } = Typography;

const emptyFilesByType = {
  [FastqFileType.WT_FASTQ]: { valid: [], invalid: [] },
  [FastqFileType.IMMUNE_FASTQ]: { valid: [], invalid: [] },
};

const parseUploadScriptVersion = '1.1.0';

const checkForSubCountWarnings = (
  fastqsCount,
  numOfSublibraries,
  lessThanMessage,
  moreThanMessage,
) => {
  if (fastqsCount > 0 && fastqsCount < numOfSublibraries * 2) {
    return lessThanMessage;
  }

  if (fastqsCount > numOfSublibraries * 2) {
    return moreThanMessage;
  }

  return null;
};

const UploadFastqForm = (props) => {
  const {
    secondaryAnalysisId, renderFastqFilesTable, setFilesNotUploaded,
  } = props;
  const dispatch = useDispatch();

  const [fileHandles, setFileHandles] = useState(emptyFilesByType);
  const [tokenExists, setTokenExists] = useState(null);
  const [newToken, setNewToken] = useState(null);

  const secondaryAnalysisFiles = useSelector(getFastqFiles(secondaryAnalysisId));

  const wtFastqs = useSelector(getFastqFiles(secondaryAnalysisId, FastqFileType.WT_FASTQ));
  const immuneFastqs = useSelector(getFastqFiles(secondaryAnalysisId, FastqFileType.IMMUNE_FASTQ));

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

  const wtFastqsCount = Object.keys(wtFastqs).length;
  const immuneFastqsCount = Object.keys(immuneFastqs).length;

  const warning = useMemo(() => {
    const wtWarning = checkForSubCountWarnings(
      wtFastqsCount,
      numOfSublibraries,
      endUserMessages.ERROR_LESS_WT_FILES_THAN_SUBLIBRARIES,
      endUserMessages.ERROR_MORE_WT_FILES_THAN_SUBLIBRARIES,
    );

    if (wtWarning) return wtWarning;

    if (!pairedWt) {
      return null;
    }

    const immuneWarning = checkForSubCountWarnings(
      immuneFastqsCount,
      numOfSublibraries,
      endUserMessages.ERROR_LESS_IMMUNE_FILES_THAN_SUBLIBRARIES,
      endUserMessages.ERROR_MORE_IMMUNE_FILES_THAN_SUBLIBRARIES,
    );

    if (immuneWarning) return immuneWarning;

    return null;
  }, [wtFastqsCount, immuneFastqsCount]);

  const validFiles = Object.values(fileHandles).flatMap(({ valid }) => valid) || [];
  const invalidFiles = Object.values(fileHandles).flatMap(({ invalid }) => invalid) || [];

  useEffect(() => {
    setFilesNotUploaded(Boolean(validFiles.length));
  }, [fileHandles]);

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
    const nonMatching = [];
    Object.values(fileHandles).forEach(({ valid }) => {
      const fileNames = valid.map((file) => file.name);
      const fileNamesSet = new Set(fileNames);

      // Files already in process of being uploaded (or already uploaded)
      const alreadyAddedFileNames = new Set(
        Object.values(secondaryAnalysisFiles).map((file) => file.name),
      );
      const nonMatchingFiles = fileNames.filter((fileName) => {
        const matchingPair = getMatchingPairFor(fileName);

        // Matching pair needs to be ready to be added too
        return !fileNamesSet.has(matchingPair)
          // Or be already added
          && !alreadyAddedFileNames.has(matchingPair);
      });

      if (nonMatchingFiles.length > 0) {
        nonMatching.push(...nonMatchingFiles);
      }
    });
    return nonMatching;
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

    setFileHandles((prevState) => {
      // Remove files with the same name from all types first
      const cleanedState = {};
      Object.entries(prevState).forEach(([currType, { valid, invalid }]) => {
        cleanedState[currType] = {
          valid: valid.filter((file) => !newValidFiles
            .some((newFile) => newFile.name === file.name)),
          invalid: invalid.filter((file) => !newValidFiles
            .some((newFile) => newFile.name === file.name)),
        };
      });

      return {
        ...cleanedState,
        [type]: {
          valid: [...cleanedState[type].valid, ...newValidFiles],
          invalid: [...cleanedState[type].invalid, ...newInvalidFiles],
        },
      };
    });
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

  const getFileType = (fileName) => Object.keys(fileHandles)
    .find((key) => fileHandles[key].valid.some((file) => file.name === fileName));

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

  let uploadCommandFileParameters = '';
  if (isKitCategory(kit, [kitCategories.TCR, kitCategories.BCR])) {
    if (pairedWt) {
      uploadCommandFileParameters = `--immune_files /path/to/fastq/file_1 /path/to/fastq/file_2 \\
  --wt_files /path/to/fastq/file_3 /path/to/fastq/file_4`;
    } else {
      uploadCommandFileParameters = '--immune_files /path/to/fastq/file_1 /path/to/fastq/file_2 ';
    }
  } else {
    uploadCommandFileParameters = '--wt_files /path/to/fastq/file_1 /path/to/fastq/file_2 ';
  }

  const consoleUploadCommand = `python parse-upload-${parseUploadScriptVersion}.py \\
  --token ${newToken ?? 'YOUR_TOKEN'} \\
  --run_id ${secondaryAnalysisId} \\
  ${uploadCommandFileParameters}
  `;

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
            <FastqDropzones
              kit={kit}
              pairedWt={pairedWt}
              onDrop={onDrop}
              handleFileSelection={handleFileSelection}
            />
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
                  getItemExplanation={(fileName) => `Either remove this file or add the ${getMatchingPairFor(fileName)} ${labelsByFastqType[getFileType(fileName)]} file.`}
                  collapsedExplanation='Files without read pair, click to display'
                />
              )
            }
            {
              (validFiles.length > 0) && (
                <>
                  <Divider orientation='center'>To upload</Divider>
                  {Object.entries(fileHandles).map(([fileType, { valid }]) => (
                    valid.length > 0 && (
                      <div key={fileType} style={{ marginBottom: '1rem' }}>
                        <Title level={5}>{labelsByFastqType[fileType] || fileType}</Title>
                        <List
                          dataSource={valid}
                          size='small'
                          itemLayout='horizontal'
                          grid={{ gutter: 5 }}
                          renderItem={(file) => (
                            <List.Item key={file.name} style={{ width: '100%' }}>
                              <Space>
                                {!file.errors
                                  ? <CheckCircleTwoTone twoToneColor='#52c41a' />
                                  : <CloseCircleTwoTone twoToneColor='#f5222d' />}
                                <Text style={{ width: '200px' }}>{file.name}</Text>
                                <DeleteOutlined
                                  style={{ color: 'crimson' }}
                                  onClick={() => removeFile(file.name)}
                                />
                              </Space>
                            </List.Item>
                          )}
                        />
                      </div>
                    )
                  ))}
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
                text: consoleUploadCommand,
              }}
              >
                {consoleUploadCommand}
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
