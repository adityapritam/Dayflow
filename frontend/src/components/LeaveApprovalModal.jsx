import React, { useState } from 'react';
import { api } from '../api/client';
import { X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { StatusBadge } from './Badge';

export const LeaveApprovalModal = ({ leave, isOpen, onClose, onSuccess }) => {
  const [adminComment, setAdminComment] = useState(leave?.adminComment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !leave) return null;

  const handleAction = async (status) => {
    try {
      setLoading(true);
      setError('');
      await api.updateLeaveStatus(leave.id, {
        status,
        adminComment,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update leave status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E6E4DD', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#171816' }}>Review Leave Request</h3>
          <button onClick={onClose} style={{ color: '#888A83' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.625rem 0.875rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div style={{ backgroundColor: '#F7F6F2', padding: '1rem 1.25rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: '#171816' }}>
                  {leave.employee?.firstName} {leave.employee?.lastName}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#565852' }}>
                  {leave.employee?.jobTitle} • {leave.employee?.department} ({leave.employee?.user?.employeeId})
                </div>
              </div>
              <StatusBadge status={leave.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem', paddingTop: '0.75rem', borderTop: '1px solid #E6E4DD' }}>
              <div>
                <div style={{ color: '#888A83', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Leave Type</div>
                <div style={{ fontWeight: '600', color: '#171816' }}>{leave.leaveType}</div>
              </div>
              <div>
                <div style={{ color: '#888A83', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Dates</div>
                <div style={{ fontWeight: '600', color: '#171816' }}>{leave.startDate} → {leave.endDate}</div>
              </div>
              <div>
                <div style={{ color: '#888A83', fontSize: '0.6875rem', textTransform: 'uppercase' }}>Duration</div>
                <div style={{ fontWeight: '600', color: '#171816' }}>{leave.totalDays} Days</div>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: '#565852', paddingTop: '0.75rem', borderTop: '1px solid #E6E4DD' }}>
              <div style={{ color: '#888A83', fontSize: '0.6875rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Reason</div>
              <div>"{leave.reason}"</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">HR Admin Remarks / Comment</label>
            <textarea
              rows={3}
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Add feedback or notes for the employee..."
              className="form-textarea"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleAction('REJECTED')}
              disabled={loading}
              className="btn-danger"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <XCircle size={16} /> Reject
            </button>

            <button
              type="button"
              onClick={() => handleAction('APPROVED')}
              disabled={loading}
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <CheckCircle2 size={16} /> Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
