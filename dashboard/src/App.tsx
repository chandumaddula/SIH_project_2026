import React, { useState } from 'react';
import { BootSplashScreen } from './components/BootSplashScreen';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { RoleSelector } from './components/RoleSelector';
import { AuthPage } from './pages/AuthPage';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { OrganisationDashboard } from './pages/OrganisationDashboard';

export const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [currentRole, setCurrentRole] = useState<'employee' | 'user' | 'other' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<string>('Hindustan Unilever Ltd');

  const handleBootComplete = () => {
    setIsBooting(false);
  };

  const handleSelectRole = (role: 'employee' | 'user' | 'other' | null) => {
    setCurrentRole(role);
  };

  const handleLoginSuccess = (role: 'employee' | 'user' | 'other', orgName?: string) => {
    setCurrentRole(role);
    if (orgName) {
      setSelectedOrg(orgName);
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentRole(null);
  };

  const handleShowBootPage = () => {
    setIsBooting(true);
  };

  if (isBooting) {
    return <BootSplashScreen onComplete={handleBootComplete} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      <Navbar 
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        onLogout={handleLogout}
        isAuthenticated={isAuthenticated}
        onShowBootPage={handleShowBootPage}
      />

      <main style={{ flex: 1, padding: '1rem 0' }}>
        {!currentRole ? (
          /* Selection page representing strictly ONLY: Employee, User, Other */
          <RoleSelector onSelectRole={handleSelectRole} />
        ) : !isAuthenticated ? (
          /* Login page appropriate to selected option only */
          <AuthPage 
            onLoginSuccess={handleLoginSuccess}
            selectedRole={currentRole}
          />
        ) : (
          <>
            {currentRole === 'employee' && <EmployeeDashboard />}
            {currentRole === 'user' && <UserDashboard />}
            {currentRole === 'other' && <OrganisationDashboard organisationName={selectedOrg} />}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
