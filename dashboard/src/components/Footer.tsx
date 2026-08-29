import React from 'react';
import { Scale, FileText, PhoneCall, ShieldCheck, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{ background: '#ffffff', borderTop: '2px solid #e2e8f0', padding: '2.5rem 2rem 1.5rem 2rem', marginTop: '4rem', color: '#475569' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#0f172a' }}>
            <Scale size={24} color="#1d4ed8" />
            <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>Legal Metrology Division</span>
          </div>
          <p style={{ fontSize: '0.8rem', lineHeight: '1.6', color: '#64748b' }}>
            Department of Consumer Affairs, Krishi Bhawan, New Delhi.<br />
            Enforcing standard weights, measures, and mandatory packaged commodity declarations under Legal Metrology Act, 2009.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#0f172a', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>Important Acts & Rules</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><a href="#act" style={{ color: '#475569', textDecoration: 'none' }}>• Legal Metrology Act, 2009</a></li>
            <li><a href="#pcr" style={{ color: '#475569', textDecoration: 'none' }}>• Legal Metrology (Packaged Commodities) Rules, 2011</a></li>
            <li><a href="#approval" style={{ color: '#475569', textDecoration: 'none' }}>• General Rules & Model Approvals</a></li>
            <li><a href="#rule27" style={{ color: '#475569', textDecoration: 'none' }}>• Rule 27 Packer/Importer Registration</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#0f172a', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>Portals & Helplines</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: 600 }}>
              <PhoneCall size={14} color="#15803d" /> National Consumer Helpline: 1915
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={14} color="#1d4ed8" /> E-Metrology Officer Support Portal
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <HelpCircle size={14} color="#d97706" /> FAQs & User Guidelines
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#0f172a', marginBottom: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}>Security & Audit Compliance</h4>
          <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontWeight: '700', marginBottom: '0.25rem' }}>
              <ShieldCheck size={14} /> CERT-In Security Cleared
            </div>
            <span style={{ color: '#64748b' }}>System Log ID: LM-2026-ENF-SEC09</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '2rem auto 0 auto', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
        <span>© 2026 Legal Metrology Compliance Portal, Government of India. All rights reserved.</span>
        <span>Designed & Maintained for Enforcement & Consumer Protection</span>
      </div>
    </footer>
  );
};
