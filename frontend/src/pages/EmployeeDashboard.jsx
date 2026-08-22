import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { AttendanceWidget } from '../components/AttendanceWidget';
import { StatusBadge } from '../components/Badge';
import { LeaveModal } from '../components/LeaveModal';
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  Plus,
  Briefcase,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  TrendingUp,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  ListTodo
} from 'lucide-react';

export const EmployeeDashboard = ({ setActiveTab }) => {
  const { user, viewingAsEmployee } = useAuth();
  const profile = viewingAsEmployee || user?.profile;

  const [leaveStats, setLeaveStats] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [payrollInfo, setPayrollInfo] = useState(null);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Today's Interactive Tasks Checklist (stored in localStorage per user)
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(`dayflow_tasks_${profile?.id || 'default'}`);
    return saved ? JSON.parse(saved) : [
      { id: 1, text: 'Review quarterly performance objectives', done: false },
      { id: 2, text: 'Complete mandatory compliance training module', done: true },
      { id: 3, text: 'Submit timesheet approvals for current cycle', done: false },
      { id: 4, text: 'Align with product team on design specs', done: false }
    ];
  });
  const [newTaskText, setNewTaskText] = useState('');

  // Load announcements dynamically from localStorage
  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('dayflow_announcements');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Q3 Health Insurance Enrollment Open', desc: 'HR has updated the medical benefit options. Submit claims by month end.', type: 'info' },
      { id: 2, title: 'Upcoming Public Holiday', desc: 'Labor Day holiday observed on first Monday of next month. Office closed.', type: 'warning' }
    ];
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const leaveRes = await api.getMyLeaves();
      setLeaveStats(leaveRes.stats);
      setRecentLeaves(leaveRes.leaveRequests.slice(0, 3));

      const payRes = await api.getMyPayroll();
      setPayrollInfo(payRes.salaryStructure);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [viewingAsEmployee]);

  useEffect(() => {
    if (profile?.id) {
      localStorage.setItem(`dayflow_tasks_${profile.id}`, JSON.stringify(tasks));
    }
  }, [tasks, profile?.id]);

  const toggleTask = (taskId) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: newTaskText, done: false }]);
    setNewTaskText('');
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const paidUsed = leaveStats ? 15 - leaveStats.paidLeaveRemaining : 0;
  const sickUsed = leaveStats ? 10 - leaveStats.sickLeaveRemaining : 0;
  const paidPercent = Math.min(100, Math.round((paidUsed / 15) * 100));
  const sickPercent = Math.min(100, Math.round((sickUsed / 10) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner / Welcome */}
      <div
        className="dashboard-banner"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
              alt="Avatar"
              style={{ width: '72px', height: '72px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.2)', objectFit: 'cover' }}
            />
            <span style={{ position: 'absolute', bottom: '2px', right: '2px', width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#059669', border: '2px solid #2D4A3E' }} />
          </div>
          <div>
            <div className="dashboard-banner-text-subtle" style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Employee Portal Workspace
            </div>
            <h2 className="dashboard-banner-text-primary" style={{ fontSize: '1.75rem', fontWeight: '700', marginTop: '0.15rem', letterSpacing: '-0.025em' }}>
              Welcome back, {profile?.firstName}!
            </h2>
            <div className="dashboard-banner-text-subtle" style={{ fontSize: '0.875rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: '600' }}>{profile?.jobTitle}</span>
              <span>•</span>
              <span style={{ fontWeight: '500' }}>{profile?.department}</span>
              <span>•</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{user?.employeeId}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setIsLeaveModalOpen(true)} className="btn-primary" style={{ backgroundColor: '#FFFFFF', color: '#2D4A3E', border: '1px solid #FFFFFF' }}>
            <Plus size={16} /> Apply for Leave
          </button>
          <button onClick={() => setActiveTab('profile')} className="btn-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)' }}>
            <User size={16} /> Edit Profile Info
          </button>
        </div>
      </div>

      {/* Main Grid: Attendance & Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Attendance Widget */}
        <AttendanceWidget onStatusChange={loadData} />

        {/* Leave Balance Snapshot Card */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888A83' }}>
                  Time Off Balance
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#171816', marginTop: '0.25rem' }}>
                  Leave Entitlements
                </h3>
              </div>
              <button onClick={() => setActiveTab('leave')} style={{ color: '#2D4A3E', fontSize: '0.8125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                All Requests <ChevronRight size={14} />
              </button>
            </div>

            {/* Leave Balance Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: '600', color: '#171816' }}>Paid Annual Leave</span>
                  <span style={{ color: '#565852' }}>{paidUsed} / 15 Days Used</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F5F4EE', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${paidPercent}%`, height: '100%', backgroundColor: '#2D4A3E', transition: 'width 0.3s ease' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: '600', color: '#171816' }}>Sick Leave</span>
                  <span style={{ color: '#565852' }}>{sickUsed} / 10 Days Used</span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#F5F4EE', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${sickPercent}%`, height: '100%', backgroundColor: '#D97706', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#888A83', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', borderTop: '1px solid #F5F4EE', paddingTop: '0.75rem' }}>
              Recent Applications
            </div>
            {recentLeaves.length === 0 ? (
              <div style={{ fontSize: '0.8125rem', color: '#888A83', fontStyle: 'italic', padding: '0.25rem 0' }}>No leave requests submitted yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {recentLeaves.map((l) => (
                  <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', padding: '0.35rem 0' }}>
                    <div>
                      <span style={{ fontWeight: '600', color: '#171816' }}>{l.leaveType} Leave</span>
                      <span style={{ color: '#888A83', marginLeft: '0.35rem' }}>({l.startDate})</span>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Todo Checklist & Payroll Snapshot */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* Interactive Checklist Widget */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ListTodo size={20} color="#2D4A3E" />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#171816' }}>Today's Action Checklist</h3>
            </div>

            <form onSubmit={addTask} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                placeholder="Add a reminder or task for today..."
                className="form-input"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                Add
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: '200px', overflowY: 'auto' }}>
              {tasks.map((task) => (
                <div key={task.id} className="checklist-item">
                  <div
                    onClick={() => toggleTask(task.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', flex: 1 }}
                  >
                    {task.done ? (
                      <CheckCircle size={18} color="#059669" style={{ flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '18px', height: '18px', border: '2px solid #D5D3CA', borderRadius: '4px', flexShrink: 0 }} />
                    )}
                    <span style={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? '#888A83' : '#171816' }}>
                      {task.text}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    style={{ color: '#DC2626', fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem' }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payroll Card */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888A83' }}>
                  Compensation Overview
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#171816', marginTop: '0.25rem' }}>
                  Monthly Payroll
                </h3>
              </div>
              <button onClick={() => setActiveTab('payroll')} style={{ color: '#2D4A3E', fontSize: '0.8125rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Payroll History <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ backgroundColor: '#EBF2EE', border: '1px solid #C2D6CA', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#2D4A3E', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Estimated Net Monthly Pay</div>
              <div style={{ fontSize: '1.875rem', fontWeight: '700', color: '#2D4A3E', marginTop: '0.25rem' }}>
                ${payrollInfo ? Math.round(payrollInfo.monthlyNet).toLocaleString() : '5,083'}
                <span style={{ fontSize: '0.875rem', color: '#565852', fontWeight: '400' }}> / mo</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center', fontSize: '0.8125rem' }}>
              <div style={{ backgroundColor: '#F7F6F2', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ color: '#888A83', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: '600' }}>Base Pay</div>
                <div style={{ fontWeight: '700', color: '#171816', marginTop: '0.15rem' }}>
                  ${payrollInfo ? Math.round(payrollInfo.monthlyBase).toLocaleString() : '7,916'}
                </div>
              </div>

              <div style={{ backgroundColor: '#F7F6F2', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ color: '#888A83', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: '600' }}>Allowances</div>
                <div style={{ fontWeight: '700', color: '#059669', marginTop: '0.15rem' }}>
                  +${payrollInfo ? Math.round(payrollInfo.monthlyAllowances).toLocaleString() : '416'}
                </div>
              </div>

              <div style={{ backgroundColor: '#F7F6F2', padding: '0.75rem', borderRadius: '8px' }}>
                <div style={{ color: '#888A83', fontSize: '0.6875rem', textTransform: 'uppercase', fontWeight: '600' }}>Deductions</div>
                <div style={{ fontWeight: '700', color: '#DC2626', marginTop: '0.15rem' }}>
                  -${payrollInfo ? Math.round(payrollInfo.monthlyDeductions).toLocaleString() : '333'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div className="dashboard-card">
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888A83' }}>
              Organization News
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#171816', marginTop: '0.25rem' }}>
              Announcements & Alerts
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {announcements.map((a) => (
              <div key={a.id} style={{ backgroundColor: '#F7F6F2', padding: '1.25rem', borderRadius: '10px', display: 'flex', gap: '0.75rem', border: '1px solid #E6E4DD' }}>
                <CheckCircle size={20} color="#2D4A3E" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#171816' }}>{a.title}</div>
                  <div style={{ fontSize: '0.8125rem', color: '#565852', marginTop: '0.25rem', lineHeight: '1.4' }}>{a.desc}</div>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div style={{ padding: '1rem', color: '#888A83', fontSize: '0.875rem', fontStyle: 'italic' }}>
                No active announcements today.
              </div>
            )}
          </div>
        </div>
      </div>

      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
};
