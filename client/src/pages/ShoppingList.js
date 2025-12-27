import React, { useState, useEffect } from 'react';
import api from '../api';
import './ShoppingList.css';

function ShoppingList() {
  const [items, setItems] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categories = [
    { name: 'Groceries', icon: '🛒', color: '#10B981' },
    { name: 'Dairy', icon: '🥛', color: '#3B82F6' },
    { name: 'Produce', icon: '🥬', color: '#22C55E' },
    { name: 'Meat', icon: '🥩', color: '#EF4444' },
    { name: 'Bakery', icon: '🍞', color: '#F59E0B' },
    { name: 'Frozen', icon: '🧊', color: '#06B6D4' },
    { name: 'Beverages', icon: '🥤', color: '#8B5CF6' },
    { name: 'Snacks', icon: '🍿', color: '#EC4899' },
    { name: 'Other', icon: '📦', color: '#6B7280' }
  ];

  useEffect(() => {
    fetchPantryItems();
    loadShoppingList();
  }, []);

  const fetchPantryItems = async () => {
    try {
      const response = await api.get('/pantry');
      setPantryItems(response.data);
    } catch (error) {
      console.error('Error fetching pantry items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadShoppingList = () => {
    const saved = localStorage.getItem('shoppingList');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  };

  const saveShoppingList = (newItems) => {
    localStorage.setItem('shoppingList', JSON.stringify(newItems));
    setItems(newItems);
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const item = {
      id: Date.now(),
      name: newItem.trim(),
      category,
      checked: false,
      quantity: 1,
      createdAt: new Date().toISOString()
    };

    saveShoppingList([...items, item]);
    setNewItem('');
  };

  const toggleItem = (id) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    saveShoppingList(updated);
  };

  const removeItem = (id) => {
    saveShoppingList(items.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    const updated = items.map(item =>
      item.id === id ? { ...item, quantity } : item
    );
    saveShoppingList(updated);
  };

  const clearCompleted = () => {
    saveShoppingList(items.filter(item => !item.checked));
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear the entire shopping list?')) {
      saveShoppingList([]);
    }
  };

  // Get low-stock suggestions from pantry
  const getLowStockSuggestions = () => {
    return pantryItems
      .filter(item => item.quantity <= 2)
      .filter(item => !items.some(i => i.name.toLowerCase() === item.name.toLowerCase()))
      .slice(0, 5);
  };

  // Get expiring soon items
  const getExpiringSoon = () => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    return pantryItems
      .filter(item => {
        const expiry = new Date(item.expiry_date);
        return expiry <= threeDaysFromNow && expiry >= new Date();
      })
      .slice(0, 5);
  };

  const addSuggestion = (itemName) => {
    const item = {
      id: Date.now(),
      name: itemName,
      category: 'Groceries',
      checked: false,
      quantity: 1,
      createdAt: new Date().toISOString()
    };
    saveShoppingList([...items, item]);
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const checkedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const lowStockItems = getLowStockSuggestions();
  const expiringItems = getExpiringSoon();

  if (loading) {
    return (
      <div className="shopping-loading">
        <div className="shopping-loading-spinner"></div>
        <p>Loading your shopping list...</p>
      </div>
    );
  }

  return (
    <div className="shopping-page">
      {/* Header */}
      <div className="shopping-header">
        <div className="shopping-header-content">
          <div className="shopping-header-text">
            <h1>🛒 Shopping List</h1>
            <p>Keep track of what you need to buy</p>
          </div>
          <div className="shopping-stats">
            <div className="shopping-stat">
              <span className="shopping-stat-value">{totalCount}</span>
              <span className="shopping-stat-label">Total Items</span>
            </div>
            <div className="shopping-stat">
              <span className="shopping-stat-value">{checkedCount}</span>
              <span className="shopping-stat-label">Completed</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="shopping-progress">
            <div className="shopping-progress-bar">
              <div 
                className="shopping-progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="shopping-progress-text">{Math.round(progress)}% complete</span>
          </div>
        )}
      </div>

      <div className="shopping-content">
        {/* Main List Section */}
        <div className="shopping-main">
          {/* Add Item Form */}
          <div className="shopping-add-section">
            <form onSubmit={addItem} className="shopping-add-form">
              <div className="shopping-add-input-wrapper">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add an item..."
                  className="shopping-add-input"
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="shopping-category-select"
                >
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="shopping-add-btn" disabled={!newItem.trim()}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Item
              </button>
            </form>
          </div>

          {/* Quick Add Chips */}
          <div className="shopping-quick-add">
            <span className="shopping-quick-label">Quick add:</span>
            {['Milk', 'Eggs', 'Bread', 'Butter', 'Cheese', 'Chicken', 'Rice'].map(item => (
              <button
                key={item}
                onClick={() => addSuggestion(item)}
                className="shopping-quick-chip"
                disabled={items.some(i => i.name.toLowerCase() === item.toLowerCase())}
              >
                + {item}
              </button>
            ))}
          </div>

          {/* Items List */}
          {totalCount === 0 ? (
            <div className="shopping-empty">
              <div className="shopping-empty-icon">🛍️</div>
              <h3>Your shopping list is empty</h3>
              <p>Add items above or check out the suggestions on the right!</p>
            </div>
          ) : (
            <div className="shopping-list">
              {Object.entries(groupedItems).map(([categoryName, categoryItems]) => {
                const catInfo = categories.find(c => c.name === categoryName) || categories[8];
                return (
                  <div key={categoryName} className="shopping-category-group">
                    <div className="shopping-category-header" style={{ '--cat-color': catInfo.color }}>
                      <span className="shopping-category-icon">{catInfo.icon}</span>
                      <span className="shopping-category-name">{categoryName}</span>
                      <span className="shopping-category-count">{categoryItems.length}</span>
                    </div>
                    <div className="shopping-category-items">
                      {categoryItems.map(item => (
                        <div
                          key={item.id}
                          className={`shopping-item ${item.checked ? 'checked' : ''}`}
                        >
                          <label className="shopping-item-checkbox">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => toggleItem(item.id)}
                            />
                            <span className="shopping-checkmark">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </span>
                          </label>
                          <span className="shopping-item-name">{item.name}</span>
                          <div className="shopping-item-quantity">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="shopping-qty-btn"
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="shopping-qty-btn"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="shopping-item-remove"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Actions */}
              <div className="shopping-actions">
                {checkedCount > 0 && (
                  <button onClick={clearCompleted} className="shopping-action-btn secondary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Clear Completed ({checkedCount})
                  </button>
                )}
                <button onClick={clearAll} className="shopping-action-btn danger">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Suggestions */}
        <div className="shopping-sidebar">
          {/* Low Stock Suggestions */}
          <div className="shopping-suggestions-card">
            <div className="shopping-suggestions-header">
              <span className="shopping-suggestions-icon">📉</span>
              <h3>Low Stock Items</h3>
            </div>
            {lowStockItems.length === 0 ? (
              <p className="shopping-suggestions-empty">All items are well stocked!</p>
            ) : (
              <div className="shopping-suggestions-list">
                {lowStockItems.map(item => (
                  <div key={item.id} className="shopping-suggestion-item">
                    <div className="shopping-suggestion-info">
                      <span className="shopping-suggestion-name">{item.name}</span>
                      <span className="shopping-suggestion-qty">
                        Only {item.quantity} left
                      </span>
                    </div>
                    <button
                      onClick={() => addSuggestion(item.name)}
                      className="shopping-suggestion-add"
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expiring Soon */}
          <div className="shopping-suggestions-card warning">
            <div className="shopping-suggestions-header">
              <span className="shopping-suggestions-icon">⏰</span>
              <h3>Expiring Soon</h3>
            </div>
            {expiringItems.length === 0 ? (
              <p className="shopping-suggestions-empty">No items expiring soon!</p>
            ) : (
              <div className="shopping-suggestions-list">
                {expiringItems.map(item => (
                  <div key={item.id} className="shopping-suggestion-item">
                    <div className="shopping-suggestion-info">
                      <span className="shopping-suggestion-name">{item.name}</span>
                      <span className="shopping-suggestion-qty warning">
                        Expires: {new Date(item.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="shopping-suggestions-tip">
              💡 Use these items before they expire!
            </p>
          </div>

          {/* Tips Card */}
          <div className="shopping-tips-card">
            <h3>🌟 Shopping Tips</h3>
            <ul>
              <li>Check your pantry before shopping</li>
              <li>Group items by store sections</li>
              <li>Buy seasonal produce for savings</li>
              <li>Check expiry dates carefully</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShoppingList;
