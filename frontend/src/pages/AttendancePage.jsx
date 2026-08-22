import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/Badge';
import { AttendanceWidget } from '../components/AttendanceWidget';
import {
  Clock,
  Calendar,
  Filter,
  User,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  CalendarDays
} from 'lucide-react';

export const AttendancePage = () => {
  const { activeRoleView } = useAuth();
  const isAdmin = activeRoleView === 'ADMIN';

  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('daily'); // 'daily' or 'weekly'
  
  // Date states
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Calculates the Monday and Sunday for the week of a given date
  const getWeekRange = (dateStr) => {
    const current = new Date(dateStr);
    const day = current.getDay();
    // Adjust day: Sunday is 0, make it 7 for Mon-Sun week logic
    const dayAdjusted = day === 0 ? 7 : day;
    
    const monday = new Date(current);
    monday.setDate(current.getDate() - dayAdjusted + 1);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      mondayStr: monday.toISOString().split('T')[0],
      sundayStr: sunday.toISOString().split('T')[0],
      mondayDate: monday,
      sundayDate: sunday
    };
  };

  const weekInfo = getWeekRange(selectedDate);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      let query = '?';

      if (viewType === 'daily') {
        query += `date=${selectedDate}&`;
      } else {
        // Weekly View
        query += `startDate=${weekInfo.mondayStr}&endDate=${weekInfo.sundayStr}&`;
      }

      if (filterStatus !== 'ALL') {
        query += `status=${filterStatus}&`;
      }

      if (isAdmin) {
        const data = await api.getAllAttendance(query);
        setAttendances(data.attendances);
      } else {
        const data = await api.getMyAttendance(query);
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
  }, [isAdmin, viewType, selectedDate, filterStatus]);

  // Date handlers for Daily/Weekly navigation
  const shiftDate = (days) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const formatDateLabel = (dateStr) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Attendance Tracker Widget for Employee */}
      {!isAdmin && <AttendanceWidget onStatusChange={fetchAttendance} />}

      {/* Main Container */}
      <div className="dashboard-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header and Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #F5F4EE', paddingBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#171816' }}>
              {isAdmin ? 'Organization Attendance Tracker' : 'My Attendance Dashboard'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#888A83', marginTop: '0.25rem' }}>
              {viewType === 'daily' 
                ? `Showing daily records for ${formatDateLabel(selectedDate)}`
                : `Showing weekly logs from ${formatDateLabel(weekInfo.mondayStr)} to ${formatDateLabel(weekInfo.sundayStr)}`
              }
            </p>
          </div>

          {/* Toggle between Daily and Weekly View */}
          <div style={{ display: 'flex', backgroundColor: '#F5F4EE', padding: '0.25rem', borderRadius: '8px', border: '1px solid #E6E4DD' }}>
            <button
              onClick={() => setViewType('daily')}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: viewType === 'daily' ? '#FFFFFF' : 'transparent',
                color: viewType === 'daily' ? '#2D4A3E' : '#888A83',
                boxShadow: viewType === 'daily' ? 'var(--shadow-sm)' : 'none',
                fontSize: '0.8125rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Calendar size={14} /> Daily View
            </button>
            <button
              onClick={() => setViewType('weekly')}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: viewType === 'weekly' ? '#FFFFFF' : 'transparent',
                color: viewType === 'weekly' ? '#2D4A3E' : '#888A83',
                boxShadow: viewType === 'weekly' ? 'var(--shadow-sm)' : 'none',
                fontSize: '0.8125rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <CalendarDays size={14} /> Weekly View
            </button>
          </div>
        </div>

        {/* Date Navigation & Status Filters Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          
          {/* Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={() => shiftDate(viewType === 'daily' ? -1 : -7)} 
              className="btn-secondary" 
              style={{ padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center' }}
              title={viewType === 'daily' ? 'Previous Day' : 'Previous Week'}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input"
                style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem', width: '135px' }}
              />
              <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#171816' }}>
                {viewType === 'daily' 
                  ? formatDateLabel(selectedDate)
                  : `Week: ${formatDateLabel(weekInfo.mondayStr)} - ${formatDateLabel(weekInfo.sundayStr)}`
                }
              </span>
            </div>

            <button 
              onClick={() => shiftDate(viewType === 'daily' ? 1 : 7)} 
              className="btn-secondary" 
              style={{ padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center' }}
              title={viewType === 'daily' ? 'Next Day' : 'Next Week'}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ListFilter size={15} color="#888A83" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
              style={{ width: '130px', padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="LEAVE">On Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        </div>

        {/* Attendance Results Table */}
        <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
          <table className="custom-table">
            <thead>
              <tr>
                {isAdmin && <th>Employee Details</th>}
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours Logged</th>
                <th>Status</th>
                <th>Remarks / Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '3rem', color: '#888A83' }}>
                    <div style={{ display: 'inline-block', border: '3px solid #E6E4DD', borderTop: '3px solid #2D4A3E', borderRadius: '50%', width: '24px', height: '24px', animation: 'spin 1s linear infinite', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '0.875rem' }}>Loading logs...</div>
                  </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '3rem', color: '#888A83' }}>
                    <Calendar size={32} color="#D5D3CA" style={{ margin: '0 auto 0.5rem auto' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>No attendance logs found for this period.</div>
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
                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E6E4DD' }}
                          />
                          <div>
                            <div style={{ fontWeight: '700', color: '#171816', fontSize: '0.875rem' }}>
                              {att.employee?.firstName} {att.employee?.lastName}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#888A83' }}>
                              {att.employee?.department} • {att.employee?.user?.employeeId}
                            </div>
                          </div>
                        </div>
                      </td>
                    )}

                    <td>
                      <div style={{ fontWeight: '600', color: '#171816', fontSize: '0.8125rem' }}>
                        {formatDateLabel(att.date)}
                      </div>
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
                      <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#171816' }}>
                        {att.totalHours ? `${att.totalHours} hrs` : '--'}
                      </div>
                    </td>

                    <td>
                      <StatusBadge status={att.status} />
                    </td>

                    <td>
                      <div style={{ fontSize: '0.8125rem', color: '#565852', fontStyle: att.notes ? 'normal' : 'italic' }}>
                        {att.notes || 'No remarks'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
