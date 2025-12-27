import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      await register(name, email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && name && email) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const steps = [
    { number: 1, label: 'Personal Info' },
    { number: 2, label: 'Security' }
  ];

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1"></div>
        <div className="auth-blob auth-blob-2"></div>
        <div className="auth-blob auth-blob-3"></div>
        <div className="auth-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="auth-particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}></div>
          ))}
        </div>
      </div>

      <div className="auth-container">
        {/* Left Side - Benefits */}
        <div className="auth-benefits">
          <div className="auth-benefits-content">
            <div className="auth-brand">
              <span className="auth-brand-icon">🥗</span>
              <span className="auth-brand-name">PantryPal</span>
            </div>
            
            <h2 className="auth-benefits-title">
              Join thousands of smart home cooks
            </h2>
            <p className="auth-benefits-subtitle">
              Take control of your kitchen and never waste food again
            </p>

            <div className="auth-stats">
              <div className="auth-stat">
                <span className="auth-stat-number">50K+</span>
                <span className="auth-stat-label">Active Users</span>
              </div>
              <div className="auth-stat">
                <span className="auth-stat-number">2M+</span>
                <span className="auth-stat-label">Items Tracked</span>
              </div>
              <div className="auth-stat">
                <span className="auth-stat-number">30%</span>
                <span className="auth-stat-label">Less Food Waste</span>
              </div>
            </div>

            <div className="auth-testimonial">
              <div className="auth-testimonial-content">
                <p>"PantryPal completely changed how I manage my kitchen. I save money and eat better!"</p>
              </div>
              <div className="auth-testimonial-author">
                <div className="auth-testimonial-avatar">👩‍🍳</div>
                <div className="auth-testimonial-info">
                  <span className="auth-testimonial-name">Sarah Johnson</span>
                  <span className="auth-testimonial-role">Home Chef</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-section">
          <div className="auth-card">
            <div className="auth-header">
              <h1 className="auth-title">Create your account</h1>
              <p className="auth-subtitle">Start your journey to a smarter kitchen</p>
            </div>

            {/* Progress Steps */}
            <div className="auth-steps">
              {steps.map((s, index) => (
                <React.Fragment key={s.number}>
                  <div className={`auth-step ${step >= s.number ? 'active' : ''} ${step > s.number ? 'completed' : ''}`}>
                    <div className="auth-step-number">
                      {step > s.number ? '✓' : s.number}
                    </div>
                    <span className="auth-step-label">{s.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`auth-step-line ${step > s.number ? 'active' : ''}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {error && (
              <div className="auth-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Info */}
              <div className={`auth-form-step ${step === 1 ? 'active' : ''}`}>
                <div className="auth-input-group">
                  <div className="auth-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="name"
                    className="auth-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="name" className="auth-label">Full Name</label>
                </div>

                <div className="auth-input-group">
                  <div className="auth-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="email" className="auth-label">Email Address</label>
                </div>

                <button 
                  type="button" 
                  className="auth-btn auth-btn-primary"
                  onClick={nextStep}
                  disabled={!name || !email}
                >
                  Continue
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>

              {/* Step 2: Security */}
              <div className={`auth-form-step ${step === 2 ? 'active' : ''}`}>
                <div className="auth-input-group">
                  <div className="auth-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="password" className="auth-label">Password</label>
                </div>

                <div className="auth-password-strength">
                  <div className="auth-strength-bars">
                    <div className={`auth-strength-bar ${password.length >= 1 ? 'active' : ''}`}></div>
                    <div className={`auth-strength-bar ${password.length >= 4 ? 'active' : ''}`}></div>
                    <div className={`auth-strength-bar ${password.length >= 6 ? 'active' : ''}`}></div>
                    <div className={`auth-strength-bar ${password.length >= 8 && /[A-Z]/.test(password) ? 'active strong' : ''}`}></div>
                  </div>
                  <span className="auth-strength-text">
                    {password.length === 0 ? '' : 
                     password.length < 4 ? 'Weak' : 
                     password.length < 6 ? 'Fair' : 
                     password.length < 8 ? 'Good' : 'Strong'}
                  </span>
                </div>

                <div className="auth-input-group">
                  <div className="auth-input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="auth-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="confirmPassword" className="auth-label">Confirm Password</label>
                  {confirmPassword && (
                    <div className={`auth-match-indicator ${password === confirmPassword ? 'match' : 'no-match'}`}>
                      {password === confirmPassword ? '✓' : '✗'}
                    </div>
                  )}
                </div>

                <div className="auth-btn-group">
                  <button 
                    type="button" 
                    className="auth-btn auth-btn-secondary"
                    onClick={prevStep}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="19" y1="12" x2="5" y2="12"/>
                      <polyline points="12 19 5 12 12 5"/>
                    </svg>
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="auth-btn auth-btn-primary"
                    disabled={loading || password !== confirmPassword || password.length < 6}
                  >
                    {loading ? (
                      <>
                        <span className="auth-spinner"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            <div className="auth-terms">
              By creating an account, you agree to our{' '}
              <a href="#terms">Terms of Service</a> and{' '}
              <a href="#privacy">Privacy Policy</a>
            </div>

            <div className="auth-divider">
              <span>or continue with</span>
            </div>

            <div className="auth-social">
              <button className="auth-social-btn google">
                <svg viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button className="auth-social-btn apple">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>
            </div>

            <p className="auth-footer">
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
