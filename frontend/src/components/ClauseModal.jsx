import React, { useState } from 'react';
import { Modal, Button, Typography, Space, Tag, Alert, Card, message, Divider } from 'antd';
import { CopyOutlined, DownloadOutlined, CheckCircleOutlined, SafetyCertificateOutlined, FileTextOutlined } from '@ant-design/icons';
import confetti from 'canvas-confetti';

const { Title, Paragraph, Text } = Typography;

export default function ClauseModal({ open, onClose, standard, tenderText }) {
  const [copied, setCopied] = useState(false);

  if (!standard) return null;

  // Generate official GeM Additional Terms & Conditions (ATC) Clause
  const generateGeMClause = () => {
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const isCode = standard.is_code;
    const title = standard.title;
    const category = standard.category;
    const qcoEnforced = standard.qco_mandatory;
    const qcoDetails = standard.qco_order_details || 'Mandatory Quality Control Order enforced by Government of India.';
    const normRefs = (standard.normative_references || []).join(', ');
    const keyParams = (standard.key_technical_params || []).map(p => `  • ${p}`).join('\n');

    return `================================================================================
GOVERNMENT e-MARKETPLACE (GeM) - ADDITIONAL TERMS & CONDITIONS (ATC)
MANDATORY COMPLIANCE CLAUSE FOR INDIAN STANDARD SPECIFICATION
================================================================================
Generated Date : ${today}
Tender Reference / Specification Category: ${category}
Applicable Indian Standard (IS Code)    : ${isCode}
Standard Title                          : ${title}
Standard Status                         : ${standard.status} (BIS Standard)
================================================================================

1. COMPLIANCE WITH SECTION 16 OF THE BUREAU OF INDIAN STANDARDS ACT, 2016:
The Supplier / Bidder shall strictly ensure that all items, materials, equipment, and components supplied under this procurement contract fully conform to Indian Standard Specification "${isCode} - ${title}". As per Section 16 of the BIS Act 2016, no person/vendor shall manufacture, import, store, sell, or distribute any goods under mandatory QCO without bearing the Standard Mark (ISI Mark).

2. MANDATORY QUALITY CONTROL ORDER (QCO) ENFORCEMENT:
${qcoEnforced 
  ? `[STATUTORY COMPLIANCE MANDATORY]
${qcoDetails}
All supplied goods MUST bear a valid Standard ISI Mark under a valid BIS License granted by the Bureau of Indian Standards. Bidders failing to upload a valid BIS License Certificate during technical bid evaluation shall be summarily REJECTED.`
  : `[STANDARD SPECIFICATION GUIDELINE]
Supplier must provide manufacturer test certificates verifying compliance with ${isCode} specifications.`}

3. NORMATIVE REFERENCES & CROSS-STANDARD TESTING COMPLIANCE:
The material supplied under this tender specification shall additionally comply with all normative standards referenced in ${isCode}, including but not limited to:
${normRefs ? normRefs : '  • Standard BIS cable, structural steel, or cement testing protocols.'}

4. MANDATORY TECHNICAL & PHYSICAL TESTING PARAMETERS:
The supplied consignment shall meet or exceed the following critical performance parameters as defined in ${isCode}:
${keyParams ? keyParams : '  • Conformity to standard physical, chemical, and mechanical tests.'}

5. QUALITY ASSURANCE & NABL ACCREDITED LABORATORY CERTIFICATION:
a) Every batch/consignment delivered at the consignee site MUST be accompanied by a Manufacturer's Test Certificate (MTC) along with an independent Test Certificate from an NABL Accredited Laboratory (National Accreditation Board for Testing and Calibration Laboratories).
b) The Inspecting Authority / Procuring Entity reserves the right to draw random samples at the supplier's cost for verification testing at a BIS-recognized / Government approved testing laboratory prior to final payment clearance.

================================================================================
[End of GeM ATC Clause - Bureau of Indian Standards Compliance Specification]
================================================================================`;
  };

  const gemClauseText = generateGeMClause();

  const handleCopy = () => {
    navigator.clipboard.writeText(gemClauseText);
    setCopied(true);
    message.success('GeM ATC Procurement Clause copied to clipboard!');
    
    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {
      // Ignore if confetti script fails
    }

    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([gemClauseText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `GeM_ATC_Clause_${standard.is_code.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    message.info('GeM ATC Clause file downloaded (.txt)');
  };

  return (
    <Modal
      title={
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <SafetyCertificateOutlined style={{ fontSize: 22, color: '#10b981' }} />
            <div>
              <Text strong style={{ fontSize: 18, color: '#f8fafc' }}>
                GeM ATC Procurement Clause Generator
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Official BIS Compliance & Section 16 Mandatory Tender Specs
              </Text>
            </div>
          </Space>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={780}
      footer={[
        <Button key="close" onClick={onClose} style={{ background: '#334155', color: '#cbd5e1', borderColor: '#475569' }}>
          Close
        </Button>,
        <Button
          key="download"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          style={{ background: '#1e293b', color: '#38bdf8', borderColor: '#38bdf8' }}
        >
          Download .TXT
        </Button>,
        <Button
          key="copy"
          type="primary"
          icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
          style={{ background: copied ? '#059669' : '#2563eb', borderColor: 'transparent' }}
        >
          {copied ? 'Copied to Clipboard!' : '1-Click Copy Clause'}
        </Button>,
      ]}
      style={{ top: 30 }}
      styles={{
        content: { background: '#0f172a', borderRadius: 12, border: '1px solid #334155' },
        header: { background: '#0f172a', borderBottom: '1px solid #1e293b' },
        footer: { borderTop: '1px solid #1e293b' }
      }}
    >
      <div style={{ padding: '12px 0' }}>
        <Alert
          message={
            <Text strong style={{ color: '#f8fafc' }}>
              Standard Identified: {standard.is_code}
            </Text>
          }
          description={
            <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
              <div>{standard.title}</div>
              <div style={{ marginTop: 4 }}>
                <Tag color="blue">{standard.category}</Tag>
                {standard.qco_mandatory ? (
                  <Tag color="error">Mandatory QCO Enforced</Tag>
                ) : (
                  <Tag color="default">Standard BIS Guideline</Tag>
                )}
              </div>
            </div>
          }
          type={standard.qco_mandatory ? 'warning' : 'info'}
          showIcon
          style={{ marginBottom: 16, background: '#1e293b', borderColor: standard.qco_mandatory ? '#f59e0b' : '#3b82f6' }}
        />

        <Title level={5} style={{ color: '#cbd5e1', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileTextOutlined style={{ color: '#38bdf8' }} /> Auto-Generated Tender Clause Text:
        </Title>

        <Card
          style={{
            background: '#020617',
            border: '1px solid #334155',
            borderRadius: 8,
            maxHeight: 380,
            overflowY: 'auto'
          }}
          styles={{ body: { padding: 16 } }}
        >
          <pre
            style={{
              fontFamily: '"Fira Code", "Courier New", monospace',
              fontSize: 12,
              lineHeight: 1.6,
              color: '#38bdf8',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0
            }}
          >
            {gemClauseText}
          </pre>
        </Card>
      </div>
    </Modal>
  );
}
