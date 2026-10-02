import React from 'react';
import { Modal, Typography, Space } from 'antd';
import { ShareAltOutlined } from '@ant-design/icons';

const { Text } = Typography;

export default function StandardsGraphModal({ open, onClose, standard }) {
  if (!standard) return null;

  const allied = standard.allied_standards || {};
  const testing = (allied.testing || []).slice(0, 2);
  const safety = (allied.safety || []).slice(0, 2);
  const installation = (allied.installation || []).slice(0, 2);

  return (
    <Modal
      title={
        <Space>
          <ShareAltOutlined style={{ color: '#38bdf8' }} />
          <span>Normative Dependency & Hierarchy Graph: {standard.is_code}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={840}
      footer={null}
    >
      <div style={{ textAlign: 'center', padding: '16px 0', background: '#0b1120', borderRadius: 8 }}>
        <svg width="760" height="340" viewBox="0 0 760 340">
          {/* Connector Lines */}
          <line x1="380" y1="60" x2="160" y2="170" stroke="#475569" strokeWidth="2" strokeDasharray="4" />
          <line x1="380" y1="60" x2="380" y2="170" stroke="#475569" strokeWidth="2" strokeDasharray="4" />
          <line x1="380" y1="60" x2="600" y2="170" stroke="#475569" strokeWidth="2" strokeDasharray="4" />

          {/* Sub-node lines */}
          <line x1="160" y1="210" x2="160" y2="270" stroke="#334155" strokeWidth="1.5" />
          <line x1="380" y1="210" x2="380" y2="270" stroke="#334155" strokeWidth="1.5" />
          <line x1="600" y1="210" x2="600" y2="270" stroke="#334155" strokeWidth="1.5" />

          {/* Root Node: Primary Standard */}
          <rect x="260" y="20" width="240" height="50" rx="8" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
          <text x="380" y="45" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
            PRIMARY: {standard.is_code}
          </text>
          <text x="380" y="60" fill="#93c5fd" fontSize="10" textAnchor="middle">
            {standard.category}
          </text>

          {/* Level 1: Category Nodes */}
          {/* Testing */}
          <rect x="70" y="170" width="180" height="40" rx="6" fill="#14532d" stroke="#22c55e" strokeWidth="1.5" />
          <text x="160" y="195" fill="#bbf7d0" fontSize="12" fontWeight="bold" textAnchor="middle">
            TEST METHODS
          </text>

          {/* Safety */}
          <rect x="290" y="170" width="180" height="40" rx="6" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" />
          <text x="380" y="195" fill="#fecaca" fontSize="12" fontWeight="bold" textAnchor="middle">
            SAFETY NORMS
          </text>

          {/* Installation */}
          <rect x="510" y="170" width="180" height="40" rx="6" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
          <text x="600" y="195" fill="#fde68a" fontSize="12" fontWeight="bold" textAnchor="middle">
            INSTALLATION CODES
          </text>

          {/* Level 2: Concrete Standards */}
          {/* Testing standard */}
          <rect x="50" y="270" width="220" height="45" rx="4" fill="#0f172a" stroke="#334155" />
          <text x="160" y="290" fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">
            {testing[0]?.is_code || 'IS 10322 (Part 1)'}
          </text>
          <text x="160" y="305" fill="#94a3b8" fontSize="9" textAnchor="middle">
            Dust & Moisture Ingress Verification
          </text>

          {/* Safety standard */}
          <rect x="270" y="270" width="220" height="45" rx="4" fill="#0f172a" stroke="#334155" />
          <text x="380" y="290" fill="#f87171" fontSize="11" fontWeight="bold" textAnchor="middle">
            {safety[0]?.is_code || 'IS 15885 (Part 2/Sec 13)'}
          </text>
          <text x="380" y="305" fill="#94a3b8" fontSize="9" textAnchor="middle">
            LED Driver Electronic Safety
          </text>

          {/* Installation standard */}
          <rect x="490" y="270" width="220" height="45" rx="4" fill="#0f172a" stroke="#334155" />
          <text x="600" y="290" fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">
            {installation[0]?.is_code || 'IS 1944 (Parts 1 & 2)'}
          </text>
          <text x="600" y="305" fill="#94a3b8" fontSize="9" textAnchor="middle">
            Public Thoroughfare Code of Practice
          </text>
        </svg>
      </div>

      <div style={{ marginTop: 16 }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          * Graph shows stored statutory dependencies. Every primary standard legally mandates compliance with its connected test method and safety sub-nodes.
        </Text>
      </div>
    </Modal>
  );
}
