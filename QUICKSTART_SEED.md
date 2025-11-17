# Quick Start with Demo Data

## 🚀 Get PropertyM Running with Sample Data in 5 Minutes

---

## Prerequisites

- Node.js 20+ installed
- PostgreSQL 15+ running
- Git (optional)

---

## Step 1: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
nano .env

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed with demo data
npm run prisma:seed
```

**✅ Backend ready with demo data!**

---

## Step 2: Start Backend

```bash
# Still in backend directory
npm run dev
```

**✅ Backend running on http://localhost:5000**

---

## Step 3: Setup & Start Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

**✅ Frontend running on http://localhost:3000**

---

## Step 4: Login & Explore

1. Open browser: **http://localhost:3000**

2. **Login with demo account:**
   - Email: `demo@propertym.com`
   - Password: `Demo@123`

3. **Explore the system:**
   - ✅ Dashboard with metrics
   - ✅ 3 properties
   - ✅ 26 units (occupied & vacant)
   - ✅ 20 tenants with payment history
   - ✅ Arrears alerts (4 tenants)
   - ✅ 100+ payments recorded
   - ✅ Reports with real data

---

## What You'll See

### Dashboard
- Total properties: **3**
- Total units: **26**
- Occupied: **20** | Vacant: **5** | Maintenance: **1**
- Rent collected this month
- **4 tenants in arrears** (red alerts)

### Properties
1. **Sunrise Apartments** (Nairobi) - 12 units
2. **Green Valley Villas** (Nairobi) - 8 villas
3. **Downtown Commercial** (Mombasa) - 6 shops

### Tenants
- 20 tenants with realistic Kenyan names
- Various occupations and employers
- Complete contact information
- Payment histories

### Payments
- 100+ payment records
- M-Pesa, Bank Transfer, Cash payments
- Payment references
- Multiple months of history

### Reports
- Payment reports with data
- Arrears reports showing overdue tenants
- Occupancy reports with statistics

---

## Docker Quick Start

If using Docker:

```bash
# Setup environment
./setup-production.sh

# Deploy
./deploy.sh

# Seed database
./seed-docker.sh

# Access at http://localhost:3000
```

---

## Clearing Demo Data

When ready for production:

```bash
cd backend
npm run prisma:clear
```

Or with Docker:
```bash
./clear-docker.sh
```

This removes all demo data but keeps your database structure.

---

## Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running
- Verify DATABASE_URL in .env file
- Test connection: `psql -U yourusername -d propertym_db`

### "Port 5000 already in use"
- Stop other processes on port 5000
- Or change PORT in backend/.env

### "Module not found"
- Run `npm install` in backend and frontend directories

### "Prisma client not generated"
- Run `npm run prisma:generate` in backend directory

---

## Next Steps

1. **Explore all features** using demo data
2. **Try adding new data** through the UI
3. **Generate reports** with date ranges
4. **Record payments** for tenants in arrears
5. **Add new properties, units, tenants**

When satisfied, **clear demo data** and start with real data!

---

## Demo Account Details

**Login URL:** http://localhost:3000

**Credentials:**
- Email: `demo@propertym.com`
- Password: `Demo@123`

**Tenants in Arrears:**
- Check Dashboard for red alerts
- 4 tenants owing 1-3 months rent
- Test payment recording to clear arrears

---

## Full Documentation

- **SEED_DATA_GUIDE.md** - Complete seed data details
- **USER_GUIDE.md** - How to use the system
- **API_DOCUMENTATION.md** - API reference
- **DEPLOYMENT_GUIDE.md** - Production deployment

---

**🎉 Enjoy exploring PropertyM with realistic demo data!**

*Total setup time: ~5 minutes*

