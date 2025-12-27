# 🥗 PantryPal - Smart Pantry & Recipe Suggester

A full-stack application to manage your pantry items, track expiry dates, and get personalized recipe suggestions based on what you have.

## 🏗️ Architecture

| Layer | Tech Stack | Responsibility |
|-------|------------|----------------|
| Front-End | React + HTML/CSS/JS | Beautiful, responsive UI: add/remove items, expiry warnings, auto-suggested recipes |
| Back-End | Node.js + Express | RESTful API, business logic, talks to DB & 3rd-party recipe API |
| Database | PostgreSQL | Persistent storage of pantry items, users, timestamps |
| DevOps | Docker + Docker-Compose | One-command spin-up of the whole stack (client, server, db, nginx) |

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- (Optional) Spoonacular API key for real recipe suggestions

### One-Command Setup

```bash
# Clone and navigate to the project
cd pantry-pal

# Start all services
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Via Nginx**: http://localhost:80

### Environment Variables

Create a `.env` file in the root directory (already created with defaults):

```env
RECIPE_API_KEY=your_spoonacular_api_key  # Get free at https://spoonacular.com/food-api
JWT_SECRET=your_jwt_secret_key
```

## 📱 Features

### 🏪 Pantry Management
- Add, edit, and delete pantry items
- Categorize items (Dairy, Meat, Vegetables, Fruits, etc.)
- Track quantities and units
- Set expiry dates

### ⚠️ Expiry Warnings
- Visual alerts for items expiring soon (within 3 days)
- Dashboard overview of expiring items
- Color-coded badges (expired, expiring today, expiring soon)

### 🍳 Recipe Suggestions
- Auto-suggested recipes based on pantry items
- Shows ingredients you have vs. what you need
- Save favorite recipes for later
- View detailed recipe instructions

### 🔐 User Authentication
- Secure registration and login
- JWT-based authentication
- Personal pantry per user

## 📁 Project Structure

```
pantry-pal/
├── docker-compose.yml      # Orchestrates all services
├── .env                    # Environment variables
├── client/                 # React Frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── context/        # React Context (Auth)
│       └── api.js          # Axios API client
├── server/                 # Node.js Backend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js        # Express app entry
│       ├── db.js           # PostgreSQL connection
│       ├── middleware/     # Auth middleware
│       └── routes/         # API routes
├── nginx/                  # Reverse Proxy
│   └── nginx.conf
└── db/                     # Database
    └── init.sql            # Schema initialization
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Pantry
- `GET /api/pantry` - Get all pantry items
- `GET /api/pantry/expiring` - Get expiring items
- `POST /api/pantry` - Add new item
- `PUT /api/pantry/:id` - Update item
- `DELETE /api/pantry/:id` - Delete item

### Recipes
- `GET /api/recipes/suggestions` - Get recipe suggestions
- `GET /api/recipes/:id` - Get recipe details
- `POST /api/recipes/save` - Save a recipe
- `GET /api/recipes/saved/all` - Get saved recipes
- `DELETE /api/recipes/saved/:id` - Remove saved recipe

### Categories
- `GET /api/categories` - Get all categories

## 🛠️ Development

### Run without Docker

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm start
```

**Database:**
```bash
# Start PostgreSQL locally and run db/init.sql
```

## 📦 Tech Stack Details

- **React 18** - Frontend framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **date-fns** - Date formatting
- **Express 4** - Backend framework
- **PostgreSQL 15** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Spoonacular API** - Recipe suggestions
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy

## 🎨 Screenshots

The app includes:
- Clean, modern dashboard with stats
- Pantry management with filtering
- Recipe cards with ingredient matching
- Responsive design for mobile

## 📄 License

MIT License

---

