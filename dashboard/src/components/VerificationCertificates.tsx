import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertCircle, Clock, Search, Filter, ShieldCheck, Download, Plus } from 'lucide-react';

interface Certificate {
  id: string;
  instrumentType: string;
  serialNo: string;
  traderName: string;
  verificationDate: string;
  expiryDate: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
  officerName: string;
}

export const VerificationCertificates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const certificates: Certificate[] = [
    { id: 'CERT-2026-8812', instrumentType: 'Electronic Bench Scale (Class III - 30kg)', serialNo: 'EBS-99104-IN', traderName: 'Venkateshwara Fresh Mart', verificationDate: '12 Jan 2026', expiryDate: '11 Jan 2027', status: 'VALID', officerName: 'Insp. R. Sharma' },
    { id: 'CERT-2026-7491', instrumentType: 'Fuel Dispensing Pump (Flowmeter 50L/min)', serialNo: 'FDP-44910-HP', traderName: 'Indian Oil Retail Outlet - Outer Ring', verificationDate: '15 Sep 2025', expiryDate: '14 Sep 2026', status: 'EXPIRING_SOON', officerName: 'Insp. A. Verma' },
    { id: 'CERT-2025-1102', instrumentType: 'Commercial Weighbridge (60 Tonnes)', serialNo: 'WB-60T-8821', traderName: 'Karnataka Logistics Freight Yard', verificationDate: '01 Feb 2025', expiryDate: '31 Jan 2026', status: 'EXPIRED', officerName: 'Insp. K. Rao' },
    { id: 'CERT-2026-9043', instrumentType: 'Jewellery Precision Balance (Class I - 500g)', serialNo: 'JBAL-00234', traderName: 'Malabar Gold & Diamonds Branch 4', verificationDate: '05 Mar 2026', expiryDate: '04 Mar 2027', status: 'VALID', officerName: 'Insp. R. Sharma' }
  ];

  const filteredCerts = certificates.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.traderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.instrumentType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="glass-card" style={{ padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Scale size={22} color="#10b981" />
            Commercial Weights & Instruments Verification Registry
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Mandatory annual verification certificates and stamping records under Legal Metrology Act 2009.
          </p>
        </div>

        <button className="btn-primary" style={{ fontSize: '0.85rem' }}>
          <Plus size={16} /> Issue New Verification Certificate
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search Certificate No, Trader, Instrument..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.4rem', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
          />
        </div>

        <div className="tab-container" style={{ margin: 0 }}>
          <button className={`tab-btn ${filterStatus === 'ALL' ? 'active' : ''}`} onClick={() => setFilterStatus('ALL')}>All</button>
          <button className={`tab-btn ${filterStatus === 'VALID' ? 'active' : ''}`} onClick={() => setFilterStatus('VALID')}>Valid</button>
          <button className={`tab-btn ${filterStatus === 'EXPIRING_SOON' ? 'active' : ''}`} onClick={() => setFilterStatus('EXPIRING_SOON')}>Expiring Soon</button>
          <button className={`tab-btn ${filterStatus === 'EXPIRED' ? 'active' : ''}`} onClick={() => setFilterStatus('EXPIRED')}>Expired</button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Certificate ID</th>
              <th>Instrument Category</th>
              <th>Trader / Establishment</th>
              <th>Serial Number</th>
              <th>Verification / Expiry</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCerts.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600, color: '#38bdf8' }}>{c.id}</td>
                <td>{c.instrumentType}</td>
                <td>{c.traderName}</td>
                <td><code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{c.serialNo}</code></td>
                <td style={{ fontSize: '0.8rem' }}>
                  <span style={{ color: '#cbd5e1', display: 'block' }}>Verified: {c.verificationDate}</span>
                  <span style={{ color: '#94a3b8' }}>Expires: {c.expiryDate}</span>
                </td>
                <td>
                  <span className={`badge ${c.status === 'VALID' ? 'badge-pass' : c.status === 'EXPIRING_SOON' ? 'badge-warning' : 'badge-critical'}`}>
                    {c.status === 'VALID' ? 'Valid Stamp' : c.status === 'EXPIRING_SOON' ? 'Re-Stamping Due' : 'Expired / Seizable'}
                  </span>
                </td>
                <td>
                  <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                    <Download size={13} /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
