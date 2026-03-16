import React, { useState, useEffect } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import { authService, extractApiErrorMessage } from '../services/api';

function Login({ onLogin }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoCreds, setDemoCreds] = useState({ user_id: '...', password: '...' });

  useEffect(() => {
    authService.fetchCurrentCredentials()
      .then((data) => setDemoCreds(data))
      .catch(() => setDemoCreds({ user_id: 'admin', password: 'admin123' }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId.trim() || !password.trim()) {
      setError('Please enter both ID and password');
      return;
    }

    try {
      setLoading(true);
      await authService.performLogin({ user_id: userId, password });
      onLogin();
    } catch (err) {
      setError(extractApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>HRMS Lite</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">User ID</label>
            <input
              type="text"
              className="form-input"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your ID"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input">
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={loading}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <><Loader size={18} className="spin" /> Signing in...</> : <><LogIn size={18} /> Sign In</>}
          </button>
        </form>

        {/* demo credentials from backend */}
        <div className="demo-creds">
          <p><strong>Demo Credentials:</strong></p>
          <p>User ID: <code>{demoCreds.user_id}</code></p>
          <p>Password: <code>{demoCreds.password}</code></p>
        </div>
      </div>
    </div>
  );
}

export default Login;
