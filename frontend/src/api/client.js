const API_BASE_URL = '/api';

export const fetchAPI = async (endpoint, options = {}) => {
  const token = localStorage.getItem('dayflow_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || 'An error occurred during API request.';
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  // Auth
  login: (credentials) => fetchAPI('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => fetchAPI('/auth/register', { method: 'POST', body: userData }),
  verifyEmail: (payload) => fetchAPI('/auth/verify-email', { method: 'POST', body: payload }),
  resendCode: (payload) => fetchAPI('/auth/resend-code', { method: 'POST', body: payload }),
  getMe: () => fetchAPI('/auth/me'),

  // Employee Profile
  getEmployees: (params = '') => fetchAPI(`/employees${params}`),
  getEmployee: (id) => fetchAPI(`/employees/${id}`),
  updateEmployee: (id, payload) => fetchAPI(`/employees/${id}`, { method: 'PUT', body: payload }),

  // Attendance
  getTodayAttendance: () => fetchAPI('/attendance/today'),
  checkIn: () => fetchAPI('/attendance/check-in', { method: 'POST' }),
  checkOut: () => fetchAPI('/attendance/check-out', { method: 'POST' }),
  getMyAttendance: (params = '') => fetchAPI(`/attendance/my${params}`),
  getAllAttendance: (params = '') => fetchAPI(`/attendance/all${params}`),
  updateAttendanceStatus: (id, payload) => fetchAPI(`/attendance/${id}`, { method: 'PUT', body: payload }),

  // Leave Management
  applyLeave: (payload) => fetchAPI('/leaves/apply', { method: 'POST', body: payload }),
  getMyLeaves: () => fetchAPI('/leaves/my'),
  getAllLeaves: (params = '') => fetchAPI(`/leaves/all${params}`),
  updateLeaveStatus: (id, payload) => fetchAPI(`/leaves/${id}/status`, { method: 'PUT', body: payload }),

  // Payroll
  getMyPayroll: () => fetchAPI('/payroll/my'),
  getAllPayrolls: (params = '') => fetchAPI(`/payroll/all${params}`),
  updateSalaryStructure: (empId, payload) => fetchAPI(`/payroll/salary/${empId}`, { method: 'PUT', body: payload }),
  updatePayrollStatus: (id, payload) => fetchAPI(`/payroll/${id}/status`, { method: 'PUT', body: payload }),

  // Admin Dashboard
  getAdminStats: () => fetchAPI('/admin/stats'),
};
