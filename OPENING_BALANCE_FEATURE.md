# Opening Balance / Arrears Feature

## Overview
This feature allows property managers to record outstanding arrears when migrating tenants from an old system to PropertyM.

## How It Works

### 1. **Creating a Tenant with Opening Balance**
When adding a new tenant, you can now specify an "Opening Balance" amount:
- Navigate to **Tenants → Add New Tenant**
- Fill in tenant details
- In the **"Opening Balance (For Migration)"** section, enter the amount in KES
- Leave empty or 0 if tenant has no outstanding balance

### 2. **Automatic Invoice Creation**
When a tenant with an opening balance is moved into a unit:
- An invoice is automatically created for the opening balance amount
- The invoice is marked as **OVERDUE** (due date set to 30 days ago)
- The invoice period is marked as `OPENING-YYYY-MM` to identify it as a migration invoice
- The invoice appears in the tenant's invoice list and arrears calculations

### 3. **Arrears Tracking**
The opening balance invoice:
- ✅ Appears in the tenant's arrears calculation
- ✅ Shows up in the dashboard arrears report
- ✅ Is included in total arrears metrics
- ✅ Can be paid off like any other invoice

## Technical Details

### Database Schema
- Added `opening_balance` field to `tenants` table (DECIMAL(10,2), nullable)
- Migration file: `20251118000000_add_opening_balance_to_tenant`

### API Changes
- **POST /tenants**: Now accepts `openingBalance` field (optional number)
- **POST /tenancies/move-in**: Automatically creates opening balance invoice if tenant has `openingBalance > 0`

### Frontend Changes
- Added "Opening Balance" input field to tenant creation form
- Field is optional and accepts decimal values
- Validation ensures value is >= 0

## Usage Example

**Scenario:** Migrating a tenant who owes KES 50,000 from the old system

1. **Create Tenant:**
   - Name: John Doe
   - Phone: +254712345678
   - **Opening Balance: 50000**
   - Click "Create Tenant"

2. **Move Tenant Into Unit:**
   - Go to tenant profile
   - Click "Move In"
   - Select unit and move-in date
   - Click "Move In"

3. **Result:**
   - Tenant is moved into unit
   - An invoice for KES 50,000 is automatically created
   - Invoice is marked as OVERDUE
   - Tenant appears in arrears reports with KES 50,000 outstanding

4. **Payment:**
   - When tenant pays, record payment against the opening balance invoice
   - Arrears will decrease accordingly

## Important Notes

- ⚠️ **Opening balance can only be set when creating a tenant** (not editable later)
- ⚠️ **Invoice is only created when tenant moves into a unit** (not when tenant is created)
- ⚠️ **If tenant already has an active tenancy**, opening balance invoice won't be created (to prevent duplicates)
- ✅ **Opening balance invoice can be paid off** like any regular invoice
- ✅ **Opening balance is included in all arrears calculations**

## Migration Steps for Production

1. **Run Database Migration:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

2. **Deploy Backend:**
   - Push changes to repository
   - Railway will auto-deploy

3. **Deploy Frontend:**
   - Push changes to repository
   - Railway will auto-deploy

4. **Verify:**
   - Create a test tenant with opening balance
   - Move tenant into unit
   - Verify invoice is created
   - Check arrears calculations

## Testing Checklist

- [ ] Create tenant with opening balance = 0 (should work normally)
- [ ] Create tenant with opening balance = 50000
- [ ] Move tenant into unit (should create invoice)
- [ ] Verify invoice appears in tenant's invoice list
- [ ] Verify invoice is marked as OVERDUE
- [ ] Verify tenant appears in arrears report
- [ ] Verify dashboard shows correct total arrears
- [ ] Record payment against opening balance invoice
- [ ] Verify arrears decrease after payment

