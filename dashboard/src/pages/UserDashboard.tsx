import React, { useState } from 'react';
import { OCRScanner } from '../components/OCRScanner';
import { VerificationCertificates } from '../components/VerificationCertificates';
import { 
  Home, 
  Scan, 
  AlertTriangle, 
  Award, 
  UserCog, 
  ShieldCheck, 
  CheckCircle2, 
  Upload, 
  FileText, 
  Search, 
  Phone, 
  MapPin, 
  Lock, 
  Clock, 
  ChevronRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';

type UserTabType = 'home' | 'scan' | 'complaint' | 'verify' | 'profile';

export const UserDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<UserTabType>('home');
  const [complaintProduct, setComplaintProduct] = useState('');
  const [complaintType, setComplaintType] = useState('Dual MRP Stamping');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState('');

  const [profileData, setProfileData] = useState({
    name: 'Ramesh Sharma',
    accountId: 'CITIZEN-IN-8042',
    email: 'ramesh.sharma@example.com',
    phone: '+91 98450 12345',
    city: 'Bengaluru, Karnataka',
    kycStatus: 'Aadhaar Verified',
    smsAlerts: true,
  });

  const sampleComplaints = [
    { id: 'GRV-2026-9041', product: 'Brand X Premium Ghee 1L', type: 'Dual MRP Charged at Store', status: 'IN_PROGRESS', date: '27 Aug 2026', officer: 'Insp. R. Sharma' },
    { id: 'GRV-2026-8812', product: 'Local Sweet Store Weigh Scale', type: 'Unstamped & Unverified Scale', status: 'RESOLVED', date: '14 Aug 2026', officer: 'Insp. K. Rao' }
  ];

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, badge: null },
    { id: 'scan', label: 'Scan', icon: Scan, badge: 'AI OCR' },
    { id: 'complaint', label: 'file a complaint', icon: AlertTriangle, badge: 'Grievance' },
    { id: 'verify', label: 'Verify licence', icon: Award, badge: 'Licence' },
    { id: 'profile', label: 'profile', icon: UserCog, badge: null },
  ];

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `GRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setTrackingId(newId);
    setComplaintSubmitted(true);
  };

  return (
    <div className="dashboard-container">
      
      {/* Top Welcome Header */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)', 
          borderRadius: '16px', 
          padding: '1.25rem 1.75rem', 
          marginBottom: '1.5rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(6, 78, 59, 0.2)',
          border: '1px solid #10b98140'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)' }}>
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.15rem' }}>
              Citizen & Consumer Protection Portal
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#a7f3d0', fontWeight: 500 }}>
              Verify Packaged Commodities, Scale Certificates & File Legal Metrology Grievances
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="badge badge-pass" style={{ background: '#065f46', color: '#34d399', borderColor: '#10b981', padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
            <Phone size={14} /> National Consumer Helpline: 1915
          </span>
        </div>
      </div>

      {/* Main Dashboard Layout with Left Sidebar */}
      <div className="dashboard-layout">
        
        {/* LEFT SIDEBAR */}
        <aside className="dashboard-sidebar">
          
          {/* Account ID Details Card */}
          <div className="sidebar-account-card" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)', borderColor: '#059669' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src="/logo/emblem.svg" 
                  alt="Citizen Emblem Logo" 
                  style={{ width: '46px', height: '46px', objectFit: 'contain', background: '#ffffff', borderRadius: '50%', padding: '3px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                />
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid #0f172a' }}></span>
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profileData.name}
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                  ID: {profileData.accountId}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#e2e8f0' }}>
              <span style={{ display: 'block', color: '#a7f3d0', fontSize: '0.68rem', fontWeight: 600 }}>Verification Status</span>
              <strong style={{ color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={13} color="#34d399" /> {profileData.kycStatus}
              </strong>
            </div>
          </div>

          {/* Navigation Menu List */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem', marginBottom: '0.5rem', display: 'block' }}>
              Citizen Features
            </span>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id as UserTabType)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Icon size={18} color={isActive ? '#059669' : '#64748b'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span 
                      style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 700, 
                        padding: '0.15rem 0.45rem', 
                        borderRadius: '9999px',
                        background: isActive ? '#059669' : '#f1f5f9',
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

          {/* Security & Support Info Box */}
          <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '0.85rem', border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <ShieldCheck size={18} color="#059669" style={{ margin: '0 auto 0.25rem auto', display: 'block' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', display: 'block' }}>
              PCR 2011 Rights Protection
            </span>
            <span style={{ fontSize: '0.68rem', color: '#166534' }}>
              Legal Consumer Defense Enclave
            </span>
          </div>

        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="dashboard-main-content">
          
          {/* FEATURE 1: HOME */}
          {activeTab === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Stat Summary Cards */}
              <div className="grid-3">
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>My Active Grievances</span>
                    <AlertTriangle size={20} color="#d97706" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>1 Active</div>
                  <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Inspection Scheduled</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Resolved Complaints</span>
                    <CheckCircle2 size={20} color="#059669" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>1 Resolved</div>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Fine Compounded</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Scanned Package Labels</span>
                    <Scan size={20} color="#1d4ed8" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>14 Scans</div>
                  <span style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>100% PCR Verified</span>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                  Citizen Consumer Quick Services
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <button 
                    onClick={() => setActiveTab('scan')} 
                    className="btn-primary" 
                    style={{ background: '#059669', justifyContent: 'center', padding: '0.85rem' }}
                  >
                    <Scan size={18} /> Scan Package Label
                  </button>

                  <button 
                    onClick={() => setActiveTab('complaint')} 
                    className="btn-secondary" 
                    style={{ justifyContent: 'center', padding: '0.85rem' }}
                  >
                    <AlertTriangle size={18} color="#d97706" /> File a Complaint
                  </button>

                  <button 
                    onClick={() => setActiveTab('verify')} 
                    className="btn-secondary" 
                    style={{ justifyContent: 'center', padding: '0.85rem' }}
                  >
                    <Award size={18} color="#1d4ed8" /> Verify Scale Licence
                  </button>

                  <button 
                    onClick={() => setActiveTab('profile')} 
                    className="btn-secondary" 
                    style={{ justifyContent: 'center', padding: '0.85rem' }}
                  >
                    <UserCog size={18} color="#475569" /> View My Profile
                  </button>
                </div>
              </div>

              {/* Consumer Rights under PCR 2011 */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} color="#059669" /> Mandatory Package Rules Every Consumer Should Know
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '0.35rem' }}>
                      1. Strict Prohibition of Dual MRP
                    </strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      No seller can charge higher than the printed MRP. Dual pricing stickers at airports or malls are illegal under Section 18.
                    </p>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '0.35rem' }}>
                      2. Mandatory Consumer Care Contact
                    </strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Every package must print a toll-free number or email for consumer complaints.
                    </p>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', marginBottom: '0.35rem' }}>
                      3. Net Quantity Verification
                    </strong>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Short weighing or short volume beyond permissible error (MPE) is punishable with heavy penalties.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* FEATURE 2: SCAN */}
          {activeTab === 'scan' && (
            <div>
              <div style={{ marginBottom: '1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '0.85rem 1.25rem', color: '#065f46', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scan size={18} />
                <span>Feature: AI OCR & Barcode Label Scanner to Verify Packaged Commodity Declarations</span>
              </div>
              <OCRScanner />
            </div>
          )}

          {/* FEATURE 3: FILE A COMPLAINT */}
          {activeTab === 'complaint' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div className="glass-card" style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={22} color="#d97706" /> Lodge Official Consumer Grievance
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  Report deceptive MRP stickers, short net weight, uncalibrated shop weighing scales, or missing manufacturer information directly to Enforcement Officers.
                </p>

                {complaintSubmitted ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.75rem', borderRadius: '12px', textAlign: 'center' }}>
                    <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 1rem auto' }} />
                    <h4 style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 800 }}>Grievance Registered Successfully!</h4>
                    <p style={{ color: '#475569', fontSize: '0.88rem', margin: '0.5rem 0' }}>Your Complaint Tracking ID is:</p>
                    <code style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', background: '#ffffff', border: '1px solid #bbf7d0', padding: '0.4rem 1.2rem', borderRadius: '8px', display: 'inline-block' }}>
                      {trackingId}
                    </code>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>
                      Assigned to District Legal Metrology Inspector for field verification within 48 hours.
                    </p>
                    <button className="btn-secondary" onClick={() => setComplaintSubmitted(false)} style={{ marginTop: '1.25rem' }}>
                      File Another Grievance
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.35rem' }}>
                        Product Name / Store Name
                      </label>
                      <input 
                        type="text" 
                        value={complaintProduct} 
                        onChange={(e) => setComplaintProduct(e.target.value)}
                        placeholder="e.g. ABC Mart Indiranagar / Brand X Refined Cooking Oil" 
                        required
                        style={{ width: '100%', padding: '0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.35rem' }}>
                        Nature of Violation / Offence
                      </label>
                      <select 
                        value={complaintType}
                        onChange={(e) => setComplaintType(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.9rem' }}
                      >
                        <option value="Dual MRP Stamping">Dual MRP Stamping (Charging higher than original printed MRP)</option>
                        <option value="Short Weight / Volume">Short Net Weight / Short Quantity in Package</option>
                        <option value="Missing Mandatory Declarations">Missing Manufacturer Address or Consumer Care Details</option>
                        <option value="Unverified Commercial Scale">Store Weighing Scale Unstamped / Missing Verification Certificate</option>
                        <option value="Expired Packed Commodity">Sale of Expired Packaged Commodity</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.35rem' }}>
                        Detailed Complaint Description & Location
                      </label>
                      <textarea 
                        rows={4} 
                        value={complaintDesc}
                        onChange={(e) => setComplaintDesc(e.target.value)}
                        placeholder="Provide store address, date of purchase, printed MRP vs charged price..." 
                        required
                        style={{ width: '100%', padding: '0.75rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#0f172a', fontSize: '0.9rem' }}
                      ></textarea>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.35rem' }}>
                        Upload Photo Evidence (Bill Receipt / Label Photo)
                      </label>
                      <input 
                        type="file" 
                        style={{ width: '100%', padding: '0.5rem', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#64748b' }}
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ background: '#059669', justifyContent: 'center', padding: '0.85rem' }}>
                      Submit Official Grievance to Enforcement Officer
                    </button>
                  </form>
                )}
              </div>

              {/* Status Tracking List */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                  My Registered Grievance History & Status
                </h3>

                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Grievance ID</th>
                        <th>Product / Store Name</th>
                        <th>Violation Type</th>
                        <th>Submitted Date</th>
                        <th>Assigned Inspector</th>
                        <th>Current Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleComplaints.map((g) => (
                        <tr key={g.id}>
                          <td style={{ fontWeight: 700, color: '#059669' }}>{g.id}</td>
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>{g.product}</td>
                          <td>{g.type}</td>
                          <td>{g.date}</td>
                          <td>{g.officer}</td>
                          <td>
                            <span className={`badge ${g.status === 'RESOLVED' ? 'badge-pass' : 'badge-warning'}`}>
                              {g.status === 'RESOLVED' ? 'Enforcement Completed' : 'Inspection Scheduled'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* FEATURE 4: VERIFY LICENCE */}
          {activeTab === 'verify' && (
            <div>
              <div style={{ marginBottom: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.85rem 1.25rem', color: '#1e40af', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} />
                <span>Feature: Search & Verify Manufacturer / Importer Licences & Scale Stamping Certificates</span>
              </div>
              <VerificationCertificates />
            </div>
          )}

          {/* FEATURE 5: PROFILE */}
          {activeTab === 'profile' && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCog size={22} color="#059669" /> Citizen Account Profile & Settings
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* Account Info */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                    Personal Details
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Full Name</span>
                      <strong style={{ color: '#0f172a' }}>{profileData.name}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Citizen Account ID</span>
                      <strong style={{ color: '#059669' }}>{profileData.accountId}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Location / City</span>
                      <strong style={{ color: '#0f172a' }}>{profileData.city}</strong>
                    </div>
                  </div>
                </div>

                {/* Contact & Verification */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                    KYC & Contact Verification
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Email Address</span>
                      <strong style={{ color: '#0f172a' }}>{profileData.email}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Mobile Number</span>
                      <strong style={{ color: '#0f172a' }}>{profileData.phone}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Verification Badge</span>
                      <span className="badge badge-pass" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                        <CheckCircle2 size={12} /> Aadhaar Verified
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Preferences */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                  Grievance Notifications & Alerts
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.88rem', color: '#0f172a', fontWeight: 600 }}>
                    <span>Send SMS/WhatsApp Updates for Filed Grievances</span>
                    <input 
                      type="checkbox" 
                      checked={profileData.smsAlerts} 
                      onChange={(e) => setProfileData({ ...profileData, smsAlerts: e.target.checked })} 
                      style={{ width: '18px', height: '18px', accentColor: '#059669' }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" style={{ background: '#059669' }} onClick={() => alert('Profile settings saved successfully!')}>
                  Save Profile Settings
                </button>
              </div>

            </div>
          )}

        </main>

      </div>
    </div>
  );
};
