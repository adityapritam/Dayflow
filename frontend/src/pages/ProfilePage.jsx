import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { User, Phone, MapPin, Briefcase, DollarSign, FileText, Edit2, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { user, viewingAsEmployee, reloadUser } = useAuth();
  const profile = viewingAsEmployee || user?.profile;
  const isSelf = !viewingAsEmployee;

  const [isEditing, setIsEditing] = useState(false);
  const [phoneInput, setPhoneInput] = useState(profile?.phone || '');
  const [addressInput, setAddressInput] = useState(profile?.address || '');
  const [avatarUrlInput, setAvatarUrlInput] = useState(profile?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setMsg('');

      await api.updateEmployee(profile.id, {
        phone: phoneInput,
        address: addressInput,
        avatarUrl: avatarUrlInput,
      });

      setMsg('Profile contact details updated successfully!');
      setIsEditing(false);
      await reloadUser();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E6E4DD',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img
            src={profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
            alt="Avatar"
            style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid #2D4A3E', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: '0.8125rem', color: '#888A83', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Employee Record
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#171816', marginTop: '0.15rem' }}>
              {profile?.firstName} {profile?.lastName}
            </h2>
            <div style={{ fontSize: '0.875rem', color: '#565852', marginTop: '0.25rem' }}>
              {profile?.jobTitle} • <span style={{ color: '#2D4A3E', fontWeight: '600' }}>{profile?.department}</span> ({user?.employeeId})
            </div>
          </div>
        </div>

        {isSelf && !isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-primary">
            <Edit2 size={16} /> Edit Contact Info
          </button>
        )}
      </div>

      {msg && (
        <div style={{ backgroundColor: '#EBF2EE', border: '1px solid #C2D6CA', color: '#2D4A3E', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {msg}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Profile Details Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Editable Personal & Contact Details */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E4DD',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <User size={20} color="#2D4A3E" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#171816' }}>
              Personal & Contact Information
            </h3>
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Phone Number (Editable)</label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address (Editable)</label>
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Image URL (Editable)</label>
                <input
                  type="text"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  className="form-input"
                  placeholder="https://..."
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  <Save size={16} /> Save Contact
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <div style={{ color: '#888A83', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Phone Number</div>
                <div style={{ color: '#171816', fontWeight: '600', marginTop: '0.15rem' }}>{profile?.phone || 'Not provided'}</div>
              </div>

              <div>
                <div style={{ color: '#888A83', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Residential Address</div>
                <div style={{ color: '#171816', fontWeight: '600', marginTop: '0.15rem' }}>{profile?.address || 'Not provided'}</div>
              </div>

              <div>
                <div style={{ color: '#888A83', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Email Address</div>
                <div style={{ color: '#171816', fontWeight: '600', marginTop: '0.15rem' }}>{user?.email}</div>
              </div>
            </div>
          )}
        </div>

        {/* Read-Only Job & Employment Details */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E4DD',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Briefcase size={20} color="#2D4A3E" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#171816' }}>
              Job & Organization Details
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <div style={{ color: '#888A83', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Job Title</div>
              <div style={{ color: '#171816', fontWeight: '600', marginTop: '0.15rem' }}>{profile?.jobTitle}</div>
            </div>

            <div>
              <div style={{ color: '#888A83', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Department</div>
              <div style={{ color: '#2D4A3E', fontWeight: '700', marginTop: '0.15rem' }}>{profile?.department}</div>
            </div>

            <div>
              <div style={{ color: '#888A83', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Employee ID</div>
              <div style={{ color: '#171816', fontWeight: '600', fontFamily: 'var(--font-mono)', marginTop: '0.15rem' }}>{user?.employeeId}</div>
            </div>

            <div>
              <div style={{ color: '#888A83', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600' }}>Date Joined</div>
              <div style={{ color: '#171816', fontWeight: '600', marginTop: '0.15rem' }}>{profile?.joinDate}</div>
            </div>
          </div>
        </div>

        {/* Read-Only Salary Structure */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <DollarSign size={20} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Salary & Benefits Summary
            </h3>
          </div>

          <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Annual Base Salary</span>
              <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>${profile?.baseSalary?.toLocaleString() || 0}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Annual Allowances</span>
              <span style={{ fontWeight: '700', color: '#059669' }}>+${profile?.allowances?.toLocaleString() || 0}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tax & Deductions</span>
              <span style={{ fontWeight: '700', color: '#DC2626' }}>-${profile?.deductions?.toLocaleString() || 0}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '1rem' }}>
              <span style={{ color: 'var(--color-primary)' }}>Net Annual Total</span>
              <span style={{ color: 'var(--color-primary)' }}>${profile?.netSalary?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
