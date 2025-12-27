import React, { useState, useEffect } from 'react';
import './AddItemModal.css';

function AddItemModal({ isOpen, onClose, onSubmit, categories, editingItem }) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    unit: 'piece',
    category_id: '',
    expiry_date: '',
  });
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        quantity: editingItem.quantity,
        unit: editingItem.unit,
        category_id: editingItem.category_id || '',
        expiry_date: editingItem.expiry_date ? editingItem.expiry_date.split('T')[0] : '',
      });
      setActiveCategory(editingItem.category_id);
    } else {
      setFormData({
        name: '',
        quantity: 1,
        unit: 'piece',
        category_id: '',
        expiry_date: '',
      });
      setActiveCategory(null);
    }
  }, [editingItem, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    setFormData((prev) => ({
      ...prev,
      category_id: catId,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      quantity: parseFloat(formData.quantity),
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      expiry_date: formData.expiry_date || null,
    });
  };

  const quickUnits = ['piece', 'kg', 'g', 'L', 'ml', 'pack'];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal add-item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="modal-icon">
              {editingItem ? '✏️' : '➕'}
            </div>
            <div>
              <h2 className="modal-title">{editingItem ? 'Edit Item' : 'Add to Pantry'}</h2>
              <p className="modal-subtitle">
                {editingItem ? 'Update your item details' : 'Add a new item to track'}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Item Name */}
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">📝</span>
              Item Name
            </label>
            <input
              type="text"
              name="name"
              className="form-input large"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Milk, Eggs, Chicken"
              required
              autoFocus
            />
          </div>

          {/* Category Selection */}
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">📁</span>
              Category
            </label>
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat.id)}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <span className="category-name">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">📊</span>
              Quantity
            </label>
            <div className="quantity-section">
              <div className="quantity-input-wrapper">
                <button 
                  type="button" 
                  className="quantity-btn minus"
                  onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(0.1, prev.quantity - 1) }))}
                >
                  −
                </button>
                <input
                  type="number"
                  name="quantity"
                  className="quantity-input"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0.1"
                  step="0.1"
                />
                <button 
                  type="button" 
                  className="quantity-btn plus"
                  onClick={() => setFormData(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                >
                  +
                </button>
              </div>
              <div className="unit-pills">
                {quickUnits.map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    className={`unit-pill ${formData.unit === unit ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, unit }))}
                  >
                    {unit}
                  </button>
                ))}
                <select
                  name="unit"
                  className="unit-select"
                  value={formData.unit}
                  onChange={handleChange}
                >
                  <option value="piece">Piece</option>
                  <option value="kg">Kilogram</option>
                  <option value="g">Gram</option>
                  <option value="lb">Pound</option>
                  <option value="oz">Ounce</option>
                  <option value="L">Liter</option>
                  <option value="ml">Milliliter</option>
                  <option value="cup">Cup</option>
                  <option value="tbsp">Tablespoon</option>
                  <option value="tsp">Teaspoon</option>
                  <option value="dozen">Dozen</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="form-section">
            <label className="form-label">
              <span className="label-icon">📅</span>
              Expiry Date
              <span className="label-optional">(optional)</span>
            </label>
            <input
              type="date"
              name="expiry_date"
              className="form-input date-input"
              value={formData.expiry_date}
              onChange={handleChange}
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="action-btn cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="action-btn submit">
              <span>{editingItem ? '✓ Update Item' : '➕ Add Item'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItemModal;
