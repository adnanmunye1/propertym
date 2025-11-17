# Test/Seed Data Guide

## Overview

The PropertyM system includes seed data functionality to populate the database with realistic sample data for testing and demonstration purposes.

---

## What's Included

The seed script creates:

### 📊 Properties (3)
1. **Sunrise Apartments** - 12 units in Nairobi CBD
2. **Green Valley Villas** - 8 luxury villas on Ngong Road
3. **Downtown Commercial Complex** - 6 shops in Mombasa

### 🏠 Units (26 total)
- **20 occupied units** with active tenants
- **5 vacant units** ready to rent
- **1 unit in maintenance**
- Mix of apartments, villas, and commercial spaces

### 👥 Tenants (20)
- Realistic Kenyan names
- Complete contact information
- Various occupations and employers
- Mix of payment statuses

### 🔑 Active Tenancies (20)
- Started at various dates (0-12 months ago)
- Different rent amounts
- **4 tenants in arrears** (realistic scenario)
- **16 tenants current/in credit**

### 💰 Payments (100+)
- Deposit payments
- Monthly rent payments
- Various payment methods (M-Pesa, Bank Transfer, Cash)
- Payment history going back several months

### 📄 Invoices (40+)
- Current month invoices
- Previous month invoices
- Mix of paid, pending, and overdue

### 👤 Demo User
- **Email:** demo@propertym.com
- **Password:** Demo@123
- **Role:** OWNER (full access)

---

## How to Use

### Initial Setup with Seed Data

If setting up for the first time:

```bash
cd backend

# Run migrations
npm run prisma:migrate

# Seed database with test data
npm run prisma:seed
```

### Adding Seed Data to Existing Database

If you already have a database:

```bash
cd backend

# Seed the database (will clear existing test data first)
npm run prisma:seed
```

**Note:** This will NOT delete your real users, only test data (properties, units, tenants, etc.)

---

## Viewing the Data

### Using Prisma Studio

```bash
cd backend
npm run prisma:studio
```

Opens at http://localhost:5555 - Browse all database tables visually.

### Using the Application

1. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login:**
   - Go to http://localhost:3000
   - Email: `demo@propertym.com`
   - Password: `Demo@123`

4. **Explore:**
   - **Dashboard** - See metrics and arrears alerts
   - **Properties** - Browse 3 sample properties
   - **Units** - View 26 units with various statuses
   - **Tenants** - See 20 tenants with different payment statuses
   - **Payments** - View payment history
   - **Reports** - Generate reports with real data

---

## Sample Data Details

### Properties

#### Sunrise Apartments (Nairobi)
- **Location:** 123 Kimathi Street, Nairobi CBD
- **Type:** Apartment building
- **Units:** 12 units (1A-3D)
- **Rent Range:** KES 18,000 - 35,000
- **Bedrooms:** 1-3 bedroom units
- **Status:** 10 occupied, 2 vacant

#### Green Valley Villas (Nairobi)
- **Location:** 45 Ngong Road, Nairobi
- **Type:** Standalone villas
- **Units:** 8 villas
- **Rent:** KES 75,000 per villa
- **Bedrooms:** 4 bedrooms each
- **Status:** 6 occupied, 2 vacant

#### Downtown Commercial Complex (Mombasa)
- **Location:** 78 Moi Avenue, Mombasa
- **Type:** Commercial shops
- **Units:** 6 shops
- **Rent:** KES 45,000 per shop
- **Status:** 4 occupied, 1 maintenance, 1 vacant

### Tenants in Arrears

The seed data includes 4 tenants (20%) who are behind on rent:
- Owing 1-3 months rent
- Realistic scenario for testing arrears tracking
- Will appear on dashboard alerts
- Show in arrears reports

### Payment Methods Distribution

- **M-Pesa** - Most common (60%)
- **Bank Transfer** - Common (25%)
- **Cash** - Occasional (15%)

---

## Clearing Test Data

### Clear All Test Data

When you're ready to use the system with real data:

```bash
cd backend
npm run prisma:clear
```

This will delete:
- ✅ All properties
- ✅ All units
- ✅ All tenants
- ✅ All tenancies
- ✅ All payments
- ✅ All invoices
- ✅ All documents
- ✅ Demo user (demo@propertym.com)

**Your real users will NOT be deleted.**

### After Clearing

Create your first real user:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "YourSecurePassword123!",
    "firstName": "Your",
    "lastName": "Name",
    "role": "OWNER"
  }'
```

---

## Automatic Clearing

You can also modify the seed script to automatically clear test data when a real user (non-demo user) is created. This can be done by:

1. Adding a check in the user creation endpoint
2. Detecting if demo user exists and real user is being created
3. Automatically running the clear script

**Example implementation location:** `backend/src/controllers/auth.controller.ts`

---

## Docker Deployment

### Seeding with Docker

If using Docker:

```bash
# Seed the database
docker-compose exec backend npm run prisma:seed

# Clear test data
docker-compose exec backend npm run prisma:clear
```

### Automatic Seeding on Startup

To automatically seed on first deployment, add to your deployment script:

```bash
# In deploy.sh, after migrations
docker-compose exec -T backend npm run prisma:seed
```

---

## Customizing Seed Data

### Modify the Seed Script

Edit `backend/prisma/seed.ts` to customize:

1. **Number of properties:**
   ```typescript
   // Add more property objects
   const property4 = await prisma.property.create({...});
   ```

2. **Number of units:**
   ```typescript
   // Change the loop count
   for (let i = 1; i <= 20; i++) { // Increase from 12
   ```

3. **Tenant names:**
   ```typescript
   // Modify tenantData array
   const tenantData = [
     { firstName: 'Your', lastName: 'Name', ... },
   ];
   ```

4. **Payment amounts:**
   ```typescript
   // Change rent amounts
   rentAmount: 30000, // Instead of 25000
   ```

### Re-run After Changes

```bash
npm run prisma:seed
```

---

## Testing Scenarios

The seed data enables testing:

### ✅ Happy Path
- View properties with units
- See occupied units
- Browse tenant details
- Check payment history
- Generate reports with data

### ✅ Arrears Management
- Dashboard shows 4 tenants in arrears
- Arrears report shows overdue amounts
- Test payment recording reduces arrears
- See balance updates in real-time

### ✅ Reports
- Payment report with date range
- Arrears report with realistic data
- Occupancy report showing 77% occupancy

### ✅ Different Property Types
- Apartments (small units)
- Villas (large luxury units)
- Commercial (shops)

### ✅ Various Unit Statuses
- Occupied (with tenants)
- Vacant (available to rent)
- Maintenance (temporarily unavailable)

---

## Troubleshooting

### Error: Unique constraint failed

**Cause:** Demo user already exists

**Solution:**
```bash
# Clear all data first
npm run prisma:clear

# Then seed again
npm run prisma:seed
```

### Error: Foreign key constraint

**Cause:** Attempting to delete in wrong order

**Solution:** The clear script deletes in correct order. Always use:
```bash
npm run prisma:clear
```

### Error: Cannot find module 'bcryptjs'

**Cause:** Dependencies not installed

**Solution:**
```bash
cd backend
npm install
```

### Error: ts-node command not found

**Cause:** Dev dependencies not installed

**Solution:**
```bash
cd backend
npm install --include=dev
```

---

## Production Warning

**⚠️ IMPORTANT:** Do not run seed scripts in production!

The seed script is for development and demonstration only. In production:

1. ❌ Do NOT run `npm run prisma:seed`
2. ✅ Create users via the registration API
3. ✅ Enter real property data through the UI
4. ✅ Backup data regularly

---

## Summary

### Quick Commands

```bash
# Seed database
cd backend && npm run prisma:seed

# View data in browser
npm run prisma:studio

# Clear test data
npm run prisma:clear
```

### Demo Login

- **URL:** http://localhost:3000
- **Email:** demo@propertym.com
- **Password:** Demo@123

### What You'll See

- 3 properties
- 26 units (20 occupied)
- 20 tenants
- 100+ payments
- 40+ invoices
- 4 tenants in arrears
- Realistic dashboard metrics

---

**Enjoy exploring PropertyM with realistic sample data!** 🎉

When you're ready for production, simply run `npm run prisma:clear` to remove all test data.

