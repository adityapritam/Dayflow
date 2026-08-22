import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';

export const EmployeeModal = ({ employee, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: 'Password123!',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    jobTitle: '',
    department: 'Engineering',
    baseSalary: 75000,
    allowances: 4000,
    deductions: 3000,
    status: 'ACTIVE',
    role: 'EMPLOYEE',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employee) {
      setFormData({
        email: employee.user?.email || '',
        password: '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        phone: employee.phone || '',
        address: employee.address || '',
        jobTitle: employee.jobTitle || '',
        department: employee.department || 'Engineering',
        baseSalary: employee.baseSalary || 0,
        allowances: employee.allowances || 0,
        deductions: employee.deductions || 0,
        status: employee.status || 'ACTIVE',
        role: employee.user?.role || 'EMPLOYEE',
      });
    } else {
      setFormData({
        email: '',
        password: 'Password123!',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        jobTitle: '',
        department: 'Engineering',
        baseSalary: 75000,
        allowances: 4000,
        deductions: 3000,
        status: 'ACTIVE',
        role: 'EMPLOYEE',
      });
    }
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      if (employee) {
        // Edit existing employee
        await api.updateEmployee(employee.id, formData);
      } else {
        // Create new employee
        await api.register({
          email: formData.email,
          password: formData.password || 'Password123!',
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          jobTitle: formData.jobTitle,
          department: formData.department,
          role: formData.role,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save employee profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '640px' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E6E4DD', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#171816' }}>
            {employee ? 'Edit Employee Details' : 'Add New Employee'}
          </h3>
          <button onClick={onClose} style={{ color: '#888A83' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' }}>
          {error && (
            <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.625rem 0.875rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="form-input"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
                disabled={!!employee}
                required
              />
            </div>

            {!employee && (
              <div className="form-group">
                <label className="form-label">Default Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="form-input"
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="form-select"
              >
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-select"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">HR Admin / Officer</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Office Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="form-input"
              placeholder="Full address..."
            />
          </div>

          {employee && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E6E4DD' }}>
              <div className="form-group">
                <label className="form-label">Annual Base ($)</label>
                <input
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Allowances ($)</label>
                <input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deductions ($)</label>
                <input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : employee ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
