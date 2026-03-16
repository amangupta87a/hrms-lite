import React from 'react';

export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem' }} />
        <p style={{ color: '#64748b' }}>{text}</p>
      </div>
    </div>
  );
}
