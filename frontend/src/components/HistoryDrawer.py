import React, { useState, useEffect } from 'react';
import { Drawer, List, Tag, Typography, Button } from 'antd';
import { HistoryOutlined, ArrowRightOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text } = Typography;

export default function HistoryDrawer({ open, onClose, onLoadQuery }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (open) {
      axios.get('/api/history')
        .then(res => setHistory(res.data))
        .catch(console.error);
    }
  }, [open]);

  return (
    <Drawer
      title={
        <span>
          <HistoryOutlined style={{ marginRight: 8, color: '#38bdf8' }} />
          Past Procurement Analysis History
        </span>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={420}
    >
      <List
        itemLayout="vertical"
        dataSource={history}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <Button
                type="link"
                size="small"
                icon={<ArrowRightOutlined />}
                onClick={() => {
                  onLoadQuery(item.query_snippet);
                  onClose();
                }}
              >
                Reload Analysis
              </Button>
            ]}
          >
            <List.Item.Meta
              title={<Text strong style={{ color: '#38bdf8' }}>{item.primary_standard}</Text>}
              description={
                <div>
                  <div style={{ fontStyle: 'italic', marginBottom: 4, color: '#cbd5e1' }}>"{item.query_snippet}"</div>
                  <Tag color="geekblue">{item.standards_count} Standards Matched</Tag>
                  <Tag color="cyan">Lang: {item.language?.toUpperCase()}</Tag>
                  <Tag color="default">{item.timestamp}</Tag>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
}
