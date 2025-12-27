import React, { useState, useEffect } from 'react';
import api from '../api';
import RecipeCard from '../components/RecipeCard';
import './Recipes.css';

function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('suggestions');
  const [message, setMessage] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [mealFilter, setMealFilter] = useState('all');

  useEffect(() => {
    if (activeTab === 'suggestions') {
      fetchSuggestions();
    } else {
      fetchSavedRecipes();
    }
  }, [activeTab]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/recipes/suggestions');
      setRecipes(response.data.recipes || []);
      setMessage(response.data.message || '');
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedRecipes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/recipes/saved/all');
      setSavedRecipes(response.data);
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecipe = async (recipe) => {
    try {
      await api.post('/recipes/save', {
        recipe_api_id: recipe.id.toString(),
        title: recipe.title,
        image_url: recipe.image,
      });
      const savedRes = await api.get('/recipes/saved/all');
      setSavedRecipes(savedRes.data);
      alert('✅ Recipe saved!');
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  const handleRemoveSaved = async (id) => {
    try {
      await api.delete(`/recipes/saved/${id}`);
      setSavedRecipes(savedRecipes.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Error removing recipe:', error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchSuggestions();
      return;
    }
    
    setSearching(true);
    try {
      const response = await api.get(`/recipes/search/${encodeURIComponent(searchTerm)}`);
      setRecipes(response.data.recipes || []);
      setMessage(`Found ${response.data.recipes?.length || 0} recipes for "${searchTerm}"`);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleViewDetails = async (recipe) => {
    try {
      const response = await api.get(`/recipes/${recipe.id}`);
      setSelectedRecipe(response.data);
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      setSelectedRecipe({
        ...recipe,
        instructions: 'Recipe details unavailable. Please try again later.',
      });
    }
  };

  const mealTypes = [
    { id: 'all', label: 'All Recipes', icon: '🍽️' },
    { id: 'breakfast', label: 'Breakfast', icon: '🥞' },
    { id: 'lunch', label: 'Lunch', icon: '🥗' },
    { id: 'dinner', label: 'Dinner', icon: '🍝' },
    { id: 'dessert', label: 'Dessert', icon: '🍰' },
  ];

  const displayRecipes = activeTab === 'suggestions' ? recipes : savedRecipes;

  return (
    <div className="page recipes">
      {/* Hero Section */}
      <div className="recipes-hero">
        <div className="hero-pattern">
          <div className="pattern-circle c1"></div>
          <div className="pattern-circle c2"></div>
          <div className="pattern-circle c3"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">🍳 Smart Suggestions</div>
          <h1 className="hero-title">Discover Delicious Recipes</h1>
          <p className="hero-subtitle">Find perfect recipes based on what's in your pantry</p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search by ingredient (chicken, pasta, tomato...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  type="button" 
                  className="search-clear"
                  onClick={() => {
                    setSearchTerm('');
                    fetchSuggestions();
                  }}
                >
                  ✕
                </button>
              )}
              <button type="submit" className="search-btn" disabled={searching}>
                {searching ? (
                  <span className="searching-spinner"></span>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="recipes-controls">
        <div className="recipe-tabs">
          <button
            className={`tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            <span className="tab-icon">🍳</span>
            <span className="tab-label">Suggestions</span>
            <span className="tab-count">{recipes.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`}
            onClick={() => setActiveTab('saved')}
          >
            <span className="tab-icon">❤️</span>
            <span className="tab-label">Saved</span>
            <span className="tab-count">{savedRecipes.length}</span>
          </button>
        </div>

        <button className="refresh-btn" onClick={fetchSuggestions}>
          <span className="refresh-icon">🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Meal Type Filter */}
      <div className="meal-filters">
        {mealTypes.map(meal => (
          <button
            key={meal.id}
            className={`meal-filter ${mealFilter === meal.id ? 'active' : ''}`}
            onClick={() => setMealFilter(meal.id)}
          >
            <span className="meal-icon">{meal.icon}</span>
            <span className="meal-label">{meal.label}</span>
          </button>
        ))}
      </div>

      {/* Message Banner */}
      {message && (
        <div className="recipe-message">
          <span className="message-icon">💡</span>
          <p>{message}</p>
        </div>
      )}

      {/* Recipe Grid */}
      {loading ? (
        <div className="loading-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="recipe-skeleton">
              <div className="skeleton-image shimmer"></div>
              <div className="skeleton-content">
                <div className="skeleton-title shimmer"></div>
                <div className="skeleton-meta shimmer"></div>
              </div>
            </div>
          ))}
        </div>
      ) : displayRecipes.length > 0 ? (
        <div className="recipe-grid">
          {displayRecipes.map((recipe, index) => (
            <div 
              key={recipe.id} 
              className="recipe-item"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <RecipeCard
                recipe={{
                  id: recipe.recipe_api_id || recipe.id,
                  title: recipe.title,
                  image: recipe.image_url || recipe.image,
                  usedIngredients: recipe.usedIngredients,
                  missedIngredients: recipe.missedIngredients,
                  usedIngredientCount: recipe.usedIngredientCount,
                  readyInMinutes: recipe.readyInMinutes,
                  servings: recipe.servings,
                }}
                onViewDetails={handleViewDetails}
                onSave={handleSaveRecipe}
                isSaved={activeTab === 'saved'}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-illustration">
            <span className="empty-emoji">
              {activeTab === 'suggestions' ? '🥘' : '❤️'}
            </span>
            <div className="empty-circles">
              <div className="empty-circle c1"></div>
              <div className="empty-circle c2"></div>
            </div>
          </div>
          <h3>
            {activeTab === 'suggestions'
              ? 'No recipe suggestions yet'
              : 'No saved recipes'}
          </h3>
          <p>
            {activeTab === 'suggestions'
              ? 'Add items to your pantry to get personalized recipe suggestions'
              : 'Save recipes you like to find them here later'}
          </p>
          {activeTab === 'suggestions' && (
            <button className="btn btn-primary" onClick={fetchSuggestions}>
              <span>🔄</span> Try Again
            </button>
          )}
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="recipe-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedRecipe(null)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="recipe-modal-image">
              <img src={selectedRecipe.image} alt={selectedRecipe.title} />
              <div className="modal-image-overlay"></div>
            </div>
            <div className="recipe-modal-content">
              <h2 className="modal-title">{selectedRecipe.title}</h2>

              {(selectedRecipe.readyInMinutes || selectedRecipe.servings) && (
                <div className="modal-meta">
                  {selectedRecipe.readyInMinutes && (
                    <div className="meta-item">
                      <span className="meta-icon">⏱️</span>
                      <span className="meta-value">{selectedRecipe.readyInMinutes}</span>
                      <span className="meta-label">minutes</span>
                    </div>
                  )}
                  {selectedRecipe.servings && (
                    <div className="meta-item">
                      <span className="meta-icon">🍽️</span>
                      <span className="meta-value">{selectedRecipe.servings}</span>
                      <span className="meta-label">servings</span>
                    </div>
                  )}
                </div>
              )}

              {selectedRecipe.extendedIngredients && (
                <div className="modal-section">
                  <h3 className="section-title">
                    <span>📝</span> Ingredients
                  </h3>
                  <ul className="ingredients-list">
                    {selectedRecipe.extendedIngredients.map((ing, idx) => (
                      <li key={idx} className="ingredient-item">
                        <span className="ingredient-bullet">•</span>
                        {ing.original}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedRecipe.instructions && (
                <div className="modal-section">
                  <h3 className="section-title">
                    <span>👨‍🍳</span> Instructions
                  </h3>
                  <div
                    className="instructions-content"
                    dangerouslySetInnerHTML={{
                      __html: selectedRecipe.instructions,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recipes;
