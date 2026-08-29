import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Scale,
  Home,
  Search,
  Salad,
  FileEdit,
  FileText,
  User,
  Camera,
  PackageCheck,
  Package,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  Building2,
  Users,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const role = user?.role || 'citizen';

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { to: '/dashboard/admin', label: 'Admin Console', icon: <Home size={18} /> },
          { to: '/dashboard/admin/users', label: 'User Management', icon: <Users size={18} /> },
          { to: '/dashboard/admin/rules', label: 'Compliance Rules', icon: <ShieldCheck size={18} /> },
          { to: '/dashboard/admin/logs', label: 'Audit Logs', icon: <FileText size={18} /> },
        ];
      case 'officer':
        return [
          { to: '/dashboard/officer', label: 'Dashboard', icon: <Home size={18} /> },
          { to: '/dashboard/officer/scan', label: 'New Inspection', icon: <Camera size={18} /> },
          { to: '/dashboard/officer/verify-product', label: 'Verify Product', icon: <PackageCheck size={18} /> },
          { to: '/dashboard/officer/product-records', label: 'Product Records', icon: <Package size={18} /> },
          { to: '/dashboard/officer/violations', label: 'Violations', icon: <AlertTriangle size={18} /> },
          { to: '/dashboard/officer/complaints', label: 'Complaints', icon: <FileEdit size={18} /> },
          { to: '/dashboard/officer/history', label: 'Inspection History', icon: <ClipboardList size={18} /> },
          { to: '/dashboard/officer/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
          { to: '/dashboard/officer/profile', label: 'Profile', icon: <User size={18} /> },
        ];
      case 'organisation':
        return [
          { to: '/dashboard/organisation', label: 'Org Dashboard', icon: <Building2 size={18} /> },
          { to: '/dashboard/organisation/products', label: 'Product Verification', icon: <PackageCheck size={18} /> },
          { to: '/dashboard/organisation/certificates', label: 'Certificates', icon: <ShieldCheck size={18} /> },
        ];
      case 'citizen':
      default:
        return [
          { to: '/dashboard/citizen', label: 'Home', icon: <Home size={18} /> },
          { to: '/dashboard/citizen/verify', label: 'Product Information', icon: <Search size={18} /> },
          { to: '/dashboard/citizen/ingredients', label: 'Ingredients & Consumer Info', icon: <Salad size={18} /> },
          { to: '/dashboard/citizen/complaints', label: 'My Complaints', icon: <FileEdit size={18} /> },
          { to: '/dashboard/citizen/history', label: 'Complaint Details', icon: <FileText size={18} /> },
          { to: '/dashboard/citizen/profile', label: 'Profile', icon: <User size={18} /> },
        ];
    }
  };

  return (
    <aside
      style={{
        width: '260px',
        height: '100vh',
        backgroundColor: '#0b1329',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
          }}
        >
          <Scale size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>
            Legal Metrology
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600 }}>
            {role === 'officer' ? 'Official Inspection Portal' : 'Consumer Rights Portal'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        <div
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: '#64748b',
            padding: '8px 12px',
            marginBottom: '4px',
          }}
        >
          {role === 'officer' ? 'EMPLOYEE WORKFLOW' : role === 'citizen' ? 'CITIZEN WORKFLOW' : `${role.toUpperCase()} MENU`}
        </div>
        {getNavLinks().map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#ffffff' : '#94a3b8',
              backgroundColor: isActive ? '#1e293b' : 'transparent',
              borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
              transition: 'all 0.15s ease',
            })}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer Settings */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #1e293b' }}>
        <NavLink
          to="/dashboard/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.9rem',
            color: '#94a3b8',
          }}
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
};
