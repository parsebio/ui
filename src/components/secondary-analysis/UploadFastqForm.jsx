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

import integrationTestConstants from 'utils/integrationTestConstants';
import _ from 'lodash';
import PropTypes from 'prop-types';

import ExpandableList from 'components/ExpandableList';
import endUserMessages from 'utils/endUserMessages';

import { getFastqFiles } from 'redux/selectors';

import getApiTokenExists from 'utils/apiToken/getApiTokenExists';
import generateApiToken from 'utils/apiToken/generateApiToken';
import { createAndUploadSecondaryAnalysisFiles } from 'utils/upload/processSecondaryUpload';

const { Text } = Typography;

const getMissingPairName = (fileName) => {
  if (fileName.includes('_R1')) return fileName.replace('_R1', '_R2');
  if (fileName.includes('_R2')) return fileName.replace('_R2', '_R1');
};

const UploadFastqForm = (props) => {
  const {
    secondaryAnalysisId, renderFastqFilesTable, setFilesNotUploaded,
  } = props;

  const emptyFiles = { valid: [], invalid: [] };
  const [fileHandles, setFileHandles] = useState(emptyFiles);

  const dispatch = useDispatch();

  const beginUpload = async () => {
    const filesList = await Promise.all(fileHandles.valid.map(async (handle) => handle.getFile()));
    await createAndUploadSecondaryAnalysisFiles(secondaryAnalysisId, filesList, fileHandles.valid, 'fastq', dispatch);
  };

  const secondaryAnalysisFiles = useSelector(getFastqFiles(secondaryAnalysisId));

  const numOfSublibraries = useSelector(
    (state) => state.secondaryAnalyses[secondaryAnalysisId].numOfSublibraries,
    _.isEqual,
  );

  useEffect(() => {
    setFilesNotUploaded(Boolean(fileHandles.valid.length));
  }, [fileHandles]);

  const nonMatchingFastqPairs = useMemo(() => {
    const fileNames = fileHandles.valid.map((file) => file.name);

    const [r1s, r2s] = _.partition(fileNames, (fileName) => fileName.includes('_R1'));

    const r1sSet = new Set(r1s);
    const r2sWithoutMatch = r2s.filter((fileName) => !r1sSet.has(fileName.replace('_R2', '_R1')));

    const r2sSet = new Set(r2s);
    const r1sWithoutMatch = r1s.filter((fileName) => !r2sSet.has(fileName.replace('_R1', '_R2')));

    return [...r1sWithoutMatch, ...r2sWithoutMatch];
  }, [fileHandles]);

  // Passing secondaryAnalysisFilesUpdated because secondaryAnalysisFiles
  // is not updated when used inside a event listener
  const validateAndSetFiles = async (fileHandlesList, secondaryAnalysisFilesUpdated) => {
    const alreadyUploadedFiles = Object.values(secondaryAnalysisFilesUpdated)
      .map((item) => item.name);

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
        validate: (file) => !alreadyUploadedFiles.includes(file.name),
        rejectReason: endUserMessages.ERROR_ALREADY_UPLOADED,
      },
      {
        validate: (file) => ['_R1', '_R2'].some((readNumber) => file.name.includes(readNumber)),
        rejectReason: endUserMessages.ERROR_READ_PAIR_NOT_IN_NAME,
      },
      {
        validate: (file) => countOccurrences('_R1', file.name) + countOccurrences('_R2', file.name) <= 1,
        rejectReason: endUserMessages.ERROR_TOO_MANY_READS_IN_NAME,
      },
    ];

    const invalidFiles = [];
    const validFiles = fileHandlesList.filter((newFile) => {
      const rejectedValidator = validators.find((validator) => !validator.validate(newFile));
      if (rejectedValidator) {
        invalidFiles.push({ rejectReason: rejectedValidator.rejectReason, name: newFile.name });
        return false;
      }
      return true;
    });

    setFileHandles((prevState) => ({
      valid: _.uniqBy([...prevState.valid, ...validFiles], 'name'),
      invalid: _.uniqBy([...prevState.invalid, ...invalidFiles], 'name'),
    }));
  };

  const handleFileSelection = async () => {
    try {
      const opts = { multiple: true };
      const handles = await window.showOpenFilePicker(opts);
      document.getElementById('uploadButton').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return validateAndSetFiles(handles, secondaryAnalysisFiles);
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
      // eslint-disable-next-line no-restricted-syntax
      for await (const currEntry of entry.values()) {
        const nestedFiles = await getAllFiles(currEntry);
        subFiles.push(...nestedFiles);
      }
    }
    return subFiles;
  };

  const onDrop = async (e) => {
    e.preventDefault();
    const { items } = e.dataTransfer;
    const newFiles = await Promise.all(Array.from(items).map(async (item) => {
      const entry = await item.getAsFileSystemHandle();
      const subFiles = await getAllFiles(entry);
      return subFiles;
    }));

    document.getElementById('uploadButton').scrollIntoView({ behavior: 'smooth', block: 'start' });

    return validateAndSetFiles(newFiles.flat(), secondaryAnalysisFiles);
  };

  useEffect(() => {
    const dropzone = document.getElementById('dropzone');
    dropzone.addEventListener('drop', onDrop);
    return () => dropzone.removeEventListener('drop', onDrop);
  }, [secondaryAnalysisFiles]);

  const removeFile = (fileName) => {
    setFileHandles((prevState) => {
      const newValid = _.filter(prevState.valid, (file) => file.name !== fileName);

      return {
        valid: newValid,
        invalid: fileHandles.invalid,
      };
    });
  };

  const [tokenExists, setTokenExists] = useState(null);
  const [newToken, setNewToken] = useState(null);

  const updateApiTokenStatus = useCallback(async () => {
    const exists = await getApiTokenExists();
    setTokenExists(exists);
  }, []);

  const generateNewToken = useCallback(async () => {
    const token = await generateApiToken();
    setNewToken(token);
  }, []);

  useEffect(() => {
    updateApiTokenStatus();
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
            <div>
              Upload your Fastq files that are output from bcl2fastq.
              For each sublibrary, you must have a pair of Fastq files, R1 and R2.
              <br />
              <br />
              Note that:
              {' '}
              <br />
              <ul>
                <li>
                  FASTQ files from the same Parse experiment that have
                  different Illumina indexes should not be concatenated.
                  These files are separate sublibraries.
                </li>
                <li>
                  FASTQ files from the same Parse experiment that
                  share identical Illumina indexes must be concatenated.
                  These files belong to the same sublibrary.
                </li>
              </ul>
              Further details on Fastq file format can be found
              {' '}
              <a href='https://support.parsebiosciences.com/hc/en-us/articles/20926505533332-Fundamentals-of-Working-with-Parse-Data' target='_blank' rel='noreferrer'>here</a>

            </div>
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
            <div
              onClick={handleFileSelection}
              onKeyDown={handleFileSelection}
              data-test-id={integrationTestConstants.ids.FILE_UPLOAD_DROPZONE}
              style={{ border: '1px solid #ccc', padding: '2rem 0' }}
              className='dropzone'
              id='dropzone'
            >
              <Empty description='Drag and drop files here or click to browse' image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </div>
            <Tooltip title={nonMatchingFastqPairs.length > 0 ? 'Please fix the files without read pair' : null}>
              <Button
                data-test-id={integrationTestConstants.ids.FILE_UPLOAD_BUTTON}
                id='uploadButton'
                type='primary'
                key='create'
                block
                disabled={!fileHandles.valid.length || nonMatchingFastqPairs.length > 0}
                onClick={() => {
                  beginUpload(fileHandles.valid);
                  setFileHandles(emptyFiles);
                }}
              >
                Upload
              </Button>
            </Tooltip>
            {
              fileHandles.invalid.length > 0 && (
                <div>
                  <ExpandableList
                    expandedTitle='Ignored files'
                    dataSource={fileHandles.invalid}
                    getItemText={(file) => file.name}
                    getItemExplanation={(file) => file.rejectReason}
                    collapsedExplanation={(
                      <>
                        {fileHandles.invalid.length}
                        {' '}
                        file
                        {fileHandles.invalid.length > 1 ? 's were' : ' was'}
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
                <>
                  <ExpandableList
                    expandedTitle='Files without read pair'
                    dataSource={nonMatchingFastqPairs}
                    getItemText={(fileName) => fileName}
                    getItemExplanation={(fileName) => `Either remove this file or add ${getMissingPairName(fileName)}.`}
                    collapsedExplanation='Files without read pair, click to display'
                  />
                </>
              )
            }
            {
              fileHandles.valid.length > 0 && (
                <>
                  <Divider orientation='center'>To upload</Divider>
                  <List
                    dataSource={fileHandles.valid}
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
                              <>
                                <CheckCircleTwoTone twoToneColor='#52c41a' />
                              </>
                            ) : (
                              <>
                                <CloseCircleTwoTone twoToneColor='#f5222d' />
                              </>
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
        <Space direction='vertical'>
          {newToken && (
            <Alert
              message={(
                <>
                  <Text>
                    Token generated:
                    {' '}
                    {
                      <Text keyboard copyable>
                        {newToken}
                      </Text>
                    }
                  </Text>
                </>
              )}
            />
          )}
          {tokenExists || newToken
            ? (
              <>
                <Text>
                  To upload files via the command line, use the previously generated token.
                  <br />
                  If the previous token was lost, a new one can be generated by clicking the
                  button below, this will invalidate the current token.
                </Text>
              </>
            )
            : 'To upload files via the command line, you need to generate a token.'}
          <Button loading={_.isNil(tokenExists)} onClick={generateNewToken}>{(tokenExists || newToken) ? 'Refresh token' : 'Generate token'}</Button>
          <Divider />
          <Text>
            To perform a command-line upload, download this script:
            <br />
            <a href='/parse-upload.py' download>parse-upload.py</a>
            <br />

            Run the script with the following command:
            <br />
            <pre>
              <Paragraph copyable={{
                text: `python parse-upload.py \\
  --token ${newToken || 'YOUR_TOKEN'} \\
  --run_id ${secondaryAnalysisId} \\
  --file /path/to/fastq/file_1 /path/to/fastq/file_2 ...
  `,
              }}
              >
                {`python parse-upload.py \\
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
