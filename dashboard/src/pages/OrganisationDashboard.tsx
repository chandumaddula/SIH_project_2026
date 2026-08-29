import React, { useState } from 'react';
import { 
  Building2, 
  FileCheck, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldCheck, 
  Download, 
  Calendar,
  LayoutDashboard,
  Award,
  Lock,
  ChevronRight,
  FileText,
  Sparkles,
  UserCog,
  RefreshCw,
  Search
} from 'lucide-react';

interface OrganisationDashboardProps {
  organisationName?: string;
}

type OrgTabType = 'overview' | 'audit' | 'reg' | 'slot' | 'vault' | 'profile';

export const OrganisationDashboard: React.FC<OrganisationDashboardProps> = ({ 
  organisationName = 'Hindustan Unilever Ltd' 
}) => {
  const [activeTab, setActiveTab] = useState<OrgTabType>('overview');
  const [auditResult, setAuditResult] = useState<null | { score: number; passed: boolean }>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Profile data for Organisation
  const [orgProfile, setOrgProfile] = useState({
    name: organisationName,
    regNo: 'REG-LM-2024-8841 / KA',
    category: 'Packer, Manufacturer & Importer',
    gstin: '29AAACH7409R1ZS',
    email: 'compliance@' + organisationName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com',
    phone: '+91 80 2839 4000',
    address: 'Plot 12, Whitefield Industrial Area, Bengaluru, Karnataka - 560066',
    licenceExpiry: '31 DEC 2027',
  });

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'audit', label: 'Pre-Market Label AI Checker', icon: FileCheck, badge: 'AI Pre-Audit' },
    { id: 'reg', label: 'Rule 27 Registration', icon: Award, badge: 'Licence' },
    { id: 'slot', label: 'Scale Stamping Booking', icon: Calendar, badge: 'Slot' },
    { id: 'vault', label: 'Compliance Vault', icon: Download, badge: 'Vault' },
    { id: 'profile', label: 'Profile & Settings', icon: UserCog, badge: null },
  ];

  const handleRunArtworkAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditResult({ score: 96, passed: true });
    }, 1200);
  };

  return (
    <div className="dashboard-container">
      
      {/* Top Banner Header */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #78350f 0%, #0f172a 100%)', 
          borderRadius: '16px', 
          padding: '1.25rem 1.75rem', 
          marginBottom: '1.5rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(120, 53, 15, 0.2)',
          border: '1px solid #f59e0b40'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)' }}>
            <Building2 size={26} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.15rem' }}>
              {organisationName}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#fde68a', fontWeight: 500 }}>
              Manufacturer / Packer / Importer Portal • Rule 27 Legal Metrology Vault
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="badge badge-pass" style={{ background: '#92400e', color: '#fef3c7', borderColor: '#f59e0b', padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
            <ShieldCheck size={14} /> Rule 27 Licence Active: REG-LM-2024-8841
          </span>
        </div>
      </div>

      {/* Main Dashboard Layout with Left Sidebar */}
      <div className="dashboard-layout">
        
        {/* LEFT SIDEBAR */}
        <aside className="dashboard-sidebar">
          
          {/* Account ID & Logo Container */}
          <div className="sidebar-account-card" style={{ background: 'linear-gradient(135deg, #78350f 0%, #0f172a 100%)', borderColor: '#d97706' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src="/logo/emblem.svg" 
                  alt="Organisation Logo" 
                  style={{ width: '46px', height: '46px', objectFit: 'contain', background: '#ffffff', borderRadius: '50%', padding: '3px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                />
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid #0f172a' }}></span>
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {organisationName}
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                  Reg: REG-LM-2024-8841
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#fef3c7' }}>
              <span style={{ display: 'block', color: '#fde68a', fontSize: '0.68rem', fontWeight: 600 }}>Licence Validity</span>
              <strong style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={13} color="#22c55e" /> Valid till 31 Dec 2027
              </strong>
            </div>
          </div>

          {/* Navigation Menu List */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem', marginBottom: '0.5rem', display: 'block' }}>
              Organisation Features
            </span>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id as OrgTabType)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Icon size={18} color={isActive ? '#d97706' : '#64748b'} />
                    <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span 
                      style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 700, 
                        padding: '0.15rem 0.45rem', 
                        borderRadius: '9999px',
                        background: isActive ? '#d97706' : '#f1f5f9',
                        color: isActive ? '#ffffff' : '#64748b'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Security Box */}
          <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '0.85rem', border: '1px solid #fde68a', textAlign: 'center' }}>
            <Lock size={18} color="#d97706" style={{ margin: '0 auto 0.25rem auto', display: 'block' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', display: 'block' }}>
              Zero-Fine Pre-Press Audit
            </span>
            <span style={{ fontSize: '0.68rem', color: '#b45309' }}>
              Metrology Act Section 18 Shield
            </span>
          </div>

        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="dashboard-main-content">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Summary Stat Cards */}
              <div className="grid-4">
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Rule 27 Licence Status</span>
                    <Award size={20} color="#059669" />
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Active & Verified</div>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Renewed 2026</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Pre-Market AI Label Audits</span>
                    <FileCheck size={20} color="#d97706" />
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>38 Artworks</div>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>100% Passed Audit</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Stamped Factory Scales</span>
                    <Calendar size={20} color="#1d4ed8" />
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>12 Weighbridges</div>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Stamping Valid 2026</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Vaulted Clearance PDF Certificates</span>
                    <Download size={20} color="#7c3aed" />
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>16 Certificates</div>
                  <span style={{ fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600 }}>Available for Download</span>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                  Organisation Compliance Shortcuts
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <button 
                    onClick={() => setActiveTab('audit')} 
                    className="btn-primary" 
                    style={{ background: '#d97706', justifyContent: 'center', padding: '0.85rem' }}
                  >
                    <FileCheck size={18} /> Upload Label Artwork for AI Pre-Audit
                  </button>

                  <button 
                    onClick={() => setActiveTab('reg')} 
                    className="btn-secondary" 
                    style={{ justifyContent: 'center', padding: '0.85rem' }}
                  >
                    <Award size={18} color="#d97706" /> View Rule 27 Registration
                  </button>

                  <button 
                    onClick={() => setActiveTab('slot')} 
                    className="btn-secondary" 
                    style={{ justifyContent: 'center', padding: '0.85rem' }}
                  >
                    <Calendar size={18} color="#1d4ed8" /> Book Scale Stamping Slot
                  </button>

                  <button 
                    onClick={() => setActiveTab('vault')} 
                    className="btn-secondary" 
                    style={{ justifyContent: 'center', padding: '0.85rem' }}
                  >
                    <Download size={18} color="#059669" /> Download Vault Documents
                  </button>
                </div>
              </div>

              {/* Recent Pre-Market Label AI Audits */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                  Recent Pre-Press Label AI Compliance Audits
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Refined Cooking Oil 1L Pouch Artwork</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>AI Score: 98/100 • Font Heights & MRP Declaration Verified</span>
                    </div>
                    <span className="badge badge-pass">Pre-Approved</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Washing Powder 500g Pack Box</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>AI Score: 96/100 • Consumer Care Toll-Free Number Verified</span>
                    </div>
                    <span className="badge badge-pass">Pre-Approved</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRE-MARKET LABEL AI CHECKER */}
          {activeTab === 'audit' && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileCheck size={22} color="#d97706" /> Pre-Press Packaging Artwork AI Pre-Audit Engine
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Upload pre-press print PDF or label design artwork to verify font heights, declaration placement, and MRP format before mass production.
                  </p>
                </div>
                <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Zero-Fine Assurance</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '12px', border: '2px dashed #f59e0b', textAlign: 'center' }}>
                  <Upload size={44} color="#d97706" style={{ margin: '0 auto 1rem auto' }} />
                  <h4 style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 700 }}>Upload Pre-Print Label Artwork (PDF / AI / PNG)</h4>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.5rem 0 1rem 0' }}>Maximum resolution recommended for vector font height calculation.</p>
                  
                  <button className="btn-primary" onClick={handleRunArtworkAudit} disabled={isAuditing} style={{ background: '#d97706', width: '100%', justifyContent: 'center' }}>
                    {isAuditing ? 'AI Engine Auditing Label Fonts & Declarations...' : 'Run Automated PCR 2011 Pre-Audit'}
                  </button>
                </div>

                {auditResult && (
                  <div style={{ background: '#f0fdf4', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#16a34a' }}>AI Pre-Compliance Score</span>
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>{auditResult.score}/100</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', color: '#334155' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle2 size={14} color="#16a34a" /> MRP format compliant ("incl. of all taxes")</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle2 size={14} color="#16a34a" /> Net Qty font height: 4.2mm (Exceeds min 3.0mm requirement)</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle2 size={14} color="#16a34a" /> Manufacturer Rule 27 registration number detected</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CheckCircle2 size={14} color="#16a34a" /> Consumer Care toll-free number & email validated</div>
                    </div>

                    <button className="btn-secondary" style={{ width: '100%', marginTop: '1rem', justifyContent: 'center', fontSize: '0.8rem' }}>
                      <Download size={14} /> Download Clearance Token Certificate
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RULE 27 REGISTRATION */}
          {activeTab === 'reg' && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={22} color="#d97706" /> Rule 27 Manufacturer / Packer / Importer Registration
              </h3>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Registration License Number:</span>
                    <h4 style={{ color: '#d97706', fontSize: '1.15rem', fontWeight: 800 }}>{orgProfile.regNo}</h4>
                  </div>
                  <span className="badge badge-pass">VALID UNTIL {orgProfile.licenceExpiry}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.6' }}>
                  <strong>Registered Entity Name:</strong> {orgProfile.name}<br />
                  <strong>Registered Premises:</strong> {orgProfile.address}<br />
                  <strong>Authorized Categories:</strong> FMCG Goods, Packaged Foods, Personal Care & Cleansing Products.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: SCALE STAMPING BOOKING */}
          {activeTab === 'slot' && (
            <div className="glass-card" style={{ padding: '1.75rem', maxWidth: '640px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={22} color="#d97706" /> Book Officer Inspection for Scale Verification & Stamping
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#0f172a', fontWeight: 700, marginBottom: '0.35rem' }}>Factory / Warehouse Location</label>
                  <input type="text" defaultValue={orgProfile.address} style={{ width: '100%', padding: '0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#0f172a', fontWeight: 700, marginBottom: '0.35rem' }}>Number of Commercial Scales to Stamp</label>
                  <input type="number" defaultValue={12} style={{ width: '100%', padding: '0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#0f172a', fontWeight: 700, marginBottom: '0.35rem' }}>Preferred Inspection Date</label>
                  <input type="date" defaultValue="2026-09-05" style={{ width: '100%', padding: '0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a' }} />
                </div>
                <button className="btn-primary" style={{ background: '#d97706', justifyContent: 'center', padding: '0.85rem' }} onClick={() => alert('Inspection slot request submitted to District Legal Metrology Officer!')}>
                  Confirm Slot Request with District Officer
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: VAULT */}
          {activeTab === 'vault' && (
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={22} color="#d97706" /> Legal Clearance Certificates & Model Approvals Vault
              </h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Document Title</th>
                      <th>Category</th>
                      <th>Issued Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>Rule 27 Packer Registration Certificate</td>
                      <td>Mandatory Registration</td>
                      <td>10 Jan 2024</td>
                      <td><span className="badge badge-pass">Active</span></td>
                      <td><button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}><Download size={13} /> PDF</button></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>Model Approval Certificate - 30kg Digital Scale</td>
                      <td>Instrument Model Approval</td>
                      <td>15 Aug 2025</td>
                      <td><span className="badge badge-pass">Approved</span></td>
                      <td><button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}><Download size={13} /> PDF</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCog size={22} color="#d97706" /> Organisation Profile & Security Settings
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* Entity Details */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                    Entity Information
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Organisation Name</span>
                      <strong style={{ color: '#0f172a' }}>{orgProfile.name}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Rule 27 Registration</span>
                      <strong style={{ color: '#d97706' }}>{orgProfile.regNo}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>GSTIN Number</span>
                      <strong style={{ color: '#0f172a' }}>{orgProfile.gstin}</strong>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                    Official Contact & Premises
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Official Email</span>
                      <strong style={{ color: '#0f172a' }}>{orgProfile.email}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Phone</span>
                      <strong style={{ color: '#0f172a' }}>{orgProfile.phone}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Registered Factory Premises</span>
                      <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.78rem' }}>{orgProfile.address}</span>
                    </div>
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" style={{ background: '#d97706' }} onClick={() => alert('Organisation settings saved successfully!')}>
                  Save Organisation Settings
                </button>
              </div>

            </div>
          )}

        </main>

      </div>
    </div>
  );
};
