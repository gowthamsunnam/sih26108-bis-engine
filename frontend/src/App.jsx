import React, { useState } from 'react';
import {
  ConfigProvider,
  theme,
  Layout,
  Input,
  Button,
  Card,
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Spin,
  Tabs,
  Upload,
  message,
  Select
} from 'antd';
import {
  SafetyCertificateOutlined,
  SearchOutlined,
  FileTextOutlined,
  UploadOutlined,
  ShareAltOutlined,
  BookOutlined,
  FilePdfOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { API_BASE } from './apiConfig';

import RequirementExtractorCard from './components/RequirementExtractorCard';
import StandardsGraphModal from './components/StandardsGraphModal';
import StandardsDetailModal from './components/StandardsDetailModal';
import ProcurementReportModal from './components/ProcurementReportModal';
import SearchDirectory from './components/SearchDirectory';
import HistoryDrawer from './components/HistoryDrawer';
import ClauseModal from './components/ClauseModal';

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Option } = Select;

export default function App() {
  const [activeTab, setActiveTab] = useState('audit');
  const [tenderText, setTenderText] = useState(
    'Supply, testing and installation of 1100V grade 3-core 240 sq mm cross-linked polyethene (XLPE) Insulated armored copper cables conforming strictly to IS 1554 (Part 1).'
  );
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState(null);

  // Core Data States
  const [extractedParams, setExtractedParams] = useState(null);
  const [missingInfo, setMissingInfo] = useState([]);
  const [multilingualMeta, setMultilingualMeta] = useState(null);
  const [results, setResults] = useState([]);
  const [auditReport, setAuditReport] = useState(null);

  // Modals & Drawers
  const [selectedStandard, setSelectedStandard] = useState(null);
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [clauseModalOpen, setClauseModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  // 1. Audit Execution (Used by both Text Input and PDF Upload)
  const handleAnalyze = async () => {
    if (!tenderText.trim()) {
      message.warning('Please enter tender text or upload a PDF first.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/recommend`, {
        tender_text: tenderText,
        extracted_parameters: extractedParams,
        language: language,
        top_k: 5
      });
      setResults(res.data.recommendations || []);
      setAuditReport(res.data.audit_report || null);
      setExtractedParams(res.data.extracted_parameters || null);
      setMissingInfo(res.data.missing_information || []);
      setMultilingualMeta(res.data.multilingual_meta || null);
      message.success('Tender compliance analysis complete.');
    } catch (err) {
      message.error('Failed to connect to backend server.');
    }
    setLoading(false);
  };

  // 2. PDF Upload Handler
  const handlePdfUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/upload-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setUploadedFileName(file.name);
      setTenderText(res.data.extracted_text || '');
      setExtractedParams(res.data.extracted_parameters || null);
      setMissingInfo(res.data.missing_information || []);
      setResults(res.data.recommendations || []);
      setAuditReport(res.data.audit_report || null);
      setMultilingualMeta(res.data.multilingual_meta || null);
      message.success(`Specifications extracted & compliance audit completed for ${file.name}.`);
    } catch (err) {
      message.error('Failed to process PDF file.');
    }
    setLoading(false);
  };

  // 3. Restore Past Session
  const handleRestoreSession = (session) => {
    setTenderText(session.full_text || session.query_snippet);
    setExtractedParams(session.extracted_parameters || null);
    setAuditReport(session.audit_report || null);
    setResults(session.recommendations || []);
    setActiveTab('audit');
    message.success(`Restored session: ${session.primary_standard}`);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorBgBase: '#09090b',
          colorBgContainer: '#111114',
          colorBorder: '#27272a',
          colorPrimary: '#2563eb',
          colorText: '#f4f4f5',
          colorTextSecondary: '#a1a1aa'
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', background: '#09090b' }}>
        {/* HEADER */}
        <Header
          style={{
            height: 'auto',
            minHeight: '72px',
            padding: '16px 32px',
            background: '#0d0d11',
            borderBottom: '1px solid #27272a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          <Space align="center" size={14}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: '#18181b',
                border: '1px solid #3f3f46',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <SafetyCertificateOutlined style={{ color: '#38bdf8', fontSize: '20px' }} />
            </div>
            <div>
              <Title
                level={4}
                style={{
                  color: '#fafafa',
                  margin: 0,
                  lineHeight: 1.25,
                  fontWeight: 600,
                  fontSize: '17px'
                }}
              >
                BIS Standards Compliance & Recommendation Engine
              </Title>
              <Text style={{ color: '#71717a', fontSize: '12px', display: 'block', marginTop: '2px' }}>
                Ministry of Consumer Affairs / Bureau of Indian Standards
              </Text>
            </div>
          </Space>

          <Space size={10}>
            <Button
              type={activeTab === 'audit' ? 'primary' : 'default'}
              onClick={() => setActiveTab('audit')}
              style={{
                background: activeTab === 'audit' ? '#2563eb' : '#18181b',
                borderColor: activeTab === 'audit' ? '#2563eb' : '#27272a',
                color: '#f4f4f5'
              }}
            >
              Tender Auditor
            </Button>
            <Button
              type={activeTab === 'directory' ? 'primary' : 'default'}
              onClick={() => setActiveTab('directory')}
              style={{
                background: activeTab === 'directory' ? '#2563eb' : '#18181b',
                borderColor: activeTab === 'directory' ? '#2563eb' : '#27272a',
                color: '#f4f4f5'
              }}
            >
              Standards Directory
            </Button>
            <Button
              icon={<HistoryOutlined />}
              onClick={() => setHistoryDrawerOpen(true)}
              style={{
                background: '#18181b',
                borderColor: '#27272a',
                color: '#a1a1aa'
              }}
            >
              Past Sessions
            </Button>
          </Space>
        </Header>

        {/* CONTENT */}
        <Content style={{ padding: '28px 36px' }}>
          {activeTab === 'directory' ? (
            <SearchDirectory
              onSelectStandard={(std) => {
                setSelectedStandard(std);
                setDetailModalOpen(true);
              }}
            />
          ) : (
            <Row gutter={24}>
              {/* LEFT COLUMN: Input & Upload */}
              <Col xs={24} lg={10}>
                <Card
                  bordered={false}
                  style={{
                    background: '#111114',
                    border: '1px solid #27272a',
                    borderRadius: 10,
                    marginBottom: 16
                  }}
                  title={
                    <span style={{ color: '#f4f4f5', fontSize: '14px', fontWeight: 600 }}>
                      Procurement Specification / BOQ Input
                    </span>
                  }
                  extra={
                    <Select
                      value={language}
                      onChange={setLanguage}
                      size="small"
                      style={{ width: 120 }}
                    >
                      <Option value="en">English</Option>
                      <Option value="te">తెలుగు (Telugu)</Option>
                      <Option value="hi">हिन्दी (Hindi)</Option>
                    </Select>
                  }
                >
                  <Tabs
                    defaultActiveKey="1"
                    items={[
                      {
                        key: '1',
                        label: 'Text / BOQ Description',
                        children: (
                          <div>
                            <TextArea
                              rows={7}
                              value={tenderText}
                              onChange={(e) => {
                                setTenderText(e.target.value);
                                setExtractedParams(null);
                                setMissingInfo([]);
                              }}
                              style={{
                                background: '#0a0a0d',
                                color: '#f4f4f5',
                                borderColor: '#27272a',
                                fontSize: '13px',
                                lineHeight: 1.6
                              }}
                            />

                            <div style={{ marginTop: 12 }}>
                              <Text style={{ color: '#71717a', fontSize: '11px', display: 'block', marginBottom: 6 }}>
                                Quick Demo Presets:
                              </Text>
                              <Space wrap size={[6, 6]}>
                                <Button
                                  size="small"
                                  style={{ background: '#18181b', borderColor: '#27272a', color: '#a1a1aa', fontSize: '11px' }}
                                  onClick={() => {
                                    setTenderText(
                                      'Supply, testing and installation of 1100V grade 3-core 240 sq mm cross-linked polyethene (XLPE) Insulated armored copper cables conforming strictly to IS 1554 (Part 1).'
                                    );
                                    setExtractedParams(null);
                                    setMissingInfo([]);
                                  }}
                                >
                                  XLPE vs IS 1554
                                </Button>
                                <Button
                                  size="small"
                                  style={{ background: '#18181b', borderColor: '#27272a', color: '#a1a1aa', fontSize: '11px' }}
                                  onClick={() => {
                                    setTenderText('Procure 500 LED street lights, 90W, 230V AC, IP66, suitable for outdoor road lighting.');
                                    setExtractedParams(null);
                                    setMissingInfo([]);
                                  }}
                                >
                                  LED Street Lights
                                </Button>
                                <Button
                                  size="small"
                                  style={{ background: '#18181b', borderColor: '#27272a', color: '#a1a1aa', fontSize: '11px' }}
                                  onClick={() => {
                                    setTenderText('I need industrial safety helmets for factory floor operations with dielectric protection.');
                                    setExtractedParams(null);
                                    setMissingInfo([]);
                                  }}
                                >
                                  Industrial Helmets
                                </Button>
                              </Space>
                            </div>

                            <Button
                              type="primary"
                              icon={<SearchOutlined />}
                              block
                              size="large"
                              style={{ marginTop: 18, background: '#2563eb', fontWeight: 500 }}
                              onClick={handleAnalyze}
                              loading={loading}
                            >
                              Audit Tender & Detect Discrepancies
                            </Button>
                          </div>
                        )
                      },
                      {
                        key: '2',
                        label: 'Upload RFP PDF',
                        children: (
                          <div>
                            <Dragger
                              beforeUpload={(file) => {
                                handlePdfUpload(file);
                                return false;
                              }}
                              showUploadList={false}
                              style={{
                                background: '#0a0a0d',
                                borderColor: '#27272a',
                                borderRadius: '8px',
                                padding: '24px 0'
                              }}
                            >
                              <p className="ant-upload-drag-icon">
                                <UploadOutlined style={{ color: '#38bdf8', fontSize: '28px' }} />
                              </p>
                              <p style={{ color: '#f4f4f5', fontSize: '13px', margin: '4px 0' }}>
                                {uploadedFileName ? `Active File: ${uploadedFileName}` : 'Click or drag tender PDF here'}
                              </p>
                              <p style={{ color: '#71717a', fontSize: '12px' }}>
                                AI extracts specifications and aligns recommendations with the extracted keywords.
                              </p>
                            </Dragger>

                            {uploadedFileName && (
                              <div style={{ marginTop: 12 }}>
                                <Tag color="blue" style={{ marginBottom: 8 }}>
                                  ✓ Extracted from: {uploadedFileName}
                                </Tag>
                                <TextArea
                                  rows={4}
                                  value={tenderText}
                                  onChange={(e) => setTenderText(e.target.value)}
                                  style={{ background: '#0a0a0d', color: '#a1a1aa', fontSize: '12px' }}
                                />
                              </div>
                            )}

                            {/* AUDIT BUTTON AVAILABLE FOR PDF UPLOAD */}
                            <Button
                              type="primary"
                              icon={<SearchOutlined />}
                              block
                              size="large"
                              style={{ marginTop: 16, background: '#2563eb', fontWeight: 500 }}
                              onClick={handleAnalyze}
                              loading={loading}
                            >
                              Audit Tender & Detect Discrepancies
                            </Button>
                          </div>
                        )
                      }
                    ]}
                  />
                </Card>

                {/* Requirement Extraction Editor */}
                <RequirementExtractorCard
                  parameters={extractedParams}
                  onParameterChange={(k, v) => setExtractedParams({ ...extractedParams, [k]: v })}
                  missingInfo={missingInfo}
                  multilingualMeta={multilingualMeta}
                />
              </Col>

              {/* RIGHT COLUMN: Audit Report & Standards */}
              <Col xs={24} lg={14}>
                {loading && (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" />
                    <Paragraph style={{ color: '#71717a', marginTop: 14, fontSize: '13px' }}>
                      Executing hybrid vector retrieval and checking statutory QCO compliance...
                    </Paragraph>
                  </div>
                )}

                {!loading && results.length === 0 && (
                  <div
                    style={{
                      background: '#111114',
                      border: '1px solid #27272a',
                      borderRadius: 10,
                      padding: '36px',
                      textAlign: 'center'
                    }}
                  >
                    <SafetyCertificateOutlined style={{ fontSize: '32px', color: '#3f3f46', marginBottom: 12 }} />
                    <Title level={5} style={{ color: '#f4f4f5', margin: '0 0 6px 0' }}>
                      Compliance Engine Standing By
                    </Title>
                    <Text style={{ color: '#71717a', fontSize: '13px' }}>
                      Enter tender text or upload an RFP PDF and click "Audit Tender & Detect Discrepancies" to identify technical contradictions and verify QCO compliance.
                    </Text>
                  </div>
                )}

                {!loading && results.length > 0 && (
                  <div>
                    {/* AUDIT REPORT BANNER */}
                    {auditReport && (
                      <div
                        style={{
                          background: auditReport.status === 'ACTION_REQUIRED' ? '#181214' : '#0e1914',
                          border: `1px solid ${auditReport.status === 'ACTION_REQUIRED' ? '#3f1d24' : '#1b3b2b'}`,
                          borderLeft: `4px solid ${auditReport.status === 'ACTION_REQUIRED' ? '#f43f5e' : '#10b981'}`,
                          borderRadius: 8,
                          padding: '16px 20px',
                          marginBottom: 20
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Title level={5} style={{ color: '#fafafa', margin: 0, fontSize: '15px' }}>
                            {auditReport.status === 'ACTION_REQUIRED'
                              ? `Tender Discrepancy Report: ${auditReport.issues_count} Issue(s) Detected`
                              : 'Tender Compliance Audit: Verified'}
                          </Title>
                          <Tag
                            style={{
                              background: auditReport.status === 'ACTION_REQUIRED' ? '#381219' : '#0d2818',
                              color: auditReport.status === 'ACTION_REQUIRED' ? '#fb7185' : '#4ade80',
                              border: 'none',
                              fontSize: '11px',
                              fontWeight: 600
                            }}
                          >
                            {auditReport.status}
                          </Tag>
                        </div>

                        <div style={{ marginTop: 14 }}>
                          {auditReport.findings.map((f, i) => (
                            <div
                              key={i}
                              style={{
                                background: '#111114',
                                border: '1px solid #27272a',
                                padding: '12px 16px',
                                borderRadius: 6,
                                marginBottom: 8
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 4 }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: f.severity === 'CRITICAL' ? '#f43f5e' : '#fbbf24',
                                    background: f.severity === 'CRITICAL' ? 'rgba(244,63,94,0.1)' : 'rgba(251,191,36,0.1)',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                  }}
                                >
                                  {f.tag}
                                </span>
                                <Text strong style={{ color: '#fafafa', fontSize: '13px' }}>
                                  {f.title}
                                </Text>
                              </div>
                              <Text style={{ color: '#a1a1aa', fontSize: '12px', display: 'block', lineHeight: 1.5 }}>
                                {f.description}
                              </Text>
                              <div style={{ marginTop: 6, fontSize: '12px', color: '#60a5fa' }}>
                                <strong style={{ color: '#93c5fd' }}>Recommended Action: </strong>
                                {f.correction}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* RESULTS HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <Title level={5} style={{ color: '#f4f4f5', margin: 0, fontSize: '14px' }}>
                        Matched Indian Standards & Regulatory Classifications ({results.length})
                      </Title>
                      <Button
                        type="primary"
                        icon={<FilePdfOutlined />}
                        onClick={() => setReportModalOpen(true)}
                        style={{ background: '#15803d', borderColor: '#15803d', fontSize: '12px' }}
                      >
                        Generate Procurement Report
                      </Button>
                    </div>

                    {/* STANDARDS CARDS */}
                    {results.map((item, idx) => {
                      const std = item.standard;
                      const allied = std.allied_standards || {};

                      return (
                        <Card
                          key={idx}
                          bordered={false}
                          style={{
                            background: '#111114',
                            border: '1px solid #27272a',
                            borderRadius: 8,
                            marginBottom: 16
                          }}
                          title={
                            <Space size={10} wrap>
                              <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '15px' }}>
                                #{idx + 1} {std.is_code}
                              </span>
                              <Tag
                                style={{
                                  background: '#18181b',
                                  border: '1px solid #3f3f46',
                                  color: '#e4e4e7',
                                  fontSize: '11px'
                                }}
                              >
                                {item.confidence_level}
                              </Tag>
                              <Tag color="blue" style={{ fontSize: '11px' }}>
                                PRIMARY PRODUCT SPECIFICATION
                              </Tag>
                            </Space>
                          }
                          extra={
                            <Space size={8}>
                              <Button
                                size="small"
                                icon={<ShareAltOutlined />}
                                onClick={() => {
                                  setSelectedStandard(std);
                                  setGraphModalOpen(true);
                                }}
                                style={{ background: '#18181b', borderColor: '#27272a', color: '#d4d4d8' }}
                              >
                                Graph
                              </Button>
                              <Button
                                size="small"
                                icon={<BookOutlined />}
                                onClick={() => {
                                  setSelectedStandard(std);
                                  setDetailModalOpen(true);
                                }}
                                style={{ background: '#18181b', borderColor: '#27272a', color: '#d4d4d8' }}
                              >
                                Details
                              </Button>
                              <Button
                                size="small"
                                type="primary"
                                ghost
                                icon={<FileTextOutlined />}
                                onClick={() => {
                                  setSelectedStandard(std);
                                  setClauseModalOpen(true);
                                }}
                                style={{ borderColor: '#3b82f6', color: '#60a5fa' }}
                              >
                                GeM Clause
                              </Button>
                            </Space>
                          }
                        >
                          {/* Title & Domain */}
                          <Paragraph style={{ color: '#f4f4f5', fontSize: '14px', fontWeight: 600, marginBottom: 8 }}>
                            {std.title}
                          </Paragraph>

                          {/* Edition & Active Amendments Banner */}
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 12 }}>
                            <Tag style={{ background: '#18181b', border: '1px solid #27272a', color: '#a1a1aa' }}>
                              <strong>Edition:</strong> {item.edition_info?.edition} ({item.edition_info?.publication_year})
                            </Tag>
                            <Tag style={{ background: '#18181b', border: '1px solid #27272a', color: '#4ade80' }}>
                              <strong>Status:</strong> {item.edition_info?.status?.toUpperCase()}
                            </Tag>
                            {(item.edition_info?.amendments || []).map((amd, aIdx) => (
                              <Tag key={aIdx} style={{ background: '#18181b', border: '1px solid #27272a', color: '#93c5fd' }}>
                                {amd.amendment_no} ({amd.year})
                              </Tag>
                            ))}
                          </div>

                          {/* DYNAMIC & CONTEXTUAL WHY RECOMMENDED */}
                          <div
                            style={{
                              background: '#0a0a0d',
                              padding: '12px 14px',
                              borderRadius: 6,
                              marginBottom: 14,
                              border: '1px solid #1f1f23'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                              <Text style={{ color: '#60a5fa', fontSize: '12px', fontWeight: 600 }}>
                                WHY RECOMMENDED (AI Relevance Score: {item.ai_relevance_score}%):
                              </Text>
                              <Text style={{ color: '#71717a', fontSize: '11px' }}>
                                Matched against declared protection & application requirements
                              </Text>
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, color: '#d4d4d8', fontSize: '12px', lineHeight: 1.6 }}>
                              {item.why_recommended.map((reason, rIdx) => (
                                <li key={rIdx}>{reason}</li>
                              ))}
                            </ul>
                          </div>

                          {/* STATUTORY COMPLIANCE & BIS SOURCE REFERENCE */}
                          <div style={{ background: '#141419', padding: '10px 14px', borderRadius: 6, marginBottom: 14, border: '1px solid #27272a' }}>
                            <Row gutter={[12, 6]}>
                              <Col span={12}>
                                <Text style={{ color: '#71717a', fontSize: '11px', display: 'block' }}>COMPLIANCE MANDATE</Text>
                                <Tag color={item.compliance_badge_color} style={{ marginTop: 2, fontWeight: 500 }}>
                                  {item.compliance_type}
                                </Tag>
                              </Col>
                              <Col span={12}>
                                <Text style={{ color: '#71717a', fontSize: '11px', display: 'block' }}>BIS GAZETTE / SOURCE REFERENCE</Text>
                                <Text style={{ color: '#f4f4f5', fontSize: '12px', fontWeight: 500 }}>
                                  {item.source_reference}
                                </Text>
                              </Col>
                            </Row>
                          </div>

                          {/* STRUCTURED ALLIED STANDARDS (SEPARATED INTO TEST, SAFETY, INSTALLATION) */}
                          <div style={{ borderTop: '1px solid #27272a', paddingTop: 12 }}>
                            <Text
                              style={{
                                color: '#9ca3af',
                                fontSize: '11px',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                display: 'block',
                                marginBottom: 8
                              }}
                            >
                              Allied Standards & Normative Testing Framework
                            </Text>
                            <Row gutter={[16, 8]}>
                              <Col xs={24} md={12}>
                                <div style={{ background: '#0d0d10', padding: '8px 10px', borderRadius: 4, border: '1px solid #1f1f23' }}>
                                  <Text style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 600, display: 'block' }}>
                                    🔬 Mandatory Test Methods:
                                  </Text>
                                  <Text style={{ color: '#a1a1aa', fontSize: '12px' }}>
                                    {(allied.testing || []).map((t) => t.is_code).join(', ') || 'IS 2925 Clause 9 / Relevant Sampling Protocols'}
                                  </Text>
                                </div>
                              </Col>
                              <Col xs={24} md={12}>
                                <div style={{ background: '#0d0d10', padding: '8px 10px', borderRadius: 4, border: '1px solid #1f1f23' }}>
                                  <Text style={{ color: '#f43f5e', fontSize: '11px', fontWeight: 600, display: 'block' }}>
                                    🛡️ Safety & Ergonomic Norms:
                                  </Text>
                                  <Text style={{ color: '#a1a1aa', fontSize: '12px' }}>
                                    {(allied.safety || []).map((s) => s.is_code).join(', ') || 'IS 8519 (Body & Head Protection Guide)'}
                                  </Text>
                                </div>
                              </Col>
                            </Row>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </Col>
            </Row>
          )}
        </Content>

        {/* MODALS & DRAWERS */}
        <StandardsGraphModal
          open={graphModalOpen}
          onClose={() => setGraphModalOpen(false)}
          standard={selectedStandard}
        />
        <StandardsDetailModal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          standard={selectedStandard}
        />
        <ProcurementReportModal
          open={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          query={tenderText}
          parameters={extractedParams}
          auditReport={auditReport}
          recommendations={results}
        />
        <ClauseModal
          open={clauseModalOpen}
          onClose={() => setClauseModalOpen(false)}
          standard={selectedStandard}
          tenderQuery={tenderText}
        />
        <HistoryDrawer
          open={historyDrawerOpen}
          onClose={() => setHistoryDrawerOpen(false)}
          onRestoreSession={handleRestoreSession}
        />
      </Layout>
    </ConfigProvider>
  );
}
