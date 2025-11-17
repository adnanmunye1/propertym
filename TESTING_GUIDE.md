# PropertyM Testing Guide

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Manual Testing Workflows](#manual-testing-workflows)
3. [API Testing](#api-testing)
4. [UI Testing](#ui-testing)
5. [Test Scenarios](#test-scenarios)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Test Checklist](#test-checklist)

---

## Testing Overview

### Testing Strategy

PropertyM uses a combination of:
- **Manual Testing**: User workflows and UI interactions
- **API Testing**: Backend endpoint validation
- **Integration Testing**: Full system workflows
- **Performance Testing**: Load and response times
- **Security Testing**: Authentication and authorization

### Testing Tools

- **Postman/Insomnia**: API testing
- **cURL**: Command-line API testing
- **Browser DevTools**: Frontend debugging
- **Prisma Studio**: Database inspection

---

## Manual Testing Workflows

### Workflow 1: Complete Property Setup

**Objective**: Test the full property creation and management flow

**Steps:**

1. **Login**
   - Navigate to login page
   - Enter credentials
   - Verify redirect to dashboard
   - ✅ Expected: Successful login, dashboard displays

2. **Create Property**
   - Click "Add Property" or navigate to Properties → New
   - Fill in form:
     - Name: "Test Apartments"
     - Address: "123 Test Street"
     - City: "Nairobi"
     - County: "Nairobi"
     - Property Type: "Apartment"
     - Total Units: 10
     - Description: "Test property"
   - Click Save
   - ✅ Expected: Property created, redirected to property list

3. **View Property**
   - Click on newly created property
   - ✅ Expected: Property details display correctly

4. **Edit Property**
   - Click "Edit Property"
   - Change description
   - Click Save
   - ✅ Expected: Changes saved successfully

---

### Workflow 2: Unit Management

**Objective**: Create and manage units

**Steps:**

1. **Create Unit**
   - Navigate to Units → New Unit
   - Select property: "Test Apartments"
   - Fill in details:
     - Unit Number: "A1"
     - Bedrooms: 2
     - Bathrooms: 1
     - Rent Amount: 25000
     - Deposit Amount: 25000
     - Status: "Vacant"
   - Click Save
   - ✅ Expected: Unit created successfully

2. **Create Multiple Units**
   - Create units A2, A3, A4 with varying specs
   - ✅ Expected: All units created

3. **View Units List**
   - Navigate to Units
   - Filter by property
   - Filter by status
   - ✅ Expected: Filters work correctly

4. **View Unit Details**
   - Click on unit A1
   - ✅ Expected: All details display correctly

---

### Workflow 3: Tenant Management & Move-In

**Objective**: Register tenant and assign to unit

**Steps:**

1. **Create Tenant**
   - Navigate to Tenants → New Tenant
   - Fill in details:
     - First Name: "Jane"
     - Last Name: "Smith"
     - Email: "jane.smith@example.com"
     - Phone: "+254712345678"
     - ID Number: "12345678"
     - Emergency Contact: "+254700000000"
   - Click Save
   - ✅ Expected: Tenant created

2. **Assign Tenant to Unit (Move-In)**
   - Go to tenant details
   - Click "Assign to Unit"
   - Select unit A1
   - Fill in tenancy details:
     - Start Date: Current date
     - Rent Amount: 25000
     - Deposit Amount: 25000
     - Rent Due Day: 5
     - Lease Term: "Fixed"
   - Click Create Tenancy
   - ✅ Expected: Tenancy created, unit marked as occupied

3. **Verify Unit Status**
   - Navigate to Units
   - Check unit A1 status
   - ✅ Expected: Status changed to "Occupied"

4. **View Tenant Balance**
   - Go to tenant details
   - ✅ Expected: Balance shows deposit credit (25000)

---

### Workflow 4: Payment Recording

**Objective**: Record rent payment and verify balance update

**Steps:**

1. **Record Payment**
   - Navigate to Payments → Record Payment
   - Select tenant: Jane Smith
   - Enter details:
     - Amount: 25000
     - Payment Date: 5th of current month
     - Payment Method: "M-Pesa"
     - Reference: "MPO123456789"
     - Notes: "January rent"
   - Click Save
   - ✅ Expected: Payment recorded

2. **Verify Balance Update**
   - Go to tenant details
   - Check balance
   - ✅ Expected: Balance = 0 (deposit 25000 - rent 25000)

3. **Record Second Payment**
   - Record another 25000 payment for next month
   - ✅ Expected: Balance = +25000 (credit)

4. **View Payment History**
   - Navigate to Payments
   - Filter by tenant
   - ✅ Expected: Both payments display

---

### Workflow 5: Arrears Management

**Objective**: Test arrears tracking and alerts

**Steps:**

1. **Create Tenant in Arrears**
   - Create new tenant "John Doe"
   - Assign to unit A2
   - Deposit: 20000, Rent: 20000
   - Start date: 2 months ago
   - ✅ Expected: Tenant created with tenancy

2. **Check Dashboard**
   - Navigate to Dashboard
   - ✅ Expected: Arrears alert shows John Doe with -40000 balance

3. **Record Partial Payment**
   - Record 15000 payment for John Doe
   - Check dashboard
   - ✅ Expected: Balance now -25000, still shows in arrears

4. **Clear Arrears**
   - Record 25000 payment
   - Check dashboard
   - ✅ Expected: John Doe removed from arrears alert

---

### Workflow 6: Reports Generation

**Objective**: Generate and export reports

**Steps:**

1. **Payment Report**
   - Navigate to Reports
   - Select "Payment Report"
   - Set date range: Last month
   - Click Generate
   - ✅ Expected: Report displays all payments

2. **Export to Excel**
   - Click "Export to Excel"
   - ✅ Expected: File downloads successfully

3. **Arrears Report**
   - Select "Arrears Report"
   - Click Generate
   - ✅ Expected: Shows all tenants with negative balance

4. **Occupancy Report**
   - Select "Occupancy Report"
   - Click Generate
   - ✅ Expected: Shows occupancy statistics

---

### Workflow 7: Document Management

**Objective**: Upload and manage documents

**Steps:**

1. **Upload Tenant Document**
   - Navigate to Documents → Upload
   - Select file (PDF/JPG)
   - Associate with tenant
   - Set document type: "ID Copy"
   - Add description
   - Click Upload
   - ✅ Expected: Document uploaded successfully

2. **View Documents**
   - Navigate to Documents
   - Filter by tenant
   - ✅ Expected: Document appears in list

3. **Download Document**
   - Click on document
   - Click Download
   - ✅ Expected: File downloads

4. **Delete Document**
   - Click Delete
   - Confirm
   - ✅ Expected: Document removed

---

### Workflow 8: Move-Out Process

**Objective**: Complete tenant move-out

**Steps:**

1. **Initiate Move-Out**
   - Go to tenant with active tenancy
   - Click "Move Out"
   - Enter move-out date
   - Calculate final balance (refund deposit if applicable)
   - Click Complete
   - ✅ Expected: Tenancy ended

2. **Verify Unit Status**
   - Check unit status
   - ✅ Expected: Status changed to "Vacant"

3. **Verify Tenant Status**
   - Check tenant details
   - ✅ Expected: No active tenancy, status "Inactive"

---

## API Testing

### Using cURL

#### Authentication

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@propertym.com",
    "password": "Admin@123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

**Save token for subsequent requests:**
```bash
TOKEN="your_access_token_here"
```

#### Properties

**Create Property:**
```bash
curl -X POST http://localhost:5000/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Property",
    "address": "123 Test St",
    "city": "Nairobi",
    "county": "Nairobi",
    "propertyType": "APARTMENT",
    "totalUnits": 10
  }'
```

**Get All Properties:**
```bash
curl http://localhost:5000/api/properties \
  -H "Authorization: Bearer $TOKEN"
```

**Get Property by ID:**
```bash
curl http://localhost:5000/api/properties/1 \
  -H "Authorization: Bearer $TOKEN"
```

#### Units

**Create Unit:**
```bash
curl -X POST http://localhost:5000/api/units \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "propertyId": 1,
    "unitNumber": "A1",
    "bedrooms": 2,
    "bathrooms": 1,
    "rentAmount": 25000,
    "depositAmount": 25000,
    "status": "VACANT"
  }'
```

#### Tenants

**Create Tenant:**
```bash
curl -X POST http://localhost:5000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+254712345678",
    "idNumber": "12345678"
  }'
```

#### Payments

**Record Payment:**
```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tenantId": 1,
    "amount": 25000,
    "paymentDate": "2024-01-05",
    "paymentMethod": "MPESA",
    "reference": "MPO123456789"
  }'
```

---

## UI Testing

### Browser Compatibility

Test on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

### Responsive Design

Test at resolutions:
- ✅ Desktop: 1920x1080
- ✅ Laptop: 1366x768
- ✅ Tablet: 768x1024
- ✅ Mobile: 375x667

### UI Elements

**Navigation:**
- ✅ Sidebar navigation works
- ✅ Active page highlighted
- ✅ All links functional

**Forms:**
- ✅ All inputs accept data
- ✅ Validation messages display
- ✅ Submit buttons work
- ✅ Cancel buttons work

**Tables:**
- ✅ Data displays correctly
- ✅ Sorting works (if implemented)
- ✅ Pagination works
- ✅ Filters work

**Modals/Dialogs:**
- ✅ Open correctly
- ✅ Close on button click
- ✅ Close on outside click
- ✅ Data persists correctly

---

## Test Scenarios

### Edge Cases

1. **Empty States**
   - ✅ No properties: Shows empty state message
   - ✅ No units: Shows empty state message
   - ✅ No tenants: Shows empty state message

2. **Large Numbers**
   - ✅ Create 100+ properties
   - ✅ Pagination works correctly
   - ✅ Performance remains acceptable

3. **Special Characters**
   - ✅ Names with apostrophes (O'Brien)
   - ✅ Addresses with special chars
   - ✅ Phone numbers with different formats

4. **Date Handling**
   - ✅ Past dates accepted where valid
   - ✅ Future dates accepted where valid
   - ✅ Invalid dates rejected

5. **Negative Balances**
   - ✅ Arrears calculated correctly
   - ✅ Display as negative numbers
   - ✅ Alerts trigger properly

### Error Scenarios

1. **Invalid Login**
   - ✅ Wrong password: Shows error
   - ✅ Non-existent email: Shows error
   - ✅ Empty fields: Shows validation errors

2. **Invalid Data**
   - ✅ Duplicate unit numbers: Shows error
   - ✅ Invalid email format: Shows error
   - ✅ Negative rent amount: Shows error

3. **Unauthorized Access**
   - ✅ Accessing without login: Redirects to login
   - ✅ Expired token: Prompts re-login

4. **Network Errors**
   - ✅ Backend down: Shows error message
   - ✅ Slow connection: Shows loading state

---

## Performance Testing

### Load Testing

**Simulate Multiple Users:**
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/properties
```

**Metrics to Check:**
- ✅ Response time < 200ms for list endpoints
- ✅ Response time < 100ms for single item endpoints
- ✅ Can handle 100 concurrent users
- ✅ No memory leaks

### Database Performance

**Check Query Performance:**
```sql
-- Enable query timing
\timing on

-- Test slow queries
EXPLAIN ANALYZE SELECT * FROM tenancies 
JOIN tenants ON tenancies."tenantId" = tenants.id
JOIN units ON tenancies."unitId" = units.id
WHERE tenancies.status = 'ACTIVE';
```

**Expected:**
- ✅ Queries execute in < 50ms
- ✅ Indexes used properly
- ✅ No full table scans on large tables

---

## Security Testing

### Authentication

- ✅ Cannot access API without token
- ✅ Invalid token rejected
- ✅ Expired token rejected
- ✅ Token refresh works

### Authorization

- ✅ Cannot access other users' data
- ✅ Cannot delete without proper permissions

### Input Validation

- ✅ SQL injection attempts blocked
- ✅ XSS attempts sanitized
- ✅ File upload restrictions enforced

### Rate Limiting

- ✅ General API: 100 req/15min enforced
- ✅ Auth endpoints: 5 attempts/15min enforced
- ✅ Returns 429 status when exceeded

---

## Test Checklist

### Pre-Deployment Testing

**Backend:**
- [ ] All API endpoints respond correctly
- [ ] Authentication works
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Logs writing correctly
- [ ] Error handling works

**Frontend:**
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Navigation works
- [ ] API calls successful
- [ ] Error messages display
- [ ] Loading states show

**Integration:**
- [ ] Full workflows complete successfully
- [ ] Data persists correctly
- [ ] Calculations accurate
- [ ] Reports generate correctly

**Performance:**
- [ ] Page load times acceptable
- [ ] API response times acceptable
- [ ] No memory leaks
- [ ] Database queries optimized

**Security:**
- [ ] Authentication required
- [ ] Tokens expire correctly
- [ ] Rate limiting works
- [ ] Input validation works
- [ ] CORS configured

**Documentation:**
- [ ] API documentation complete
- [ ] User guide available
- [ ] Admin guide available
- [ ] Deployment guide available

---

## Automated Testing (Future Enhancement)

### Recommended Framework

**Backend:**
- Jest for unit tests
- Supertest for API tests

**Frontend:**
- Jest + React Testing Library
- Cypress for E2E tests

### Example Test Structure

```typescript
// backend/tests/auth.test.ts
describe('Authentication', () => {
  test('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Password123!' });
    
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('accessToken');
  });
});
```

---

## Bug Reporting Template

When reporting bugs during testing:

**Title:** Brief description

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
What should happen

**Actual Result:**
What actually happened

**Screenshots:**
If applicable

**Environment:**
- Browser/OS
- User role
- Date/time

**Severity:**
- Critical: System unusable
- High: Major feature broken
- Medium: Minor feature broken
- Low: Cosmetic issue

---

*Last updated: Week 8 - Production Ready*

