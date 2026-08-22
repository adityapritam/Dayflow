import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toUpperCase();

  const styles = {
    PRESENT: { bg: '#EBF2EE', color: '#2D4A3E', border: '#C2D6CA', label: 'Present' },
    ACTIVE: { bg: '#EBF2EE', color: '#2D4A3E', border: '#C2D6CA', label: 'Active' },
    APPROVED: { bg: '#EBF2EE', color: '#2D4A3E', border: '#C2D6CA', label: 'Approved' },
    PAID: { bg: '#EBF2EE', color: '#2D4A3E', border: '#C2D6CA', label: 'Paid' },

    PENDING: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A', label: 'Pending' },
    HALF_DAY: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A', label: 'Half Day' },
    PROCESSING: { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A', label: 'Processing' },

    ABSENT: { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', label: 'Absent' },
    REJECTED: { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', label: 'Rejected' },
    INACTIVE: { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', label: 'Inactive' },

    LEAVE: { bg: '#E0F2FE', color: '#075985', border: '#BAE6FD', label: 'On Leave' },
  };

  const style = styles[normalized] || { bg: '#F3F4F6', color: '#374151', border: '#E5E7EB', label: status };

  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        padding: '0.2rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        letterSpacing: '0.02em',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.color,
        }}
      />
      {style.label}
    </span>
  );
};
