# Week 4 Implementation Plan

## Goal: Invoices, Payments, Balances, and Arrears Logic

This is the **core financial module** that makes the system valuable for property management!

### Week 4 Objectives:
1. ✅ Implement Invoice generation (monthly rent charges)
2. ✅ Implement Payment recording (M-Pesa, Bank, Cash, Airtel)
3. ✅ Payment allocation to invoices
4. ✅ Arrears calculation (overdue amounts)
5. ✅ Balance tracking per tenant
6. ✅ Invoice status management (PENDING, PAID, OVERDUE, PARTIALLY_PAID)
7. ✅ Dashboard metrics (rent due, rent received, arrears)
8. ✅ Payment history views
9. ✅ Arrears indicators on tenant pages
10. ✅ Proper financial data validation

---

## Backend Implementation

### 1. Invoice Controller (`src/controllers/invoice.controller.ts`)
- **Generate invoices** - Create invoices for active tenancies
- **Bulk generate** - Generate invoices for all active tenancies for a period
- **List invoices** - Filtered by tenant, unit, period, status
- **Get invoice** - By ID with payment details
- **Update invoice** - Modify amounts or notes
- **Calculate invoice status** - Based on payments received

### 2. Payment Controller (`src/controllers/payment.controller.ts`)
- **Record payment** - Create payment record
- **List payments** - Filtered by date, tenant, property, method
- **Get payment** - By ID
- **Update payment** - Edit amount or details
- **Delete payment** - With recalculation
- **Allocate to invoice** - Update invoice paid amounts

### 3. Arrears Service (`src/services/arrears.service.ts`)
- **Calculate tenant balance** - Total billed vs total paid
- **Calculate arrears** - Overdue invoice amounts
- **Days overdue** - For oldest unpaid invoice
- **Arrears by property** - Summary statistics
- **Top arrears list** - Worst 5-10 tenants

### 4. Invoice Status Logic
- **PENDING** - Not paid, not yet due
- **PARTIALLY_PAID** - Some payment received
- **PAID** - Fully paid
- **OVERDUE** - Past due date, not fully paid

### 5. Payment Allocation Logic
When payment recorded:
1. Link to invoice if specified
2. Update invoice.paidAmount
3. Recalculate invoice.status
4. Update tenant balance
5. Trigger arrears recalculation

---

## Frontend Implementation

### 1. Payments Module

**Pages:**
- `/payments` - List all payments (table with filters)
- `/payments/new` - Record new payment form
- `/payments/[id]` - Payment detail (optional)

**Components:**
- `PaymentList` - Table with date, tenant, amount, method
- `PaymentForm` - Record payment with tenant/unit/invoice selection
- `PaymentMethodBadge` - Visual indicators for M-Pesa, Bank, etc.

**Features:**
- Filter by date range
- Filter by payment method
- Filter by property
- Filter by tenant
- Quick record from tenant detail
- Quick record from unit detail
- Invoice linking (if applicable)

### 2. Invoices Module

**Pages:**
- `/invoices` - List all invoices (table)
- `/invoices/generate` - Bulk generation form
- `/invoices/[id]` - Invoice detail with payments

**Components:**
- `InvoiceList` - Table with period, tenant, amount, status
- `GenerateInvoicesForm` - Select period and generate
- `InvoiceDetail` - Show invoice with payment allocations
- `InvoiceStatusBadge` - Color-coded status

**Features:**
- Filter by period (month/year)
- Filter by status
- Filter by tenant
- Generate for single month
- View payment history per invoice

### 3. Arrears Display

**Updates to Existing Pages:**
- **Dashboard** - Add real metrics
  - Total rent due this month
  - Total rent received this month
  - Total arrears amount
  - Number of tenants in arrears
  - Top 5 tenants in arrears list

- **Tenant Detail** - Add balance section
  - Total billed (all-time)
  - Total paid (all-time)
  - Current balance
  - Arrears amount (overdue only)
  - Days overdue
  - Visual indicator (On time / X days late)

- **Tenant List** - Add balance column
  - Show current balance
  - Highlight negative balances (arrears)

### 4. New UI Components

- `PaymentMethodSelect` - Dropdown for M-Pesa, Bank, Cash, Airtel, Other
- `DateRangePicker` - Select start and end dates
- `StatusIndicator` - Visual arrears indicators (On time, 7 days, 30+ days)
- `MonthPeriodPicker` - Select YYYY-MM format

---

## Calculation Logic

### Invoice Generation:
```
For each active tenancy:
  1. Get unit rent amount
  2. Check if invoice exists for period
  3. If not, create invoice:
     - period: "YYYY-MM"
     - dueDate: 1st of month (configurable)
     - rentAmount: unit.rentAmount
     - additionalCharges: 0 (can be added)
     - totalAmount: rentAmount + additionalCharges
     - paidAmount: 0
     - status: PENDING
```

### Payment Allocation:
```
When payment recorded:
  1. Create payment record
  2. If invoice specified:
     - Add to invoice.paidAmount
     - Recalculate invoice.status:
       - paidAmount >= totalAmount → PAID
       - paidAmount > 0 && < totalAmount → PARTIALLY_PAID
       - paidAmount = 0 && dueDate < today → OVERDUE
       - paidAmount = 0 → PENDING
  3. Update tenant balance
```

### Arrears Calculation:
```
For tenant:
  Total Billed = SUM(invoice.totalAmount)
  Total Paid = SUM(payment.amount)
  Balance = Total Billed - Total Paid
  
  Arrears = SUM(
    invoice.totalAmount - invoice.paidAmount
    WHERE invoice.dueDate < TODAY
    AND invoice.status IN (PENDING, PARTIALLY_PAID, OVERDUE)
  )
  
  Days Overdue = MIN(
    TODAY - invoice.dueDate
    WHERE invoice.status IN (PENDING, PARTIALLY_PAID, OVERDUE)
  )
```

---

## API Endpoints to Implement

### Invoices:
```
GET    /api/invoices                List (filtered by period, tenant, status)
POST   /api/invoices                Create single invoice
POST   /api/invoices/generate       Bulk generate for period
GET    /api/invoices/:id            Get detail with payments
PATCH  /api/invoices/:id            Update
GET    /api/invoices/tenant/:id     Get all invoices for tenant
```

### Payments:
```
GET    /api/payments                List (filtered by date, tenant, method)
POST   /api/payments                Record payment
GET    /api/payments/:id            Get detail
PATCH  /api/payments/:id            Update
DELETE /api/payments/:id            Delete with recalculation
GET    /api/payments/tenant/:id     Get payments for tenant
```

### Dashboard:
```
GET    /api/dashboard/metrics       Get summary statistics
GET    /api/dashboard/arrears       Get tenants in arrears
```

---

## Validation Rules

### Invoice Validation:
- ✅ Tenancy: Required, must exist
- ✅ Period: Required, format YYYY-MM
- ✅ Due date: Required
- ✅ Rent amount: Required, > 0
- ✅ Additional charges: >= 0
- ✅ Unique per tenancy per period

### Payment Validation:
- ✅ Tenant: Required, must exist
- ✅ Unit: Required, must exist
- ✅ Amount: Required, > 0
- ✅ Payment date: Required, not in future
- ✅ Method: Required, valid enum
- ✅ Reference: Optional

---

## Implementation Order

### Day 1-2: Invoice Backend
1. Invoice controller
2. Invoice generation logic
3. Invoice routes
4. Invoice status calculation

### Day 3: Payment Backend
5. Payment controller
6. Payment allocation logic
7. Payment routes
8. Invoice update on payment

### Day 4: Arrears & Balance
9. Arrears calculation service
10. Balance calculation per tenant
11. Dashboard metrics API
12. Update tenant balance endpoint

### Day 5-6: Frontend Financial UI
13. Payments list page
14. Record payment form
15. Invoices list page
16. Generate invoices form
17. Payment method dropdown

### Day 7: Dashboard & Integration
18. Update dashboard with real metrics
19. Add balance to tenant detail
20. Add arrears indicators
21. Payment history on tenant detail
22. Testing and polish

---

## Success Criteria

By end of Week 4:
- ✅ Can generate invoices manually or in bulk
- ✅ Can record payments with different methods
- ✅ Payments update invoice status automatically
- ✅ Arrears calculated correctly
- ✅ Dashboard shows real financial metrics
- ✅ Tenant detail shows balance and arrears
- ✅ Can see payment history
- ✅ Can filter payments and invoices
- ✅ Data integrity maintained

---

Let's begin! 🚀

