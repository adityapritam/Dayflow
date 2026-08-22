import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { StatusBadge } from '../components/Badge';
import { LeaveApprovalModal } from '../components/LeaveApprovalModal';
import {
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  UserPlus,
  Shield,
  Send,
  X,
  Volume2
} from 'lucide-react';

export const AdminDashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // HR Announcements Manager (shared via localStorage with Employee Dashboard)
  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('dayflow_announcements');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Q3 Health Insurance Enrollment Open', desc: 'HR has updated the medical benefit options. Submit claims by month end.', type: 'info' },
      { id: 2, title: 'Upcoming Public Holiday', desc: 'Labor Day holiday observed on first Monday of next month. Office closed.', type: 'warning' }
    ];
  });
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementDesc, setAnnouncementDesc] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminStats();
      setStats(data.stats);
      setRecentActivity(data.recentActivity);

      const leaveRes = await api.getAllLeaves('?status=PENDING');
      setPendingLeaves(leaveRes.leaveRequests);
    } catch (err) {
      console.error('Failed to load HR dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    localStorage.setItem('dayflow_announcements', JSON.stringify(announcements));
  }, [announcements]);

  const postAnnouncement = (e) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementDesc.trim()) return;

    const newAnnouncement = {
      id: Date.now(),
      title: announcementTitle,
      desc: announcementDesc,
      type: 'info'
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    // Also save to 'dayflow_announcements' for the employee side sync
    localStorage.setItem('dayflow_announcements', JSON.stringify([newAnnouncement, ...announcements]));

    setAnnouncementTitle('');
    setAnnouncementDesc('');
    setSuccessMsg('Announcement published successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const deleteAnnouncement = (id) => {
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    localStorage.setItem('dayflow_announcements', JSON.stringify(updated));
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
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <div style={{ fontSize: '0.8125rem', color: '#2D4A3E', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Shield size={14} /> HR Director Overview
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#171816', marginTop: '0.2rem', letterSpacing: '-0.025em' }}>
            Organization Dashboard
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#565852', marginTop: '0.25rem' }}>
            Real-time workforce intelligence, attendance metrics, and pending approvals.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setActiveTab('employees')} className="btn-primary">
            <UserPlus size={16} /> Manage Employees
          </button>
          <button onClick={() => setActiveTab('leave-approvals')} className="btn-secondary">
            <CalendarDays size={16} /> Review Leave Requests
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {/* Total Staff */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E4DD',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#888A83', letterSpacing: '0.04em' }}>Total Workforce</span>
            <div style={{ backgroundColor: '#EBF2EE', color: '#2D4A3E', padding: '0.5rem', borderRadius: '8px' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#171816' }}>
            {stats?.totalEmployees ?? 5}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600', marginTop: '0.25rem' }}>
            Active Personnel
          </div>
        </div>

        {/* Today's Attendance Rate */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E4DD',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#888A83', letterSpacing: '0.04em' }}>Today's Attendance</span>
            <div style={{ backgroundColor: '#EBF2EE', color: '#2D4A3E', padding: '0.5rem', borderRadius: '8px' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#171816' }}>
            {stats?.todayAttendance?.present ?? 0} <span style={{ fontSize: '1rem', color: '#888A83', fontWeight: '400' }}>/ {stats?.totalEmployees ?? 5}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#565852', marginTop: '0.25rem' }}>
            {stats?.todayAttendance?.attendanceRate ?? 100}% Attendance Rate
          </div>
        </div>

        {/* Pending Leaves */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E4DD',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#888A83', letterSpacing: '0.04em' }}>Pending Approvals</span>
            <div style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.5rem', borderRadius: '8px' }}>
              <CalendarDays size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#D97706' }}>
            {stats?.pendingLeavesCount ?? pendingLeaves.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888A83', marginTop: '0.25rem' }}>
            Action Required
          </div>
        </div>

        {/* Monthly Payroll Total */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E4DD',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#888A83', letterSpacing: '0.04em' }}>Monthly Payroll</span>
            <div style={{ backgroundColor: '#EBF2EE', color: '#2D4A3E', padding: '0.5rem', borderRadius: '8px' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#171816' }}>
            ${stats?.monthlyPayrollTotal ? stats.monthlyPayrollTotal.toLocaleString() : '40,625'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#565852', marginTop: '0.25rem' }}>
            Est. Net Disbursements
          </div>
        </div>
      </div>

      {/* Attendance Stats bar & Announcements Broadcaster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Today's Attendance breakdown bar chart */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E4DD',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888A83' }}>
                Presence Status
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#171816', marginTop: '0.25rem' }}>
                Today's Attendance Breakdown
              </h3>
            </div>

            {stats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: '600', color: '#171816' }}>Checked In / Active</span>
                    <span style={{ color: '#059669', fontWeight: '700' }}>{stats.todayAttendance?.present} Employees</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#F5F4EE', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${stats.todayAttendance?.attendanceRate}%`, height: '100%', backgroundColor: '#059669' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: '600', color: '#171816' }}>On Approved Leave</span>
                    <span style={{ color: '#075985', fontWeight: '700' }}>{stats.todayAttendance?.onLeave} Employees</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#F5F4EE', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${stats.totalEmployees > 0 ? (stats.todayAttendance?.onLeave / stats.totalEmployees) * 100 : 0}%`, height: '100%', backgroundColor: '#075985' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: '600', color: '#171816' }}>Absent</span>
                    <span style={{ color: '#DC2626', fontWeight: '700' }}>{stats.todayAttendance?.absent} Employees</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#F5F4EE', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${stats.totalEmployees > 0 ? (stats.todayAttendance?.absent / stats.totalEmployees) * 100 : 0}%`, height: '100%', backgroundColor: '#DC2626' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* HR Announcements Publisher */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E4DD',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Volume2 size={20} color="#2D4A3E" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#171816' }}>Announcements Broadcaster</h3>
            </div>

            {successMsg && (
              <div style={{ backgroundColor: '#EBF2EE', border: '1px solid #C2D6CA', color: '#2D4A3E', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>
                {successMsg}
              </div>
            )}

            <form onSubmit={postAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Announcement Title..."
                className="form-input"
                style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                required
              />
              <textarea
                value={announcementDesc}
                onChange={(e) => setAnnouncementDesc(e.target.value)}
                placeholder="Enter details / guidelines for staff..."
                className="form-textarea"
                style={{ fontSize: '0.875rem', padding: '0.5rem' }}
                rows={2}
                required
              />
              <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-end', padding: '0.5rem 1rem' }}>
                <Send size={14} /> Publish Announcement
              </button>
            </form>
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px solid #F5F4EE', paddingTop: '0.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#888A83', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Broadcasts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
              {announcements.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', backgroundColor: '#F7F6F2', padding: '0.35rem 0.5rem', borderRadius: '6px' }}>
                  <span style={{ fontWeight: '600', color: '#171816', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{a.title}</span>
                  <button onClick={() => deleteAnnouncement(a.id)} style={{ color: '#DC2626' }}><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Action Queue & Activity Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Pending Leave Requests Queue */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E4DD',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888A83' }}>
                HR Action Items
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#171816', marginTop: '0.25rem' }}>
                Pending Leave Requests
              </h3>
            </div>
            <button onClick={() => setActiveTab('leave-approvals')} style={{ color: '#2D4A3E', fontSize: '0.8125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View Queue <ChevronRight size={14} />
            </button>
          </div>

          {pendingLeaves.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#F7F6F2', borderRadius: '10px', color: '#888A83', fontSize: '0.875rem' }}>
              <CheckCircle2 size={32} color="#059669" style={{ margin: '0 auto 0.5rem auto' }} />
              All clear! No pending leave requests to review.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  style={{
                    backgroundColor: '#F7F6F2',
                    border: '1px solid #E6E4DD',
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <img
                      src={leave.employee?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                      alt="Avatar"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#171816' }}>
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#565852' }}>
                        {leave.leaveType} Leave • {leave.totalDays} Days ({leave.startDate})
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedLeave(leave);
                      setIsApprovalOpen(true);
                    }}
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Activity Trail */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6E4DD',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888A83' }}>
              Audit Stream
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#171816', marginTop: '0.25rem' }}>
              Recent System Activity
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '340px', overflowY: 'auto' }}>
            {recentActivity.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: '#888A83', fontStyle: 'italic' }}>No audit logs recorded yet.</div>
            ) : (
              recentActivity.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: '#F7F6F2',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#171816' }}>
                      {log.action.replace('_', ' ')}
                    </div>
                    <div style={{ color: '#565852', marginTop: '0.1rem', fontSize: '0.75rem' }}>
                      {log.details}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#888A83', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <LeaveApprovalModal
        leave={selectedLeave}
        isOpen={isApprovalOpen}
        onClose={() => {
          setIsApprovalOpen(false);
          setSelectedLeave(null);
        }}
        onSuccess={loadAdminData}
      />
    </div>
  );
};
