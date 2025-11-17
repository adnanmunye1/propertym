# Week 3 Implementation Plan

## Goal: Tenants, Relationships, and Move-in/Move-out Workflows

### Week 3 Objectives:
1. ✅ Implement Tenant CRUD operations
2. ✅ Implement Tenancy management (move-in/move-out)
3. ✅ Enforce business rules (one tenant per unit, one unit per tenant)
4. ✅ Automatic status updates (unit ↔ tenant)
5. ✅ Tenant search and filtering
6. ✅ Emergency contact management
7. ✅ Tenancy history tracking
8. ✅ Phone number validation (Kenyan format)
9. ✅ Deposit tracking per tenancy
10. ✅ Clean UI for tenant workflows

---

## Backend Implementation

### 1. Tenant Controller (`src/controllers/tenant.controller.ts`)
- **Create** tenant with phone validation
- **List** tenants (paginated, searchable, filterable)
- **Get** tenant by ID with current tenancy
- **Update** tenant details
- **Archive** tenant (Former status)
- **Get balance** and arrears (placeholder for Week 4)
- **Get payment history** (placeholder for Week 4)

### 2. Tenancy Controller (`src/controllers/tenancy.controller.ts`)
- **Move-in** - Assign tenant to unit
  - Check unit is vacant
  - Check tenant has no active tenancy
  - Update unit status to OCCUPIED
  - Update tenant status to ACTIVE
  - Record deposit information
- **Move-out** - Vacate unit
  - Update tenancy move-out date
  - Set tenancy inactive
  - Update unit status to VACANT
  - Update tenant status to FORMER
  - Handle deposit refund/forfeiture
- **List** tenancies with filters
- **Get** tenancy by ID

### 3. Validation & Business Rules
- Phone number validation (Kenyan format: +2547xxxxxxxx or 07xxxxxxxx)
- One active tenancy per unit enforcement
- One active tenancy per tenant enforcement
- Automatic status synchronization
- Deposit amount tracking

### 4. Helper Utilities
- Phone number formatter
- Kenyan phone validation regex
- Status update helpers

---

## Frontend Implementation

### 1. Tenants Module

**Pages:**
- `/tenants` - List all tenants (table with search/filters)
- `/tenants/new` - Create new tenant
- `/tenants/[id]` - Tenant detail with history
- `/tenants/[id]/edit` - Edit tenant

**Components:**
- `TenantList` - Table with search, status filters
- `TenantCard` - Tenant information card
- `TenantForm` - Create/edit form with phone validation
- `TenantDetail` - Detail view with tabs (Profile, Payments, History)
- `MoveInDialog` - Dialog for assigning tenant to unit
- `MoveOutDialog` - Dialog for vacating unit
- `PhoneInput` - Kenyan phone number input with validation

**Features:**
- Search by name, phone, ID number
- Filter by status (Active, Notice Given, Former)
- Filter by in-arrears (placeholder)
- Show current unit and property
- Show move-in date
- Emergency contact display

### 2. Tenancy Workflows

**Move-In:**
1. Select tenant (or create new)
2. Select vacant unit
3. Enter move-in date
4. Enter deposit amount
5. Validate and submit
6. System automatically:
   - Creates tenancy record
   - Updates unit status to OCCUPIED
   - Updates tenant status to ACTIVE

**Move-Out:**
1. From tenant detail or unit detail
2. Enter move-out date
3. Choose deposit action (refund/forfeit)
4. Enter refund amount if applicable
5. Submit
6. System automatically:
   - Updates tenancy with move-out date
   - Sets tenancy inactive
   - Updates unit status to VACANT
   - Updates tenant status to FORMER

---

## Validation Rules

### Tenant Validation:
- ✅ First name: Required, max 100 chars
- ✅ Last name: Required, max 100 chars
- ✅ ID number: Required, max 50 chars
- ✅ Phone: Required, Kenyan format (+2547... or 07...)
- ✅ Email: Optional, valid email format
- ✅ Emergency contact name: Optional, max 200 chars
- ✅ Emergency contact phone: Optional, Kenyan format

### Move-In Validation:
- ✅ Tenant: Required, must not have active tenancy
- ✅ Unit: Required, must be VACANT
- ✅ Move-in date: Required, not in future
- ✅ Deposit paid: Required, >= 0

### Move-Out Validation:
- ✅ Move-out date: Required, >= move-in date
- ✅ Deposit refund: Optional, <= deposit paid
- ✅ Tenancy must be active

---

## API Endpoints to Implement

### Tenants:
```
GET    /api/tenants              List (paginated, filtered, searchable)
POST   /api/tenants              Create
GET    /api/tenants/:id          Get detail with current tenancy
PATCH  /api/tenants/:id          Update
GET    /api/tenants/:id/balance  Get balance/arrears (placeholder)
GET    /api/tenants/:id/invoices Get invoices (placeholder)
GET    /api/tenants/:id/payments Get payments (placeholder)
```

### Tenancies:
```
GET    /api/tenancies            List all tenancies
POST   /api/tenancies/move-in    Create tenancy (move-in)
PATCH  /api/tenancies/:id/move-out   End tenancy (move-out)
GET    /api/tenancies/:id        Get tenancy detail
```

---

## Business Rules to Enforce

### Rule 1: One Tenant Per Unit
```
When moving in:
- Check if unit already has active tenancy
- Return error if unit is occupied
- Only VACANT units can be assigned
```

### Rule 2: One Unit Per Tenant
```
When moving in:
- Check if tenant already has active tenancy
- Return error if tenant is already renting
- Tenant must be in ACTIVE or FORMER status
```

### Rule 3: Status Synchronization
```
On Move-In:
  unit.status → OCCUPIED
  tenant.status → ACTIVE
  tenancy.isActive → true

On Move-Out:
  unit.status → VACANT
  tenant.status → FORMER
  tenancy.isActive → false
  tenancy.moveOutDate → set
```

### Rule 4: Deposit Handling
```
Move-In:
  Record deposit paid amount
  Record deposit paid date
  Set deposit status to HELD

Move-Out:
  Record refund amount (or 0 if forfeited)
  Record refund date
  Set deposit status to REFUNDED or FORFEITED
```

---

## Implementation Order

### Day 1-2: Backend Tenant Management
1. Tenant controller (CRUD)
2. Phone validation helper
3. Tenant routes
4. Testing tenant endpoints

### Day 3: Backend Tenancy Management
5. Tenancy controller (move-in/move-out)
6. Business rule validation
7. Status update logic
8. Tenancy routes

### Day 4-5: Frontend Tenant UI
9. Tenant list page
10. Tenant create/edit forms
11. Tenant detail page
12. Phone input component

### Day 6: Frontend Tenancy Workflows
13. Move-in dialog
14. Move-out dialog
15. Integration with unit/property pages
16. Tenancy history display

### Day 7: Polish & Testing
17. Error handling
18. Loading states
19. Empty states
20. End-to-end testing
21. Responsive design check

---

## Success Criteria

By end of Week 3:
- ✅ Can create, view, edit tenant profiles
- ✅ Can move tenant into vacant unit
- ✅ Unit becomes occupied, tenant becomes active
- ✅ Can move tenant out
- ✅ Unit becomes vacant, tenant becomes former
- ✅ Cannot assign multiple tenants to one unit
- ✅ Cannot assign one tenant to multiple units
- ✅ Deposit tracking works
- ✅ Tenancy history visible
- ✅ Phone validation for Kenyan numbers
- ✅ Search and filter tenants
- ✅ Clean, intuitive UI

---

## Data Flow Examples

### Move-In Flow:
```
1. User: Select tenant "John Doe"
2. User: Select unit "A1" from "Westlands Apartments"
3. User: Enter move-in date: 01/11/2025
4. User: Enter deposit: KES 30,000
5. Submit

Backend:
  - Validate unit is VACANT ✓
  - Validate tenant has no active tenancy ✓
  - Create Tenancy record
  - Update unit.status → OCCUPIED
  - Update tenant.status → ACTIVE
  - Return success

Frontend:
  - Show success message
  - Redirect to tenant detail
  - Show updated status
```

### Move-Out Flow:
```
1. User: From tenant detail, click "Move Out"
2. User: Enter move-out date: 30/11/2025
3. User: Choose deposit action: Refund
4. User: Enter refund amount: KES 30,000
5. Submit

Backend:
  - Validate tenancy exists and is active ✓
  - Validate move-out date >= move-in date ✓
  - Update tenancy.moveOutDate
  - Update tenancy.isActive → false
  - Update deposit info
  - Update unit.status → VACANT
  - Update tenant.status → FORMER
  - Return success

Frontend:
  - Show success message
  - Refresh tenant detail
  - Show updated status
```

---

Let's begin! 🚀

