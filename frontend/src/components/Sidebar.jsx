import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  User,
  FileText,
  ShieldAlert,
  LogOut,
  ArrowRightLeft,
  Eye,
  X,
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const {
    user,
    role,
    activeRoleView,
    toggleRoleView,
    viewingAsEmployee,
    clearEmployeeInspection,
    logout,
  } = useAuth();

  const isAdmin = role === 'ADMIN';

  const employeeNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Attendance History', icon: Clock },
    { id: 'leave', label: 'Leave Requests', icon: CalendarDays },
    { id: 'payroll', label: 'My Salary & Payroll', icon: DollarSign },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const adminNavItems = [
    { id: 'admin-overview', label: 'HR Overview', icon: LayoutDashboard },
    { id: 'employees', label: 'Employee Directory', icon: Users },
    { id: 'attendance-tracker', label: 'Attendance Tracker', icon: Clock },
    { id: 'leave-approvals', label: 'Leave Approvals', icon: CalendarDays },
    { id: 'payroll-hub', label: 'Payroll Manager', icon: DollarSign },
  ];

  const currentNavItems = activeRoleView === 'ADMIN' ? adminNavItems : employeeNavItems;

  const displayUser = viewingAsEmployee || user?.profile;
  const displayRole = viewingAsEmployee ? 'INSPECTING EMPLOYEE' : activeRoleView;

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'background-color 0.2s, border-color 0.2s'
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '1.5rem 1.5rem 1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#2D4A3E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '1.125rem',
            }}
          >
            D
          </div>
          <div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Dayflow
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Human Capital Platform
            </div>
          </div>
        </div>

        {/* HR Role Switcher */}
        {isAdmin && !viewingAsEmployee && (
          <div
            style={{
              marginTop: '1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              padding: '0.25rem',
              borderRadius: '8px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.25rem',
            }}
          >
            <button
              onClick={() => {
                toggleRoleView('ADMIN');
                setActiveTab('admin-overview');
              }}
              style={{
                padding: '0.4rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: activeRoleView === 'ADMIN' ? 'var(--bg-surface)' : 'transparent',
                color: activeRoleView === 'ADMIN' ? 'var(--color-primary)' : 'var(--text-secondary)',
                boxShadow: activeRoleView === 'ADMIN' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <ShieldAlert size={12} /> HR Admin
            </button>

            <button
              onClick={() => {
                toggleRoleView('EMPLOYEE');
                setActiveTab('dashboard');
              }}
              style={{
                padding: '0.4rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: activeRoleView === 'EMPLOYEE' ? 'var(--bg-surface)' : 'transparent',
                color: activeRoleView === 'EMPLOYEE' ? 'var(--color-primary)' : 'var(--text-secondary)',
                boxShadow: activeRoleView === 'EMPLOYEE' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
              }}
            >
              <User size={12} /> My Portal
            </button>
          </div>
        )}
      </div>

      {/* Impersonation Banner */}
      {viewingAsEmployee && (
        <div
          style={{
            backgroundColor: '#FEF3C7',
            borderBottom: '1px solid #FDE68A',
            padding: '0.75rem 1rem',
            fontSize: '0.75rem',
            color: '#92400E',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: '600' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Eye size={14} /> Viewing as Employee
            </span>
            <button
              onClick={clearEmployeeInspection}
              style={{ color: '#92400E', display: 'flex', alignItems: 'center' }}
              title="Exit employee view"
            >
              <X size={14} />
            </button>
          </div>
          <div style={{ fontSize: '0.6875rem', marginTop: '0.15rem' }}>
            {viewingAsEmployee.firstName} {viewingAsEmployee.lastName} ({viewingAsEmployee.user?.employeeId})
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '1rem 0.875rem', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#888A83', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.625rem 0.5rem 0.625rem' }}>
          Navigation
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.875rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '600' : '500',
                    backgroundColor: isActive ? 'var(--bg-accent-light)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={18} color={isActive ? 'var(--color-primary)' : 'var(--text-muted)'} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={displayUser?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
            alt="Avatar"
            style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--border-color)', objectFit: 'cover' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayUser?.firstName} {displayUser?.lastName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {user?.employeeId} • <span style={{ textTransform: 'uppercase', fontWeight: '600', color: 'var(--color-primary)', fontSize: '0.6875rem' }}>{displayRole}</span>
            </div>
          </div>
          <button
            onClick={logout}
            style={{ color: 'var(--text-muted)', padding: '0.35rem', borderRadius: '6px' }}
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
