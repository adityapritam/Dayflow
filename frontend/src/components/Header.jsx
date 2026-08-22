import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Calendar, Search } from 'lucide-react';

export const Header = ({ title, subtitle }) => {
  const { user } = useAuth();
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E6E4DD',
        padding: '1.25rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#171816', letterSpacing: '-0.025em' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.875rem', color: '#565852', marginTop: '0.15rem' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#F5F4EE',
            padding: '0.5rem 0.875rem',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            color: '#565852',
            fontWeight: '500',
          }}
        >
          <Calendar size={15} color="#2D4A3E" />
          <span>{todayStr}</span>
        </div>
      </div>
    </header>
  );
};
