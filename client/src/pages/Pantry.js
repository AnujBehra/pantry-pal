import React, { useState, useEffect } from 'react';
import api from '../api';
import PantryItem from '../components/PantryItem';
import AddItemModal from '../components/AddItemModal';
import './Pantry.css';

function Pantry() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, categoriesRes] = await Promise.all([
        api.get('/pantry'),
        api.get('/categories'),
      ]);
      setItems(itemsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (itemData) => {
    try {
      if (editingItem) {
        const response = await api.put(`/pantry/${editingItem.id}`, itemData);
        setItems(items.map((item) =>
          item.id === editingItem.id ? response.data : item
        ));
      } else {
        const response = await api.post('/pantry', itemData);
        setItems([response.data, ...items]);
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/pantry/${id}`);
        setItems(items.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const getExpiringCount = () => {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    return items.filter(item => {
      const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null;
      return expiryDate && expiryDate <= threeDaysFromNow;
    }).length;
  };

  const getCategoryCount = (categoryId) => {
    return items.filter(item => item.category_id === categoryId).length;
  };

  const filteredAndSortedItems = items
    .filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'all') return matchesSearch;
      if (filter === 'expiring') {
        const expiryDate = item.expiry_date ? new Date(item.expiry_date) : null;
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        return matchesSearch && expiryDate && expiryDate <= threeDaysFromNow;
      }
      return matchesSearch && item.category_id === parseInt(filter);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expiry':
          if (!a.expiry_date) return 1;
          if (!b.expiry_date) return -1;
          return new Date(a.expiry_date) - new Date(b.expiry_date);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <span className="loading-icon">🏪</span>
          </div>
          <h2 className="loading-text">Loading your pantry...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page pantry">
      {/* Page Header */}
      <div className="pantry-header">
        <div className="header-content">
          <div className="header-title-section">
            <div className="header-icon-wrapper">
              <span className="header-icon">🏪</span>
            </div>
            <div>
              <h1 className="page-title">My Pantry</h1>
              <p className="page-subtitle">
                {items.length} items • {getExpiringCount()} expiring soon
              </p>
            </div>
          </div>
          <button className="btn btn-primary btn-lg add-btn" onClick={openAddModal}>
            <span className="btn-icon">➕</span>
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="pantry-toolbar">
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search your pantry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>
        
        <div className="toolbar-actions">
          <div className="sort-dropdown">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Sort: A-Z</option>
              <option value="expiry">Sort: Expiry</option>
              <option value="quantity">Sort: Quantity</option>
              <option value="recent">Sort: Recent</option>
            </select>
          </div>

          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </button>
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="3" y="4" width="18" height="4" rx="1"/>
                <rect x="3" y="10" width="18" height="4" rx="1"/>
                <rect x="3" y="16" width="18" height="4" rx="1"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="category-filters">
        <button
          className={`category-pill ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <span className="pill-icon">📦</span>
          <span className="pill-label">All</span>
          <span className="pill-count">{items.length}</span>
        </button>
        <button
          className={`category-pill expiring ${filter === 'expiring' ? 'active' : ''}`}
          onClick={() => setFilter('expiring')}
        >
          <span className="pill-icon">⚠️</span>
          <span className="pill-label">Expiring</span>
          <span className="pill-count">{getExpiringCount()}</span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-pill ${filter === cat.id.toString() ? 'active' : ''}`}
            onClick={() => setFilter(cat.id.toString())}
          >
            <span className="pill-icon">{cat.icon}</span>
            <span className="pill-label">{cat.name}</span>
            <span className="pill-count">{getCategoryCount(cat.id)}</span>
          </button>
        ))}
      </div>

      {/* Items Grid/List */}
      {filteredAndSortedItems.length > 0 ? (
        <div className={`pantry-items ${viewMode}`}>
          {filteredAndSortedItems.map((item, index) => (
            <div 
              key={item.id} 
              className="item-wrapper"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <PantryItem
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-illustration">
            <span className="empty-emoji">🛒</span>
            <div className="empty-circles">
              <div className="empty-circle c1"></div>
              <div className="empty-circle c2"></div>
              <div className="empty-circle c3"></div>
            </div>
          </div>
          <h3>No items found</h3>
          <p>
            {searchTerm
              ? 'Try a different search term'
              : 'Start by adding items to your pantry'}
          </p>
          <button className="btn btn-primary" onClick={openAddModal}>
            <span>➕</span> Add Your First Item
          </button>
        </div>
      )}

      {/* Quick Add Floating Button (Mobile) */}
      <button className="fab" onClick={openAddModal}>
        <span>➕</span>
      </button>

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleAddItem}
        categories={categories}
        editingItem={editingItem}
      />
    </div>
  );
}

export default Pantry;
