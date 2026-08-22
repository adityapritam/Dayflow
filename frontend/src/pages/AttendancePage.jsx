import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/Badge';
import { AttendanceWidget } from '../components/AttendanceWidget';
import { Clock, Calendar, Filter, User, CheckCircle } from 'lucide-react';

export const AttendancePage = () => {
  const { activeRoleView } = useAuth();
  const isAdmin = activeRoleView === 'ADMIN';

  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        let query = '?';
        if (filterDate) query += `date=${filterDate}&`;
        if (filterStatus !== 'ALL') query += `status=${filterStatus}`;
        const data = await api.getAllAttendance(query);
        setAttendances(data.attendances);
      } else {
        const data = await api.getMyAttendance();
        setAttendances(data.attendances);
      }
    } catch (err) {
      console.error('Failed to fetch attendance history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [isAdmin, filterDate, filterStatus]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Attendance Tracker Widget for Employee */}
      {!isAdmin && <AttendanceWidget onStatusChange={fetchAttendance} />}

      {/* Table Header & Controls */}
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
            {isAdmin ? 'Company Attendance Logs' : 'My Attendance History'}
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#565852', marginTop: '0.15rem' }}>
            {isAdmin ? 'Monitor daily check-ins, check-outs, and presence across departments.' : 'Past 60 days of workday timestamps.'}
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={15} color="#888A83" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="form-input"
                style={{ width: '160px', padding: '0.4rem 0.625rem' }}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
              style={{ width: '130px', padding: '0.4rem 0.625rem' }}
            >
              <option value="ALL">All Status</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="LEAVE">On Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              {isAdmin && <th>Employee</th>}
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Total Hours</th>
              <th>Status</th>
              <th>Notes / Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '3rem', color: '#888A83' }}>
                  Loading attendance records...
                </td>
              </tr>
            ) : attendances.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '3rem', color: '#888A83' }}>
                  No attendance records found.
                </td>
              </tr>
            ) : (
              attendances.map((att) => (
                <tr key={att.id}>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={att.employee?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                          alt="Avatar"
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: '#171816' }}>
                            {att.employee?.firstName} {att.employee?.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888A83' }}>
                            {att.employee?.department} ({att.employee?.user?.employeeId})
                          </div>
                        </div>
                      </div>
                    </td>
                  )}

                  <td>
                    <div style={{ fontWeight: '600', color: '#171816' }}>{att.date}</div>
                  </td>

                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: att.checkIn ? '#2D4A3E' : '#888A83', fontWeight: '500' }}>
                      {att.checkIn || '--:--'}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: att.checkOut ? '#2D4A3E' : '#888A83', fontWeight: '500' }}>
                      {att.checkOut || '--:--'}
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#171816' }}>
                      {att.totalHours ? `${att.totalHours} hrs` : '--'}
                    </div>
                  </td>

                  <td>
                    <StatusBadge status={att.status} />
                  </td>

                  <td>
                    <div style={{ fontSize: '0.8125rem', color: '#565852' }}>
                      {att.notes || 'Standard entry'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
