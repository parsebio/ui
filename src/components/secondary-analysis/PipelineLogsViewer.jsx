import React, {
  useState, useEffect,
} from 'react';
import {
  CloseCircleOutlined, SyncOutlined, CheckCircleOutlined, LoadingOutlined, PauseCircleOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import {
  Select, Tabs, Typography, Space, Button, Divider, Row, Col, Tooltip,
} from 'antd';
import { loadSecondaryAnalysisLogs } from 'redux/actions/secondaryAnalyses';
import { useSelector, useDispatch } from 'react-redux';
import { fastLoad } from 'components/Loader';
import _ from 'lodash';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const PipelineLogsViewer = (props) => {
  const { secondaryAnalysisId } = props;
  const dispatch = useDispatch();

  const [selectedSublibrary, setSelectedSublibrary] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const {
    tasksData, pipelineTasks, sublibraries, logs,
  } = useSelector((state) => _.pick(state.secondaryAnalyses[secondaryAnalysisId]
    .status, ['tasksData', 'pipelineTasks', 'sublibraries', 'logs']), _.isEqual);

  const selectedLogs = logs?.[selectedSublibrary]?.[selectedTask?.process] || {};

  useEffect(() => {
    if (selectedSublibrary && selectedTask) {
      dispatch(loadSecondaryAnalysisLogs(secondaryAnalysisId, selectedTask));
    }
  }, [selectedSublibrary, selectedTask]);

  const handleClose = () => {
    setSelectedSublibrary(null);
    setSelectedTask(null);
  };

  const handleRefresh = () => {
    if (selectedSublibrary && selectedTask) {
      dispatch(loadSecondaryAnalysisLogs(secondaryAnalysisId, selectedTask));
    }
  };

  return (
    <div>
      <Divider />
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <Row gutter={16} align='middle'>
          <Title level={5}>Pipeline Logs:</Title>

          <Col>
            <Select
              placeholder='Select a sublibrary'
              value={selectedSublibrary}
              onChange={(value) => {
                setSelectedSublibrary(value);
                const task = tasksData.find(
                  ({ process, sublibrary }) => process === pipelineTasks[0] && sublibrary === value,
                );
                setSelectedTask(task);
              }}
              style={{ width: 200 }}
            >
              {sublibraries.map((sublibrary) => (
                <Option key={sublibrary} value={sublibrary}>{sublibrary}</Option>
              ))}
            </Select>
          </Col>
          {selectedSublibrary && (
            <Col>
              <Button icon={<CloseCircleOutlined />} onClick={handleClose} style={{ fontSize: '2vh', marginRight: 8 }} />
            </Col>
          )}
        </Row>
      </Space>
      {selectedSublibrary && (
        <Tabs
          onChange={(key) => {
            const task = tasksData.find(({ taskId }) => taskId.toString() === key);
            setSelectedTask(task);
          }}
          style={{ width: '70vh', margin: '0 auto', maxHeight: '30%' }}
        >
          {pipelineTasks.map((taskName) => {
            const task = tasksData.find(({ process, sublibrary }) => (
              process === taskName && sublibrary === selectedSublibrary
            ));
            const taskId = task?.taskId;
            let icon;
            switch (task?.status) {
              case 'COMPLETED':
                icon = <CheckCircleOutlined style={{ color: 'green' }} />;
                break;
              case 'SUBMITTED':
              case 'RUNNING':
                icon = <LoadingOutlined spin style={{ color: 'blue' }} />;
                break;

              default:
                icon = <PauseCircleOutlined style={{ color: 'grey' }} />;
            }
            return (
              <TabPane
                tab={(
                  <span>
                    {icon}
                    {' '}
                    {taskName}
                  </span>
                )}
                disabled={!taskId}
                key={taskId ?? taskName}
                onChange={() => {
                  setSelectedTask(task);
                }}
              >
                <div style={{
                  position: 'relative',
                }}
                >

                  {selectedLogs.loading && fastLoad('Loading logs...')}
                  {selectedLogs.data && (
                    <>
                      <Tooltip title='Click to refresh logs'>
                        <Button
                          icon={<SyncOutlined />}
                          onClick={handleRefresh}
                          style={{
                            position: 'absolute',
                            top: '1vh',
                            right: '2.5vh',
                          }}
                        />
                      </Tooltip>
                      <div style={{
                        backgroundColor: '#11001b',
                        color: '#fff',
                        padding: 10,
                        textAlign: 'left',
                        minHeight: '5vh',
                        wordBreak: 'break-word',
                        maxHeight: '30vh',
                        overflow: 'auto',
                        display: 'flex',
                        flexDirection: 'column-reverse', // This will start the scroll from the bottom
                      }}
                      >
                        {selectedLogs.data.map((entry, index) => (
                          <div key={`${entry}-${index}`} style={{ marginBottom: '0.5vh' }}>{entry || 'No logs yet'}</div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </TabPane>
            );
          })}
        </Tabs>
      )}
    </div>
  );
};

PipelineLogsViewer.propTypes = {
  secondaryAnalysisId: PropTypes.string.isRequired,
};

export default PipelineLogsViewer;
