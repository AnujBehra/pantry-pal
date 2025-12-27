import React, { useState } from 'react';
import './RecipeCard.css';

function RecipeCard({ recipe, onViewDetails, onSave, isSaved, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div 
      className="recipe-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="recipe-image-wrapper">
        {!imageLoaded && <div className="image-placeholder shimmer"></div>}
        <img 
          src={recipe.image} 
          alt={recipe.title} 
          className={`recipe-image ${imageLoaded ? 'loaded' : ''}`}
          onLoad={() => setImageLoaded(true)}
        />
        <div className={`image-overlay ${isHovered ? 'visible' : ''}`}></div>
        
        {/* Save Button */}
        {!isSaved ? (
          <button 
            className={`save-btn ${isHovered ? 'visible' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSave(recipe);
            }}
            title="Save recipe"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        ) : onRemove && (
          <button 
            className="save-btn saved visible"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(recipe.id);
            }}
            title="Remove from saved"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Tags */}
        <div className="recipe-tags">
          {recipe.category && (
            <span className="recipe-tag category">{recipe.category}</span>
          )}
          {recipe.area && (
            <span className="recipe-tag area">{recipe.area}</span>
          )}
          {recipe.source === 'mealdb' && (
            <span className="recipe-tag real">🌐 Real</span>
          )}
        </div>

        {/* Quick Stats Overlay */}
        <div className={`quick-stats ${isHovered ? 'visible' : ''}`}>
          {recipe.readyInMinutes && (
            <div className="quick-stat">
              <span className="quick-stat-icon">⏱️</span>
              <span>{recipe.readyInMinutes}m</span>
            </div>
          )}
          {recipe.servings && (
            <div className="quick-stat">
              <span className="quick-stat-icon">🍽️</span>
              <span>{recipe.servings}</span>
            </div>
          )}
        </div>
      </div>

      <div className="recipe-content">
        <h3 className="recipe-title">{recipe.title}</h3>

        {recipe.usedIngredients && recipe.usedIngredients.length > 0 && (
          <div className="ingredients-preview">
            <div className="ingredient-row used">
              <span className="ingredient-badge">✓</span>
              <span className="ingredient-text">
                {recipe.usedIngredients.slice(0, 3).map((i) => i.name).join(', ')}
                {recipe.usedIngredients.length > 3 && ` +${recipe.usedIngredients.length - 3}`}
              </span>
            </div>
            {recipe.missedIngredients?.length > 0 && (
              <div className="ingredient-row missing">
                <span className="ingredient-badge">+</span>
                <span className="ingredient-text">
                  {recipe.missedIngredients.slice(0, 2).map((i) => i.name).join(', ')}
                  {recipe.missedIngredients.length > 2 && ` +${recipe.missedIngredients.length - 2}`}
                </span>
              </div>
            )}
          </div>
        )}

        {recipe.usedIngredientCount !== undefined && recipe.usedIngredientCount > 0 && (
          <div className="match-indicator">
            <div className="match-bar">
              <div 
                className="match-fill"
                style={{ width: `${Math.min(100, recipe.usedIngredientCount * 20)}%` }}
              ></div>
            </div>
            <span className="match-text">
              {recipe.usedIngredientCount} ingredient{recipe.usedIngredientCount > 1 ? 's' : ''} matched
            </span>
          </div>
        )}

        <button 
          className="view-recipe-btn"
          onClick={() => onViewDetails(recipe)}
        >
          <span>View Recipe</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default RecipeCard;
