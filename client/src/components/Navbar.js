import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from './Notifications';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/pantry', label: 'Pantry', icon: '🏪' },
    { path: '/recipes', label: 'Recipes', icon: '📖' },
    { path: '/shopping', label: 'Shopping', icon: '🛒' },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo-wrapper">
            <span className="navbar-logo">🥗</span>
          </div>
          <div className="navbar-brand-text">
            <span className="navbar-title">PantryPal</span>
            <span className="navbar-tagline">Smart Kitchen</span>
          </div>
        </Link>

        <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${isActive(link.path) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="navbar-link-icon">{link.icon}</span>
              <span className="navbar-link-text">{link.label}</span>
              {isActive(link.path) && <span className="navbar-link-indicator" />}
            </Link>
          ))}
        </div>

        <div className="navbar-user">
          <Notifications />
          <div className="navbar-user-info">
            <div className="navbar-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="navbar-user-details">
              <span className="navbar-user-name">{user?.name?.split(' ')[0]}</span>
              <span className="navbar-user-email">{user?.email}</span>
            </div>
          </div>
          <button onClick={logout} className="btn btn-ghost btn-sm navbar-logout">
            <span>Logout</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        <button 
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
