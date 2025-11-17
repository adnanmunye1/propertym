# Technology Stack Documentation

## Property Management Web Application - Tech Stack

### Frontend Stack

**Core Framework:**
- **Next.js 14** (App Router) with TypeScript
  - Server-side rendering and static generation
  - Built-in API routes capability
  - Excellent developer experience and performance
  - Easy deployment to Vercel or other platforms

**UI & Styling:**
- **Tailwind CSS** - Utility-first CSS framework for rapid, modern UI development
- **shadcn/ui** - High-quality, accessible React components built on Radix UI
- **Lucide React** - Beautiful, consistent icons

**State Management & Data Fetching:**
- **React Hook Form** - Performant form handling
- **Zod** - TypeScript-first schema validation
- **TanStack Query (React Query)** - Server state management and caching

**Additional Libraries:**
- **date-fns** - Date manipulation and formatting (DD/MM/YYYY)
- **recharts** - Charts for dashboard
- **xlsx** - Excel export functionality

### Backend Stack

**Core Framework:**
- **Node.js** with **Express.js** and **TypeScript**
  - Fast, lightweight, well-documented
  - Large ecosystem of middleware
  - Easy to scale

**Database:**
- **PostgreSQL 15+**
  - Robust relational database
  - ACID compliance for financial data integrity
  - Excellent performance and indexing
  - JSON support for flexible fields if needed

**ORM:**
- **Prisma**
  - Type-safe database access
  - Automatic migrations
  - Excellent TypeScript integration
  - Visual database browser

**Authentication:**
- **JWT (JSON Web Tokens)** with **bcrypt** for password hashing
  - Stateless authentication
  - Secure token-based sessions
  - Easy to implement and maintain

**File Storage:**
- **AWS S3** or **Cloudinary** (configurable)
  - Secure document storage
  - Signed URLs for protected access
  - Scalable and reliable
  - Local filesystem fallback for development

**Additional Libraries:**
- **express-validator** - Request validation middleware
- **multer** - File upload handling
- **winston** - Structured logging
- **cors** - Cross-origin resource sharing
- **helmet** - Security headers

### Development Tools

**Code Quality:**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety across the stack

**Version Control:**
- **Git** with conventional commits

### Deployment & Infrastructure

**Hosting Options:**
- **Frontend:** Vercel or Netlify
- **Backend:** Railway, Render, or AWS EC2
- **Database:** Railway, Supabase, or AWS RDS
- **File Storage:** AWS S3 or Cloudinary

**Environment Configuration:**
- Environment variables for all sensitive config
- Separate development, staging, and production environments

### Security Measures

1. **Authentication:**
   - Bcrypt for password hashing (12 rounds)
   - JWT with secure secret and expiration
   - HTTP-only cookies option

2. **API Security:**
   - Helmet.js for security headers
   - CORS configuration
   - Rate limiting middleware
   - Input validation on all endpoints

3. **Database:**
   - Parameterized queries (via Prisma)
   - Connection pooling
   - Regular automated backups

4. **File Storage:**
   - Signed URLs with expiration
   - No public bucket access
   - File type and size validation

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  Next.js 14 + TypeScript + Tailwind + shadcn/ui            │
│  (Port 3000)                                                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTP/REST API
                  │ (JWT Authentication)
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                         BACKEND                             │
│  Express.js + TypeScript + Prisma                          │
│  (Port 5000)                                                │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
┌───────────────┐   ┌──────────────┐
│  PostgreSQL   │   │  AWS S3 /    │
│   Database    │   │  File Storage│
└───────────────┘   └──────────────┘
```

### Why This Stack?

1. **TypeScript Throughout:** Type safety reduces bugs and improves developer experience
2. **Modern & Maintained:** All technologies are actively maintained with strong communities
3. **Scalable:** Can handle growth from dozens to thousands of units
4. **Developer Experience:** Excellent tooling and documentation
5. **Production-Ready:** Battle-tested stack used by thousands of companies
6. **Cost-Effective:** Can start with free tiers and scale as needed
7. **Kenyan Context:** Works well with local hosting providers and payment gateways (future M-Pesa integration)

### Future Extensibility

This stack supports Phase 2 requirements:
- ✅ Tenant portal (authentication already supports multiple user types)
- ✅ Automated jobs (Node.js cron jobs or scheduled functions)
- ✅ SMS/Email integration (easy to add services like Twilio, Africa's Talking)
- ✅ M-Pesa integration (REST API compatible)
- ✅ PWA support (Next.js supports PWA out of the box)
- ✅ Mobile apps (can share API with React Native if needed)

