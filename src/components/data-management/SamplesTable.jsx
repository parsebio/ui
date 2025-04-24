/* eslint-disable react/jsx-props-no-spreading */
import _ from 'lodash';
import React, {
  useEffect, useState, forwardRef, useImperativeHandle, useMemo, useCallback,
} from 'react';
import { useVT } from 'virtualizedtableforantd4';

import { useSelector, useDispatch } from 'react-redux';
import {
  Table, Row, Typography, Space, Alert, Tabs, Tooltip,
} from 'antd';
import {
  MenuOutlined,
} from '@ant-design/icons';
import { sortableHandle } from 'react-sortable-hoc';

import ReactResizeDetector from 'react-resize-detector';
import { ClipLoader } from 'react-spinners';

import ExampleExperimentsSpace from 'components/data-management/ExampleExperimentsSpace';
import MetadataPopover from 'components/data-management/metadata/MetadataPopover';
import MetadataColumnTitle from 'components/data-management/metadata/MetadataColumn';
import { UploadCell, SampleNameCell, EditableFieldCell } from 'components/data-management/SamplesTableCells';

import {
  deleteMetadataTrack,
  createMetadataTrack,
  updateValuesInMetadataTrack,
  reorderSamples,
} from 'redux/actions/experiments';
import { loadSamples } from 'redux/actions/samples';
import { METADATA_DEFAULT_VALUE } from 'redux/reducers/experiments/initialState';

import DraggableBodyRow from 'components/data-management/DraggableBodyRow';
import UploadStatusView from 'components/UploadStatusView';
import { metadataNameToKey, metadataKeyToName } from 'utils/data-management/metadataUtils';
import integrationTestConstants from 'utils/integrationTestConstants';
import useConditionalEffect from 'utils/customHooks/useConditionalEffect';
import fileUploadUtils, { techNamesToDisplay } from 'utils/upload/fileUploadUtils';
import { sampleTech } from 'utils/constants';
import { fileTypeToDisplay } from 'utils/sampleFileType';
import UploadStatus from 'utils/upload/UploadStatus';

const { UPLOADED, INCOMPLETE } = UploadStatus;
const { Text } = Typography;

const SamplesTable = forwardRef((props, ref) => {
  const dispatch = useDispatch();

  const [selectedTable, setSelectedTable] = useState('All');
  const [fullTableData, setFullTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState(initialTableColumns);

  const samples = useSelector((state) => state.samples);

  const samplesLoading = useSelector((state) => state.samples.meta.loading);
  const activeExperimentId = useSelector((state) => state.experiments.meta.activeExperimentId);
  const samplesValidating = useSelector(
    (state) => state.samples.meta.validating.includes(activeExperimentId),
  );

  const activeExperiment = useSelector((state) => state.experiments[activeExperimentId]);

  const parentExperimentName = useSelector(
    (state) => state.experiments[activeExperiment?.parentExperimentId]?.name,
  );

  const selectedTechs = Array.from(new Set(
    activeExperiment?.sampleIds.map((sampleId) => samples[sampleId]?.type).filter((type) => type),
  )).sort();
  console.log('SELECTED TECHS', selectedTechs, ' table columns ', tableColumns, ' TABLE DATA', fullTableData, ' selected table ', selectedTable);

  const [sampleNames, setSampleNames] = useState(new Set());
  const DragHandle = sortableHandle(() => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />);

  const [samplesLoaded, setSamplesLoaded] = useState(false);

  useEffect(() => {
    if (!activeExperiment?.sampleIds.length) {
      setFullTableData([]);
      return;
    }

    const alreadyInTable = () => _.isEqual(
      fullTableData.map(({ key }) => key),
      activeExperiment.sampleIds,
    );

    const anyNotLoadedYet = () => activeExperiment.sampleIds.some((sampleId) => !samples[sampleId]);

    if (alreadyInTable() || anyNotLoadedYet()) return;

    const newData = activeExperiment.sampleIds.map((sampleUuid) => generateDataForItem(sampleUuid));

    setFullTableData(newData);
  }, [activeExperiment?.sampleIds, samples]);

  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const newSamplesLoaded = activeExperiment?.sampleIds.every((sampleId) => samples[sampleId]);

    if (newSamplesLoaded === true && samplesLoaded === false) {
      setSamplesLoaded(true);
    }
  }, [activeExperiment, samples]);

  const [VT, setVT] = useVT(
    () => ({
      scroll: { y: size.height },
    }),
    [size.height],
  );

  useMemo(() => setVT({ body: { row: DraggableBodyRow } }), [selectedTable]);

  useEffect(() => {
    if (activeExperiment?.sampleIds.length > 0 && !samplesLoading) {
      // if there are samples - build the table columns
      const sanitizedSampleNames = new Set(
        activeExperiment.sampleIds.map((id) => samples[id]?.name.trim()),
      );

      setSampleNames(sanitizedSampleNames);
      const metadataColumns = activeExperiment.metadataKeys.map(
        (metadataKey) => createInitializedMetadataColumn(metadataKeyToName(metadataKey)),
      ) || [];

      setTableColumns({
        ...initialTableColumns,
        commonColumns: [...initialTableColumns.commonColumns, ...metadataColumns],
      });
    }
  }, [samples, activeExperiment?.sampleIds, samplesLoading]);

  useConditionalEffect(() => {
    setSamplesLoaded(false);

    dispatch(loadSamples(activeExperimentId));
  }, [activeExperimentId]);

  const getTechSpecificTable = () => {
    const selectedTableColumns = [
      ...tableColumns.tables[selectedTable], ...tableColumns.commonColumns,
    ].sort((a, b) => a.index - b.index);

    const selectedTechSampleIds = activeExperiment.sampleIds
      .filter((sampleId) => samples[sampleId]?.type === selectedTable);
    const selectedTableData = fullTableData
      .filter((item) => selectedTechSampleIds.includes(item.key));

    return { data: selectedTableData, columns: selectedTableColumns };
  };

  const getAllTechTable = () => {
    const selectedTableData = [];
    fullTableData.forEach((item) => {
      if (!samples[item.uuid]) return;

      const filesInSample = Object?.entries(samples[item.uuid].files);

      const allUploaded = filesInSample
        .every(([, value]) => value.upload.status === UPLOADED);

      const allFilesPresent = fileUploadUtils[samples[item.uuid].type]?.requiredFiles
        .every((fileType) => filesInSample.map(([fileKey]) => fileKey).includes(fileType));

      const status = (allUploaded && allFilesPresent)
        ? UPLOADED : INCOMPLETE;

      selectedTableData.push({
        ...item,
        uploadStatus: status,
        technology: samples[item.uuid].type,
      });
    });

    const selectedTableColumns = [
      {
        className: `${integrationTestConstants.classes.SAMPLE_CELL}`,
        index: 1,
        key: 'sample',
        title: 'Sample',
        dataIndex: 'name',
        fixed: 'left',
        render: (text, record, indx) => (
          <SampleNameCell cellInfo={{ text, record, indx }} />
        ),
      },
      {
        index: 2,
        key: 'uploadStatus',
        title: 'Upload Status',
        dataIndex: 'uploadStatus',
        render: (uploadStatus, record) => (
          uploadStatus === UPLOADED ? (
            <UploadStatusView status={uploadStatus} />
          ) : (
            <Tooltip title={`Not all files for this sample are uploaded, go to the ${techNamesToDisplay[record.technology]} tab`}>
              <div>
                <UploadStatusView status={uploadStatus} />
              </div>
            </Tooltip>
          )
        ),
      },
      {
        index: 4,
        key: 'technology',
        title: 'Technology',
        dataIndex: 'technology',
        render: (text) => (
          <Text>{techNamesToDisplay[text]}</Text>
        ),
      },
      ...tableColumns.commonColumns,
    ].sort((a, b) => a.index - b.index);
    return { data: selectedTableData, columns: selectedTableColumns };
  };

  const renderSelectedTable = () => {
    let table = {};

    if (selectedTable === 'All') {
      table = getAllTechTable();
    } else {
      table = getTechSpecificTable();
    }

    return (

      <Table
        scroll={{ y: size.height, x: 'max-content' }}
        components={VT}
        columns={table.columns}
        dataSource={table.data}
        locale={locale}
        showHeader={activeExperiment?.sampleIds.length > 0}
        pagination={false}
        onRow={(record, index) => ({
          index,
          moveRow,
        })}
        sticky
        bordered
      />
    );
  };

  const initialTableColumns = useMemo(() => {
    const columns = {
      tables: [],
      commonColumns: [{
        fixed: 'left',
        index: 0,
        key: 'sort',
        dataIndex: 'sort',
        width: 50,
        render: () => <DragHandle />,
      }],
    };

    if (selectedTechs.length > 0) {
      selectedTechs.forEach((tech) => {
        columns.tables[tech] = [{
          className: `${integrationTestConstants.classes.SAMPLE_CELL}`,
          index: 1,
          key: 'sample',
          title: tech === sampleTech.SEURAT ? 'File' : 'Sample',
          dataIndex: 'name',
          fixed: 'left',
          render: (text, record, indx) => (
            <SampleNameCell cellInfo={{ text, record, indx }} />
          ),
        }];
        fileUploadUtils[tech].requiredFiles.forEach(
          (requiredFile, indx) => columns.tables[tech].push({
            index: 2 + indx,
            title: <center>{fileTypeToDisplay[requiredFile]}</center>,
            key: requiredFile,
            dataIndex: requiredFile,
            width: 170,
            onCell: () => ({ style: { margin: '0px', padding: '0px' } }),
            render: (tableCellData) => tableCellData && (
              <UploadCell
                columnId={requiredFile}
                sampleUuid={tableCellData.sampleUuid}
              />
            ),
          }),
        );
      });
    }
    return columns;
  }, [selectedTechs]);

  const deleteMetadataColumn = (name) => {
    dispatch(deleteMetadataTrack(name, activeExperimentId));
  };

  const createInitializedMetadataColumn = (name) => {
    const key = metadataNameToKey(name);

    return {
      key,
      title: () => (
        <MetadataColumnTitle
          name={name}
          sampleNames={sampleNames}
          setCells={setMetadataCells}
          deleteMetadataColumn={deleteMetadataColumn}
          activeExperimentId={activeExperimentId}
          samplesList={fullTableData
            .map(({ uuid, name: metadataName }) => ({ sampleUuid: uuid, name: metadataName }))}
        />
      ),
      width: 200,
      dataIndex: key,
      render: (cellValue, record, rowIdx) => (
        <EditableFieldCell
          sampleUuid={record.uuid}
          dataIndex={key}
          rowIdx={rowIdx}
          onAfterSubmit={(newValue) => {
            dispatch(updateValuesInMetadataTrack(activeExperimentId, [record.uuid], key, newValue));
          }}
        />
      ),
    };
  };

  const onMetadataCreate = (name) => {
    dispatch(createMetadataTrack(name, activeExperimentId));
  };

  useImperativeHandle(ref, () => ({
    createMetadataColumn() {
      // change to current table columns
      const key = `metadata_${tableColumns.length}`;
      const previousTableColumns = tableColumns;

      const metadataCreateColumn = {
        key,
        fixed: 'right',
        title: () => (
          <MetadataPopover
            existingMetadata={activeExperiment.metadataKeys}
            onCreate={(name) => {
              onMetadataCreate(name);
            }}
            onCancel={() => {
              setTableColumns(previousTableColumns);
            }}
            message='Provide new metadata track name'
            visible
          >
            <Space>
              New Metadata Track
            </Space>
          </MetadataPopover>
        ),
        width: 200,
      };
      setTableColumns({
        ...previousTableColumns,
        commonColumns: [...tableColumns.commonColumns, metadataCreateColumn],
      });
    },
  }));

  const MASS_EDIT_ACTIONS = [
    'REPLACE_EMPTY',
    'REPLACE_ALL',
    'CLEAR_ALL',
  ];

  const setMetadataCells = (value, metadataKey, actionType, selectedSamples) => {
    if (!MASS_EDIT_ACTIONS.includes(actionType) || !value) return;

    const canUpdateCell = (sampleUuid, action) => {
      if (action !== 'REPLACE_EMPTY') return true;

      const isMetadataEmpty = (uuid) => (
        !samples[uuid].metadata[metadataKey]
        || samples[uuid].metadata[metadataKey] === METADATA_DEFAULT_VALUE
      );

      return isMetadataEmpty(sampleUuid);
    };

    const filteredSamplesToUpdate = selectedSamples
      .filter((sampleUuid) => canUpdateCell(sampleUuid, actionType));

    dispatch(updateValuesInMetadataTrack(
      activeExperimentId, filteredSamplesToUpdate, metadataKey, value,
    ));
  };

  const generateDataForItem = useCallback((sampleUuid) => {
    const tech = samples[sampleUuid].type;
    const sampleFileTypes = fileUploadUtils[tech]?.requiredFiles
      .map((requiredFile) => ([requiredFile, { sampleUuid }]));

    return {
      key: sampleUuid,
      name: samples[sampleUuid]?.name || 'UPLOAD ERROR: Please reupload sample',
      uuid: sampleUuid,
      ...Object.fromEntries(sampleFileTypes),
    };
  }, [activeExperiment?.sampleIds, selectedTechs, samples]);

  const renderLoader = () => (
    <>
      <Row justify='center'>
        <ClipLoader
          size={50}
          color='#8f0b10'
        />
      </Row>

      <Row justify='center'>
        <Text>
          {
            samplesLoading ? 'We\'re getting your samples ...'
              : samplesValidating ? 'We\'re validating your samples ...'
                : ''
          }
        </Text>
      </Row>
    </>
  );

  const locale = {
    emptyText: (
      <ExampleExperimentsSpace
        introductionText='Start uploading your samples by clicking on Add data.'
        imageStyle={{ height: 60 }}
      />
    ),
  };

  const moveRow = async (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    await dispatch(reorderSamples(activeExperimentId, fromIndex, toIndex));
  };

  const renderSamplesTable = () => {
    const technologyTabs = [{
      key: 'All',
      label: 'All',
    }];

    selectedTechs.forEach((tech) => {
      technologyTabs.push({
        key: tech,
        label: techNamesToDisplay[tech],
      });
    });
    return (
      <ReactResizeDetector
        handleHeight
        refreshMode='throttle'
        refreshRate={500}
        onResize={(height) => { setSize({ height }); }}
      >
        <Tabs defaultActiveKey='All' items={technologyTabs} onChange={(key) => setSelectedTable(key)} />
        {renderSelectedTable()}
      </ReactResizeDetector>
    );
  };

  return (
    <>
      {
        activeExperiment?.isSubsetted ? (
          <center>
            <Alert
              type='info'
              message='Subsetted experiment'
              description={(
                <>
                  This is a subset of
                  {' '}
                  <b>{parentExperimentName || ' a deleted experiment'}</b>
                  .
                  <br />
                  You can  see remaining samples after subsetting in
                  the data processing and data exploration pages.
                </>
              )}
            />
          </center>
        )
          : !samplesLoaded || samplesLoading || samplesValidating || !tableColumns
            ? renderLoader()
            : renderSamplesTable()
      }
    </>
  );
});

export default SamplesTable;
