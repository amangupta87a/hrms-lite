import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ 
  isOpen, onClose, onConfirm, 
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false
}) {
  const btnClass = isDangerous ? 'btn btn-danger' : 'btn btn-primary';
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </button>
          <button className={btnClass} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Wait...' : confirmText}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {isDangerous && (
          <div style={{ background: '#fee2e2', borderRadius: '50%', padding: '0.75rem', color: '#dc2626' }}>
            <AlertTriangle size={24} />
          </div>
        )}
        <p className="confirm-text">{message}</p>
      </div>
    </Modal>
  );
}
