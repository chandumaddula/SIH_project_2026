import React, { useState } from 'react';
import { FileText, ShieldAlert, Download, Lock, FileSpreadsheet } from 'lucide-react';

export const NoticeGenerator: React.FC = () => {
  const [traderName, setTraderName] = useState('Metro Supermarket Private Limited');
  const [traderAddress, setTraderAddress] = useState('Plot 84, MG Road, Bengaluru - 560001');
  const [violationType, setViolationType] = useState('Rule 6(1)(e) - Non-compliant MRP & Font Height');
  const [seizedQty, setSeizedQty] = useState('48 Units');
  const [compoundingFee, setCompoundingFee] = useState(25000);
  const [officerSigned, setOfficerSigned] = useState(false);
  const [noticeGenerated, setNoticeGenerated] = useState(false);

  const handleGenerateNotice = () => {
    setOfficerSigned(true);
    setTimeout(() => {
      setNoticeGenerated(true);
    }, 400);
  };

  return (
    <div className="glass-card" style={{ padding: '1.75rem', background: '#ffffff', border: '1px solid #cbd5e1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={22} color="#b45309" />
            Digital Seizure Memo & Form 1 Inspection Notice Generator
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Under Section 15 & 48 of Legal Metrology Act 2009 and Packaged Commodity Rules 2011.
          </p>
        </div>

        <span className="badge badge-warning" style={{ padding: '0.4rem 0.8rem' }}>
          OFFICIAL ENFORCEMENT WORKFLOW
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Input Form */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
          <h4 style={{ color: '#1d4ed8', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem' }}>
            1. Offender & Seizure Details
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', color: '#334155', fontWeight: 600, marginBottom: '0.25rem' }}>Establishment / Manufacturer Name</label>
              <input 
                type="text" 
                value={traderName} 
                onChange={(e) => setTraderName(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#334155', fontWeight: 600, marginBottom: '0.25rem' }}>Premises Address</label>
              <input 
                type="text" 
                value={traderAddress} 
                onChange={(e) => setTraderAddress(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#334155', fontWeight: 600, marginBottom: '0.25rem' }}>Detected Violation Section</label>
              <select 
                value={violationType}
                onChange={(e) => setViolationType(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
              >
                <option value="Rule 6(1)(e) - Non-compliant MRP & Font Height">Rule 6(1)(e) - Missing "incl. of all taxes" & Font height &lt; 3mm</option>
                <option value="Rule 6(1)(b) - Omission of Manufacturer Name & Address">Rule 6(1)(b) - Omission of Manufacturer / Packer Name & Address</option>
                <option value="Rule 11 - Short Net Weight / Volume Non-Compliance">Rule 11 - Short Net Weight / Volume (Out of Maximum Permissible Error)</option>
                <option value="Section 18 - Dual MRP Stamping Violation">Section 18 - Dual MRP Stamping Violation</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#334155', fontWeight: 600, marginBottom: '0.25rem' }}>Seized Quantity</label>
                <input 
                  type="text" 
                  value={seizedQty} 
                  onChange={(e) => setSeizedQty(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#334155', fontWeight: 600, marginBottom: '0.25rem' }}>Compounding Fee (₹)</label>
                <input 
                  type="number" 
                  value={compoundingFee} 
                  onChange={(e) => setCompoundingFee(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.6rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#0f172a' }}
                />
              </div>
            </div>

            <button className="btn-primary" onClick={handleGenerateNotice} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
              <Lock size={16} /> Sign Digital Notice & Issue Seizure Memo
            </button>
          </div>
        </div>

        {/* Notice Preview */}
        <div style={{ background: '#ffffff', color: '#0f172a', padding: '1.5rem', borderRadius: '10px', fontSize: '0.82rem', fontFamily: 'serif', border: '2px solid #0f172a', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', color: '#1e3a8a' }}>
              GOVERNMENT OF INDIA • LEGAL METROLOGY DEPARTMENT
            </h4>
            <p style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              SEIZURE MEMORANDUM & NOTICE OF COMPOUNDING OFFENCE
            </p>
            <p style={{ fontSize: '0.65rem', color: '#475569' }}>
              [Issued under Section 15 & 48 of Legal Metrology Act, 2009]
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.75rem' }}>
            <span>Memo No: <strong>LM/2026/SZ/0942</strong></span>
            <span>Date: <strong>29 Aug 2026</strong></span>
          </div>

          <p style={{ marginBottom: '0.5rem' }}>To,</p>
          <p style={{ fontWeight: 700, marginBottom: '0.75rem' }}>M/s {traderName}<br />{traderAddress}</p>

          <p style={{ lineHeight: '1.4', marginBottom: '0.75rem', textAlign: 'justify' }}>
            Whereas during routine field inspection, the undersigned Enforcement Officer seized <strong>{seizedQty}</strong> of packaged commodities found to be in violation of <strong>{violationType}</strong>.
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>Compounding Amount Payable:</span>
              <span>₹ {compoundingFee.toLocaleString('en-IN')}/-</span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>Payable within 15 days via National e-Metrology Gateway.</span>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1rem', borderTop: '1px dashed #94a3b8' }}>
            <div>
              <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>Digital Verification Hash:</span>
              <code style={{ fontSize: '0.6rem', color: '#1d4ed8' }}>0x8F92A...4B11E9</code>
            </div>

            <div style={{ textAlign: 'right' }}>
              {officerSigned ? (
                <div style={{ border: '2px solid #15803d', color: '#15803d', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-block', fontWeight: 700, fontSize: '0.7rem' }}>
                  ✓ DIGITALLY SIGNED BY INSPECTOR
                </div>
              ) : (
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic' }}>Pending Signature...</span>
              )}
            </div>
          </div>

          {noticeGenerated && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', width: '100%', justifyContent: 'center' }}>
                <Download size={14} /> Download Official PDF Report (Form-1)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
