import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/Badge';
import { LeaveModal } from '../components/LeaveModal';
import { LeaveApprovalModal } from '../components/LeaveApprovalModal';
import {
  CalendarDays,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';

export const LeavePage = () => {
  const { activeRoleView } = useAuth();
  const isAdmin = activeRoleView === 'ADMIN';

  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedLeaveForApproval, setSelectedLeaveForApproval] = useState(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        let query = '?';
        if (filterStatus !== 'ALL') query += `status=${filterStatus}&`;
        if (filterType !== 'ALL') query += `leaveType=${filterType}`;
        const data = await api.getAllLeaves(query);
        setLeaves(data.leaveRequests);
      } else {
        const data = await api.getMyLeaves();
        setLeaves(data.leaveRequests);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [isAdmin, filterStatus, filterType]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Leave Allowance Header Cards for Employee */}
      {!isAdmin && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E4DD', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#888A83' }}>Paid Annual Leave</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2D4A3E', marginTop: '0.25rem' }}>
              {stats.paidLeaveRemaining} <span style={{ fontSize: '0.875rem', color: '#888A83', fontWeight: '400' }}>/ 15 days</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E4DD', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#888A83' }}>Sick Leave</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#D97706', marginTop: '0.25rem' }}>
              {stats.sickLeaveRemaining} <span style={{ fontSize: '0.875rem', color: '#888A83', fontWeight: '400' }}>/ 10 days</span>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E6E4DD', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#888A83' }}>Pending Requests</div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#171816', marginTop: '0.25rem' }}>
              {stats.totalPending} <span style={{ fontSize: '0.875rem', color: '#888A83', fontWeight: '400' }}>active</span>
            </div>
          </div>
        </div>
      )}

      {/* Header Bar */}
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
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#171816' }}>
            {isAdmin ? 'Company Leave Approvals' : 'My Leave Requests'}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#565852', marginTop: '0.15rem' }}>
            {isAdmin ? 'Review, approve, or reject employee leave applications.' : 'Track status and remarks on your time off applications.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {isAdmin && (
            <>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-select"
                style={{ width: '140px' }}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="form-select"
                style={{ width: '130px' }}
              >
                <option value="ALL">All Types</option>
                <option value="PAID">Paid</option>
                <option value="SICK">Sick</option>
                <option value="UNPAID">Unpaid</option>
              </select>
            </>
          )}

          {!isAdmin && (
            <button onClick={() => setIsApplyModalOpen(true)} className="btn-primary">
              <Plus size={16} /> Apply for Leave
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              {isAdmin && <th>Employee</th>}
              <th>Leave Type</th>
              <th>Date Range</th>
              <th>Duration</th>
              <th>Reason</th>
              <th>Status</th>
              <th>HR Remarks</th>
              {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '3rem', color: '#888A83' }}>
                  Loading leave applications...
                </td>
              </tr>
            ) : leaves.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '3rem', color: '#888A83' }}>
                  No leave requests found.
                </td>
              </tr>
            ) : (
              leaves.map((leave) => (
                <tr key={leave.id}>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={leave.employee?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                          alt="Avatar"
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: '#171816' }}>
                            {leave.employee?.firstName} {leave.employee?.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888A83' }}>
                            {leave.employee?.department} ({leave.employee?.user?.employeeId})
                          </div>
                        </div>
                      </div>
                    </td>
                  )}

                  <td>
                    <span style={{ fontWeight: '600', color: '#171816' }}>{leave.leaveType} Leave</span>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', color: '#171816' }}>
                      {leave.startDate} → {leave.endDate}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#2D4A3E' }}>
                      {leave.totalDays} Day(s)
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', color: '#565852', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {leave.reason}
                    </div>
                  </td>

                  <td>
                    <StatusBadge status={leave.status} />
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', color: '#565852', fontStyle: leave.adminComment ? 'normal' : 'italic' }}>
                      {leave.adminComment || 'No comments'}
                    </div>
                  </td>

                  {isAdmin && (
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedLeaveForApproval(leave);
                          setIsApprovalModalOpen(true);
                        }}
                        className="btn-secondary"
                        style={{ padding: '0.35rem 0.625rem', fontSize: '0.75rem' }}
                      >
                        Review
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <LeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={fetchLeaves}
      />

      <LeaveApprovalModal
        leave={selectedLeaveForApproval}
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setSelectedLeaveForApproval(null);
        }}
        onSuccess={fetchLeaves}
      />
    </div>
  );
};
