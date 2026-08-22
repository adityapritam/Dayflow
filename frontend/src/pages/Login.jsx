import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Key, Mail, Sparkles, User, ShieldCheck } from 'lucide-react';

export const Login = ({ onNavigateRegister, onNavigateVerify, onBackToLanding }) => {
  const { loginUser } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please enter your Email or Employee ID and Password.');
      return;
    }

    try {
      setLoading(true);
      await loginUser({ identifier, password });
    } catch (err) {
      if (err.data?.requiresVerification) {
        onNavigateVerify(err.data.email, err.data.demoCode);
        return;
      }
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoIdentifier, demoPassword) => {
    setIdentifier(demoIdentifier);
    setPassword(demoPassword);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FBFBF9',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Banner */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#2D4A3E',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 4px 12px rgba(45, 74, 62, 0.2)',
            }}
          >
            D
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#171816', letterSpacing: '-0.03em' }}>
            Welcome to Dayflow
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#565852', marginTop: '0.35rem' }}>
            Human Capital Management Platform
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E4DD',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)',
          }}
        >
          {error && (
            <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.8125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email or Employee ID</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@dayflow.com or EMP-001"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Mail size={18} color="#888A83" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
                <Key size={18} color="#888A83" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.5rem' }}
            >
              <LogIn size={18} /> {loading ? 'Signing In...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #F5F4EE' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#888A83', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={14} color="#D97706" /> Quick Demo Credentials
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@dayflow.com', 'Password123!')}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#F5F4EE',
                  border: '1px solid #E6E4DD',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: '600', color: '#2D4A3E', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ShieldCheck size={12} /> HR Admin Account
                </div>
                <div style={{ color: '#888A83', fontSize: '0.6875rem', marginTop: '0.1rem' }}>admin@dayflow.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('alex@dayflow.com', 'Password123!')}
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#F5F4EE',
                  border: '1px solid #E6E4DD',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: '600', color: '#171816', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={12} /> Employee Account
                </div>
                <div style={{ color: '#888A83', fontSize: '0.6875rem', marginTop: '0.1rem' }}>alex@dayflow.com</div>
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#565852', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>
            Don't have an employee account?{' '}
            <button
              onClick={onNavigateRegister}
              style={{ color: '#2D4A3E', fontWeight: '600', textDecoration: 'underline' }}
            >
              Create Account
            </button>
          </div>
          {onBackToLanding && (
            <div>
              <button
                onClick={onBackToLanding}
                style={{ color: '#888A83', fontSize: '0.8125rem', fontWeight: '600', marginTop: '0.25rem' }}
              >
                ← Back to Home Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
