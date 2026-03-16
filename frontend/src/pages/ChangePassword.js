import React, { useState } from 'react';
import { Key, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Modal } from '../components';
import { authService, extractApiErrorMessage } from '../services/api';

function ChangePassword({ isOpen, onClose, onSuccess }) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setOldPass('');
    setNewPass('');
    setConfirmPass('');
    setError('');
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!oldPass || !newPass || !confirmPass) {
      setError('All fields are required');
      return;
    }

    if (newPass.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }

    if (newPass !== confirmPass) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authService.updatePassword({
        old_password: oldPass,
        new_password: newPass,
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => handleClose(), 1500);
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Change Password">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-error" style={{marginBottom: '1rem'}}>
            <AlertCircle size={18} /> {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" style={{marginBottom: '1rem'}}>
            <CheckCircle size={18} /> Password changed successfully!
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            className="form-input"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            disabled={success || loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-input"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            disabled={success || loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            className="form-input"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            disabled={success || loading}
          />
        </div>

        <div style={{display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem'}}>
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={success || loading}>
            {loading ? <><Loader size={18} className="spin" /> Saving...</> : <><Key size={18} /> Change Password</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ChangePassword;
