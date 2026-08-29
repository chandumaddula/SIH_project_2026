import React, { useState } from 'react';
import { OCRScanner } from '../components/OCRScanner';
import { NoticeGenerator } from '../components/NoticeGenerator';
import { VerificationCertificates } from '../components/VerificationCertificates';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import { 
  LayoutDashboard, 
  Scan, 
  Award, 
  ClipboardCheck, 
  MapPin, 
  BarChart3, 
  UserCog, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation, 
  Search, 
  Download, 
  Lock, 
  RefreshCw, 
  ChevronRight, 
  Phone, 
  Mail, 
  Building,
  FileSpreadsheet,
  BadgeAlert,
  ArrowRight
} from 'lucide-react';

type TabType = 'overview' | 'scanner' | 'licence' | 'inspection' | 'map' | 'reports' | 'profile';

export const EmployeeDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Interactive state for Map Navigation target selection
  const [selectedMapTarget, setSelectedMapTarget] = useState<string | null>('target-1');

  // Interactive state for Profile Settings
  const [profileData, setProfileData] = useState({
    name: 'Officer Rajesh Kumar',
    employeeId: 'LM-ENF-4091',
    cadre: 'Senior Legal Metrology Inspector',
    zone: 'Zone 4 - Bengaluru Urban District',
    email: 'rajesh.kumar.lm@gov.in',
    phone: '+91 98765 43210',
    enclaveStatus: 'Active & Verified',
    autoScan: true,
    emailAlerts: true,
  });

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'scanner', label: 'Scanner/QR scanner', icon: Scan, badge: 'AI OCR' },
    { id: 'licence', label: 'Licence verification', icon: Award, badge: 'Act 2009' },
    { id: 'inspection', label: 'Inspection', icon: ClipboardCheck, badge: '7 Memos' },
    { id: 'map', label: 'Map navigation', icon: MapPin, badge: 'Zone 4' },
    { id: 'reports', label: 'Report and Analysis', icon: BarChart3, badge: 'Analytics' },
    { id: 'profile', label: 'Profile setting', icon: UserCog, badge: null },
  ];

  // Mock map inspection targets for Map Navigation
  const mapTargets = [
    { id: 'target-1', name: 'BigBazaar Supermarket Hub', address: 'Indiranagar 100ft Rd, Bengaluru', risk: 'High Risk', distance: '1.2 km', violations: 3, coords: '12.9716° N, 77.6412° E' },
    { id: 'target-2', name: 'Sri Lakshmi Packaging Works', address: 'Peenya Industrial Estate Phase 2', risk: 'Medium Risk', distance: '4.8 km', violations: 1, coords: '13.0308° N, 77.5192° E' },
    { id: 'target-3', name: 'APMC Wholesale Grain Mandi', address: 'Yeshwanthpur Market Complex', risk: 'Compliant', distance: '6.5 km', violations: 0, coords: '13.0238° N, 77.5510° E' },
    { id: 'target-4', name: 'Metro Cash & Carry Hub', address: 'Kanakapura Main Road', risk: 'High Risk', distance: '8.1 km', violations: 5, coords: '12.8950° N, 77.5680° E' }
  ];

  return (
    <div className="dashboard-container">
      
      {/* Top Banner Header */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          borderRadius: '16px', 
          padding: '1.25rem 1.75rem', 
          marginBottom: '1.5rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 10px 25px rgba(15, 23, 42, 0.15)',
          border: '1px solid #334155'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)' }}>
            <Shield size={26} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.15rem' }}>
              Enforcement Officer Portal • Legal Metrology
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
              Department of Consumer Affairs • Government of India
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>Session Status</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
              Enclave Active (256-Bit SSL)
            </span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout with Left Sidebar */}
      <div className="dashboard-layout">
        
        {/* LEFT SIDEBAR */}
        <aside className="dashboard-sidebar">
          
          {/* Account ID & Logo Container */}
          <div className="sidebar-account-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src="/logo/emblem.svg" 
                  alt="Officer Logo" 
                  style={{ width: '46px', height: '46px', objectFit: 'contain', background: '#ffffff', borderRadius: '50%', padding: '3px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
                />
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid #0f172a' }}></span>
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {profileData.name}
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, display: 'block', marginTop: '2px' }}>
                  ID: {profileData.employeeId}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.72rem', color: '#cbd5e1' }}>
              <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.68rem' }}>Cadre & Zone</span>
              <strong style={{ color: '#ffffff' }}>Inspector • Zone 4 Bengaluru</strong>
            </div>
          </div>

          {/* Navigation Menu List */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem', marginBottom: '0.5rem', display: 'block' }}>
              Officer Features
            </span>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id as TabType)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Icon size={18} color={isActive ? '#1d4ed8' : '#64748b'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span 
                      style={{ 
                        fontSize: '0.65rem', 
                        fontWeight: 700, 
                        padding: '0.15rem 0.45rem', 
                        borderRadius: '9999px',
                        background: isActive ? '#1d4ed8' : '#f1f5f9',
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

          {/* Security & System Info Footer */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '0.85rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <Lock size={16} color="#15803d" style={{ margin: '0 auto 0.25rem auto', display: 'block' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155', display: 'block' }}>
              Metrology Act 2009 Compliant
            </span>
            <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
              Encrypted Audit Enclave
            </span>
          </div>

        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="dashboard-main-content">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* KPI Cards */}
              <div className="grid-4">
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Monthly Inspections</span>
                    <ClipboardCheck size={20} color="#1d4ed8" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>48</div>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>+12% vs last month</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Seizures Issued</span>
                    <BadgeAlert size={20} color="#d97706" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>7 Memos</div>
                  <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 600 }}>Under Compounding</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Scale Verifications</span>
                    <Award size={20} color="#059669" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>124 Verified</div>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>Stamping Valid 2026</span>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Compliance Pass Rate</span>
                    <CheckCircle2 size={20} color="#2563eb" />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>89.4%</div>
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>PCR 2011 Standards</span>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="glass-card">
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                  Quick Inspection Actions
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <button 
                    onClick={() => setActiveTab('scanner')} 
                    className="btn-primary" 
                    style={{ justifyContent: 'center', padding: '0.85rem' }}
                  >
                    <Scan size={18} /> Launch AI OCR Scanner
                  </button>

                  <button 
                    onClick={() => setActiveTab('licence')} 
                    className="btn-secondary" 
                    style={{ justifyContent: 'center', padding: '0.85rem' }}
                  >
                    <Award size={18} color="#1d4ed8" /> Check Scale Licence
                  </button>

                  <button 
                    onClick={() => setActiveTab('inspection')} 
                    className="btn-secondary" 
                    style={{ justifyContent: 'center', padding: '0.85rem' }}
                  >
                    <FileSpreadsheet size={18} color="#d97706" /> Issue Seizure Memo
                  </button>

                  <button 
                    onClick={() => setActiveTab('map')} 
                    className="btn-secondary" 
                    style={{ justifyContent: 'center', padding: '0.85rem' }}
                  >
                    <MapPin size={18} color="#059669" /> Open Zone Map
                  </button>
                </div>
              </div>

              {/* Recent Field Inspections & Enforcement Feed */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Recent Field Inspection Logs
                  </h3>
                  <button onClick={() => setActiveTab('inspection')} style={{ background: 'none', border: 'none', color: '#1d4ed8', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                    View All <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>BigBazaar Outlet - Indiranagar</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Edible Oil Packets • Rule 6(1)(e) MRP Font Violations Flagged</span>
                    </div>
                    <span className="badge badge-warning">Memo Issued</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Sri Lakshmi Wholesale Grains</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Electronic Weighing Scale • Verification Stamping Valid till Nov 2026</span>
                    </div>
                    <span className="badge badge-pass">Pass Verified</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>Metro Supermarket - Kanakapura Rd</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Imported Chocolate Bags • Missing Country of Origin & Importer Address</span>
                    </div>
                    <span className="badge badge-critical">Seizure Pending</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SCANNER / QR SCANNER */}
          {activeTab === 'scanner' && (
            <div>
              <div style={{ marginBottom: '1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.85rem 1.25rem', color: '#1e40af', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scan size={18} />
                <span>Feature: AI OCR & Barcode/QR Scanner for Field Commodity Label Inspection</span>
              </div>
              <OCRScanner />
            </div>
          )}

          {/* TAB 3: LICENCE VERIFICATION */}
          {activeTab === 'licence' && (
            <div>
              <div style={{ marginBottom: '1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', padding: '0.85rem 1.25rem', color: '#065f46', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} />
                <span>Feature: National Scale & Weights Verification Registry & Licence Lookup</span>
              </div>
              <VerificationCertificates />
            </div>
          )}

          {/* TAB 4: INSPECTION */}
          {activeTab === 'inspection' && (
            <div>
              <div style={{ marginBottom: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '0.85rem 1.25rem', color: '#92400e', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ClipboardCheck size={18} />
                <span>Feature: Field Inspection Audits, Seizure Memos & Legal Compounding Notice Generator</span>
              </div>
              <NoticeGenerator />
            </div>
          )}

          {/* TAB 5: MAP NAVIGATION */}
          {activeTab === 'map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '0.85rem 1.25rem', color: '#166534', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Navigation size={18} />
                <span>Feature: GIS Field Map Navigation & Inspection Target Route Planning (Zone 4 - Bengaluru Urban)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                
                {/* Interactive Simulated Map Box */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={18} color="#1d4ed8" /> Zone 4 Inspection Map Radar
                    </h3>
                    <span className="badge badge-pass">Live GPS Sync</span>
                  </div>

                  {/* Visual Map Canvas Representation */}
                  <div 
                    style={{ 
                      flex: 1, 
                      background: '#1e293b', 
                      borderRadius: '12px', 
                      position: 'relative', 
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1.5rem',
                      border: '1px solid #334155'
                    }}
                  >
                    {/* Simulated Grid Lines */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                    {/* Officer Current GPS Marker */}
                    <div style={{ position: 'absolute', top: '40%', left: '35%', textAlign: 'center', zIndex: 10 }}>
                      <div style={{ width: '20px', height: '20px', background: '#3b82f6', border: '3px solid #ffffff', borderRadius: '50%', boxShadow: '0 0 15px #3b82f6', margin: '0 auto' }}></div>
                      <span style={{ fontSize: '0.68rem', background: '#0f172a', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid #334155', marginTop: '4px', display: 'inline-block' }}>
                        Officer GPS (Current)
                      </span>
                    </div>

                    {/* Target Pins on Map */}
                    {mapTargets.map((target, idx) => {
                      const isSelected = selectedMapTarget === target.id;
                      const topPos = `${25 + idx * 18}%`;
                      const leftPos = `${55 + (idx % 2 === 0 ? 15 : -15)}%`;

                      return (
                        <div 
                          key={target.id}
                          onClick={() => setSelectedMapTarget(target.id)}
                          style={{ 
                            position: 'absolute', 
                            top: topPos, 
                            left: leftPos, 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                            zIndex: isSelected ? 20 : 5
                          }}
                        >
                          <MapPin size={24} color={target.risk === 'High Risk' ? '#ef4444' : target.risk === 'Medium Risk' ? '#f59e0b' : '#22c55e'} />
                        </div>
                      );
                    })}

                    <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(15,23,42,0.85)', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.7rem', color: '#cbd5e1', border: '1px solid #334155' }}>
                      GPS: 12.9716° N, 77.5946° E • Accuracy: 3m
                    </div>
                  </div>
                </div>

                {/* Target Information & Route Guidance Panel */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
                    Scheduled Inspection Targets
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {mapTargets.map((target) => {
                      const isSelected = selectedMapTarget === target.id;
                      return (
                        <div 
                          key={target.id}
                          onClick={() => setSelectedMapTarget(target.id)}
                          style={{
                            padding: '1rem',
                            borderRadius: '12px',
                            border: isSelected ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{target.name}</strong>
                            <span 
                              className={`badge ${target.risk === 'High Risk' ? 'badge-critical' : target.risk === 'Medium Risk' ? 'badge-warning' : 'badge-pass'}`}
                              style={{ fontSize: '0.65rem' }}
                            >
                              {target.risk}
                            </span>
                          </div>

                          <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.5rem' }}>
                            {target.address}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                            <span>Distance: {target.distance}</span>
                            <span>Pending Violations: {target.violations}</span>
                            <span style={{ color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              Navigate <ArrowRight size={12} />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: REPORT AND ANALYSIS */}
          {activeTab === 'reports' && (
            <div>
              <div style={{ marginBottom: '1rem', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px', padding: '0.85rem 1.25rem', color: '#6b21a8', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} />
                <span>Feature: Legal Metrology Rule Enforcement Reports & State Analytics Breakdown</span>
              </div>
              <AnalyticsCharts />
            </div>
          )}

          {/* TAB 7: PROFILE SETTING */}
          {activeTab === 'profile' && (
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCog size={22} color="#1d4ed8" /> Inspector Profile & Security Settings
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* Officer Information Card */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                    Official Credentials
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Full Name</span>
                      <strong style={{ color: '#0f172a' }}>{profileData.name}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Officer ID</span>
                      <strong style={{ color: '#1d4ed8' }}>{profileData.employeeId}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Designation Cadre</span>
                      <strong style={{ color: '#0f172a' }}>{profileData.cadre}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Jurisdiction Zone</span>
                      <strong style={{ color: '#0f172a' }}>{profileData.zone}</strong>
                    </div>
                  </div>
                </div>

                {/* Contact & Enclave Security Details */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                    Enclave & Digital Key Settings
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem' }}>
                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Govt Email</span>
                      <strong style={{ color: '#0f172a' }}>{profileData.email}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Registered Contact</span>
                      <strong style={{ color: '#0f172a' }}>{profileData.phone}</strong>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Digital Signature Token</span>
                      <span className="badge badge-pass" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                        RSA-4096 Key Active
                      </span>
                    </div>

                    <div>
                      <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>SSL Security Certificate</span>
                      <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.8rem' }}>
                        Valid till Dec 2027
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Preferences & Toggles */}
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                  Inspection Preferences
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.88rem', color: '#0f172a', fontWeight: 600 }}>
                    <span>Enable Auto AI OCR Bounding Box Extraction on Camera Capture</span>
                    <input 
                      type="checkbox" 
                      checked={profileData.autoScan} 
                      onChange={(e) => setProfileData({ ...profileData, autoScan: e.target.checked })} 
                      style={{ width: '18px', height: '18px', accentColor: '#1d4ed8' }}
                    />
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '0.88rem', color: '#0f172a', fontWeight: 600 }}>
                    <span>Receive Instant Email Digest for Issued Seizure Memos</span>
                    <input 
                      type="checkbox" 
                      checked={profileData.emailAlerts} 
                      onChange={(e) => setProfileData({ ...profileData, emailAlerts: e.target.checked })} 
                      style={{ width: '18px', height: '18px', accentColor: '#1d4ed8' }}
                    />
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button className="btn-primary" onClick={() => alert('Profile settings saved successfully!')}>
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
