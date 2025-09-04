/* eslint-disable react/jsx-props-no-spreading */
import { v4 as uuidv4 } from 'uuid';
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { createAndUploadGenomeFile, createGenome } from 'redux/actions/genomes';
import {
  Form,
  Typography,
  Divider,
  Input,
  Empty,
  Space,
  Button,
  Tooltip,
  List,
  Select,
} from 'antd';
import { InfoCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { getGenomeById } from 'redux/selectors';

import Dropzone from 'react-dropzone';
import propTypes from 'prop-types';
import integrationTestConstants from 'utils/integrationTestConstants';
import FilesUploadTable from 'components/secondary-analysis/FilesUploadTable';

import useLocalState from 'utils/customHooks/useLocalState';

// Import ExpandableList for ignored files
import ExpandableList from 'components/ExpandableList';

const { Text, Title } = Typography;

// Supported extensions for FASTA and annotation files
const fastaExtensions = ['.fa', '.fasta', '.fa.gz', '.fasta.gz', '.fna', '.fna.gz'];
const annotationExtensions = ['.gtf', '.gff3', '.gtf.gz', '.gff3.gz'];

const SelectReferenceGenome = (props) => {
  const {
    genomeId, onDetailsChanged, onGenomeDetailsChanged, secondaryAnalysisId,
  } = props;
  const dispatch = useDispatch();

  const [localGenome, updateGenome] = useLocalState(
    (value) => onDetailsChanged({ refGenome: value }),
    genomeId,
  );

  const { public: publicGenomes, custom: customGenomes } = useSelector((state) => state.genomes);

  const options = [...Object.values(publicGenomes),
    ...Object.values(customGenomes)].map((currentGenome) => ({
    label: `${currentGenome.name}: ${currentGenome.description}`,
    value: currentGenome.id,
  }));

  // an genome is stored if has any uploaded input files
  const selectedGenome = useSelector(getGenomeById(localGenome));
  const [genomeNameInput, setGenomeNameInput] = useLocalState(
    (value) => onGenomeDetailsChanged({ name: value }),
    '',
  );
  const [genomeDescriptionInput, setGenomeDescriptionInput] = useLocalState(
    (value) => onGenomeDetailsChanged({ description: value }),
    '',
  );

  const isCustomGenomeSaved = selectedGenome
  && !selectedGenome.built && !_.isEmpty(selectedGenome.files);

  const [filePair, setFilePair] = useState(null);
  const [invalidFiles, setInvalidFiles] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (!selectedGenome) return;
    if (!selectedGenome.built) {
      setGenomeNameInput(selectedGenome.name);
      form.setFieldsValue({ genomeName: selectedGenome.name });
      setGenomeDescriptionInput(selectedGenome.description);
    } else {
      setGenomeNameInput('');
      form.setFieldsValue({ genomeName: '' });
      setGenomeDescriptionInput('');
    }
  }, [selectedGenome]);

  // Determine file type based on extension
  const getFileType = (fileName) => {
    const lower = fileName.toLowerCase();
    if (fastaExtensions.some((ext) => lower.endsWith(ext))) {
      return 'fasta';
    }
    if (annotationExtensions.some((ext) => lower.endsWith(ext))) {
      return 'annotation';
    }
    return 'unknown';
  };

  const createNewGenome = async () => {
    const newGenomeId = await dispatch(createGenome(
      genomeNameInput,
      genomeDescriptionInput,
      secondaryAnalysisId,
    ));
    updateGenome(newGenomeId);
    return newGenomeId;
  };

  const uploadPairs = async () => {
    if (!filePair) return;

    let selectedGenomeId = genomeId;
    if (!customGenomes[genomeId]) {
      selectedGenomeId = await createNewGenome();
    }

    const pairFileId = uuidv4();
    dispatch(createAndUploadGenomeFile(
      selectedGenomeId,
      filePair.fasta,
      'fasta',
      pairFileId,
    ));
    dispatch(createAndUploadGenomeFile(
      selectedGenomeId,
      filePair.annotation,
      'annotation',
      pairFileId,
    ));

    setFilePair(null);
    setInvalidFiles([]);
  };

  // Handle dropped files from the dropzone
  // Simple behavior: take the FIRST TWO files only and try to use them
  const onDrop = (acceptedFiles) => {
    setInvalidFiles([]);

    const picked = acceptedFiles.slice(0, 2);

    if (picked.length < 2) {
      setFilePair(null);
      setInvalidFiles(picked.map((f) => ({
        name: f.name,
        reason: 'Select two files: one FASTA and one annotation.',
      })));
      return;
    }

    const [a, b] = picked;
    const typeA = getFileType(a.name);
    const typeB = getFileType(b.name);

    // Validate: exactly one fasta and one annotation
    if ((typeA === 'fasta' && typeB === 'annotation') || (typeA === 'annotation' && typeB === 'fasta')) {
      setFilePair({
        fasta: typeA === 'fasta' ? a : b,
        annotation: typeA === 'annotation' ? a : b,
      });
      setInvalidFiles([]);
    } else {
      setFilePair(null);
      const reason = 'Need one FASTA (*.fa/*.fasta/*.fna[.gz]) and one annotation (*.gtf/*.gff3[.gz]) file.';
      setInvalidFiles([
        { name: a.name, reason },
        { name: b.name, reason },
      ]);
    }
  };

  // Remove the currently selected pair
  const removePair = () => {
    setFilePair(null);
  };

  const genomeNamePattern = /^[A-Za-z0-9_.-]+$/;
  // Determine whether the upload button should be disabled
  const isUploadDisabled = !genomeNameInput
    || !genomeDescriptionInput
    || !filePair
    || !genomeNamePattern.test(genomeNameInput);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div>
        <Tooltip title='Select the reference genome for aligning your whole transcriptome data.'>
          <Title level={5}>Select the reference genome:</Title>
        </Tooltip>
      </div>
      <br />
      <Select
        showSearch
        style={{ width: '90%' }}
        value={localGenome}
        disabled={isCustomGenomeSaved}
        placeholder='Select the reference genome'
        onChange={updateGenome}
        options={options}
        filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
      />
      <Divider> OR </Divider>
      <Title level={5}>Add files for new genome generation:</Title>
      <Form form={form} component={false}>
        {/* Form fields: name and description, with validation */}
        <Space direction='vertical'>
          <div style={{ display: 'flex' }}>
            <Form.Item
              name='genomeName'
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
                value={genomeNameInput}
                onChange={(e) => setGenomeNameInput(e.target.value)}
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

            <Input
              placeholder='Specify genome description'
              style={{ flex: 1 }}
              maxLength={50}
              value={genomeDescriptionInput}
              onChange={(e) => setGenomeDescriptionInput(e.target.value)}
            />
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
        Upload a single matched FASTA and annotation file.
        <br />
        Only the first two files you select will be used.
        <br />
        The expected files are one of each of the following:
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
              description='Drag and drop two files (one FASTA and one annotation) here or click to browse'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Dropzone>
      {filePair && (
        <>
          <Divider>Files to be uploaded</Divider>
          <List
            size='small'
            dataSource={[filePair]}
            renderItem={(pair) => (
              <List.Item
                actions={[
                  <DeleteOutlined
                    key='delete'
                    onClick={removePair}
                    style={{ color: 'crimson' }}
                  />,
                ]}
              >
                <Text>
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
      <center>
        <Button
          data-test-id={integrationTestConstants.ids.FILE_UPLOAD_BUTTON}
          type='primary'
          style={{ width: '50%' }}
          disabled={isUploadDisabled}
          onClick={uploadPairs}
        >
          Upload
        </Button>
      </center>
      {selectedGenome && !selectedGenome?.built && !_.isEmpty(selectedGenome.files) && (
        <FilesUploadTable
          files={Object.values(selectedGenome.files)}
          canEditTable
          secondaryAnalysisId={secondaryAnalysisId}
          pairedWt={false}
        />
      )}
      {/* <div style={{ marginTop: 'auto', marginBottom: '0.1em' }}>
        <Text type='secondary'>
          <i>
            If the genome you require is not available, please contact us at
            {' '}
            <a href='mailto:support@parsebiosciences.com'>support@parsebiosciences.com</a>.
          </i>
        </Text>
      </div> */}
    </div>
  );
};

SelectReferenceGenome.defaultProps = {
  genomeId: undefined,
};

SelectReferenceGenome.propTypes = {
  onDetailsChanged: propTypes.func.isRequired,
  genomeId: propTypes.string,
  secondaryAnalysisId: propTypes.string.isRequired,
  onGenomeDetailsChanged: propTypes.func.isRequired,
};

export default SelectReferenceGenome;
