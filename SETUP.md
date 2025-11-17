# Quick Setup Guide

This guide will help you get the Property Management application running on your local machine.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** 18+ installed (`node -v`)
- **PostgreSQL** 15+ installed and running
- **npm** or **yarn** installed
- A terminal/command line interface

## Step-by-Step Setup

### 1. Database Setup

First, create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE propertym_db;

# Create user (optional)
CREATE USER propertym_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE propertym_db TO propertym_user;

# Exit psql
\q
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd /Users/munye/Documents/Propertym/backend

# Install dependencies (already done, but just in case)
npm install

# Update DATABASE_URL in .env file
# The .env file already exists, just verify the DATABASE_URL is correct:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/propertym_db?schema=public"

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start the backend server
npm run dev
```

Backend should now be running on **http://localhost:5000**

Test it:
```bash
curl http://localhost:5000/api/health
```

### 3. Create First User

With the backend running, create your first admin user:

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@propertym.com",
    "password": "Admin@123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "OWNER"
  }'
```

**Or using a REST client like Postman/Insomnia:**
- Method: POST
- URL: http://localhost:5000/api/auth/register
- Headers: Content-Type: application/json
- Body (JSON):
```json
{
  "email": "admin@propertym.com",
  "password": "Admin@123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "OWNER"
}
```

Save the credentials you used!

### 4. Frontend Setup

Open a **new terminal** (keep backend running):

```bash
# Navigate to frontend directory
cd /Users/munye/Documents/Propertym/frontend

# Install dependencies (already done, but just in case)
npm install

# Verify .env.local exists with correct API URL
# It should contain:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Start the frontend server
npm run dev
```

Frontend should now be running on **http://localhost:3000**

### 5. Login and Test

1. Open your browser and go to **http://localhost:3000**
2. You should be redirected to the login page
3. Login with the credentials you created:
   - Email: admin@propertym.com
   - Password: Admin@123
4. You should be redirected to the dashboard
5. Explore the navigation sidebar

## Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Database created and connected
- [ ] Prisma migrations completed
- [ ] First user created
- [ ] Login successful
- [ ] Dashboard displays
- [ ] Sidebar navigation visible
- [ ] Logout works

## Common Issues and Solutions

### Issue: Port 5000 already in use
**Solution:** Change PORT in `backend/.env` to another port (e.g., 5001), and update `NEXT_PUBLIC_API_URL` in `frontend/.env.local`

### Issue: Database connection failed
**Solution:** 
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `backend/.env` has correct credentials
- Ensure database `propertym_db` exists

### Issue: Prisma migrate fails
**Solution:**
```bash
# Reset database (warning: deletes all data)
cd backend
npx prisma migrate reset

# Or create manually
npx prisma db push
```

### Issue: Cannot connect to backend from frontend
**Solution:**
- Verify backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Check browser console for CORS errors

### Issue: Login returns 401 Unauthorized
**Solution:**
- Verify user was created successfully
- Check email and password are correct
- Look at backend logs for errors

### Issue: Node version warnings
**Solution:** Next.js 16 requires Node 20+, but works with 18. Consider upgrading:
```bash
# Using nvm
nvm install 20
nvm use 20
```

## Development Workflow

### Running Both Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Viewing Database

Use Prisma Studio to view/edit database:
```bash
cd backend
npx prisma studio
```

Opens at http://localhost:5555

### Viewing Logs

Backend logs are in:
- Console output (terminal)
- `backend/logs/error.log` (errors only)
- `backend/logs/combined.log` (all logs)

## What's Working (Week 1)

✅ User authentication (register, login, logout)  
✅ Protected routes  
✅ JWT token management with auto-refresh  
✅ Dashboard layout with navigation  
✅ Responsive design  
✅ Error handling  

## What's Coming (Week 2+)

⏳ Property management  
⏳ Unit management  
⏳ Tenant management  
⏳ Rent payment tracking  
⏳ Arrears calculation  
⏳ Document uploads  
⏳ Reports and exports  

## Need Help?

If you encounter issues:
1. Check this guide first
2. Review error messages in terminal
3. Check browser console (F12)
4. Look at backend logs
5. Verify all environment variables

## Next Steps

Once everything is running:
1. Explore the dashboard
2. Review the documentation in:
   - `TECH_STACK.md`
   - `ARCHITECTURE.md`
   - `DATABASE_SCHEMA.md`
   - `WEEK1_SUMMARY.md`
3. Get ready for Week 2 implementation!

---

**🎉 Congratulations! Your Property Management System is now running!**

