import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      <div className="auth-container">
        <div className="auth-illustration">
          <div className="illustration-content">
            <div className="floating-icons">
              <span className="float-icon i1">🥕</span>
              <span className="float-icon i2">🍎</span>
              <span className="float-icon i3">🥛</span>
              <span className="float-icon i4">🧀</span>
              <span className="float-icon i5">🥚</span>
              <span className="float-icon i6">🍞</span>
            </div>
            <div className="illustration-text">
              <h2>Manage Your Kitchen</h2>
              <p>Track your pantry, reduce food waste, and discover delicious recipes with what you have.</p>
            </div>
            <div className="feature-pills">
              <span className="feature-pill">📦 Track Items</span>
              <span className="feature-pill">⏰ Expiry Alerts</span>
              <span className="feature-pill">🍳 Get Recipes</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-wrapper">
              <span className="auth-logo">🥗</span>
            </div>
            <h1 className="auth-title">Welcome Back!</h1>
            <p className="auth-subtitle">Sign in to manage your pantry</p>
          </div>

          {error && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label className="input-label">
                <span className="label-icon">📧</span>
                Email
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">
                <span className="label-icon">🔒</span>
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="auth-footer">
            <p>Don't have an account?</p>
            <Link to="/register" className="auth-link">
              Create Account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
