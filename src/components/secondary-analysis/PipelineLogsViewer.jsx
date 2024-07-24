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
                const sublibraryTasks = tasksData.filter(({ sublibrary }) => (
                  sublibrary === value
                ));
                const task = sublibraryTasks[sublibraryTasks.length - 1];
                setSelectedTask(task);
                setSelectedSublibrary(value);
              }}
              style={{ width: 200 }}
            >
              {sublibraries.map((sublibrary) => (
                <Option key={sublibrary} value={sublibrary}>{sublibrary}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Space>
      {selectedSublibrary && (
        <Tabs
          onChange={(key) => {
            const task = tasksData.find(({ taskId }) => taskId.toString() === key);
            setSelectedTask(task);
          }}
          activeKey={`${selectedTask?.taskId}`}
          style={{ width: '70vh', margin: '0 auto', maxHeight: '30%' }}
        >
          {pipelineTasks.map((taskName) => {
            const tasks = tasksData.filter(({ process, sublibrary }) => (
              process === taskName && sublibrary === selectedSublibrary
            ));
            // if the task failed, there might be multiple past attempts of it
            // so we are getting the latest one
            const task = tasks[tasks.length - 1];

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
              case 'ABORTED':
              case 'FAILED':
                icon = <CloseCircleOutlined style={{ color: 'red' }} />;
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
                          data-testid='refresh-logs-button'
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
