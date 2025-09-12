/* eslint-disable react/jsx-props-no-spreading */
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { createAndUploadGenomeFile, createGenome, deleteGenomeInputFile } from 'redux/actions/genomes';
import {
  Form,
  Typography,
  Input,
  Empty,
  Space,
  Button,
  Tooltip,
  List,
  Divider,
} from 'antd';
import { InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { getGenomeById } from 'redux/selectors';

import Dropzone from 'react-dropzone';
import propTypes from 'prop-types';
import integrationTestConstants from 'utils/integrationTestConstants';
import FilesUploadTable from 'components/secondary-analysis/FilesUploadTable';

import ExpandableList from 'components/ExpandableList';

const { Text } = Typography;

// Supported extensions for FASTA and annotation files
const fastaExtensions = ['.fa', '.fasta', '.fa.gz', '.fasta.gz', '.fna', '.fna.gz'];
const annotationExtensions = ['.gtf', '.gff3', '.gtf.gz', '.gff3.gz'];
const genomeNamePattern = /^[A-Za-z0-9_.-]+$/;

const GenomeCreator = (props) => {
  const {
    genomeId,
    updateGenome,
    secondaryAnalysisId,
    genomeDiffRef,
  } = props;

  const dispatch = useDispatch();

  const { custom: customGenomes } = useSelector((state) => state.genomes);

  const selectedGenome = useSelector(getGenomeById(genomeId), _.isEqual);

  const [filePairs, setFilePairs] = useState([]);
  const [invalidFiles, setInvalidFiles] = useState([]);
  const [form] = Form.useForm();

  const genomeName = Form.useWatch('nameInput', form) || '';
  const genomeDescription = Form.useWatch('descriptionInput', form) || '';

  useEffect(() => {
    if (!selectedGenome) return;

    if (!selectedGenome.built) {
      form.setFieldsValue({
        nameInput: selectedGenome.name,
        descriptionInput: selectedGenome.description,
      });
    } else {
      form.setFieldsValue({ nameInput: '', descriptionInput: '' });
    }
  }, [selectedGenome]);

  // Determine file type based on extension
  const getFileType = (fileName) => {
    const lower = fileName.toLowerCase();
    if (fastaExtensions.some((ext) => lower.endsWith(ext))) return 'fasta';
    if (annotationExtensions.some((ext) => lower.endsWith(ext))) return 'annotation';
    return 'unknown';
  };

  const createNewGenome = async () => {
    const newGenomeId = await dispatch(createGenome(
      genomeName,
      genomeDescription,
      secondaryAnalysisId,
    ));
    updateGenome(newGenomeId);
    return newGenomeId;
  };

  const uploadPairs = async () => {
    if (filePairs.length === 0) return;

    let selectedGenomeId = genomeId;
    if (!customGenomes[genomeId]) {
      selectedGenomeId = await createNewGenome();
    }

    filePairs.forEach((pair) => {
      const pairFileId = uuidv4();
      dispatch(createAndUploadGenomeFile(
        selectedGenomeId,
        pair.fasta,
        'fasta',
        pairFileId,
      ));
      dispatch(createAndUploadGenomeFile(
        selectedGenomeId,
        pair.annotation,
        'annotation',
        pairFileId,
      ));
    });

    setFilePairs([]);
    setInvalidFiles([]);
  };

  const deleteGenomeInputPair = (fileId) => {
    dispatch(deleteGenomeInputFile(selectedGenome.id, fileId));
  };

  // Handle dropped files: accept at most ONE valid pair per drop
  const onDrop = (acceptedFiles) => {
    const newInvalids = [];
    // We allow only 1 pair to be dropped at a time
    const existingNames = new Set(
      filePairs.flatMap((p) => [p.fasta.name, p.annotation.name]),
    );

    let fastaFile = null;
    let annotationFile = null;

    acceptedFiles.forEach((f) => {
      const type = getFileType(f.name);

      // Track unknowns as invalid
      if (type === 'unknown') {
        newInvalids.push({ name: f.name, reason: 'Unsupported file type' });
        return;
      }

      // Skip duplicates
      if (existingNames.has(f.name)) {
        newInvalids.push({ name: f.name, reason: 'Duplicate of a selected file' });
        return;
      }

      if (!fastaFile && type === 'fasta') {
        fastaFile = f;
      } else if (!annotationFile && type === 'annotation') {
        annotationFile = f;
      }
    });

    if (fastaFile && annotationFile) {
      setFilePairs((prev) => [...prev, { fasta: fastaFile, annotation: annotationFile }]);
    } else {
      const tried = acceptedFiles.slice(0, 2);
      newInvalids.push(
        ...tried
          .filter((f) => !newInvalids.find((i) => i.name === f.name))
          .map((f) => ({
            name: f.name,
            reason: 'Need one FASTA (*.fa/*.fasta/*.fna[.gz]) and one annotation (*.gtf/*.gff3[.gz]) file.',
          })),
      );
    }

    setInvalidFiles((prev) => [...prev, ...newInvalids]);
    document.getElementById('uploadButton').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Remove a file pair by index
  const removePair = (index) => {
    setFilePairs((prev) => prev.filter((pair, i) => i !== index));
  };

  const validGenomeName = genomeName && genomeNamePattern.test(genomeName);
  const isUploadDisabled = !validGenomeName
    || !genomeDescription
    || filePairs.length === 0;

  const handleValuesChange = (changedValue) => {
    const { nameInput, descriptionInput } = changedValue;
    if (nameInput && genomeNamePattern.test(nameInput)) {
      genomeDiffRef.current.name = nameInput;
    }

    if (descriptionInput) {
      genomeDiffRef.current.description = descriptionInput;
    }
  };

  return (
    <>
      <Form form={form} component={false} onValuesChange={handleValuesChange}>
        {/* Form fields: name and description, with validation */}
        <Space direction='vertical'>
          <div style={{ display: 'flex' }}>
            <Form.Item
              name='nameInput'
              rules={[
                {
                  pattern: genomeNamePattern,
                  message:
                    'Only alpha-numeric characters, dots, dashes and underscores are supported.',
                },
              ]}
              validateTrigger={['onChange', 'onBlur']}
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Input
                placeholder='Specify genome name'
                maxLength={20}
              />
            </Form.Item>
            <Tooltip
              title='Specify a genome name. Character limit is 20. Only alpha-numeric characters, dots, dashes and underscores are supported.
             An example is “GRCm39_GFP”.'
            >
              <InfoCircleOutlined style={{ marginLeft: '8px' }} />
            </Tooltip>
          </div>
          <div style={{ display: 'flex' }}>
            <Form.Item
              name='descriptionInput'
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Input
                placeholder='Specify genome description'
                maxLength={50}
              />
            </Form.Item>
            <Tooltip
              overlay={(
                <div>
                  Add a short description for your genome. An example is “Custom
                  Mus musculus (Mouse) with GFP”. (Character limit is 50.) It&apos;s
                  currently only possible to generate single species custom
                  genomes in Trailmaker. If you are working with mixed species,
                  reach out to
                  {' '}
                  <a href='mailto:support@parsebiosciences.com'>
                    support@parsebiosciences.com
                  </a>
                  {' '}
                  for help.
                </div>
              )}
            >
              <InfoCircleOutlined style={{ marginLeft: '8px' }} />
            </Tooltip>
          </div>
        </Space>
      </Form>
      <Text style={{ marginTop: '1vh', marginBottom: '1vh' }}>
        Upload one matched FASTA/annotation pair per drop.
        <br />
        You can add multiple pairs by dropping again.
        <br />
        Expected files (one of each):
        <br />
        *.fasta or *.fasta.gz or *.fa or *.fa.gz or *.fna or *.fna.gz
        <br />
        AND
        <br />
        *.gtf or *.gtf.gz or *.gff3 or *.gff3.gz
      </Text>
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
              description='Drag and drop one pair (one FASTA + one annotation) here, or click to browse'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Dropzone>
      {filePairs.length > 0 && (
        <>
          <Divider>Pairs to be uploaded</Divider>
          <List
            size='small'
            dataSource={filePairs}
            renderItem={(pair, index) => (
              <List.Item
                key={`pair-${index}`}
                actions={[
                  <DeleteOutlined
                    key='delete'
                    onClick={() => removePair(index)}
                    style={{ color: 'crimson' }}
                  />,
                ]}
              >
                <Text key={`pair-text-${index}`}>
                  {pair.fasta.name}
                  <b> and </b>
                  {pair.annotation.name}
                </Text>
              </List.Item>
            )}
          />
        </>
      )}
      {invalidFiles.length > 0 && (
        <ExpandableList
          expandedTitle='Ignored files'
          dataSource={invalidFiles}
          getItemText={(file) => file.name}
          getItemExplanation={(file) => file.reason}
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
      )}
      <br />
      <Space direction='vertical'>
        <center>
          <Tooltip
            title={isUploadDisabled ? (
              !genomeName
                ? 'Specify a valid genome name.'
                : !genomeDescription
                  ? 'Specify a genome description.'
                  : filePairs.length === 0
                    ? 'Add at least one valid FASTA/annotation file pair.'
                    : ''
            ) : ''}
          >
            <Button
              data-test-id={integrationTestConstants.ids.FILE_UPLOAD_BUTTON}
              type='primary'
              id='uploadButton'
              disabled={isUploadDisabled}
              onClick={uploadPairs}
            >
              Upload
            </Button>
          </Tooltip>
        </center>
        {selectedGenome && !selectedGenome?.built && !_.isEmpty(selectedGenome.files) && (
          <FilesUploadTable
            files={Object.values(selectedGenome.files)}
            deleteAlertText='This action will also delete the corresponding file in the genome pair. Are you sure you want to delete this pair of files?'
            canEditTable
            handleDelete={deleteGenomeInputPair}
          />
        )}
      </Space>
      {/* <div style={{ marginTop: 'auto', marginBottom: '0.1em' }}>
        <Text type='secondary'>
          <i>
            If the genome you require is not available, please contact us at
            {' '}
            <a href='mailto:support@parsebiosciences.com'>support@parsebiosciences.com</a>.
          </i>
        </Text>
      </div> */}
    </>
  );
};

GenomeCreator.defaultProps = {
  genomeId: undefined,
};

GenomeCreator.propTypes = {
  updateGenome: propTypes.func.isRequired,
  genomeId: propTypes.string,
  secondaryAnalysisId: propTypes.string.isRequired,
  genomeDiffRef: propTypes.shape({
    current: propTypes.object,
  }).isRequired,
};

export default GenomeCreator;
