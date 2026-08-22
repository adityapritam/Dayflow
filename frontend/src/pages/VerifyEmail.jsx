import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';

export const VerifyEmail = ({ email, demoCode, onNavigateLogin }) => {
  const { verifyEmailCode } = useAuth();
  const [code, setCode] = useState(demoCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!code) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      await verifyEmailCode({ email, code });
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: '#EBF2EE',
              color: '#2D4A3E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#171816', letterSpacing: '-0.03em' }}>
            Verify Email Address
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#565852', marginTop: '0.35rem' }}>
            We've generated a verification code for <strong style={{ color: '#171816' }}>{email}</strong>
          </p>
        </div>

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

          {demoCode && (
            <div
              style={{
                backgroundColor: '#FEF3C7',
                border: '1px dashed #FDE68A',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                fontSize: '0.8125rem',
                color: '#92400E',
                marginBottom: '1.25rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                <Sparkles size={14} /> Demo Verification Code
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: '700', color: '#92400E', marginTop: '0.25rem', letterSpacing: '0.2em' }}>
                {demoCode}
              </div>
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label className="form-label">6-Digit Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                className="form-input"
                style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.2em', fontFamily: 'var(--font-mono)' }}
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={onNavigateLogin}
            style={{ color: '#565852', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={16} /> Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
