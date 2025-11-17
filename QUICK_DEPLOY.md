# 🚀 Quick Deploy Guide - Show Your Client in 15 Minutes

## Fastest Option: Railway.app

### Why Railway?
✅ Deploy entire stack (frontend, backend, database)  
✅ FREE $5/month credit  
✅ No credit card required  
✅ Takes 10-15 minutes  
✅ Get live URL instantly  

---

## 📋 Quick Steps

### 1. Push to GitHub (5 min)

```bash
cd /Users/munye/Documents/Propertym

git init
git add .
git commit -m "PropertyM - Ready for demo"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/propertym.git
git push -u origin main
```

### 2. Deploy on Railway (10 min)

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your PropertyM repo**
5. **Add PostgreSQL:** Click "New" → "Database" → "PostgreSQL"

### 3. Configure Services

#### Backend Service:
- **Root Directory:** `backend`
- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npm run build && npm start`

**Environment Variables:**
```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=super_secret_jwt_key_min_32_characters_long_12345
JWT_REFRESH_SECRET=super_secret_refresh_key_min_32_chars_67890
FRONTEND_URL=https://your-frontend.railway.app
```

#### Frontend Service:
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

**Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### 4. Run Migrations

In Railway backend terminal:
```bash
npx prisma migrate deploy
npm run prisma:seed
```

### 5. Get Your Live URLs! 🎉

Railway gives you URLs like:
- **Frontend:** `https://propertym-production.up.railway.app`
- **Backend:** `https://propertym-backend.up.railway.app`

---

## 🎯 Send to Client

**Demo URL:** Your Railway frontend URL  
**Login Credentials:**
- Email: `demo@propertym.com`
- Password: `Demo@123`

---

## ⚡ Even Faster Alternative: Render.com

If Railway doesn't work, try Render:

1. **Go to:** https://render.com
2. **New** → **Web Service** → Connect GitHub
3. **Add PostgreSQL** (free tier)
4. **Deploy!**

Same concept, different platform.

---

## 💡 Pro Tips

### Make it Professional:
1. **Custom Domain:** Add your own domain in Railway settings
2. **Remove Demo Data:** Run `npm run prisma:clear` before client demo
3. **Add Real Data:** Input 2-3 real properties with your client

### For the Demo:
- Show the **Dashboard** with charts
- Demo **Global Search** (Cmd/Ctrl + K)
- Record a **Quick Payment**
- Generate a **Report**

---

## 🆘 Need Help?

### Railway Issues:
- Check logs in Railway dashboard
- Verify environment variables
- Ensure DATABASE_URL is set

### Can't Deploy?
**Alternative:** Use **Render.com** or **Vercel + Supabase**

---

## ☎️ Quick Support

**Railway Docs:** https://docs.railway.app  
**Railway Discord:** Active community for help  

---

**Total Time:** 15 minutes  
**Cost:** $0 (Free tier)  
**Result:** Live demo URL for your client! 🚀

