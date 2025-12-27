import React, { useState } from 'react';
import { format, isPast, isToday, addDays, isBefore, differenceInDays } from 'date-fns';
import './PantryItem.css';

function PantryItem({ item, onEdit, onDelete, viewMode = 'grid' }) {
  const [showActions, setShowActions] = useState(false);

  const getExpiryStatus = () => {
    if (!item.expiry_date) return null;
    
    const expiryDate = new Date(item.expiry_date);
    const daysUntil = differenceInDays(expiryDate, new Date());
    
    if (isPast(expiryDate) && !isToday(expiryDate)) {
      return { status: 'expired', label: 'Expired', days: daysUntil, color: '#DC2626' };
    }
    if (isToday(expiryDate)) {
      return { status: 'today', label: 'Today!', days: 0, color: '#DC2626' };
    }
    if (isBefore(expiryDate, addDays(new Date(), 3))) {
      return { status: 'soon', label: `${daysUntil}d left`, days: daysUntil, color: '#D97706' };
    }
    if (isBefore(expiryDate, addDays(new Date(), 7))) {
      return { status: 'week', label: `${daysUntil}d left`, days: daysUntil, color: '#10B981' };
    }
    return { status: 'good', label: `${daysUntil}d`, days: daysUntil, color: '#10B981' };
  };

  const expiryStatus = getExpiryStatus();

  const getProgressWidth = () => {
    if (!item.expiry_date) return 100;
    const daysUntil = differenceInDays(new Date(item.expiry_date), new Date());
    if (daysUntil < 0) return 0;
    if (daysUntil > 30) return 100;
    return Math.max(0, Math.min(100, (daysUntil / 30) * 100));
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`pantry-item-list ${expiryStatus?.status || ''}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="list-icon-wrapper">
          <span className="list-icon">{item.category_icon || '📦'}</span>
        </div>
        
        <div className="list-info">
          <h3 className="list-name">{item.name}</h3>
          <span className="list-category">{item.category_name || 'Uncategorized'}</span>
        </div>

        <div className="list-quantity">
          <span className="quantity-value">{item.quantity}</span>
          <span className="quantity-unit">{item.unit}</span>
        </div>

        {item.expiry_date && (
          <div className="list-expiry">
            <span className="expiry-date-text">
              {format(new Date(item.expiry_date), 'MMM d')}
            </span>
            {expiryStatus && (
              <span 
                className={`expiry-badge-small ${expiryStatus.status}`}
                style={{ '--badge-color': expiryStatus.color }}
              >
                {expiryStatus.label}
              </span>
            )}
          </div>
        )}

        <div className={`list-actions ${showActions ? 'visible' : ''}`}>
          <button className="action-btn edit" onClick={() => onEdit(item)} title="Edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="action-btn delete" onClick={() => onDelete(item.id)} title="Delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`pantry-item-card ${expiryStatus?.status || ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {expiryStatus && ['expired', 'today', 'soon'].includes(expiryStatus.status) && (
        <div className={`card-alert ${expiryStatus.status}`}>
          <span>{expiryStatus.status === 'expired' ? '⚠️ Expired' : expiryStatus.status === 'today' ? '🔥 Today!' : '⏰ Expiring Soon'}</span>
        </div>
      )}

      <div className="card-header">
        <div className="card-icon-wrapper">
          <span className="card-icon">{item.category_icon || '📦'}</span>
        </div>
        <div className={`card-actions ${showActions ? 'visible' : ''}`}>
          <button className="action-btn edit" onClick={() => onEdit(item)} title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="action-btn delete" onClick={() => onDelete(item.id)} title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="card-content">
        <h3 className="card-name">{item.name}</h3>
        <span className="card-category">{item.category_name || 'Uncategorized'}</span>
      </div>

      <div className="card-quantity">
        <span className="quantity-number">{item.quantity}</span>
        <span className="quantity-label">{item.unit}</span>
      </div>

      {item.expiry_date && (
        <div className="card-expiry">
          <div className="expiry-header">
            <span className="expiry-label">Expires</span>
            <span className="expiry-date">{format(new Date(item.expiry_date), 'MMM d, yyyy')}</span>
          </div>
          <div className="expiry-progress">
            <div 
              className="expiry-progress-bar"
              style={{ 
                width: `${getProgressWidth()}%`,
                backgroundColor: expiryStatus?.color || '#10B981'
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PantryItem;
