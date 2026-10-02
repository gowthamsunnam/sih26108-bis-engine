import React, { useState, useEffect } from 'react';
import { Input, Table, Tag, Typography, Button, Space } from 'antd';
import { SearchOutlined, BookOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE } from '../apiConfig';

const { Search } = Input;
const { Title, Text } = Typography;

export default function SearchDirectory({ onSelectStandard }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStandards = async (term = '') => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/standards${term ? `?search=${encodeURIComponent(term)}` : ''}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStandards();
  }, []);

  const columns = [
    {
      title: <span style={{ color: '#a1a1aa' }}>IS Code</span>,
      dataIndex: 'is_code',
      key: 'is_code',
      render: (text) => <Text strong style={{ color: '#38bdf8' }}>{text}</Text>,
      width: '18%'
    },
    {
      title: <span style={{ color: '#a1a1aa' }}>Title & Scope</span>,
      dataIndex: 'title',
      key: 'title',
      render: (title, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#f4f4f5' }}>{title}</div>
          <div style={{ fontSize: '12px', color: '#71717a', marginTop: 4 }}>
            {record.scope?.substring(0, 130)}...
          </div>
        </div>
      )
    },
    {
      title: <span style={{ color: '#a1a1aa' }}>Domain / Category</span>,
      dataIndex: 'category',
      key: 'category',
      render: (cat) => (
        <Tag style={{ background: '#18181b', border: '1px solid #27272a', color: '#38bdf8' }}>
          {cat}
        </Tag>
      ),
      width: '20%'
    },
    {
      title: <span style={{ color: '#a1a1aa' }}>Certification</span>,
      key: 'certification',
      render: (_, r) => {
        const isCrs = r.certification?.scheme === 'CRS';
        return (
          <Tag
            style={{
              background: isCrs ? 'rgba(6,182,212,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${isCrs ? '#0891b2' : '#b91c1c'}`,
              color: isCrs ? '#22d3ee' : '#f87171'
            }}
          >
            {r.certification?.scheme_name || r.certification?.scheme || 'BIS Standard'}
          </Tag>
        );
      },
      width: '16%'
    },
    {
      title: <span style={{ color: '#a1a1aa' }}>Action</span>,
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<BookOutlined />}
          onClick={() => onSelectStandard(record)}
          style={{ color: '#60a5fa' }}
        >
          Inspect
        </Button>
      ),
      width: '10%'
    }
  ];

  return (
    <div style={{ background: '#111114', padding: '24px', borderRadius: 10, border: '1px solid #27272a' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <Title level={4} style={{ color: '#f4f4f5', margin: 0 }}>
            Bureau of Indian Standards — Master Directory
          </Title>
          <Text style={{ color: '#71717a', fontSize: '13px' }}>
            Showing {data.length} indexed national standards across Civil, Electrical, PPE, Plastics, and Electronics domains.
          </Text>
        </div>

        <Search
          placeholder="Filter by keyword: 'cement', 'cables', 'helmet', 'toys'..."
          allowClear
          enterButton="Search"
          size="middle"
          onSearch={(v) => fetchStandards(v)}
          style={{ width: 340 }}
        />
      </div>

      <Table
        dataSource={data}
        columns={columns}
        rowKey="is_code"
        loading={loading}
        pagination={{
          pageSize: 6,
          showSizeChanger: false,
          showTotal: (total, range) => (
            <span style={{ color: '#71717a', fontSize: '12px' }}>
              Showing {range[0]}-{range[1]} of {total} standards
            </span>
          )
        }}
        style={{
          background: '#0d0d10',
          borderRadius: 8,
          border: '1px solid #27272a'
        }}
      />
    </div>
  );
}
