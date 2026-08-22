import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { LogIn, LogOut, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { StatusBadge } from './Badge';

export const AttendanceWidget = ({ onStatusChange }) => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchToday = async () => {
    try {
      setLoading(true);
      const data = await api.getTodayAttendance();
      setAttendance(data.attendance);
    } catch (err) {
      console.error('Failed to load today attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      const data = await api.checkIn();
      setAttendance(data.attendance);
      setSuccessMsg('Checked in successfully!');
      if (onStatusChange) onStatusChange();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setErrorMsg('');
      const data = await api.checkOut();
      setAttendance(data.attendance);
      setSuccessMsg('Checked out successfully! Great work today.');
      if (onStatusChange) onStatusChange();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const isCheckedIn = !!attendance?.checkIn;
  const isCheckedOut = !!attendance?.checkOut;

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E6E4DD',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888A83' }}>
            Daily Workday Tracker
          </span>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#171816', marginTop: '0.25rem' }}>
            Attendance Status
          </h3>
        </div>
        {attendance ? <StatusBadge status={attendance.status} /> : <span style={{ fontSize: '0.8125rem', color: '#888A83' }}>Not Checked In</span>}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1rem',
          backgroundColor: '#F7F6F2',
          padding: '1.25rem',
          borderRadius: '10px',
          marginBottom: '1.25rem',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: '#565852', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
            <Clock size={14} color="#2D4A3E" /> Current Time
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: '700', color: '#171816' }}>
            {formattedTime}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#888A83', marginTop: '0.15rem' }}>{formattedDate}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: '#565852', marginBottom: '0.25rem' }}>Check In</div>
          <div style={{ fontSize: '1rem', fontWeight: '600', color: isCheckedIn ? '#2D4A3E' : '#888A83' }}>
            {attendance?.checkIn || '--:--'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: '#565852', marginBottom: '0.25rem' }}>Check Out</div>
          <div style={{ fontSize: '1rem', fontWeight: '600', color: isCheckedOut ? '#2D4A3E' : '#888A83' }}>
            {attendance?.checkOut || '--:--'}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: '#565852', marginBottom: '0.25rem' }}>Hours Worked</div>
          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#171816' }}>
            {attendance?.totalHours ? `${attendance.totalHours} hrs` : '--'}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.625rem 0.875rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: '#EBF2EE', border: '1px solid #C2D6CA', color: '#2D4A3E', padding: '0.625rem 0.875rem', borderRadius: '8px', fontSize: '0.8125rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={handleCheckIn}
          disabled={isCheckedIn || actionLoading || loading}
          className="btn-primary"
          style={{
            flex: 1,
            justifyContent: 'center',
            opacity: isCheckedIn ? 0.5 : 1,
            cursor: isCheckedIn ? 'not-allowed' : 'pointer',
          }}
        >
          <LogIn size={16} /> {isCheckedIn ? 'Checked In' : 'Check In Now'}
        </button>

        <button
          onClick={handleCheckOut}
          disabled={!isCheckedIn || isCheckedOut || actionLoading || loading}
          className="btn-secondary"
          style={{
            flex: 1,
            justifyContent: 'center',
            opacity: !isCheckedIn || isCheckedOut ? 0.5 : 1,
            cursor: !isCheckedIn || isCheckedOut ? 'not-allowed' : 'pointer',
          }}
        >
          <LogOut size={16} /> {isCheckedOut ? 'Checked Out' : 'Check Out'}
        </button>
      </div>
    </div>
  );
};
