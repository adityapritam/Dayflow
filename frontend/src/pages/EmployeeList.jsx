import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/Badge';
import { EmployeeModal } from '../components/EmployeeModal';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Eye,
  Filter,
  Mail,
  Phone,
  Briefcase,
  Building,
  LayoutGrid,
  List,
  ChevronRight,
  TrendingUp,
  UserPlus
} from 'lucide-react';

const DEPT_COLORS = {
  'Engineering': { border: '#0284C7', bg: '#F0F9FF', text: '#0369A1' },
  'Design': { border: '#EA580C', bg: '#FFF7ED', text: '#C2410C' },
  'Human Resources': { border: '#DB2777', bg: '#FDF2F8', text: '#BE185D' },
  'Product': { border: '#7C3AED', bg: '#F5F3FF', text: '#6D28D9' },
  'default': { border: '#2D4A3E', bg: '#EBF2EE', text: '#2D4A3E' }
};

export const EmployeeList = () => {
  const { inspectEmployeeView } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'table' or 'grid'

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      let query = `?search=${encodeURIComponent(search)}`;
      if (department !== 'ALL') query += `&department=${department}`;
      if (status !== 'ALL') query += `&status=${status}`;

      const data = await api.getEmployees(query);
      setEmployees(data.employees);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, department, status]);

  const getDeptTheme = (deptName) => {
    return DEPT_COLORS[deptName] || DEPT_COLORS['default'];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Directory Welcome & Stats Header */}
      <div
        className="dashboard-banner"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div className="dashboard-banner-text-subtle" style={{ fontSize: '0.8125rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Users size={14} /> Organization Directory
          </div>
          <h2 className="dashboard-banner-text-primary" style={{ fontSize: '1.75rem', fontWeight: '700', marginTop: '0.2rem', letterSpacing: '-0.025em' }}>
            Workforce Directory
          </h2>
          <p className="dashboard-banner-text-subtle" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Total Managed Staff: <span style={{ fontWeight: '700' }}>{employees.length}</span> Active and Inactive members.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedEmployee(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
          style={{ backgroundColor: '#FFFFFF', color: '#2D4A3E', border: '1px solid #FFFFFF' }}
        >
          <UserPlus size={16} /> Add Employee
        </button>
      </div>

      {/* Filter & View Mode Controls Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E6E4DD',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by name, title, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
            />
            <Search size={18} color="#888A83" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="#888A83" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="form-select"
              style={{ width: '150px', fontSize: '0.875rem' }}
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Product">Product</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-select"
              style={{ width: '130px', fontSize: '0.875rem' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* View Switcher Toggle */}
        <div style={{ display: 'flex', backgroundColor: '#F5F4EE', padding: '0.25rem', borderRadius: '8px', border: '1px solid #E6E4DD' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '0.35rem 0.625rem',
              borderRadius: '6px',
              backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'grid' ? '#2D4A3E' : '#888A83',
              boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8125rem',
              fontWeight: '600'
            }}
          >
            <LayoutGrid size={14} /> Grid
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '0.35rem 0.625rem',
              borderRadius: '6px',
              backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'table' ? '#2D4A3E' : '#888A83',
              boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8125rem',
              fontWeight: '600'
            }}
          >
            <List size={14} /> List
          </button>
        </div>
      </div>

      {/* Directory Layout rendering */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#888A83', fontSize: '0.875rem', backgroundColor: '#FFFFFF', border: '1px solid #E6E4DD', borderRadius: '12px' }}>
          Loading employee directory...
        </div>
      ) : employees.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#888A83', fontSize: '0.875rem', backgroundColor: '#FFFFFF', border: '1px solid #E6E4DD', borderRadius: '12px' }}>
          <Search size={36} color="#D5D3CA" style={{ margin: '0 auto 0.75rem auto' }} />
          No managed staff profiles found matching the filters.
        </div>
      ) : viewMode === 'grid' ? (
        /* Card Grid Mode */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {employees.map((emp) => {
            const theme = getDeptTheme(emp.department);
            return (
              <div
                key={emp.id}
                className="dashboard-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem 1.25rem 1.25rem 1.25rem',
                  height: '280px',
                  borderTop: `5px solid ${theme.border}`,
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={emp.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                        alt="Avatar"
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `2px solid ${theme.border}`,
                          boxShadow: `0 0 0 3px ${theme.bg}`
                        }}
                      />
                      {emp.status === 'ACTIVE' && (
                        <span style={{ position: 'absolute', bottom: '0px', right: '0px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#059669', border: '2px solid #FFFFFF' }} />
                      )}
                    </div>
                    <StatusBadge status={emp.status} />
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '1.0625rem', fontWeight: '700', color: '#171816', letterSpacing: '-0.02em' }}>
                      {emp.firstName} {emp.lastName}
                    </h4>
                    <div style={{ fontSize: '0.8125rem', color: '#565852', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                      <Briefcase size={12} color="#888A83" /> {emp.jobTitle}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem', padding: '0.15rem 0.5rem', backgroundColor: theme.bg, color: theme.text, borderRadius: '4px', fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <Building size={10} /> {emp.department}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', borderTop: '1px solid #F5F4EE', paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', color: '#888A83' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={12} /> {emp.user?.email}
                    </div>
                    {emp.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={12} /> {emp.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons inside Card */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => inspectEmployeeView(emp)}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                  >
                    <Eye size={12} /> View Portal
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setIsModalOpen(true);
                    }}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                  >
                    <Edit2 size={12} /> Modify info
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table Mode */
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Employee Details</th>
                <th>Department & Role</th>
                <th>Contact Info</th>
                <th>Join Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const theme = getDeptTheme(emp.department);
                return (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <img
                          src={emp.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                          alt="Avatar"
                          style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${theme.border}` }}
                        />
                        <div>
                          <div style={{ fontWeight: '700', color: '#171816' }}>
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888A83', fontFamily: 'var(--font-mono)' }}>
                            {emp.user?.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: '700', color: '#171816' }}>{emp.jobTitle}</div>
                      <div style={{ display: 'inline-block', padding: '0.1rem 0.35rem', backgroundColor: theme.bg, color: theme.text, borderRadius: '4px', fontSize: '0.6875rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '0.15rem' }}>{emp.department}</div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8125rem', color: '#565852', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={13} color="#888A83" /> {emp.user?.email}
                      </div>
                      {emp.phone && (
                        <div style={{ fontSize: '0.75rem', color: '#888A83', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={12} /> {emp.phone}
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8125rem', color: '#565852' }}>{emp.joinDate}</div>
                    </td>

                    <td>
                      <StatusBadge status={emp.status} />
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => inspectEmployeeView(emp)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.625rem', fontSize: '0.75rem' }}
                        >
                          <Eye size={14} /> View
                        </button>

                        <button
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setIsModalOpen(true);
                          }}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.625rem', fontSize: '0.75rem' }}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <EmployeeModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSuccess={fetchEmployees}
      />
    </div>
  );
};
