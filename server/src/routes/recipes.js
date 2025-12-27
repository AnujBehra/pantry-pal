const express = require('express');
const axios = require('axios');
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';
const MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Extensive mock recipes for demo
const mockRecipes = [
  {
    id: 101,
    title: 'Creamy Garlic Pasta',
    image: 'https://www.themealdb.com/images/media/meals/qtqwwu1511792650.jpg',
    readyInMinutes: 25,
    servings: 4,
    usedIngredientCount: 4,
    missedIngredientCount: 2,
    usedIngredients: [{ name: 'pasta' }, { name: 'garlic' }, { name: 'butter' }, { name: 'cream' }],
    missedIngredients: [{ name: 'parmesan' }, { name: 'parsley' }],
    instructions: '1. Cook pasta according to package directions.\n2. Mince garlic and sauté in butter until fragrant.\n3. Add cream and simmer for 5 minutes.\n4. Toss pasta with sauce and serve with parmesan.',
    extendedIngredients: [
      { original: '400g pasta' },
      { original: '4 cloves garlic, minced' },
      { original: '3 tbsp butter' },
      { original: '1 cup heavy cream' },
      { original: '1/2 cup parmesan cheese' },
      { original: 'Fresh parsley for garnish' },
    ],
  },
  {
    id: 102,
    title: 'Classic Chicken Stir Fry',
    image: 'https://www.themealdb.com/images/media/meals/1529446352.jpg',
    readyInMinutes: 30,
    servings: 4,
    usedIngredientCount: 5,
    missedIngredientCount: 2,
    usedIngredients: [{ name: 'chicken' }, { name: 'broccoli' }, { name: 'carrots' }, { name: 'soy sauce' }, { name: 'garlic' }],
    missedIngredients: [{ name: 'ginger' }, { name: 'sesame oil' }],
    instructions: '1. Cut chicken into bite-sized pieces.\n2. Heat oil in wok over high heat.\n3. Cook chicken until golden, set aside.\n4. Stir fry vegetables for 3-4 minutes.\n5. Return chicken, add sauce, and toss.',
    extendedIngredients: [
      { original: '500g chicken breast' },
      { original: '2 cups broccoli florets' },
      { original: '2 carrots, sliced' },
      { original: '3 tbsp soy sauce' },
      { original: '3 cloves garlic' },
      { original: '1 tbsp fresh ginger' },
      { original: '1 tbsp sesame oil' },
    ],
  },
  {
    id: 103,
    title: 'Vegetable Fried Rice',
    image: 'https://www.themealdb.com/images/media/meals/1529445434.jpg',
    readyInMinutes: 20,
    servings: 4,
    usedIngredientCount: 5,
    missedIngredientCount: 1,
    usedIngredients: [{ name: 'rice' }, { name: 'eggs' }, { name: 'peas' }, { name: 'carrots' }, { name: 'soy sauce' }],
    missedIngredients: [{ name: 'green onions' }],
    instructions: '1. Use day-old cold rice for best results.\n2. Scramble eggs in wok, set aside.\n3. Stir fry vegetables until tender.\n4. Add rice and soy sauce, toss well.\n5. Mix in eggs and green onions.',
    extendedIngredients: [
      { original: '4 cups cooked rice (cold)' },
      { original: '3 eggs, beaten' },
      { original: '1 cup frozen peas' },
      { original: '2 carrots, diced' },
      { original: '3 tbsp soy sauce' },
      { original: '4 green onions, chopped' },
    ],
  },
  {
    id: 104,
    title: 'Fluffy Pancakes',
    image: 'https://www.themealdb.com/images/media/meals/rwuyqx1511383174.jpg',
    readyInMinutes: 20,
    servings: 4,
    usedIngredientCount: 4,
    missedIngredientCount: 2,
    usedIngredients: [{ name: 'flour' }, { name: 'eggs' }, { name: 'milk' }, { name: 'butter' }],
    missedIngredients: [{ name: 'baking powder' }, { name: 'maple syrup' }],
    instructions: '1. Mix flour, baking powder, and salt.\n2. Whisk eggs, milk, and melted butter.\n3. Combine wet and dry ingredients.\n4. Cook on griddle until bubbles form, flip.\n5. Serve with maple syrup.',
    extendedIngredients: [
      { original: '2 cups all-purpose flour' },
      { original: '2 eggs' },
      { original: '1.5 cups milk' },
      { original: '3 tbsp melted butter' },
      { original: '2 tsp baking powder' },
      { original: 'Maple syrup for serving' },
    ],
  },
  {
    id: 105,
    title: 'Greek Salad',
    image: 'https://www.themealdb.com/images/media/meals/k29viq1585565980.jpg',
    readyInMinutes: 15,
    servings: 2,
    usedIngredientCount: 4,
    missedIngredientCount: 2,
    usedIngredients: [{ name: 'tomatoes' }, { name: 'cucumber' }, { name: 'onion' }, { name: 'olive oil' }],
    missedIngredients: [{ name: 'feta cheese' }, { name: 'olives' }],
    instructions: '1. Chop tomatoes, cucumber, and onion.\n2. Add olives and crumbled feta.\n3. Drizzle with olive oil and oregano.\n4. Season with salt and pepper.\n5. Toss gently and serve.',
    extendedIngredients: [
      { original: '3 ripe tomatoes, chopped' },
      { original: '1 cucumber, sliced' },
      { original: '1 red onion, sliced' },
      { original: '3 tbsp olive oil' },
      { original: '100g feta cheese' },
      { original: '1/2 cup kalamata olives' },
    ],
  },
  {
    id: 106,
    title: 'Beef Tacos',
    image: 'https://www.themealdb.com/images/media/meals/ypxvwv1505333929.jpg',
    readyInMinutes: 25,
    servings: 4,
    usedIngredientCount: 4,
    missedIngredientCount: 3,
    usedIngredients: [{ name: 'ground beef' }, { name: 'onion' }, { name: 'tomatoes' }, { name: 'garlic' }],
    missedIngredients: [{ name: 'taco shells' }, { name: 'cheese' }, { name: 'lettuce' }],
    instructions: '1. Brown ground beef with onion and garlic.\n2. Add taco seasoning and tomatoes.\n3. Simmer for 10 minutes.\n4. Warm taco shells in oven.\n5. Assemble with toppings.',
    extendedIngredients: [
      { original: '500g ground beef' },
      { original: '1 onion, diced' },
      { original: '2 tomatoes, diced' },
      { original: '3 cloves garlic' },
      { original: '8 taco shells' },
      { original: '1 cup shredded cheese' },
      { original: '2 cups shredded lettuce' },
    ],
  },
  {
    id: 107,
    title: 'Mushroom Risotto',
    image: 'https://www.themealdb.com/images/media/meals/sywrsu1511463066.jpg',
    readyInMinutes: 40,
    servings: 4,
    usedIngredientCount: 4,
    missedIngredientCount: 2,
    usedIngredients: [{ name: 'rice' }, { name: 'mushrooms' }, { name: 'onion' }, { name: 'butter' }],
    missedIngredients: [{ name: 'white wine' }, { name: 'parmesan' }],
    instructions: '1. Sauté mushrooms and set aside.\n2. Cook onion in butter until soft.\n3. Add rice and toast for 2 minutes.\n4. Add wine and stir until absorbed.\n5. Gradually add broth, stirring constantly.\n6. Finish with mushrooms and parmesan.',
    extendedIngredients: [
      { original: '1.5 cups arborio rice' },
      { original: '300g mixed mushrooms' },
      { original: '1 onion, finely diced' },
      { original: '4 tbsp butter' },
      { original: '1/2 cup white wine' },
      { original: '1/2 cup parmesan cheese' },
    ],
  },
  {
    id: 108,
    title: 'Honey Garlic Salmon',
    image: 'https://www.themealdb.com/images/media/meals/1548772327.jpg',
    readyInMinutes: 25,
    servings: 2,
    usedIngredientCount: 3,
    missedIngredientCount: 2,
    usedIngredients: [{ name: 'salmon' }, { name: 'garlic' }, { name: 'butter' }],
    missedIngredients: [{ name: 'honey' }, { name: 'lemon' }],
    instructions: '1. Mix honey, soy sauce, garlic, and lemon.\n2. Season salmon with salt and pepper.\n3. Sear salmon in butter until golden.\n4. Add sauce and baste.\n5. Cook until salmon is done.',
    extendedIngredients: [
      { original: '2 salmon fillets' },
      { original: '4 cloves garlic, minced' },
      { original: '2 tbsp butter' },
      { original: '3 tbsp honey' },
      { original: '1 lemon, juiced' },
    ],
  },
  {
    id: 109,
    title: 'Caprese Sandwich',
    image: 'https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg',
    readyInMinutes: 10,
    servings: 2,
    usedIngredientCount: 3,
    missedIngredientCount: 2,
    usedIngredients: [{ name: 'bread' }, { name: 'tomatoes' }, { name: 'olive oil' }],
    missedIngredients: [{ name: 'mozzarella' }, { name: 'basil' }],
    instructions: '1. Slice bread and toast lightly.\n2. Layer fresh mozzarella slices.\n3. Add sliced tomatoes.\n4. Top with fresh basil leaves.\n5. Drizzle with olive oil and balsamic.',
    extendedIngredients: [
      { original: '4 slices crusty bread' },
      { original: '2 ripe tomatoes, sliced' },
      { original: '2 tbsp olive oil' },
      { original: '200g fresh mozzarella' },
      { original: 'Fresh basil leaves' },
    ],
  },
  {
    id: 110,
    title: 'Banana Smoothie Bowl',
    image: 'https://www.themealdb.com/images/media/meals/vwuprt1468331656.jpg',
    readyInMinutes: 10,
    servings: 1,
    usedIngredientCount: 3,
    missedIngredientCount: 2,
    usedIngredients: [{ name: 'bananas' }, { name: 'milk' }, { name: 'honey' }],
    missedIngredients: [{ name: 'granola' }, { name: 'berries' }],
    instructions: '1. Freeze bananas overnight.\n2. Blend with milk until thick.\n3. Pour into bowl.\n4. Top with granola and berries.\n5. Drizzle with honey.',
    extendedIngredients: [
      { original: '2 frozen bananas' },
      { original: '1/2 cup milk' },
      { original: '1 tbsp honey' },
      { original: '1/4 cup granola' },
      { original: '1/2 cup mixed berries' },
    ],
  },
  {
    id: 111,
    title: 'Chicken Caesar Wrap',
    image: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
    readyInMinutes: 20,
    servings: 2,
    usedIngredientCount: 3,
    missedIngredientCount: 2,
    usedIngredients: [{ name: 'chicken' }, { name: 'lettuce' }, { name: 'garlic' }],
    missedIngredients: [{ name: 'tortillas' }, { name: 'caesar dressing' }],
    instructions: '1. Grill seasoned chicken breast.\n2. Slice chicken into strips.\n3. Chop romaine lettuce.\n4. Warm tortillas.\n5. Layer with dressing and wrap tightly.',
    extendedIngredients: [
      { original: '2 chicken breasts' },
      { original: '2 cups romaine lettuce' },
      { original: '2 cloves garlic' },
      { original: '2 large tortillas' },
      { original: '4 tbsp caesar dressing' },
    ],
  },
  {
    id: 112,
    title: 'Tomato Basil Soup',
    image: 'https://www.themealdb.com/images/media/meals/stpuws1511191310.jpg',
    readyInMinutes: 35,
    servings: 4,
    usedIngredientCount: 4,
    missedIngredientCount: 1,
    usedIngredients: [{ name: 'tomatoes' }, { name: 'onion' }, { name: 'garlic' }, { name: 'butter' }],
    missedIngredients: [{ name: 'basil' }],
    instructions: '1. Sauté onion and garlic in butter.\n2. Add canned tomatoes and broth.\n3. Simmer for 20 minutes.\n4. Blend until smooth.\n5. Stir in fresh basil and cream.',
    extendedIngredients: [
      { original: '2 cans crushed tomatoes' },
      { original: '1 onion, diced' },
      { original: '4 cloves garlic' },
      { original: '3 tbsp butter' },
      { original: '1/2 cup fresh basil' },
    ],
  },
  {
    id: 113,
    title: 'Spaghetti Carbonara',
    image: 'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
    readyInMinutes: 25,
    servings: 4,
    usedIngredientCount: 4,
    missedIngredientCount: 2,
    usedIngredients: [{ name: 'pasta' }, { name: 'eggs' }, { name: 'bacon' }, { name: 'garlic' }],
    missedIngredients: [{ name: 'parmesan' }, { name: 'black pepper' }],
    instructions: '1. Cook pasta until al dente.\n2. Fry bacon until crispy.\n3. Whisk eggs with parmesan.\n4. Toss hot pasta with bacon.\n5. Add egg mixture off heat, toss quickly.',
    extendedIngredients: [
      { original: '400g spaghetti' },
      { original: '4 eggs' },
      { original: '200g bacon or pancetta' },
      { original: '3 cloves garlic' },
      { original: '1 cup parmesan cheese' },
      { original: 'Fresh black pepper' },
    ],
  },
  {
    id: 114,
    title: 'Grilled Cheese Deluxe',
    image: 'https://www.themealdb.com/images/media/meals/xxyupu1468262513.jpg',
    readyInMinutes: 15,
    servings: 2,
    usedIngredientCount: 3,
    missedIngredientCount: 1,
    usedIngredients: [{ name: 'bread' }, { name: 'cheese' }, { name: 'butter' }],
    missedIngredients: [{ name: 'tomatoes' }],
    instructions: '1. Butter outside of bread slices.\n2. Layer cheese between slices.\n3. Add tomato slices if desired.\n4. Grill on medium until golden.\n5. Flip and grill other side.',
    extendedIngredients: [
      { original: '4 slices bread' },
      { original: '4 slices cheddar cheese' },
      { original: '2 tbsp butter' },
      { original: '1 tomato, sliced (optional)' },
    ],
  },
  {
    id: 115,
    title: 'Teriyaki Chicken Bowl',
    image: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
    readyInMinutes: 30,
    servings: 4,
    usedIngredientCount: 4,
    missedIngredientCount: 2,
    usedIngredients: [{ name: 'chicken' }, { name: 'rice' }, { name: 'soy sauce' }, { name: 'garlic' }],
    missedIngredients: [{ name: 'ginger' }, { name: 'honey' }],
    instructions: '1. Cook rice according to package.\n2. Slice chicken thighs.\n3. Make teriyaki sauce with soy, honey, garlic.\n4. Cook chicken and coat with sauce.\n5. Serve over rice with vegetables.',
    extendedIngredients: [
      { original: '500g chicken thighs' },
      { original: '2 cups rice' },
      { original: '4 tbsp soy sauce' },
      { original: '3 cloves garlic' },
      { original: '1 inch ginger' },
      { original: '3 tbsp honey' },
    ],
  },
  {
    id: 116,
    title: 'Avocado Toast',
    image: 'https://www.themealdb.com/images/media/meals/rsqwus1511462879.jpg',
    readyInMinutes: 10,
    servings: 2,
    usedIngredientCount: 2,
    missedIngredientCount: 2,
    usedIngredients: [{ name: 'bread' }, { name: 'eggs' }],
    missedIngredients: [{ name: 'avocado' }, { name: 'lemon' }],
    instructions: '1. Toast bread until golden.\n2. Mash avocado with lemon and salt.\n3. Spread on toast.\n4. Top with poached egg.\n5. Season with pepper and chili flakes.',
    extendedIngredients: [
      { original: '2 slices sourdough bread' },
      { original: '2 eggs' },
      { original: '1 ripe avocado' },
      { original: '1/2 lemon, juiced' },
    ],
  },
];

// Helper function to match recipes with pantry items
const matchRecipesWithPantry = (recipes, pantryItems) => {
  const pantryNames = pantryItems.map(item => item.name.toLowerCase());
  
  return recipes.map(recipe => {
    const allIngredients = recipe.usedIngredients.concat(recipe.missedIngredients || []);
    const usedIngredients = [];
    const missedIngredients = [];
    
    allIngredients.forEach(ing => {
      const ingName = ing.name.toLowerCase();
      const isInPantry = pantryNames.some(pantryItem => 
        pantryItem.includes(ingName) || ingName.includes(pantryItem)
      );
      
      if (isInPantry) {
        usedIngredients.push(ing);
      } else {
        missedIngredients.push(ing);
      }
    });

    return {
      ...recipe,
      usedIngredients,
      missedIngredients,
      usedIngredientCount: usedIngredients.length,
      missedIngredientCount: missedIngredients.length,
    };
  }).sort((a, b) => b.usedIngredientCount - a.usedIngredientCount);
};

// Fetch real recipes from TheMealDB (free, no API key needed)
const fetchMealDBRecipes = async (ingredient) => {
  try {
    const response = await axios.get(`${MEALDB_BASE_URL}/filter.php?i=${ingredient}`);
    if (response.data.meals) {
      return response.data.meals.slice(0, 6).map(meal => ({
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        source: 'mealdb',
        readyInMinutes: 30,
        servings: 4,
      }));
    }
    return [];
  } catch (error) {
    console.log('MealDB API error:', error.message);
    return [];
  }
};

// Get recipe suggestions based on pantry items
router.get('/suggestions', authenticateToken, async (req, res) => {
  try {
    // Get user's pantry items
    const pantryResult = await db.query(
      'SELECT name FROM pantry_items WHERE user_id = $1',
      [req.user.id]
    );

    const pantryItems = pantryResult.rows;
    const ingredients = pantryItems.map(item => item.name).join(',');

    if (!ingredients) {
      return res.json({ 
        recipes: mockRecipes.slice(0, 8),
        message: 'Add items to your pantry to get personalized recipe suggestions! Here are some popular recipes:' 
      });
    }

    // Try Spoonacular first if API key available
    if (process.env.RECIPE_API_KEY && process.env.RECIPE_API_KEY !== 'demo_key') {
      try {
        const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/findByIngredients`, {
          params: {
            ingredients,
            number: 12,
            ranking: 2,
            ignorePantry: false,
            apiKey: process.env.RECIPE_API_KEY,
          },
        });
        return res.json({ recipes: response.data });
      } catch (apiError) {
        console.log('Spoonacular API error, trying alternatives');
      }
    }

    // Try TheMealDB for real recipes (free, no key needed)
    let mealDBRecipes = [];
    
    // Search for multiple pantry ingredients
    for (const item of pantryItems.slice(0, 3)) {
      const recipes = await fetchMealDBRecipes(item.name);
      mealDBRecipes = [...mealDBRecipes, ...recipes];
    }
    
    // Remove duplicates
    const uniqueMealDB = mealDBRecipes.filter((recipe, index, self) =>
      index === self.findIndex(r => r.id === recipe.id)
    );

    // Match mock recipes with pantry items
    const matchedRecipes = matchRecipesWithPantry(mockRecipes, pantryItems);

    // Add ingredient matching to MealDB recipes
    const enrichedMealDB = uniqueMealDB.map(r => ({
      ...r,
      usedIngredientCount: 1,
      missedIngredientCount: 0,
      usedIngredients: pantryItems.slice(0, 2).map(p => ({ name: p.name })),
      missedIngredients: [],
    }));

    // Combine and sort by match count
    const combinedRecipes = [...enrichedMealDB, ...matchedRecipes]
      .filter((recipe, index, self) => index === self.findIndex(r => r.id === recipe.id))
      .sort((a, b) => b.usedIngredientCount - a.usedIngredientCount)
      .slice(0, 12);

    res.json({ 
      recipes: combinedRecipes,
      message: pantryItems.length > 0 
        ? `Found ${combinedRecipes.length} recipes based on your ${pantryItems.length} pantry items!`
        : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipe suggestions' });
  }
});

// Search recipes by ingredient
router.get('/search/:ingredient', authenticateToken, async (req, res) => {
  try {
    const { ingredient } = req.params;
    
    // Try MealDB search
    const mealDBRecipes = await fetchMealDBRecipes(ingredient);
    
    // Also filter mock recipes
    const matchedMock = mockRecipes.filter(recipe => 
      recipe.usedIngredients.some(ing => 
        ing.name.toLowerCase().includes(ingredient.toLowerCase())
      ) ||
      recipe.title.toLowerCase().includes(ingredient.toLowerCase())
    );

    res.json({
      recipes: [...mealDBRecipes, ...matchedMock].slice(0, 12),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get recipe details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if it's a MealDB recipe (5+ digit ID)
    if (id.length >= 5 && !isNaN(id)) {
      try {
        const response = await axios.get(`${MEALDB_BASE_URL}/lookup.php?i=${id}`);
        if (response.data.meals && response.data.meals[0]) {
          const meal = response.data.meals[0];
          
          // Extract ingredients from MealDB format
          const ingredients = [];
          for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
              ingredients.push({ original: `${measure} ${ingredient}`.trim() });
            }
          }

          return res.json({
            id: meal.idMeal,
            title: meal.strMeal,
            image: meal.strMealThumb,
            servings: 4,
            readyInMinutes: 30,
            instructions: meal.strInstructions,
            extendedIngredients: ingredients,
            sourceUrl: meal.strSource || meal.strYoutube,
            category: meal.strCategory,
            area: meal.strArea,
          });
        }
      } catch (mealDBError) {
        console.log('MealDB lookup error');
      }
    }

    // Try Spoonacular if API key available
    if (process.env.RECIPE_API_KEY && process.env.RECIPE_API_KEY !== 'demo_key') {
      try {
        const response = await axios.get(`${SPOONACULAR_BASE_URL}/recipes/${id}/information`, {
          params: { apiKey: process.env.RECIPE_API_KEY },
        });
        return res.json(response.data);
      } catch (spoonError) {
        console.log('Spoonacular lookup error');
      }
    }

    // Return mock recipe details
    const mockRecipe = mockRecipes.find(r => r.id === parseInt(id));
    if (mockRecipe) {
      return res.json(mockRecipe);
    }

    // Default fallback
    res.json({
      id: parseInt(id),
      title: 'Recipe Details',
      image: 'https://www.themealdb.com/images/media/meals/qtqwwu1511792650.jpg',
      servings: 4,
      readyInMinutes: 30,
      instructions: 'Recipe instructions will appear here. Add more items to your pantry for personalized recipes!',
      extendedIngredients: [
        { original: 'Various ingredients as needed' },
      ],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch recipe details' });
  }
});

// Get random recipe inspiration
router.get('/random/inspiration', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${MEALDB_BASE_URL}/random.php`);
    if (response.data.meals && response.data.meals[0]) {
      const meal = response.data.meals[0];
      return res.json({
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        category: meal.strCategory,
        area: meal.strArea,
      });
    }
    
    // Fallback to random mock recipe
    const randomMock = mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
    res.json(randomMock);
  } catch (error) {
    console.error(error);
    const randomMock = mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
    res.json(randomMock);
  }
});

// Save a recipe
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { recipe_api_id, title, image_url } = req.body;

    const result = await db.query(
      `INSERT INTO saved_recipes (user_id, recipe_api_id, title, image_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, recipe_api_id) DO NOTHING
       RETURNING *`,
      [req.user.id, recipe_api_id, title, image_url]
    );

    res.status(201).json(result.rows[0] || { message: 'Recipe already saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get saved recipes
router.get('/saved/all', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM saved_recipes WHERE user_id = $1 ORDER BY saved_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove saved recipe
router.delete('/saved/:id', authenticateToken, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM saved_recipes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Recipe removed from saved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
