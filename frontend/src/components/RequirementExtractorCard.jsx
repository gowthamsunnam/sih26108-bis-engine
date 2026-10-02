import React from 'react';
import { Card, Tag, Input, Form, Row, Col, Typography, Alert, Space } from 'antd';
import { EditOutlined, AlertOutlined, SafetyCertificateOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function RequirementExtractorCard({
  parameters,
  onParameterChange,
  missingInfo,
  multilingualMeta
}) {
  if (!parameters) return null;

  return (
    <Card
      style={{
        background: '#111827',
        borderColor: '#1f2937',
        borderRadius: 8,
        marginBottom: 16,
        color: '#fff'
      }}
      title={
        <Space>
          <EditOutlined style={{ color: '#38bdf8' }} />
          <span style={{ color: '#f3f4f6' }}>AI Extracted Requirement Parameters (Editable)</span>
        </Space>
      }
      extra={
        multilingualMeta?.detected_language !== 'en' && (
          <Tag color="cyan">
            Translated from {multilingualMeta?.detected_language.toUpperCase()}
          </Tag>
        )
      }
    >
      <Form layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={<Text style={{ color: '#9ca3af' }}>Identified Product</Text>}>
              <Input
                value={parameters.product}
                onChange={(e) => onParameterChange('product', e.target.value)}
                style={{ background: '#030712', color: '#38bdf8', borderColor: '#374151' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={<Text style={{ color: '#9ca3af' }}>Procurement Category</Text>}>
              <Input
                value={parameters.category}
                onChange={(e) => onParameterChange('category', e.target.value)}
                style={{ background: '#030712', color: '#fff', borderColor: '#374151' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label={<Text style={{ color: '#9ca3af' }}>Quantity</Text>}>
              <Input
                value={parameters.quantity || ''}
                placeholder="e.g. 500"
                onChange={(e) => onParameterChange('quantity', e.target.value)}
                style={{ background: '#030712', color: '#fff', borderColor: '#374151' }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={<Text style={{ color: '#9ca3af' }}>Power / Wattage</Text>}>
              <Input
                value={parameters.power || ''}
                placeholder="e.g. 90W"
                onChange={(e) => onParameterChange('power', e.target.value)}
                style={{ background: '#030712', color: '#fff', borderColor: '#374151' }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={<Text style={{ color: '#9ca3af' }}>Voltage</Text>}>
              <Input
                value={parameters.voltage || ''}
                placeholder="e.g. 230V AC"
                onChange={(e) => onParameterChange('voltage', e.target.value)}
                style={{ background: '#030712', color: '#fff', borderColor: '#374151' }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={<Text style={{ color: '#9ca3af' }}>IP Ingress Rating</Text>}>
              <Input
                value={parameters.ip_rating || ''}
                placeholder="e.g. IP66"
                onChange={(e) => onParameterChange('ip_rating', e.target.value)}
                style={{ background: '#030712', color: '#fff', borderColor: '#374151' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={<Text style={{ color: '#9ca3af' }}>Protections Demanded</Text>}>
              <Input
                value={Array.isArray(parameters.protections_demanded) ? parameters.protections_demanded.join(', ') : (parameters.protections_demanded || '')}
                placeholder="e.g. Impact & Shock Absorption, 2000V Dielectric Protection"
                onChange={(e) => onParameterChange('protections_demanded', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                style={{ background: '#030712', color: '#a7f3d0', borderColor: '#374151' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={<Text style={{ color: '#9ca3af' }}>Intended Application / Sectors</Text>}>
              <Input
                value={Array.isArray(parameters.applications) ? parameters.applications.join(', ') : (parameters.applications || parameters.application || '')}
                placeholder="e.g. Construction & Civil Infrastructure"
                onChange={(e) => onParameterChange('applications', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                style={{ background: '#030712', color: '#fed7aa', borderColor: '#374151' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label={<Text style={{ color: '#9ca3af' }}>Materials Detected</Text>}>
              <Input
                value={Array.isArray(parameters.materials) ? parameters.materials.join(', ') : (parameters.materials || '')}
                placeholder="e.g. XLPE, PVC, Copper, ABS, HDPE, Steel"
                onChange={(e) => onParameterChange('materials', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                style={{ background: '#030712', color: '#fff', borderColor: '#374151' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* Missing Information / Ambiguity Prompting (Feature 9) */}
      {missingInfo && missingInfo.length > 0 && (
        <Alert
          type="warning"
          showIcon
          icon={<AlertOutlined />}
          style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: '#d97706', marginTop: 8 }}
          message={<Text strong style={{ color: '#fbbf24' }}>Additional Information Recommended</Text>}
          description={
            <div style={{ color: '#d1d5db', fontSize: '13px' }}>
              The specification leaves technical parameters undefined. To avoid substandard procurement disputes, specify:
              <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                {missingInfo.map((m, idx) => (
                  <li key={idx}>
                    <strong>{m.field}:</strong> {m.prompt}
                  </li>
                ))}
              </ul>
            </div>
          }
        />
      )}
    </Card>
  );
}
