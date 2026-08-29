import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Mail, Lock, User as UserIcon, Building, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../types/user';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [department, setDepartment] = useState('');
  const [organisationName, setOrganisationName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        email,
        fullName,
        password,
        role,
        department: role === 'officer' ? department : undefined,
        organisationName: role === 'organisation' ? organisationName : undefined,
      });
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'officer') navigate('/dashboard/officer');
      else if (role === 'organisation') navigate('/dashboard/organisation');
      else navigate('/dashboard/citizen');
    } catch {
      // Error handled in store
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        padding: '24px',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15), transparent 50%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '16px',
          padding: '36px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              margin: '0 auto 12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Scale size={28} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
            Create Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
            Join the Legal Metrology Compliance Platform
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<UserIcon size={18} />}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
            required
          />

          {/* Role selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: '#cbd5e1' }}>
              Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            >
              <option value="citizen">Citizen / Consumer</option>
              <option value="officer">Enforcement Officer</option>
              <option value="organisation">Manufacturer / Organisation</option>
              <option value="admin">System Administrator</option>
            </select>
          </div>

          {role === 'officer' && (
            <Input
              label="Department / Unit"
              type="text"
              placeholder="Legal Metrology Department - Zone 4"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              icon={<ShieldCheck size={18} />}
              required
            />
          )}

          {role === 'organisation' && (
            <Input
              label="Organisation Name"
              type="text"
              placeholder="Acme Foods & Consumer Goods Pvt Ltd"
              value={organisationName}
              onChange={(e) => setOrganisationName(e.target.value)}
              icon={<Building size={18} />}
              required
            />
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            rightIcon={<UserPlus size={18} />}
            style={{ width: '100%', marginTop: '8px' }}
          >
            Register Account
          </Button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#6366f1', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
