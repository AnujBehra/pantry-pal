-- PantryPal Database Schema

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories for pantry items
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50)
);

-- Pantry items
CREATE TABLE pantry_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit VARCHAR(20) DEFAULT 'piece',
    category_id INTEGER REFERENCES categories(id),
    expiry_date DATE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved recipes
CREATE TABLE saved_recipes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    recipe_api_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, recipe_api_id)
);

-- Insert default categories
INSERT INTO categories (name, icon) VALUES
    ('Dairy', '🥛'),
    ('Meat', '🥩'),
    ('Vegetables', '🥬'),
    ('Fruits', '🍎'),
    ('Grains', '🌾'),
    ('Spices', '🌶️'),
    ('Beverages', '🥤'),
    ('Frozen', '🧊'),
    ('Canned', '🥫'),
    ('Other', '📦');

-- Indexes for better performance
CREATE INDEX idx_pantry_items_user_id ON pantry_items(user_id);
CREATE INDEX idx_pantry_items_expiry ON pantry_items(expiry_date);
CREATE INDEX idx_saved_recipes_user_id ON saved_recipes(user_id);
