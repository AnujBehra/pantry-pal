import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalItems: 0,
    expiringItems: [],
    recentItems: [],
    categories: {},
  });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [pantryRes, expiringRes] = await Promise.all([
        api.get('/pantry'),
        api.get('/pantry/expiring'),
      ]);

      // Count items by category
      const categories = pantryRes.data.reduce((acc, item) => {
        const cat = item.category_name || 'Other';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalItems: pantryRes.data.length,
        expiringItems: expiringRes.data,
        recentItems: pantryRes.data.slice(0, 5),
        categories,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (date) => {
    return differenceInDays(new Date(date), new Date());
  };

  const getExpiryClass = (days) => {
    if (days <= 1) return 'critical';
    if (days <= 3) return 'warning';
    return 'soon';
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <span className="loading-icon">🥗</span>
          </div>
          <h2 className="loading-text">Loading your kitchen...</h2>
          <div className="loading-bar">
            <div className="loading-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-background">
          <div className="hero-shape shape-1"></div>
          <div className="hero-shape shape-2"></div>
          <div className="hero-shape shape-3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-greeting">{greeting}</p>
            <h1 className="hero-title">
              {user?.name?.split(' ')[0]} <span className="wave">👋</span>
            </h1>
            <p className="hero-subtitle">
              Let's see what's cooking in your pantry today
            </p>
          </div>
          <div className="hero-actions">
            <Link to="/pantry" className="btn btn-primary btn-lg hero-btn">
              <span>➕</span> Add Items
            </Link>
            <Link to="/recipes" className="btn btn-secondary btn-lg hero-btn">
              <span>🍳</span> Find Recipes
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card glass animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="stat-icon-wrapper gradient-primary">
              <span className="stat-icon">📦</span>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalItems}</span>
              <span className="stat-label">Total Items</span>
            </div>
            <div className="stat-trend positive">
              <span>↗</span> In stock
            </div>
          </div>

          <div className="stat-card glass animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="stat-icon-wrapper gradient-warning">
              <span className="stat-icon">⏰</span>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.expiringItems.length}</span>
              <span className="stat-label">Expiring Soon</span>
            </div>
            <div className="stat-trend warning">
              <span>⚠️</span> Needs attention
            </div>
          </div>

          <div className="stat-card glass animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="stat-icon-wrapper gradient-secondary">
              <span className="stat-icon">📊</span>
            </div>
            <div className="stat-content">
              <span className="stat-value">{Object.keys(stats.categories).length}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="stat-trend neutral">
              <span>📁</span> Organized
            </div>
          </div>

          <div className="stat-card glass animate-slide-up action-card-highlight" style={{animationDelay: '0.4s'}}>
            <Link to="/recipes" className="stat-action-link">
              <div className="stat-icon-wrapper gradient-accent">
                <span className="stat-icon">🍲</span>
              </div>
              <div className="stat-content">
                <span className="stat-value">Find</span>
                <span className="stat-label">Recipe Suggestions</span>
              </div>
              <div className="stat-arrow">→</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Expiring Items */}
        {stats.expiringItems.length > 0 && (
          <div className="dashboard-card expiring-card animate-slide-up" style={{animationDelay: '0.5s'}}>
            <div className="card-header">
              <div className="card-title-wrapper">
                <span className="card-icon">⚠️</span>
                <h2 className="card-title">Expiring Soon</h2>
              </div>
              <Link to="/pantry" className="card-link">
                View All <span>→</span>
              </Link>
            </div>
            <div className="expiring-list">
              {stats.expiringItems.slice(0, 5).map((item, index) => {
                const days = getDaysUntilExpiry(item.expiry_date);
                return (
                  <div 
                    key={item.id} 
                    className={`expiring-item ${getExpiryClass(days)}`}
                    style={{animationDelay: `${0.1 * index}s`}}
                  >
                    <div className="expiring-item-left">
                      <span className="expiring-emoji">{item.category_icon || '📦'}</span>
                      <div className="expiring-details">
                        <span className="expiring-name">{item.name}</span>
                        <span className="expiring-meta">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    </div>
                    <div className="expiring-item-right">
                      <span className={`expiry-badge ${getExpiryClass(days)}`}>
                        {days <= 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `${days} days`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Items */}
        <div className="dashboard-card recent-card animate-slide-up" style={{animationDelay: '0.6s'}}>
          <div className="card-header">
            <div className="card-title-wrapper">
              <span className="card-icon">📋</span>
              <h2 className="card-title">Recent Items</h2>
            </div>
            <Link to="/pantry" className="card-link">
              Manage Pantry <span>→</span>
            </Link>
          </div>
          {stats.recentItems.length > 0 ? (
            <div className="recent-list">
              {stats.recentItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="recent-item"
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <span className="recent-emoji">{item.category_icon || '📦'}</span>
                  <div className="recent-details">
                    <span className="recent-name">{item.name}</span>
                    <span className="recent-category">{item.category_name || 'Uncategorized'}</span>
                  </div>
                  <span className="recent-quantity">
                    {item.quantity} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-illustration">
                <span className="empty-emoji">🏪</span>
                <div className="empty-circles">
                  <div className="empty-circle c1"></div>
                  <div className="empty-circle c2"></div>
                  <div className="empty-circle c3"></div>
                </div>
              </div>
              <h3>Your pantry is empty</h3>
              <p>Start by adding some items to track what you have</p>
              <Link to="/pantry" className="btn btn-primary">
                <span>➕</span> Add Your First Item
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card actions-card animate-slide-up" style={{animationDelay: '0.7s'}}>
          <div className="card-header">
            <div className="card-title-wrapper">
              <span className="card-icon">⚡</span>
              <h2 className="card-title">Quick Actions</h2>
            </div>
          </div>
          <div className="quick-actions-grid">
            <Link to="/pantry" className="quick-action-card">
              <div className="quick-action-icon gradient-primary">
                <span>➕</span>
              </div>
              <span className="quick-action-label">Add Item</span>
              <span className="quick-action-desc">Add new pantry items</span>
            </Link>
            <Link to="/recipes" className="quick-action-card">
              <div className="quick-action-icon gradient-secondary">
                <span>�</span>
              </div>
              <span className="quick-action-label">Find Recipes</span>
              <span className="quick-action-desc">Cook with what you have</span>
            </Link>
            <Link to="/pantry" className="quick-action-card">
              <div className="quick-action-icon gradient-warning">
                <span>📊</span>
              </div>
              <span className="quick-action-label">View Pantry</span>
              <span className="quick-action-desc">Manage all items</span>
            </Link>
            <Link to="/recipes" className="quick-action-card">
              <div className="quick-action-icon gradient-accent">
                <span>❤️</span>
              </div>
              <span className="quick-action-label">Saved Recipes</span>
              <span className="quick-action-desc">Your favorites</span>
            </Link>
          </div>
        </div>

        {/* Category Overview */}
        {Object.keys(stats.categories).length > 0 && (
          <div className="dashboard-card categories-card animate-slide-up" style={{animationDelay: '0.8s'}}>
            <div className="card-header">
              <div className="card-title-wrapper">
                <span className="card-icon">📁</span>
                <h2 className="card-title">Categories</h2>
              </div>
            </div>
            <div className="categories-list">
              {Object.entries(stats.categories).map(([category, count], index) => (
                <div 
                  key={category} 
                  className="category-item"
                  style={{animationDelay: `${0.1 * index}s`}}
                >
                  <span className="category-name">{category}</span>
                  <span className="category-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="tips-section animate-slide-up" style={{animationDelay: '0.9s'}}>
        <div className="tip-card">
          <div className="tip-icon">💡</div>
          <div className="tip-content">
            <h3>Pro Tip</h3>
            <p>Check your expiring items regularly and find recipes that use them to reduce food waste!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
