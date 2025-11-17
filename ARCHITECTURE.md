# System Architecture

## Property Management Application - Architecture Document

### System Overview

This is a three-tier web application consisting of:
1. **Presentation Layer** - Next.js frontend
2. **Application Layer** - Express.js REST API
3. **Data Layer** - PostgreSQL database + File storage

---

## Entity Relationship Design

### Core Entities

#### 1. User
**Purpose:** System authentication and access control

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | System generated |
| email | String | UNIQUE, NOT NULL | Login identifier |
| password | String | NOT NULL | Bcrypt hashed |
| firstName | String | NOT NULL | |
| lastName | String | NOT NULL | |
| role | Enum | NOT NULL | OWNER, STAFF |
| isActive | Boolean | DEFAULT true | Soft delete |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

#### 2. Property
**Purpose:** Represents a building or standalone house

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | System generated |
| name | String | NOT NULL | e.g., "Mbagathi Apartments" |
| type | String | NOT NULL | e.g., "Apartment block" |
| area | String | | Estate or area |
| town | String | | |
| county | String | | |
| address | String | | Full address |
| description | Text | | Optional details |
| isActive | Boolean | DEFAULT true | Soft delete |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Relationships:**
- Has many Units
- Has many Documents
- Has many PropertyImages

#### 3. Unit
**Purpose:** Represents a rental unit within a property

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | System generated |
| propertyId | UUID | FK, NOT NULL | References Property |
| name | String | NOT NULL | e.g., "A1", "House 3" |
| bedrooms | Integer | | Optional |
| bathrooms | Integer | | Optional |
| floor | String | | Optional |
| size | Decimal | | Square meters, optional |
| rentAmount | Decimal | NOT NULL | Monthly rent in KES |
| depositAmount | Decimal | NOT NULL | Security deposit in KES |
| status | Enum | NOT NULL | VACANT, OCCUPIED, RESERVED, INACTIVE |
| notes | Text | | Internal comments |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Relationships:**
- Belongs to one Property
- Has many Tenancies
- Has one current active Tenancy
- Has many Invoices
- Has many Documents
- Has many UnitImages

**Constraints:**
- UNIQUE (propertyId, name) - No duplicate unit names per property

#### 4. Tenant
**Purpose:** Represents a person renting a unit

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | System generated |
| firstName | String | NOT NULL | |
| lastName | String | NOT NULL | |
| idNumber | String | NOT NULL | ID or passport |
| phone | String | NOT NULL | Kenyan format |
| email | String | | Optional |
| emergencyContactName | String | | Optional |
| emergencyContactPhone | String | | Optional |
| status | Enum | NOT NULL | ACTIVE, NOTICE_GIVEN, FORMER |
| notes | Text | | Internal comments |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Relationships:**
- Has many Tenancies
- Has one current active Tenancy
- Has many Payments
- Has many Documents

**Constraints:**
- Can have only one active Tenancy at a time

#### 5. Tenancy
**Purpose:** Links a tenant to a unit for a period

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | System generated |
| tenantId | UUID | FK, NOT NULL | References Tenant |
| unitId | UUID | FK, NOT NULL | References Unit |
| moveInDate | Date | NOT NULL | |
| moveOutDate | Date | | Null if active |
| depositPaid | Decimal | NOT NULL | Amount paid as deposit |
| depositPaidDate | Date | | |
| depositRefunded | Decimal | DEFAULT 0 | Amount refunded |
| depositRefundDate | Date | | |
| depositStatus | Enum | NOT NULL | HELD, REFUNDED, FORFEITED |
| isActive | Boolean | NOT NULL | Only one active per tenant/unit |
| notes | Text | | |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Relationships:**
- Belongs to one Tenant
- Belongs to one Unit
- Has many Invoices

**Constraints:**
- Only one active Tenancy per Unit
- Only one active Tenancy per Tenant

#### 6. Invoice
**Purpose:** Represents monthly rent charges

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | System generated |
| tenancyId | UUID | FK, NOT NULL | References Tenancy |
| tenantId | UUID | FK, NOT NULL | References Tenant (denormalized) |
| unitId | UUID | FK, NOT NULL | References Unit (denormalized) |
| period | String | NOT NULL | e.g., "2025-01" |
| dueDate | Date | NOT NULL | Typically 1st of month |
| rentAmount | Decimal | NOT NULL | Base rent in KES |
| additionalCharges | Decimal | DEFAULT 0 | Optional extras |
| totalAmount | Decimal | NOT NULL | rentAmount + additionalCharges |
| paidAmount | Decimal | DEFAULT 0 | Calculated from payments |
| status | Enum | NOT NULL | PENDING, PARTIALLY_PAID, PAID, OVERDUE |
| notes | Text | | |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Relationships:**
- Belongs to one Tenancy
- Belongs to one Tenant (denormalized)
- Belongs to one Unit (denormalized)
- Has many Payments

**Constraints:**
- UNIQUE (tenancyId, period) - One invoice per tenancy per period

#### 7. Payment
**Purpose:** Records rent payments received

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | System generated |
| tenantId | UUID | FK, NOT NULL | References Tenant |
| unitId | UUID | FK, NOT NULL | References Unit |
| invoiceId | UUID | FK | Primary invoice, nullable |
| paymentDate | Date | NOT NULL | When payment received |
| amount | Decimal | NOT NULL | Amount in KES |
| method | Enum | NOT NULL | MPESA, BANK, CASH, AIRTEL, OTHER |
| reference | String | | Transaction code |
| notes | Text | | |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Relationships:**
- Belongs to one Tenant
- Belongs to one Unit
- Optionally belongs to one Invoice

#### 8. Document
**Purpose:** Stores uploaded files metadata

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | System generated |
| fileName | String | NOT NULL | Original file name |
| fileSize | Integer | NOT NULL | Size in bytes |
| mimeType | String | NOT NULL | e.g., "application/pdf" |
| storageKey | String | NOT NULL | S3 key or file path |
| storageUrl | String | NOT NULL | Access URL (signed) |
| documentType | Enum | NOT NULL | AGREEMENT, NOTICE, ID, RECEIPT, OTHER |
| entityType | Enum | NOT NULL | PROPERTY, UNIT, TENANT, SYSTEM |
| propertyId | UUID | FK | Optional |
| unitId | UUID | FK | Optional |
| tenantId | UUID | FK | Optional |
| uploadedBy | UUID | FK, NOT NULL | References User |
| notes | Text | | |
| createdAt | DateTime | NOT NULL | |
| updatedAt | DateTime | NOT NULL | |

**Relationships:**
- Optionally belongs to Property
- Optionally belongs to Unit
- Optionally belongs to Tenant
- Belongs to User (uploader)

#### 9. PropertyImage & UnitImage
**Purpose:** Store property and unit photos

Similar structure to Document but simpler:

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | System generated |
| propertyId/unitId | UUID | FK, NOT NULL | Parent entity |
| fileName | String | NOT NULL | |
| storageKey | String | NOT NULL | S3 key |
| storageUrl | String | NOT NULL | Access URL |
| isPrimary | Boolean | DEFAULT false | Featured image |
| createdAt | DateTime | NOT NULL | |

---

## Data Relationships Summary

```
User (authentication only)

Property (1) ─┬─ (many) Unit (1) ─┬─ (many) Tenancy (many) ─── Tenant
              │                     │
              │                     ├─ (many) Invoice
              │                     │
              │                     └─ (many) UnitImage
              │
              ├─ (many) PropertyImage
              │
              └─ (many) Document

Tenant ─┬─ (many) Tenancy
        │
        ├─ (many) Payment
        │
        └─ (many) Document

Invoice ─── (many) Payment

Document ─── Property, Unit, or Tenant (optional polymorphic)
```

---

## Key Business Rules

### 1. Tenant-Unit Assignment
- A Unit can have only ONE active Tenancy at a time
- A Tenant can have only ONE active Tenancy at a time
- When Tenancy is created: Unit status → OCCUPIED, Tenant status → ACTIVE
- When Tenancy ends: Unit status → VACANT, Tenant status → FORMER

### 2. Invoice Generation
- Invoices created monthly for each active Tenancy
- Invoice period must be unique per Tenancy
- Invoice amount is based on Unit's current rentAmount at time of generation
- Changing Unit rent doesn't affect existing Invoices

### 3. Payment Allocation
- Payments link to Tenant and Unit (required)
- Payments optionally link to primary Invoice
- Payment amounts update Invoice.paidAmount
- Invoice status updates based on paid amount:
  - `PENDING`: paidAmount = 0
  - `PARTIALLY_PAID`: 0 < paidAmount < totalAmount
  - `PAID`: paidAmount >= totalAmount
  - `OVERDUE`: status = PENDING or PARTIALLY_PAID AND dueDate < today

### 4. Arrears Calculation
For each Tenant:
```
Total Billed = SUM(Invoice.totalAmount for all invoices)
Total Paid = SUM(Payment.amount for all payments)
Balance = Total Billed - Total Paid
Arrears = SUM(Invoice.totalAmount - Invoice.paidAmount WHERE dueDate < today)
Days Overdue = MIN(today - Invoice.dueDate WHERE status IN (PENDING, PARTIALLY_PAID, OVERDUE))
```

### 5. Deposit Tracking
- Deposits tracked per Tenancy
- Deposit is separate from rent payments
- Deposit can be HELD, REFUNDED, or FORFEITED
- Refund recorded with date and amount

### 6. Soft Deletes
- Properties: marked inactive rather than deleted if they have history
- Units: marked INACTIVE rather than deleted
- Tenants: marked FORMER rather than deleted if they have payment history
- Payments and Invoices: should not be deleted; require confirmation if allowed

---

## API Architecture

### API Structure

```
/api
  /auth
    POST   /login
    POST   /logout
    GET    /me
    POST   /refresh
    POST   /reset-password
  
  /properties
    GET    /               (list, paginated, filterable)
    POST   /               (create)
    GET    /:id            (detail)
    PATCH  /:id            (update)
    DELETE /:id            (soft delete/archive)
    GET    /:id/units      (units for property)
    POST   /:id/images     (upload property image)
    DELETE /:id/images/:imageId
  
  /units
    GET    /               (list, paginated, filterable)
    POST   /               (create)
    GET    /:id            (detail with tenant, payments)
    PATCH  /:id            (update)
    DELETE /:id            (soft delete)
    POST   /:id/images     (upload unit image)
    DELETE /:id/images/:imageId
  
  /tenants
    GET    /               (list, paginated, filterable, searchable)
    POST   /               (create)
    GET    /:id            (detail)
    PATCH  /:id            (update)
    GET    /:id/balance    (computed balance and arrears)
    GET    /:id/invoices   (invoice history)
    GET    /:id/payments   (payment history)
    POST   /:id/move-in    (assign to unit)
    POST   /:id/move-out   (vacate unit)
  
  /tenancies
    GET    /               (list)
    POST   /               (create - move in)
    PATCH  /:id            (update - move out, etc.)
  
  /invoices
    GET    /               (list, filterable by tenant, unit, period)
    POST   /               (create single)
    POST   /generate       (bulk generate for period)
    GET    /:id            (detail)
    PATCH  /:id            (update)
  
  /payments
    GET    /               (list, filterable, paginated)
    POST   /               (record payment)
    GET    /:id            (detail)
    PATCH  /:id            (update)
    DELETE /:id            (delete with confirmation)
  
  /documents
    GET    /               (list, filterable)
    POST   /               (upload)
    GET    /:id            (get signed URL)
    DELETE /:id            (delete)
  
  /dashboard
    GET    /metrics        (summary stats)
    GET    /arrears        (tenants in arrears)
  
  /reports
    GET    /payments       (payments report with filters, exportable)
    GET    /arrears        (arrears report, exportable)
    GET    /occupancy      (occupancy report)
    GET    /export/:type   (CSV/Excel export)
```

### Authentication Middleware
All API routes except `/auth/login` require valid JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Frontend Architecture

### Directory Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Authenticated layout
│   │   ├── page.tsx             # Dashboard
│   │   ├── properties/
│   │   │   ├── page.tsx         # List
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx     # Detail
│   │   │   └── new/
│   │   │       └── page.tsx     # Create
│   │   ├── tenants/
│   │   ├── payments/
│   │   ├── documents/
│   │   ├── reports/
│   │   └── settings/
│   └── api/                     # Optional API routes for Next.js
├── components/
│   ├── ui/                      # shadcn components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── main-layout.tsx
│   ├── properties/
│   ├── tenants/
│   └── shared/
├── lib/
│   ├── api.ts                   # API client
│   ├── auth.ts                  # Auth utilities
│   ├── utils.ts                 # General utilities
│   └── validations.ts           # Zod schemas
├── hooks/
│   ├── useAuth.ts
│   ├── useProperties.ts
│   └── ...
├── types/
│   └── index.ts                 # TypeScript types
└── styles/
    └── globals.css
```

### State Management Strategy

1. **Server State:** TanStack Query for API data
2. **Form State:** React Hook Form
3. **Auth State:** Context API + localStorage/cookies
4. **UI State:** React hooks (useState, useReducer)

---

## Security Architecture

### Authentication Flow

1. **Login:**
   - User submits email + password
   - Backend validates credentials
   - Backend generates JWT (1 hour expiry) + refresh token (7 days)
   - Tokens sent to frontend
   - Frontend stores tokens securely (httpOnly cookie or localStorage)

2. **Authenticated Requests:**
   - Frontend includes JWT in Authorization header
   - Backend middleware validates JWT
   - Backend extracts user ID from token
   - Request proceeds if valid

3. **Token Refresh:**
   - When JWT expires, frontend uses refresh token
   - Backend validates refresh token
   - Backend generates new JWT
   - Frontend updates stored token

### File Storage Security

1. Files uploaded to S3 private bucket (or private directory)
2. Files NOT publicly accessible
3. Access via signed URLs with 15-minute expiration
4. Backend generates signed URL on request
5. Frontend displays file via temporary URL

---

## Database Indexes

Essential indexes for performance:

```sql
-- Properties
CREATE INDEX idx_properties_is_active ON properties(is_active);

-- Units
CREATE INDEX idx_units_property_id ON units(property_id);
CREATE INDEX idx_units_status ON units(status);
CREATE UNIQUE INDEX idx_units_property_name ON units(property_id, name);

-- Tenants
CREATE INDEX idx_tenants_phone ON tenants(phone);
CREATE INDEX idx_tenants_status ON tenants(status);

-- Tenancies
CREATE INDEX idx_tenancies_tenant_id ON tenancies(tenant_id);
CREATE INDEX idx_tenancies_unit_id ON tenancies(unit_id);
CREATE INDEX idx_tenancies_is_active ON tenancies(is_active);

-- Invoices
CREATE INDEX idx_invoices_tenancy_id ON invoices(tenancy_id);
CREATE INDEX idx_invoices_tenant_id ON invoices(tenant_id);
CREATE INDEX idx_invoices_unit_id ON invoices(unit_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_period ON invoices(period);

-- Payments
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- Documents
CREATE INDEX idx_documents_entity_type ON documents(entity_type);
CREATE INDEX idx_documents_property_id ON documents(property_id);
CREATE INDEX idx_documents_unit_id ON documents(unit_id);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
```

---

## Deployment Architecture

### Development
```
Frontend: localhost:3000
Backend: localhost:5000
Database: localhost:5432 (Docker)
File Storage: Local filesystem
```

### Production
```
Frontend: Vercel (or similar)
Backend: Railway/Render (or AWS EC2)
Database: Railway Postgres (or AWS RDS)
File Storage: AWS S3
```

### Environment Variables

**Backend (.env):**
```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
AWS_REGION=...
FRONTEND_URL=https://app.example.com
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://api.example.com
```

---

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Type safety across the stack
- ✅ Scalable data model
- ✅ Secure authentication and file handling
- ✅ Extensible for Phase 2 features
- ✅ Performance optimized with proper indexing

