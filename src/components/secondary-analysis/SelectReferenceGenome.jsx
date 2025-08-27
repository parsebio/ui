/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import {
  Form,
  Select,
  Typography,
  Divider,
  Input,
  Empty,
  Space,
  Button,
  Tooltip,
} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

import Dropzone from 'react-dropzone';
import propTypes from 'prop-types';
import integrationTestConstants from 'utils/integrationTestConstants';

import genomes from 'utils/genomes.json';
import useLocalState from 'utils/customHooks/useLocalState';

const { Text } = Typography;

const options = genomes.map((genome) => ({
  label: `${genome.name}: ${genome.species}`,
  value: genome.name,
}));

const SelectReferenceGenome = (props) => {
  const { genome, onDetailsChanged } = props;

  const [localGenome, updateGenome] = useLocalState(
    (value) => onDetailsChanged({ refGenome: value }),
    genome,
  );

  const onDrop = (acceptedFiles) => {
  };

  const [form] = Form.useForm();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div>
        <Tooltip title='Select the reference genome for aligning your whole transcriptome data.'>
          <span>Select the reference genome:</span>
        </Tooltip>
      </div>
      <br />
      <Select
        showSearch
        style={{ width: '90%' }}
        value={localGenome}
        placeholder='Select the reference genome'
        onChange={updateGenome}
        options={options}
        filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
      />
      <Divider> OR </Divider>
      <Text>Add files for new genome generation:</Text>
      <Form form={form} component={false}>
        <Space direction='vertical'>
          <div style={{ display: 'flex' }}>
            <Form.Item
              name='genomeName'
              rules={[
                {
                  pattern: /^[A-Za-z0-9_.-]+$/,
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
            <Tooltip title='Specify a genome name. Character limit is 20. Only alpha-numeric characters, dots, dashes and underscores are supported.
             An example is “GRCm39_GFP”.'
            >
              <InfoCircleOutlined style={{ marginLeft: '8px' }} />
            </Tooltip>
          </div>
          <div style={{ display: 'flex' }}>
            <Form.Item
              name='genomeDescription'
              // No validation rules specified for description
              style={{ flex: 1, marginBottom: 0 }}
            >
              <Input
                placeholder='Specify genome description'
                style={{ flex: 1 }}
                maxLength={50}
              />
            </Form.Item>
            <Tooltip
              overlay={(
                <div>
                  Add a short description for your genome. An example is “Custom
                  Mus musculus (Mouse) with GFP”. (Character limit is 50.) It’s
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
      <Text>
        Upload one pair of matched Fasta/Annotation files at a time. Multiple
        pairs can be uploaded sequentially. The expected files are 1 of each of
        the following:
        {' '}
        <br />
        *.fasta or *.fasta.gz or *.fa or *.fa.gz or *.fna or *.fna.gz
        {' '}
        <br />
        AND
        <br />
        {' '}
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
              description='Drag and drop xlsm file here or click to browse'
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </Dropzone>
      <br />
      <center>
        <Button type='primary' style={{ width: '50%' }}>
          Upload
        </Button>
      </center>
      {/* <div style={{ marginTop: 'auto', marginBottom: '0.1em' }}>
        <Text type='secondary'>
          <i>
            If the genome you require is not available, please contact us at
            {' '}
            <a href='mailto:support@parsebiosciences.com'>support@parsebiosciences.com</a>
            .
          </i>
        </Text>
      </div> */}
    </div>
  );
};

SelectReferenceGenome.defaultProps = {
  genome: undefined,
};

SelectReferenceGenome.propTypes = {
  onDetailsChanged: propTypes.func.isRequired,
  genome: propTypes.string,
};

export default SelectReferenceGenome;
