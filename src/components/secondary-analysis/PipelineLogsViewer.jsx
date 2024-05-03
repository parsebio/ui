import React, {
  useState, useEffect,
} from 'react';
import {
  CloseCircleOutlined, SyncOutlined, CheckCircleOutlined, LoadingOutlined, PauseCircleOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import {
  Select, Tabs, Typography, Space, Button, Divider, Row, Col,
} from 'antd';
import { loadSecondaryAnalysisLogs } from 'redux/actions/secondaryAnalyses';
import { useSelector, useDispatch } from 'react-redux';
import { fastLoad } from 'components/Loader';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const PipelineLogsViewer = (props) => {
  const { secondaryAnalysisId } = props;
  const dispatch = useDispatch();
  const [selectedSublibrary, setSelectedSublibrary] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const secondaryAnalysis = useSelector((state) => state.secondaryAnalyses[secondaryAnalysisId]);
  const { tasksData, pipelineTasks, sublibraries } = secondaryAnalysis.status;
  const logs = secondaryAnalysis.status?.logs?.[selectedSublibrary]?.[selectedTask?.process] || {};

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
                  (t) => t.process.toString() === pipelineTasks[0] && t.sublibrary === value,
                );
                console.log('SETTING TO TASK', task);
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
              <Button icon={<SyncOutlined />} onClick={handleRefresh} style={{ fontSize: '2vh' }} />
            </Col>
          )}
        </Row>
      </Space>
      {selectedSublibrary && (
        <Tabs
          onChange={(key) => {
            const task = tasksData.find((t) => t.taskId.toString() === key);
            setSelectedTask(task);
          }}
          style={{ width: '70vh', margin: '0 auto', maxHeight: '30%' }}
        >
          {pipelineTasks.map((taskName) => {
            const task = tasksData.find((t) => (
              t.process === taskName && t.sublibrary === selectedSublibrary
            ));
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
                disabled={!task?.taskId}
                key={task?.taskId || taskName}
                onChange={() => {
                  setSelectedTask(task);
                }}
              >
                {logs.loading && fastLoad('Loading logs...')}
                {logs.data && (

                  <div style={{
                    backgroundColor: '#11001b',
                    color: '#fff',
                    padding: 10,
                    textAlign: 'left',
                    wordBreak: 'break-word',
                    maxHeight: '30vh',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column-reverse', // This will start the scroll from the bottom
                  }}
                  >
                    {logs.data.map((entry, index) => (
                      <div key={`${entry}-${index}`} style={{ marginBottom: '0.5vh' }}>{entry}</div>
                    ))}
                  </div>
                )}
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
