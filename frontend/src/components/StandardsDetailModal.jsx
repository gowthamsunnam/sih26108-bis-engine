import React from 'react';
import { Modal, Typography, Tag, Divider, Row, Col, List, Space, Card } from 'antd';
import {
  SafetyCertificateOutlined,
  BookOutlined,
  HistoryOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  AppstoreOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function StandardsDetailModal({ open, onClose, standard }) {
  if (!standard) return null;

  const cert = standard.certification || {};
  const allied = standard.allied_standards || {};
  const complianceType = cert.compliance_type || cert.scheme_name || 'Mandatory ISI (Scheme I)';
  const isCRS = complianceType.includes('CRS');
  const isISI = complianceType.includes('ISI');

  return (
    <Modal
      title={
        <Space>
          <BookOutlined style={{ color: '#38bdf8' }} />
          <span style={{ color: '#f4f4f5', fontWeight: 600 }}>Bureau of Indian Standards — Official Standard Dossier</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={840}
      footer={null}
      styles={{
        content: { background: '#0e0e11', border: '1px solid #27272a', color: '#f4f4f5' },
        header: { background: '#0e0e11', borderBottom: '1px solid #27272a', paddingBottom: 12 }
      }}
    >
      {/* HEADER SECTION */}
      <div style={{ marginBottom: 16, marginTop: 12 }}>
        <Title level={4} style={{ margin: 0, color: '#f4f4f5' }}>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>{standard.is_code}</span>: {standard.title}
        </Title>
        <Space style={{ marginTop: 10 }} wrap>
          <Tag color="blue" style={{ fontWeight: 600 }}>{standard.category}</Tag>
          <Tag color={isCRS ? 'cyan' : isISI ? 'red' : 'green'} style={{ fontWeight: 600 }}>
            {complianceType}
          </Tag>
          <Tag color="purple">EDITION: {standard.edition || 'Current Revision'}</Tag>
          <Tag color="geekblue">PUB YEAR: {standard.publication_year}</Tag>
          <Tag color="green">{standard.reaffirmation_date || `Reaffirmed ${standard.publication_year + 5}`}</Tag>
          <Tag color="default" style={{ background: '#18181b', color: '#a1a1aa', borderColor: '#27272a' }}>
            STATUS: {standard.status?.toUpperCase() || 'ACTIVE'}
          </Tag>
        </Space>
      </div>

      <Divider style={{ borderColor: '#27272a', margin: '12px 0' }} />

      {/* STATUTORY SCOPE & PRODUCTS COVERED */}
      <Title level={5} style={{ color: '#f4f4f5', margin: '8px 0' }}>Statutory Scope & Manufacturing Coverage</Title>
      <Paragraph style={{ color: '#d4d4d8', fontSize: '13.5px', lineHeight: '1.6' }}>
        {standard.scope}
      </Paragraph>
      <div>
        <Text strong style={{ color: '#a1a1aa' }}>Products Covered: </Text>
        {(standard.products_covered || []).map((p, i) => (
          <Tag key={i} style={{ background: '#18181b', color: '#e4e4e7', borderColor: '#27272a', margin: '2px 4px' }}>
            {p}
          </Tag>
        ))}
      </div>

      <Divider style={{ borderColor: '#27272a', margin: '14px 0' }} />

      {/* CERTIFICATION & GAZETTE SOURCE REFERENCE */}
      <Title level={5} style={{ color: '#f4f4f5', margin: '8px 0' }}>
        <SafetyCertificateOutlined style={{ color: '#fbbf24' }} /> Statutory Compliance Scheme & Gazette Source Reference
      </Title>
      <div style={{ background: '#141418', padding: 14, borderRadius: 8, border: '1px solid #27272a' }}>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <p style={{ margin: '0 0 6px 0', color: '#a1a1aa' }}>
              <strong style={{ color: '#a1a1aa' }}>Certification Scheme: </strong>
              <Tag color={isCRS ? 'cyan' : isISI ? 'red' : 'green'} style={{ fontWeight: 600 }}>
                {complianceType}
              </Tag>
            </p>
            <p style={{ margin: '0 0 6px 0', color: '#a1a1aa' }}>
              <strong style={{ color: '#a1a1aa' }}>Governing Order: </strong>
              <span style={{ color: '#f4f4f5' }}>{cert.mandatory_order || 'Statutory Quality Control Order'}</span>
            </p>
          </Col>
          <Col span={12}>
            <p style={{ margin: '0 0 6px 0', color: '#a1a1aa' }}>
              <strong style={{ color: '#a1a1aa' }}>Regulatory Authority: </strong>
              <span style={{ color: '#f4f4f5' }}>{cert.regulatory_authority || 'Bureau of Indian Standards'}</span>
            </p>
            <p style={{ margin: '0 0 6px 0', color: '#a1a1aa' }}>
              <strong style={{ color: '#a1a1aa' }}>Official Gazette Reference: </strong>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                {cert.gazette_reference || cert.mandatory_order}
              </span>
            </p>
          </Col>
          <Col span={24}>
            <p style={{ margin: 0, color: '#a1a1aa' }}>
              <strong style={{ color: '#a1a1aa' }}>Statutory Legal Basis: </strong>
              <span style={{ color: '#f4f4f5' }}>{cert.legal_basis || 'Mandatory Section 16 BIS Act 2016 Enforcement'}</span>
            </p>
          </Col>
        </Row>
      </div>

      <Divider style={{ borderColor: '#27272a', margin: '14px 0' }} />

      {/* AMENDMENTS & REVISION HISTORY WITH NOTES */}
      <Title level={5} style={{ color: '#f4f4f5', margin: '8px 0' }}>
        <HistoryOutlined style={{ color: '#38bdf8' }} /> Active Amendments & Technical Revision Notes
      </Title>
      <List
        size="small"
        style={{ background: '#141418', borderRadius: 8, border: '1px solid #27272a' }}
        dataSource={standard.amendments || []}
        renderItem={(item) => (
          <List.Item style={{ borderBottom: '1px solid #27272a' }}>
            <Space align="start">
              <Tag color="orange" style={{ fontWeight: 600 }}>{item.amendment_no} ({item.year})</Tag>
              <Text style={{ color: '#e4e4e7' }}>{item.notes}</Text>
            </Space>
          </List.Item>
        )}
      />

      <Divider style={{ borderColor: '#27272a', margin: '14px 0' }} />

      {/* PRIMARY STANDARD SPECIFICATION */}
      <Title level={5} style={{ color: '#f4f4f5', margin: '8px 0' }}>
        <BookOutlined style={{ color: '#38bdf8' }} /> Primary Product Manufacturing Specification
      </Title>
      <div style={{ background: '#0f172a', padding: 14, borderRadius: 8, border: '1px solid #1e3a8a', marginBottom: 14 }}>
        <Text strong style={{ color: '#38bdf8', fontSize: '14px' }}>
          {standard.primary_standard?.role || 'Core Product Manufacturing Specification'}: {standard.is_code}
        </Text>
        <p style={{ margin: '6px 0 0 0', color: '#e2e8f0', fontSize: '13px', lineHeight: 1.5 }}>
          {standard.primary_standard?.description || standard.scope}
        </p>
      </div>

      {/* ALLIED STANDARDS CLASSIFIED TAXONOMY */}
      <Title level={5} style={{ color: '#f4f4f5', margin: '12px 0 8px 0' }}>Allied Standards & Normative Taxonomy (Separately Classified)</Title>
      <Row gutter={[12, 12]}>
        {/* 1. Testing Methods */}
        <Col span={12}>
          <Card
            size="small"
            style={{ background: '#0a1610', borderColor: '#14532d', borderRadius: 8 }}
            title={<span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 600 }}>🧪 1. Testing Methods & Lab Protocols</span>}
          >
            {(allied.testing || []).map((t, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <Text code style={{ background: '#14532d', color: '#f4f4f5', borderColor: '#22c55e', fontWeight: 600 }}>{t.is_code}</Text>
                {t.title && <div style={{ fontWeight: 600, color: '#4ade80', fontSize: '11.5px', marginTop: 2 }}>{t.title}</div>}
                <div style={{ fontSize: '11px', color: '#d1d5db', marginTop: 2 }}>{t.description}</div>
              </div>
            ))}
          </Card>
        </Col>

        {/* 2. Safety Norms */}
        <Col span={12}>
          <Card
            size="small"
            style={{ background: '#190e11', borderColor: '#7f1d1d', borderRadius: 8 }}
            title={<span style={{ color: '#f87171', fontSize: '12px', fontWeight: 600 }}>🛡️ 2. Safety & Protection Norms</span>}
          >
            {(allied.safety || []).map((s, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <Text code style={{ background: '#7f1d1d', color: '#f4f4f5', borderColor: '#ef4444', fontWeight: 600 }}>{s.is_code}</Text>
                {s.title && <div style={{ fontWeight: 600, color: '#f87171', fontSize: '11.5px', marginTop: 2 }}>{s.title}</div>}
                <div style={{ fontSize: '11px', color: '#d1d5db', marginTop: 2 }}>{s.description}</div>
              </div>
            ))}
          </Card>
        </Col>

        {/* 3. Installation Codes */}
        <Col span={12}>
          <Card
            size="small"
            style={{ background: '#18130a', borderColor: '#78350f', borderRadius: 8 }}
            title={<span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 600 }}>📐 3. Installation & Usage Codes</span>}
          >
            {(allied.installation || []).map((ins, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <Text code style={{ background: '#78350f', color: '#f4f4f5', borderColor: '#f59e0b', fontWeight: 600 }}>{ins.is_code}</Text>
                {ins.title && <div style={{ fontWeight: 600, color: '#fbbf24', fontSize: '11.5px', marginTop: 2 }}>{ins.title}</div>}
                <div style={{ fontSize: '11px', color: '#d1d5db', marginTop: 2 }}>{ins.description}</div>
              </div>
            ))}
          </Card>
        </Col>

        {/* 4. Related Products */}
        <Col span={12}>
          <Card
            size="small"
            style={{ background: '#10111d', borderColor: '#312e81', borderRadius: 8 }}
            title={<span style={{ color: '#818cf8', fontSize: '12px', fontWeight: 600 }}>📦 4. Related Products & Components</span>}
          >
            {(allied.related_products || []).map((r, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <Text code style={{ background: '#312e81', color: '#f4f4f5', borderColor: '#6366f1', fontWeight: 600 }}>{r.is_code}</Text>
                {r.title && <div style={{ fontWeight: 600, color: '#818cf8', fontSize: '11.5px', marginTop: 2 }}>{r.title}</div>}
                <div style={{ fontSize: '11px', color: '#d1d5db', marginTop: 2 }}>{r.description}</div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </Modal>
  );
}
