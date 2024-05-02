import React, {
  useState, useMemo, useEffect, useRef,
} from 'react';
import {
  Select, Tabs, Typography, Space, Card,
} from 'antd';
import { CheckCircleOutlined, LoadingOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { loadSecondaryAnalysisLogs } from 'redux/actions/secondaryAnalyses';
import { useSelector, useDispatch } from 'react-redux';
import { fastLoad } from 'components/Loader';
import pipelineTasks from 'utils/secondary-analysis/pipelineTasks';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const PipelineLogsViewer = (props) => {
  const { secondaryAnalysisId } = props;
  const dispatch = useDispatch();
  const [selectedSublibrary, setSelectedSublibrary] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const logs = useSelector((state) => (
    state.secondaryAnalyses[secondaryAnalysisId].status?.logs?.[selectedSublibrary]?.[selectedTask?.process])) || {};
  const tasksData = useSelector((state) => state.secondaryAnalyses[secondaryAnalysisId].status?.tasksData);

  useEffect(() => {
    if (selectedSublibrary && selectedTask) {
      dispatch(loadSecondaryAnalysisLogs(secondaryAnalysisId, selectedTask));
    }
  }, [selectedSublibrary, selectedTask]);

  const sublibraries = useMemo(() => {
    const uniqueSublibraries = new Set(tasksData.map((task) => task.sublibrary));
    return Array.from(uniqueSublibraries);
  }, [tasksData]);

  const filteredTasks = useMemo(() => tasksData.filter(
    (task) => task.sublibrary === selectedSublibrary,
  ),
  [tasksData, selectedSublibrary]);

  return (
    <div>
      <br />
      <Space direction='horizontal'>
        <Title level={5}>Pipeline Logs:</Title>
        <Select
          placeholder='Select a sublibrary'
          onChange={(value) => {
            setSelectedSublibrary(value);
            const task = tasksData.find(
              (t) => t.process.toString() === pipelineTasks[0] && t.sublibrary === value,
            );
            console.log('SETTING TO TASK', task);
            setSelectedTask(task);
          }}
          style={{ width: 200, marginBottom: 20 }}
        >
          {sublibraries.map((sublibrary) => (
            <Option key={sublibrary} value={sublibrary}>{sublibrary}</Option>
          ))}
        </Select>
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
            const task = filteredTasks.find((t) => t.process === taskName);
            let icon;
            switch (task?.status) {
              case 'COMPLETED':
                icon = <CheckCircleOutlined style={{ color: 'green' }} />;
                break;
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
                onChange={(key) => {
                  setSelectedTask(task);
                }}
              >
                {logs.loading && fastLoad('Loading logs...')}
                {logs.data && (
                  <Card
                    title='Log Entries'
                    style={{
                      backgroundColor: '#11001b',
                      color: '#fff',
                      overflow: 'auto',

                      textAlign: 'left',
                    }}
                  >
                    <div style={{
                      wordBreak: 'break-word',
                      maxHeight: '30vh',
                    }}
                    >
                      {logs.data.map((entry, index) => (
                        <div key={index} style={{ marginBottom: '0.5vh' }}>{entry}</div>
                      ))}
                    </div>
                  </Card>
                )}
              </TabPane>
            );
          })}
        </Tabs>
      )}
    </div>
  );
};

export default PipelineLogsViewer;
