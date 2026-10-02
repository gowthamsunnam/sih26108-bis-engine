import React, { useState, useEffect } from 'react';
import { Drawer, List, Tag, Typography, Button, Space, Popconfirm, message } from 'antd';
import { HistoryOutlined, ArrowRightOutlined, DeleteOutlined, ClearOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE } from '../apiConfig';

const { Text } = Typography;

export default function HistoryDrawer({ open, onClose, onRestoreSession }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/history`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open]);

  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API_BASE}/api/history/${id}`);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      message.success('Session removed');
    } catch (err) {
      message.error('Failed to delete session');
    }
  };

  const handleClearAll = async () => {
    try {
      await axios.delete(`${API_BASE}/api/history`);
      setHistory([]);
      message.success('All history cleared');
    } catch (err) {
      message.error('Failed to clear history');
    }
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 8 }}>
          <Space>
            <HistoryOutlined style={{ color: '#38bdf8' }} />
            <span style={{ color: '#f4f4f5', fontSize: '15px' }}>Past Analysis Sessions</span>
          </Space>
          {history.length > 0 && (
            <Popconfirm
              title="Clear all past sessions?"
              description="This will permanently delete your stored audits."
              onConfirm={handleClearAll}
              okText="Yes, Clear All"
              cancelText="Cancel"
            >
              <Button type="text" danger size="small" icon={<ClearOutlined />}>
                Clear All
              </Button>
            </Popconfirm>
          )}
        </div>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={460}
      styles={{
        header: { background: '#0d0d11', borderBottom: '1px solid #27272a' },
        body: { background: '#09090b', padding: '16px' }
      }}
    >
      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#71717a' }}>
          No previous analysis sessions recorded.
        </div>
      ) : (
        <List
          loading={loading}
          itemLayout="vertical"
          dataSource={history}
          renderItem={(item) => (
            <div
              key={item.id}
              onClick={() => {
                onRestoreSession(item);
                onClose();
              }}
              style={{
                background: '#111114',
                border: '1px solid #27272a',
                borderRadius: 8,
                padding: '14px 16px',
                marginBottom: 12,
                cursor: 'pointer',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#27272a')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Text strong style={{ color: '#38bdf8', fontSize: '14px' }}>
                  {item.primary_standard}
                </Text>
                <Popconfirm
                  title="Delete this session?"
                  onConfirm={(e) => handleDeleteItem(item.id, e)}
                  okText="Delete"
                  cancelText="Cancel"
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{ color: '#71717a' }}
                    onClick={(e) => e.stopPropagation()}
                    danger
                  />
                </Popconfirm>
              </div>

              <div style={{ color: '#a1a1aa', fontSize: '12px', margin: '6px 0', lineHeight: 1.4 }}>
                "{item.query_snippet}"
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Space size={6}>
                  <Tag style={{ background: '#18181b', border: '1px solid #27272a', color: '#38bdf8', fontSize: '11px' }}>
                    {item.standards_count} Standards
                  </Tag>
                  <Tag style={{ background: '#18181b', border: '1px solid #27272a', color: '#71717a', fontSize: '11px' }}>
                    {item.timestamp}
                  </Tag>
                </Space>

                <Button
                  type="link"
                  size="small"
                  icon={<ArrowRightOutlined />}
                  style={{ color: '#60a5fa', padding: 0 }}
                >
                  Restore Chart
                </Button>
              </div>
            </div>
          )}
        />
      )}
    </Drawer>
  );
}
