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
} from 'lucide-react';

export const EmployeeList = () => {
  const { inspectEmployeeView } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Controls */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E6E4DD',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '280px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder="Search by name, ID, title, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
            <Search size={18} color="#888A83" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={16} color="#888A83" />
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="form-select"
              style={{ width: '150px' }}
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
              style={{ width: '130px' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedEmployee(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Employee Directory Table */}
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
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#888A83' }}>
                  Loading employee profiles...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#888A83' }}>
                  No employee profiles match your search filter.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <img
                        src={emp.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                        alt="Avatar"
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
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
                    <div style={{ fontWeight: '600', color: '#171816' }}>{emp.jobTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: '#2D4A3E', fontWeight: '500' }}>{emp.department}</div>
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
                        title="Inspect Dashboard View"
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
                        title="Edit Employee"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
