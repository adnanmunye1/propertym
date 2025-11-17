# Database Schema Documentation

## Overview

This document describes the complete database schema for the Property Management application. The schema is designed to handle properties, units, tenants, rent invoicing, payments, arrears tracking, and document management for Kenyan property management.

## Schema Visualization

```
┌─────────────┐
│    User     │
│ (Auth only) │
└─────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Property    │────────>│     Unit     │────────>│   Tenancy    │
│              │  1:many │              │  1:many │              │
│ - name       │         │ - name       │         │ - moveInDate │
│ - address    │         │ - rentAmount │         │ - moveOutDate│
│ - type       │         │ - status     │         │ - deposit    │
└──────────────┘         └──────┬───────┘         └──────┬───────┘
      │                         │                        │
      │ 1:many                  │ 1:many                 │ many:1
      │                         │                        │
      ▼                         ▼                        ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│PropertyImage │         │  UnitImage   │         │    Tenant    │
└──────────────┘         └──────────────┘         │              │
                                                   │ - name       │
┌──────────────┐                                   │ - phone      │
│   Document   │<──────────────────────────────────│ - idNumber   │
│              │                                   └──────┬───────┘
│ (polymorphic)│                                          │
└──────────────┘                                          │ 1:many
                                                          │
                         ┌──────────────┐                │
                         │   Invoice    │<───────────────┘
                         │              │
                         │ - period     │
                         │ - dueDate    │
                         │ - amount     │
                         │ - status     │
                         └──────┬───────┘
                                │
                                │ 1:many
                                │
                                ▼
                         ┌──────────────┐
                         │   Payment    │
                         │              │
                         │ - date       │
                         │ - amount     │
                         │ - method     │
                         └──────────────┘
```

## Enums

### UserRole
```sql
OWNER    - Full access to all features
STAFF    - Staff member (permissions TBD in Phase 2)
```

### PropertyType
```sql
APARTMENT_BLOCK
SINGLE_HOUSE
BEDSITTER_BLOCK
COMMERCIAL
OTHER
```

### UnitStatus
```sql
VACANT      - Unit is available
OCCUPIED    - Unit has active tenant
RESERVED    - Unit is reserved
INACTIVE    - Unit not in use
```

### TenantStatus
```sql
ACTIVE         - Currently renting
NOTICE_GIVEN   - Has given notice to vacate
FORMER         - No longer renting
```

### DepositStatus
```sql
HELD       - Deposit is being held
REFUNDED   - Deposit has been returned
FORFEITED  - Deposit was not returned
```

### InvoiceStatus
```sql
PENDING         - Not paid, not yet due or just due
PARTIALLY_PAID  - Some payment received
PAID            - Fully paid
OVERDUE         - Past due date and not fully paid
```

### PaymentMethod
```sql
MPESA          - M-Pesa mobile payment
BANK_TRANSFER  - Bank transfer
CASH           - Cash payment
AIRTEL_MONEY   - Airtel Money
OTHER          - Other payment method
```

### DocumentType
```sql
AGREEMENT  - Tenancy agreement
NOTICE     - Notices (vacate, rent increase)
ID         - ID or passport scan
RECEIPT    - Payment receipt
OTHER      - Other documents
```

### EntityType
```sql
PROPERTY   - Document linked to property
UNIT       - Document linked to unit
TENANT     - Document linked to tenant
SYSTEM     - System-level document
```

## Detailed Table Definitions

### 1. users
Authentication and user management

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | | Login email |
| password | VARCHAR(255) | NOT NULL | | Bcrypt hashed password |
| first_name | VARCHAR(100) | NOT NULL | | User first name |
| last_name | VARCHAR(100) | NOT NULL | | User last name |
| role | UserRole | NOT NULL | 'OWNER' | User role |
| is_active | BOOLEAN | NOT NULL | true | Account active status |
| created_at | TIMESTAMP | NOT NULL | now() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | now() | Last update time |

**Indexes:**
- `idx_users_email` on `email`
- `idx_users_is_active` on `is_active`

---

### 2. properties
Property (building) information

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| name | VARCHAR(255) | NOT NULL | | Property name |
| type | PropertyType | NOT NULL | | Property type |
| area | VARCHAR(100) | | | Estate or area |
| town | VARCHAR(100) | | | Town/city |
| county | VARCHAR(100) | | | County |
| address | TEXT | | | Full address |
| description | TEXT | | | Property description |
| is_active | BOOLEAN | NOT NULL | true | Active/archived status |
| created_at | TIMESTAMP | NOT NULL | now() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | now() | Last update time |

**Indexes:**
- `idx_properties_is_active` on `is_active`
- `idx_properties_name` on `name`

---

### 3. property_images
Property photos

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| property_id | UUID | FK → properties(id), NOT NULL, ON DELETE CASCADE | | Parent property |
| file_name | VARCHAR(255) | NOT NULL | | Original file name |
| storage_key | VARCHAR(500) | NOT NULL | | S3 key or file path |
| storage_url | VARCHAR(500) | NOT NULL | | Access URL |
| is_primary | BOOLEAN | NOT NULL | false | Featured image flag |
| created_at | TIMESTAMP | NOT NULL | now() | Upload time |

**Indexes:**
- `idx_property_images_property_id` on `property_id`

---

### 4. units
Rental units within properties

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| property_id | UUID | FK → properties(id), NOT NULL, ON DELETE RESTRICT | | Parent property |
| name | VARCHAR(100) | NOT NULL | | Unit name/number |
| bedrooms | INTEGER | | | Number of bedrooms |
| bathrooms | INTEGER | | | Number of bathrooms |
| floor | VARCHAR(50) | | | Floor level |
| size | DECIMAL(10,2) | | | Size in sq meters |
| rent_amount | DECIMAL(10,2) | NOT NULL | | Monthly rent (KES) |
| deposit_amount | DECIMAL(10,2) | NOT NULL | | Security deposit (KES) |
| status | UnitStatus | NOT NULL | 'VACANT' | Current status |
| notes | TEXT | | | Internal notes |
| created_at | TIMESTAMP | NOT NULL | now() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | now() | Last update time |

**Indexes:**
- `idx_units_property_id` on `property_id`
- `idx_units_status` on `status`
- `idx_units_property_name` UNIQUE on `(property_id, name)`

**Constraints:**
- `chk_rent_positive` CHECK `rent_amount > 0`
- `chk_deposit_positive` CHECK `deposit_amount >= 0`

---

### 5. unit_images
Unit photos

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| unit_id | UUID | FK → units(id), NOT NULL, ON DELETE CASCADE | | Parent unit |
| file_name | VARCHAR(255) | NOT NULL | | Original file name |
| storage_key | VARCHAR(500) | NOT NULL | | S3 key or file path |
| storage_url | VARCHAR(500) | NOT NULL | | Access URL |
| is_primary | BOOLEAN | NOT NULL | false | Featured image flag |
| created_at | TIMESTAMP | NOT NULL | now() | Upload time |

**Indexes:**
- `idx_unit_images_unit_id` on `unit_id`

---

### 6. tenants
Tenant (renter) profiles

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| first_name | VARCHAR(100) | NOT NULL | | First name |
| last_name | VARCHAR(100) | NOT NULL | | Last name |
| id_number | VARCHAR(50) | NOT NULL | | ID or passport number |
| phone | VARCHAR(20) | NOT NULL | | Phone number |
| email | VARCHAR(255) | | | Email address |
| emergency_contact_name | VARCHAR(200) | | | Emergency contact name |
| emergency_contact_phone | VARCHAR(20) | | | Emergency contact phone |
| status | TenantStatus | NOT NULL | 'ACTIVE' | Current status |
| notes | TEXT | | | Internal notes |
| created_at | TIMESTAMP | NOT NULL | now() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | now() | Last update time |

**Indexes:**
- `idx_tenants_phone` on `phone`
- `idx_tenants_status` on `status`
- `idx_tenants_id_number` on `id_number`
- `idx_tenants_name` on `(first_name, last_name)`

---

### 7. tenancies
Links tenants to units for rental periods

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| tenant_id | UUID | FK → tenants(id), NOT NULL, ON DELETE RESTRICT | | Tenant |
| unit_id | UUID | FK → units(id), NOT NULL, ON DELETE RESTRICT | | Unit |
| move_in_date | DATE | NOT NULL | | Move-in date |
| move_out_date | DATE | | | Move-out date (null if active) |
| deposit_paid | DECIMAL(10,2) | NOT NULL | 0 | Deposit amount paid |
| deposit_paid_date | DATE | | | Deposit payment date |
| deposit_refunded | DECIMAL(10,2) | NOT NULL | 0 | Deposit refunded amount |
| deposit_refund_date | DATE | | | Deposit refund date |
| deposit_status | DepositStatus | NOT NULL | 'HELD' | Deposit status |
| is_active | BOOLEAN | NOT NULL | true | Active tenancy flag |
| notes | TEXT | | | Internal notes |
| created_at | TIMESTAMP | NOT NULL | now() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | now() | Last update time |

**Indexes:**
- `idx_tenancies_tenant_id` on `tenant_id`
- `idx_tenancies_unit_id` on `unit_id`
- `idx_tenancies_is_active` on `is_active`
- `idx_tenancies_move_in_date` on `move_in_date`

**Constraints:**
- `chk_deposit_paid_positive` CHECK `deposit_paid >= 0`
- `chk_deposit_refunded_positive` CHECK `deposit_refunded >= 0`
- `chk_move_out_after_move_in` CHECK `move_out_date IS NULL OR move_out_date >= move_in_date`

**Business Logic (enforced in application):**
- Only ONE active tenancy per unit
- Only ONE active tenancy per tenant

---

### 8. invoices
Monthly rent invoices

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| tenancy_id | UUID | FK → tenancies(id), NOT NULL, ON DELETE RESTRICT | | Parent tenancy |
| tenant_id | UUID | FK → tenants(id), NOT NULL, ON DELETE RESTRICT | | Tenant (denormalized) |
| unit_id | UUID | FK → units(id), NOT NULL, ON DELETE RESTRICT | | Unit (denormalized) |
| period | VARCHAR(7) | NOT NULL | | Period (YYYY-MM format) |
| due_date | DATE | NOT NULL | | Payment due date |
| rent_amount | DECIMAL(10,2) | NOT NULL | | Base rent amount (KES) |
| additional_charges | DECIMAL(10,2) | NOT NULL | 0 | Additional charges (KES) |
| total_amount | DECIMAL(10,2) | NOT NULL | | Total amount due (KES) |
| paid_amount | DECIMAL(10,2) | NOT NULL | 0 | Amount paid (KES) |
| status | InvoiceStatus | NOT NULL | 'PENDING' | Invoice status |
| notes | TEXT | | | Internal notes |
| created_at | TIMESTAMP | NOT NULL | now() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | now() | Last update time |

**Indexes:**
- `idx_invoices_tenancy_id` on `tenancy_id`
- `idx_invoices_tenant_id` on `tenant_id`
- `idx_invoices_unit_id` on `unit_id`
- `idx_invoices_period` on `period`
- `idx_invoices_due_date` on `due_date`
- `idx_invoices_status` on `status`
- `idx_invoices_tenancy_period` UNIQUE on `(tenancy_id, period)`

**Constraints:**
- `chk_amounts_positive` CHECK `rent_amount > 0 AND additional_charges >= 0 AND total_amount > 0 AND paid_amount >= 0`
- `chk_paid_not_exceed_total` CHECK `paid_amount <= total_amount`

**Computed Fields (in application):**
- `total_amount = rent_amount + additional_charges`
- Status updated based on `paid_amount` and `due_date`

---

### 9. payments
Rent payment records

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| tenant_id | UUID | FK → tenants(id), NOT NULL, ON DELETE RESTRICT | | Payer tenant |
| unit_id | UUID | FK → units(id), NOT NULL, ON DELETE RESTRICT | | Related unit |
| invoice_id | UUID | FK → invoices(id), ON DELETE SET NULL | | Primary invoice (optional) |
| payment_date | DATE | NOT NULL | | Payment received date |
| amount | DECIMAL(10,2) | NOT NULL | | Payment amount (KES) |
| method | PaymentMethod | NOT NULL | | Payment method |
| reference | VARCHAR(100) | | | Transaction reference/code |
| notes | TEXT | | | Internal notes |
| created_at | TIMESTAMP | NOT NULL | now() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL | now() | Last update time |

**Indexes:**
- `idx_payments_tenant_id` on `tenant_id`
- `idx_payments_unit_id` on `unit_id`
- `idx_payments_invoice_id` on `invoice_id`
- `idx_payments_payment_date` on `payment_date`
- `idx_payments_method` on `method`

**Constraints:**
- `chk_amount_positive` CHECK `amount > 0`

---

### 10. documents
Document metadata and storage references

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | gen_random_uuid() | Unique identifier |
| file_name | VARCHAR(255) | NOT NULL | | Original file name |
| file_size | INTEGER | NOT NULL | | File size in bytes |
| mime_type | VARCHAR(100) | NOT NULL | | MIME type |
| storage_key | VARCHAR(500) | NOT NULL | | S3 key or file path |
| storage_url | VARCHAR(500) | NOT NULL | | Access URL |
| document_type | DocumentType | NOT NULL | | Document category |
| entity_type | EntityType | NOT NULL | | Linked entity type |
| property_id | UUID | FK → properties(id), ON DELETE SET NULL | | Linked property |
| unit_id | UUID | FK → units(id), ON DELETE SET NULL | | Linked unit |
| tenant_id | UUID | FK → tenants(id), ON DELETE SET NULL | | Linked tenant |
| uploaded_by | UUID | FK → users(id), NOT NULL, ON DELETE RESTRICT | | Uploader user |
| notes | TEXT | | | Internal notes |
| created_at | TIMESTAMP | NOT NULL | now() | Upload time |
| updated_at | TIMESTAMP | NOT NULL | now() | Last update time |

**Indexes:**
- `idx_documents_entity_type` on `entity_type`
- `idx_documents_property_id` on `property_id`
- `idx_documents_unit_id` on `unit_id`
- `idx_documents_tenant_id` on `tenant_id`
- `idx_documents_uploaded_by` on `uploaded_by`
- `idx_documents_document_type` on `document_type`

---

## Critical Business Logic

### Arrears Calculation Logic

Executed at runtime for each tenant:

```sql
-- Get total billed
SELECT SUM(total_amount) as total_billed
FROM invoices
WHERE tenant_id = :tenant_id

-- Get total paid
SELECT SUM(amount) as total_paid
FROM payments
WHERE tenant_id = :tenant_id

-- Current balance
balance = total_billed - total_paid

-- Arrears (overdue only)
SELECT SUM(total_amount - paid_amount) as arrears
FROM invoices
WHERE tenant_id = :tenant_id
  AND due_date < CURRENT_DATE
  AND status IN ('PENDING', 'PARTIALLY_PAID', 'OVERDUE')

-- Days overdue (oldest unpaid invoice)
SELECT MIN(CURRENT_DATE - due_date) as days_overdue
FROM invoices
WHERE tenant_id = :tenant_id
  AND due_date < CURRENT_DATE
  AND status IN ('PENDING', 'PARTIALLY_PAID', 'OVERDUE')
```

### Payment Allocation Logic

When a payment is recorded:

1. Update `invoices.paid_amount` for the linked invoice
2. Recalculate invoice status:
   - If `paid_amount >= total_amount`: status = PAID
   - If `paid_amount > 0 AND paid_amount < total_amount`: status = PARTIALLY_PAID
   - If `paid_amount = 0 AND due_date < today`: status = OVERDUE
   - If `paid_amount = 0`: status = PENDING
3. Update dashboard metrics

### Tenancy Status Updates

**Move In:**
1. Create new Tenancy record with `is_active = true`
2. Update Unit: `status = OCCUPIED`
3. Update Tenant: `status = ACTIVE`
4. Validate: No other active tenancy for this unit or tenant

**Move Out:**
1. Update Tenancy: `is_active = false`, `move_out_date = :date`
2. Update Unit: `status = VACANT`
3. Update Tenant: `status = FORMER`
4. Handle deposit refund/forfeiture

---

## Data Integrity Rules

1. **Foreign Key Cascades:**
   - Images: CASCADE delete when parent is deleted
   - Financial records (invoices, payments): RESTRICT delete
   - Documents: SET NULL when parent is soft-deleted

2. **Soft Deletes:**
   - Properties, Units, Tenants use `is_active` flag
   - Never hard-delete records with financial history

3. **Unique Constraints:**
   - Unit names must be unique within a property
   - One invoice per tenancy per period
   - Email must be unique for users

4. **Check Constraints:**
   - All monetary amounts must be positive
   - Paid amounts cannot exceed total amounts
   - Move-out dates must be after move-in dates

---

## Backup and Recovery

**Backup Strategy:**
- Daily automated backups at 2 AM EAT
- Retention: 30 days
- Monthly backups retained for 1 year

**Recovery Process:**
1. Stop application
2. Restore database from backup
3. Verify data integrity
4. Restart application

---

This schema is optimized for:
✅ Data integrity and consistency
✅ Query performance with proper indexing
✅ Kenyan property management workflows
✅ Financial accuracy and audit trails
✅ Scalability to thousands of units and tenants
✅ Future extensibility (tenant portal, automation)

