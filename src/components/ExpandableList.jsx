import React from 'react';
import PropTypes from 'prop-types';
import {
  Divider, List, Space, Typography,
} from 'antd';

import Expandable from 'components/Expandable';
import { CloseCircleTwoTone, WarningOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ExpandableList = (props) => {
  const {
    expandedTitle,
    dataSource,
    getItemText,
    getItemExplanation,
    collapsedExplanation,
  } = props;

  return (
    <Expandable
      style={{ width: '100%' }}
      expandedContent={(
        <>
          <Divider orientation='center' style={{ color: 'red', marginBottom: '0' }}>{expandedTitle}</Divider>
          <List
            dataSource={dataSource}
            size='small'
            itemLayout='horizontal'
            pageSize={2}
            pagination={dataSource.length > 10}
            renderItem={(item) => (
              <List.Item key={getItemText(item)} style={{ height: '100%', width: '100%' }}>
                <Space style={{ width: 200, justifyContent: 'center' }}>
                  <CloseCircleTwoTone twoToneColor='#f5222d' />
                  <div style={{ width: 200 }}>
                    <Text
                      ellipsis={{ tooltip: getItemText(item) }}
                    >
                      {getItemText(item)}
                    </Text>
                  </div>
                </Space>
                <Text style={{ width: '100%', marginLeft: '50px' }}>
                  {getItemExplanation(item)}
                </Text>
              </List.Item>
            )}
          />
        </>
      )}
      collapsedContent={(
        <center style={{ cursor: 'pointer' }}>
          <Divider orientation='center' style={{ color: 'red' }} />
          <Text type='danger'>
            {' '}
            <WarningOutlined />
            {' '}
          </Text>
          <Text>
            {collapsedExplanation}
          </Text>
        </center>
      )}
    />
  );
};

ExpandableList.propTypes = {
  expandedTitle: PropTypes.string.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.any).isRequired,
  getItemText: PropTypes.func.isRequired,
  getItemExplanation: PropTypes.func.isRequired,
  collapsedExplanation: PropTypes.node.isRequired,
};

ExpandableList.defaultProps = {};

export default ExpandableList;
