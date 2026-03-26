# 🪑 Jothi Industrial And Furniture - Full Stack E-Commerce

**Jothi Industrial And Furniture** | Ilampillai, Salem, Tamil Nadu  
GST: 33MUBPS8703H1ZA

A complete MERN stack furniture e-commerce application with advanced Space Optimizer tool.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env — set your MONGODB_URI
npm install
node seed.js          # Seed database with sample data
npm run dev           # Start on port 5000
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev           # Start on port 5173
```

### 3. Open Browser
```
http://localhost:5173
```

---

## 🔑 Test Accounts

| Role     | Email                          | Password     |
|----------|-------------------------------|--------------|
| Admin    | admin@jothifurniture.com       | admin123     |
| Customer | customer@test.com              | customer123  |

---

## 🏗️ Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | React 18, Vite, React Router v6     |
| State        | Zustand                             |
| 3D/2D        | Three.js, HTML5 Canvas              |
| Backend      | Node.js, Express.js                 |
| Database     | MongoDB + Mongoose                  |
| Auth         | JWT + bcryptjs                      |
| HTTP Client  | Axios                               |
| Styling      | Pure CSS (earthy theme)             |

---

## 📁 Project Structure

```
jothi-furniture/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express API routes
│   ├── middleware/       # Auth middleware
│   ├── server.js        # Main entry point
│   ├── seed.js          # Database seeder
│   └── .env.example     # Environment template
│
└── frontend/
    └── src/
        ├── pages/       # Page components
        ├── components/  # Reusable components
        ├── store/       # Zustand state stores
        ├── styles/      # Global CSS
        ├── App.jsx      # Router setup
        └── main.jsx     # Entry point
```

---

## ✨ Features

- **Authentication** — JWT login/register, role-based access
- **Product Catalog** — Search, filter by category, price range, sort, pagination
- **Product Details** — Reviews, ratings, dimensions
- **Cart & Checkout** — Persistent cart, order placement with shipping
- **Space Optimizer** — 2D canvas drag & drop + 3D Three.js visualization
- **Admin Panel** — Manage products, orders, queries, inventory
- **Contact System** — Customer queries with admin response tracking

---

## 🌿 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jothi-furniture
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```
