import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="alert alert-error">
      <AlertCircle size={20} />
      <span>{message}</span>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
          Retry
        </button>
      )}
    </div>
  );
}
