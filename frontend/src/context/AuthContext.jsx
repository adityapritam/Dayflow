import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dayflow_token') || null);
  const [loading, setLoading] = useState(true);
  const [activeRoleView, setActiveRoleView] = useState(null); // 'ADMIN' or 'EMPLOYEE' override
  const [viewingAsEmployee, setViewingAsEmployee] = useState(null); // Impersonation state for HR

  useEffect(() => {
    if (token) {
      api.getMe()
        .then((data) => {
          setUser(data.user);
          setActiveRoleView(data.user.role);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const loginUser = async (credentials) => {
    const data = await api.login(credentials);
    localStorage.setItem('dayflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setActiveRoleView(data.user.role);
    setViewingAsEmployee(null);
    return data;
  };

  const registerUser = async (userData) => {
    return await api.register(userData);
  };

  const verifyEmailCode = async (payload) => {
    const data = await api.verifyEmail(payload);
    localStorage.setItem('dayflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setActiveRoleView(data.user.role);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('dayflow_token');
    setToken(null);
    setUser(null);
    setActiveRoleView(null);
    setViewingAsEmployee(null);
  };

  const reloadUser = async () => {
    if (!token) return;
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch (e) {
      console.error('Failed to reload user profile:', e);
    }
  };

  // Helper for HR to switch views / inspect an employee
  const toggleRoleView = (role) => {
    setActiveRoleView(role);
  };

  const inspectEmployeeView = (employeeProfile) => {
    setViewingAsEmployee(employeeProfile);
    setActiveRoleView('EMPLOYEE');
  };

  const clearEmployeeInspection = () => {
    setViewingAsEmployee(null);
    if (user?.role === 'ADMIN') {
      setActiveRoleView('ADMIN');
    }
  };

  const value = {
    user,
    token,
    role: user?.role,
    activeRoleView: activeRoleView || user?.role,
    viewingAsEmployee,
    loading,
    loginUser,
    registerUser,
    verifyEmailCode,
    logout,
    reloadUser,
    toggleRoleView,
    inspectEmployeeView,
    clearEmployeeInspection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
