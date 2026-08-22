import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VerifyEmail } from './pages/VerifyEmail';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { EmployeeList } from './pages/EmployeeList';
import { AttendancePage } from './pages/AttendancePage';
import { LeavePage } from './pages/LeavePage';
import { PayrollPage } from './pages/PayrollPage';
import { ProfilePage } from './pages/ProfilePage';

const AppContent = () => {
  const { user, token, activeRoleView, loading } = useAuth();

  const [authView, setAuthView] = useState('landing'); // 'landing', 'login', 'register', 'verify'
  const [verifyEmailState, setVerifyEmailState] = useState({ email: '', demoCode: '' });
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBFBF9', color: '#2D4A3E', fontWeight: '600' }}>
        Loading Dayflow System...
      </div>
    );
  }

  if (!token || !user) {
    if (authView === 'landing') {
      return (
        <LandingPage
          onLogin={() => setAuthView('login')}
          onRegister={() => setAuthView('register')}
        />
      );
    }

    if (authView === 'register') {
      return (
        <Register
          onNavigateLogin={() => setAuthView('login')}
          onNavigateVerify={(email, demoCode) => {
            setVerifyEmailState({ email, demoCode });
            setAuthView('verify');
          }}
          onBackToLanding={() => setAuthView('landing')}
        />
      );
    }

    if (authView === 'verify') {
      return (
        <VerifyEmail
          email={verifyEmailState.email}
          demoCode={verifyEmailState.demoCode}
          onNavigateLogin={() => setAuthView('login')}
        />
      );
    }

    return (
      <Login
        onNavigateRegister={() => setAuthView('register')}
        onNavigateVerify={(email, demoCode) => {
          setVerifyEmailState({ email, demoCode });
          setAuthView('verify');
        }}
        onBackToLanding={() => setAuthView('landing')}
      />
    );
  }

  // Ensure default tab is appropriate when switching roles
  const effectiveTab = (activeRoleView === 'ADMIN' && activeTab === 'dashboard') ? 'admin-overview' : (activeRoleView === 'EMPLOYEE' && activeTab === 'admin-overview') ? 'dashboard' : activeTab;

  const pageHeadings = {
    'dashboard': { title: 'Employee Dashboard', subtitle: 'Personal work summary, attendance clock, and leave balances.' },
    'admin-overview': { title: 'HR Executive Overview', subtitle: 'Company-wide metrics, attendance rates, and pending approvals.' },
    'employees': { title: 'Employee Directory', subtitle: 'Manage organization staff profiles, roles, and job structures.' },
    'attendance': { title: 'Attendance History', subtitle: 'Log of daily check-in and check-out timestamps.' },
    'attendance-tracker': { title: 'Company Attendance Tracker', subtitle: 'Monitor daily attendance records across all employees.' },
    'leave': { title: 'Leave Management', subtitle: 'Submit time off applications and track approval statuses.' },
    'leave-approvals': { title: 'Leave Approvals Queue', subtitle: 'Review and approve/reject employee leave applications.' },
    'payroll': { title: 'My Salary & Paystubs', subtitle: 'View official base salary structure and monthly paystubs.' },
    'payroll-hub': { title: 'Payroll Manager', subtitle: 'Manage employee salary structures and disbursement status.' },
    'profile': { title: 'Employee Profile', subtitle: 'Personal details, job title, and contact information.' },
  };

  const currentHeading = pageHeadings[effectiveTab] || pageHeadings['dashboard'];

  const renderTabContent = () => {
    switch (effectiveTab) {
      case 'dashboard':
        return <EmployeeDashboard setActiveTab={setActiveTab} />;
      case 'admin-overview':
        return <AdminDashboard setActiveTab={setActiveTab} />;
      case 'employees':
        return <EmployeeList />;
      case 'attendance':
      case 'attendance-tracker':
        return <AttendancePage />;
      case 'leave':
      case 'leave-approvals':
        return <LeavePage />;
      case 'payroll':
      case 'payroll-hub':
        return <PayrollPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <EmployeeDashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={effectiveTab} setActiveTab={setActiveTab} />
      <div className="main-content">
        <Header title={currentHeading.title} subtitle={currentHeading.subtitle} />
        <main className="content-wrapper">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
