# Vercel Deployment Guide for Jothi Furniture Store

## 📋 Overview

This guide will help you deploy your Furniture Store application to **Vercel** (frontend) and **Render/Railway** (backend).

---

## 🚀 Quick Deploy Options

### Option 1: Deploy Frontend to Vercel + Backend to Render (Recommended)

#### **Step 1: Deploy Backend to Render.com**

1. Go to https://render.com and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `https://github.com/Kumudha369/Furniture-Store`
4. Configure:
   - **Name:** jothi-furniture-backend
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add Environment Variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://your-mongodb-atlas-uri
   JWT_SECRET=your-production-jwt-secret
   JWT_EXPIRE=7d
   NODE_ENV=production
   ```
6. Click **"Create Web Service"**
7. Copy your backend URL (e.g., `https://jothi-furniture-backend.onrender.com`)

#### **Step 2: Update Frontend API URL**

Create a `.env.production` file in the `frontend` folder:

```bash
cd frontend
echo "VITE_API_URL=https://jothi-furniture-backend.onrender.com" > .env.production
```

Or manually create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-url.onrender.com
```

#### **Step 3: Deploy Frontend to Vercel**

**Method A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to frontend folder
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

**Method B: Using Vercel Website**

1. Go to https://vercel.com/new
2. Import your GitHub repository: `https://github.com/Kumudha369/Furniture-Store`
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory: `frontend`** (IMPORTANT!)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
5. Click **"Deploy"**

---

### Option 2: Deploy Both to Vercel (Serverless Functions)

⚠️ **Note:** This requires significant backend refactoring for serverless functions. Not recommended for this project.

---

## 🔧 Alternative Backend Hosting Options

### 1. **Railway.app** (Easy MongoDB Integration)
- Visit: https://railway.app
- New Project → Deploy from GitHub
- Root Directory: `backend`
- Add MongoDB plugin
- Set environment variables

### 2. **Heroku** (Classic Choice)
```bash
# Install Heroku CLI
# Then run:
cd backend
heroku create jothi-furniture-backend
heroku config:set MONGODB_URI=your-mongo-uri
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

### 3. **MongoDB Atlas** (Database)
1. Go to https://mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Use in `MONGODB_URI` environment variable

---

## 📝 Important Notes

### Environment Variables

**Backend (Render/Railway):**
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jothi-furniture
JWT_SECRET=super_secret_production_key_change_this
JWT_EXPIRE=7d
NODE_ENV=production
```

**Frontend (Vercel):**
```
VITE_API_URL=https://your-backend-url.onrender.com
```

### CORS Configuration

Your backend already has CORS enabled, which is perfect for Vercel deployment.

### Database Migration

If you have existing data:
1. Export from local MongoDB using `mongodump`
2. Import to MongoDB Atlas using `mongorestore`

---

## ✅ Testing After Deployment

1. **Test Backend API:**
   ```
   https://your-backend-url.onrender.com/api/products
   ```

2. **Test Frontend:**
   ```
   https://your-app.vercel.app
   ```

3. **Check Browser Console** for any API errors

---

## 🐛 Troubleshooting

### Frontend Can't Connect to Backend
- ✅ Check CORS settings in backend
- ✅ Verify `VITE_API_URL` is set correctly
- ✅ Ensure backend is running (not in sleep mode)

### Backend Errors
- ✅ Check MongoDB connection string
- ✅ Verify all environment variables are set
- ✅ Check logs in Render/Railway dashboard

### Build Failures on Vercel
- ✅ Ensure root directory is set to `frontend`
- ✅ Check `package.json` has correct build script
- ✅ Review build logs in Vercel dashboard

---

## 🎯 Recommended Stack

| Component | Service | Why |
|-----------|---------|-----|
| Frontend | Vercel | Free, fast CDN, automatic HTTPS |
| Backend | Render | Free tier, easy setup, PostgreSQL support |
| Database | MongoDB Atlas | Free tier, managed service, reliable |

---

## 📞 Support

If you need help:
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas
