import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import './Notifications.css';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/pantry');
      const items = response.data;
      const newNotifications = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      items.forEach(item => {
        const expiryDate = new Date(item.expiry_date);
        expiryDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        // Expired items
        if (diffDays < 0) {
          newNotifications.push({
            id: `expired-${item.id}`,
            type: 'expired',
            title: 'Item Expired',
            message: `${item.name} has expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`,
            icon: '⚠️',
            itemId: item.id,
            priority: 1,
            time: 'Expired'
          });
        }
        // Expiring today
        else if (diffDays === 0) {
          newNotifications.push({
            id: `today-${item.id}`,
            type: 'urgent',
            title: 'Expires Today!',
            message: `${item.name} expires today. Use it now!`,
            icon: '🔥',
            itemId: item.id,
            priority: 2,
            time: 'Today'
          });
        }
        // Expiring in 1-3 days
        else if (diffDays <= 3) {
          newNotifications.push({
            id: `soon-${item.id}`,
            type: 'warning',
            title: 'Expiring Soon',
            message: `${item.name} expires in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
            icon: '⏰',
            itemId: item.id,
            priority: 3,
            time: `${diffDays} day${diffDays !== 1 ? 's' : ''}`
          });
        }

        // Low stock
        if (item.quantity <= 2) {
          newNotifications.push({
            id: `low-${item.id}`,
            type: 'info',
            title: 'Low Stock',
            message: `Only ${item.quantity} ${item.name} left`,
            icon: '📉',
            itemId: item.id,
            priority: 4,
            time: 'Stock Alert'
          });
        }
      });

      // Sort by priority
      newNotifications.sort((a, b) => a.priority - b.priority);
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.length;
  const hasUrgent = notifications.some(n => n.type === 'expired' || n.type === 'urgent');

  return (
    <div className="notifications-wrapper" ref={dropdownRef}>
      <button 
        className={`notifications-trigger ${hasUrgent ? 'urgent' : ''} ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className={`notifications-badge ${hasUrgent ? 'urgent' : ''}`}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {hasUrgent && <span className="notifications-pulse"></span>}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button onClick={clearAll} className="notifications-clear">
                Clear all
              </button>
            )}
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="notifications-loading">
                <div className="notifications-spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notifications-empty">
                <span className="notifications-empty-icon">🎉</span>
                <h4>All caught up!</h4>
                <p>No notifications at the moment</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.type}`}
                >
                  <div className="notification-icon">{notification.icon}</div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{notification.time}</div>
                  </div>
                  <button 
                    className="notification-dismiss"
                    onClick={() => dismissNotification(notification.id)}
                    aria-label="Dismiss"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notifications-footer">
              <button className="notifications-view-all">
                View all alerts
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;
