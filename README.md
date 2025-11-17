# Property Management Web Application

A comprehensive property management system designed for Kenyan landlords to manage properties, units, tenants, rent payments, and arrears tracking.

## Tech Stack

### Frontend
- **Next.js 14** (App Router) with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **TanStack Query** for state management
- **React Hook Form** + Zod for forms and validation
- **Axios** for API calls

### Backend
- **Node.js** with **Express.js** and TypeScript
- **PostgreSQL** database
- **Prisma** ORM
- **JWT** authentication
- **Bcrypt** for password hashing
- **Winston** for logging

## Project Structure

```
Propertym/
├── backend/                 # Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Custom middleware
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
│
├── frontend/                # Next.js app
│   ├── app/
│   │   ├── (auth)/          # Auth pages
│   │   ├── (dashboard)/     # Dashboard pages
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── ui/              # UI components
│   │   ├── layout/          # Layout components
│   │   └── shared/          # Shared components
│   ├── lib/                 # Utilities
│   ├── hooks/               # Custom hooks
│   ├── types/               # TypeScript types
│   └── package.json
│
├── TECH_STACK.md            # Technology decisions
├── ARCHITECTURE.md          # System architecture
├── DATABASE_SCHEMA.md       # Database design
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ (Note: Next.js 16 requires Node 20+, but will work with 18 with warnings)
- PostgreSQL 15+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and secrets
   ```

4. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

5. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

6. **Start development server:**
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   The `.env.local` file should already exist with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

### Create First User

**Option 1: Use Demo Data (Recommended for Testing)**

Seed the database with sample data including a demo user:

```bash
cd backend
npm run prisma:seed
```

This creates:
- Demo user (demo@propertym.com / Demo@123)
- 3 properties with 26 units
- 20 tenants with payment history
- Realistic arrears scenarios

See **SEED_DATA_GUIDE.md** for complete details.

**Option 2: Create User Manually**

Create your own user via API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-secure-password",
    "firstName": "Admin",
    "lastName": "User",
    "role": "OWNER"
  }'
```

Or use a tool like Postman/Insomnia.

## 🎉 Project Status: COMPLETE (Week 8/8)

**PropertyM v1.0** is production-ready! All features implemented, tested, and documented.

### Quick Start (Docker):
```bash
./setup-production.sh  # Configure environment
./deploy.sh            # Deploy all services
```

See **DEPLOYMENT_GUIDE.md** for detailed instructions.

---

## Week 1 Deliverables ✅

### Documentation
- [x] Tech stack selection and documentation
- [x] System architecture design
- [x] Complete database schema with relationships
- [x] Project README and setup instructions

### Backend
- [x] Project setup with TypeScript, Express, and Prisma
- [x] Database schema defined and ready for migration
- [x] Authentication system (JWT, bcrypt)
- [x] User model and authentication endpoints
- [x] Middleware (auth, error handling)
- [x] Logging system
- [x] Placeholder routes for all modules

### Frontend
- [x] Next.js project setup with TypeScript and Tailwind
- [x] Design system (colors, typography, components)
- [x] UI component library (Button, Input, Card)
- [x] Authentication flow (login page)
- [x] Dashboard layout with sidebar and topbar
- [x] Protected routes
- [x] API client setup with axios
- [x] Custom hooks for authentication

### Features Implemented
- ✅ User login and logout
- ✅ JWT token-based authentication
- ✅ Authenticated layout with navigation
- ✅ Dashboard placeholder
- ✅ Responsive design
- ✅ Modern, clean UI

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/propertym_db"
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
STORAGE_TYPE=local
UPLOAD_DIR=./uploads
LOG_LEVEL=debug
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/register` - Create user (admin only)

### Other Endpoints
All other endpoints (`/api/properties`, `/api/units`, `/api/tenants`, etc.) are placeholder stubs that will be implemented in Week 2-8.

## Design System

### Colors
- **Primary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Typography
- **Font**: Inter (system fallback: system-ui, sans-serif)
- **Headings**: Bold, tight tracking
- **Body**: Regular, comfortable reading

### Components
- Clean, minimal design
- Consistent spacing (Tailwind scale)
- Subtle shadows and borders
- Smooth transitions and hover states

## All Weeks Complete ✅

### Week 1: Authentication & Foundation ✅
- Complete authentication system
- Database schema
- API foundation
- Modern UI design

### Week 2: Properties and Units ✅
- Property CRUD operations
- Unit CRUD operations
- Image upload functionality
- Property and unit pages

### Week 3: Tenants and Relationships ✅
- Tenant CRUD operations
- Tenant-unit assignment
- Move-in/move-out workflows
- Tenant search and filtering

### Week 4: Invoices, Payments, and Arrears ✅
- Invoice generation
- Payment recording
- Arrears calculation
- Balance tracking

### Week 5: Dashboard and Alerts ✅
- Dashboard metrics
- Arrears alerts
- Top overdue tenants
- Visual data display

### Week 6: Documents and Reports ✅
- Document upload and management
- Payment reports
- Arrears reports
- Occupancy reports
- CSV/Excel export

### Week 7: Security & Performance ✅
- Rate limiting
- Security headers
- Performance optimization
- Comprehensive logging

### Week 8: Testing & Deployment ✅
- Docker deployment
- Complete documentation
- Testing procedures
- Production ready

---

## 📖 Documentation

### For All Users:
- **README.md** - Project overview (this file)
- **QUICKSTART.md** - Quick start guide

### For End Users:
- **USER_GUIDE.md** - Complete user manual

### For Administrators:
- **ADMIN_GUIDE.md** - System administration guide
- **DEPLOYMENT_GUIDE.md** - Deployment instructions

### For Developers:
- **API_DOCUMENTATION.md** - Complete API reference
- **TECH_STACK.md** - Technology decisions
- **ARCHITECTURE.md** - System architecture
- **DATABASE_SCHEMA.md** - Database design

### For QA/Testing:
- **TESTING_GUIDE.md** - Testing procedures

### Progress Documentation:
- **WEEK1_SUMMARY.md** through **WEEK8_SUMMARY.md**
- **WEEK8_COMPLETE.md** - Final completion status

---

## Next Steps (Week 2-8) - COMPLETED ✅

### Week 2: Properties and Units
- Implement property CRUD operations
- Implement unit CRUD operations
- Add image upload functionality
- Build property and unit list/detail pages

### Week 3: Tenants and Relationships
- Implement tenant CRUD
- Tenant-unit assignment logic
- Move-in/move-out workflows
- Tenant search and filtering

### Week 4: Invoices, Payments, and Arrears
- Invoice generation logic
- Payment recording
- Arrears calculation
- Balance tracking

### Week 5: Dashboard and Alerts
- Dashboard metrics implementation
- Arrears alerts
- Top overdue tenants
- Visual charts

### Week 6: Documents and Reports
- Document upload and management
- Payment reports
- Arrears reports
- Occupancy reports
- CSV/Excel export

### Week 7: Polish and UX
- End-to-end testing
- UI/UX refinements
- Navigation improvements
- Validation enhancements

### Week 8: Security, Performance, and Deployment
- Security hardening
- Performance optimization
- Production deployment
- Documentation finalization

## License

MIT

## Support

For questions or issues, please contact the development team.

