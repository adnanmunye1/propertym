# Deploy PropertyM to Railway - Quick Guide

## 🚀 Deploy in 10 Minutes

### Step 1: Prerequisites
- GitHub account
- Railway account (sign up at https://railway.app)

### Step 2: Push to GitHub

```bash
cd /Users/munye/Documents/Propertym

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - PropertyM"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/propertym.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Railway

1. **Go to Railway:** https://railway.app
2. **Login with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your PropertyM repository**

### Step 4: Add PostgreSQL Database

1. **In Railway project, click "New"**
2. **Select "Database" → "PostgreSQL"**
3. Railway will automatically create the database

### Step 5: Configure Backend

1. **Click on your backend service**
2. **Go to "Variables" tab**
3. **Add these variables:**

```
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your_super_secure_jwt_secret_min_32_chars_long
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_min_32_chars_long
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
STORAGE_TYPE=local
LOG_LEVEL=info
```

4. **Set root directory:** `backend`
5. **Set start command:** `npm run build && npm start`

### Step 6: Configure Frontend

1. **Add frontend service** (repeat deploy from GitHub)
2. **Go to "Variables" tab**
3. **Add:**

```
NEXT_PUBLIC_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

4. **Set root directory:** `frontend`
5. **Set build command:** `npm run build`
6. **Set start command:** `npm start`

### Step 7: Run Database Migrations

1. **Click on backend service**
2. **Go to "Settings" → "Deploy"**
3. **Add build command:**

```bash
cd backend && npm install && npx prisma generate && npx prisma migrate deploy
```

### Step 8: Seed Database (Optional)

In Railway backend terminal:

```bash
npm run prisma:seed
```

### Step 9: Get Your Live URL!

Railway will provide URLs like:
- **Frontend:** `https://propertym-frontend.up.railway.app`
- **Backend:** `https://propertym-backend.up.railway.app`

---

## ✅ Done!

Send the frontend URL to your client!

### Demo Credentials:
- **Email:** demo@propertym.com
- **Password:** Demo@123

---

## 💰 Pricing

**Railway Free Tier:**
- $5 credit per month
- Enough for demos and small projects
- No credit card required for trial

---

## 🔧 Troubleshooting

### If backend won't start:
1. Check DATABASE_URL is set correctly
2. Verify migrations ran successfully
3. Check logs in Railway dashboard

### If frontend can't connect:
1. Verify NEXT_PUBLIC_API_URL points to backend
2. Check CORS settings in backend
3. Ensure backend is running

---

## 📞 Support

If you need help, Railway has great docs:
https://docs.railway.app

