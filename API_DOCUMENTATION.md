# PropertyM API Documentation

## Base URL

**Development:** `http://localhost:5000/api`  
**Production:** `https://your-domain.com/api`

---

## Authentication

All endpoints except `/auth/login` and `/auth/register` require authentication via JWT Bearer token.

### Headers

```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## API Endpoints

### 🔐 Authentication

#### Register User

```http
POST /auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "OWNER"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "OWNER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Login

```http
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "OWNER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Get Current User

```http
GET /auth/me
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "OWNER"
  }
}
```

---

#### Refresh Token

```http
POST /auth/refresh
```

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### Logout

```http
POST /auth/logout
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 🏢 Properties

#### Get All Properties

```http
GET /properties
```

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `limit` (optional): Items per page, default: 20

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sunrise Apartments",
      "address": "123 Main Street",
      "city": "Nairobi",
      "county": "Nairobi",
      "propertyType": "APARTMENT",
      "totalUnits": 12,
      "description": "Modern apartments in the city center",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "images": [
        {
          "id": 1,
          "url": "/uploads/properties/image1.jpg",
          "isPrimary": true
        }
      ],
      "_count": {
        "units": 12
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

#### Get Property by ID

```http
GET /properties/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Sunrise Apartments",
    "address": "123 Main Street",
    "city": "Nairobi",
    "county": "Nairobi",
    "propertyType": "APARTMENT",
    "totalUnits": 12,
    "description": "Modern apartments in the city center",
    "images": [
      {
        "id": 1,
        "url": "/uploads/properties/image1.jpg",
        "isPrimary": true
      }
    ],
    "units": [
      {
        "id": 1,
        "unitNumber": "A1",
        "rentAmount": 25000,
        "status": "OCCUPIED"
      }
    ]
  }
}
```

---

#### Create Property

```http
POST /properties
```

**Body:**
```json
{
  "name": "Sunrise Apartments",
  "address": "123 Main Street",
  "city": "Nairobi",
  "county": "Nairobi",
  "propertyType": "APARTMENT",
  "totalUnits": 12,
  "description": "Modern apartments in the city center"
}
```

**Response:** `201 Created`

---

#### Update Property

```http
PUT /properties/:id
```

**Body:** (same as create, all fields optional)

**Response:** `200 OK`

---

#### Delete Property

```http
DELETE /properties/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

### 🏠 Units

#### Get All Units

```http
GET /units
```

**Query Parameters:**
- `propertyId` (optional): Filter by property
- `status` (optional): Filter by status (VACANT, OCCUPIED, MAINTENANCE)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** `200 OK`

---

#### Get Unit by ID

```http
GET /units/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "propertyId": 1,
    "unitNumber": "A1",
    "bedrooms": 2,
    "bathrooms": 1,
    "sqft": 850,
    "rentAmount": 25000,
    "depositAmount": 25000,
    "status": "OCCUPIED",
    "description": "2 bedroom apartment with balcony",
    "property": {
      "id": 1,
      "name": "Sunrise Apartments"
    },
    "currentTenancy": {
      "id": 1,
      "tenant": {
        "id": 1,
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "startDate": "2024-01-01",
      "rentAmount": 25000
    }
  }
}
```

---

#### Create Unit

```http
POST /units
```

**Body:**
```json
{
  "propertyId": 1,
  "unitNumber": "A1",
  "bedrooms": 2,
  "bathrooms": 1,
  "sqft": 850,
  "rentAmount": 25000,
  "depositAmount": 25000,
  "status": "VACANT",
  "description": "2 bedroom apartment with balcony"
}
```

**Response:** `201 Created`

---

#### Update Unit

```http
PUT /units/:id
```

**Response:** `200 OK`

---

#### Delete Unit

```http
DELETE /units/:id
```

**Response:** `200 OK`

---

### 👥 Tenants

#### Get All Tenants

```http
GET /tenants
```

**Query Parameters:**
- `status` (optional): ACTIVE, INACTIVE
- `search` (optional): Search by name, email, or phone
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** `200 OK`

---

#### Get Tenant by ID

```http
GET /tenants/:id
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "phone": "+254712345678",
    "idNumber": "12345678",
    "status": "ACTIVE",
    "tenancies": [
      {
        "id": 1,
        "unit": {
          "id": 1,
          "unitNumber": "A1",
          "property": {
            "name": "Sunrise Apartments"
          }
        },
        "startDate": "2024-01-01",
        "rentAmount": 25000,
        "depositAmount": 25000,
        "balance": -5000,
        "status": "ACTIVE"
      }
    ],
    "documents": [],
    "invoices": [],
    "payments": []
  }
}
```

---

#### Create Tenant

```http
POST /tenants
```

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+254712345678",
  "idNumber": "12345678",
  "emergencyContact": "+254700000000",
  "occupation": "Software Engineer",
  "employer": "Tech Corp"
}
```

**Response:** `201 Created`

---

#### Update Tenant

```http
PUT /tenants/:id
```

**Response:** `200 OK`

---

#### Delete Tenant

```http
DELETE /tenants/:id
```

**Response:** `200 OK`

---

### 🔑 Tenancies

#### Create Tenancy (Move In)

```http
POST /tenancy
```

**Body:**
```json
{
  "tenantId": 1,
  "unitId": 1,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "rentAmount": 25000,
  "depositAmount": 25000,
  "rentDueDay": 5,
  "leaseTerm": "FIXED"
}
```

**Response:** `201 Created`

---

#### End Tenancy (Move Out)

```http
POST /tenancy/:id/move-out
```

**Body:**
```json
{
  "moveOutDate": "2024-12-31",
  "finalBalance": 0
}
```

**Response:** `200 OK`

---

### 💰 Payments

#### Get All Payments

```http
GET /payments
```

**Query Parameters:**
- `tenantId` (optional): Filter by tenant
- `startDate` (optional): Filter by date range
- `endDate` (optional): Filter by date range
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** `200 OK`

---

#### Get Payment by ID

```http
GET /payments/:id
```

**Response:** `200 OK`

---

#### Record Payment

```http
POST /payments
```

**Body:**
```json
{
  "tenantId": 1,
  "amount": 25000,
  "paymentDate": "2024-01-05",
  "paymentMethod": "MPESA",
  "reference": "MPO123456789",
  "notes": "January rent payment"
}
```

**Response:** `201 Created`

---

#### Delete Payment

```http
DELETE /payments/:id
```

**Response:** `200 OK`

---

### 📄 Invoices

#### Get All Invoices

```http
GET /invoices
```

**Query Parameters:**
- `tenantId` (optional): Filter by tenant
- `status` (optional): PENDING, PAID, OVERDUE
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:** `200 OK`

---

#### Get Invoice by ID

```http
GET /invoices/:id
```

**Response:** `200 OK`

---

#### Create Invoice

```http
POST /invoices
```

**Body:**
```json
{
  "tenantId": 1,
  "amount": 25000,
  "dueDate": "2024-01-05",
  "description": "Rent for January 2024",
  "type": "RENT"
}
```

**Response:** `201 Created`

---

### 📊 Dashboard

#### Get Dashboard Metrics

```http
GET /dashboard/metrics
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalProperties": 10,
    "totalUnits": 120,
    "occupiedUnits": 95,
    "vacantUnits": 25,
    "rentDueThisMonth": 2375000,
    "rentReceivedThisMonth": 2100000,
    "totalArrears": 150000,
    "tenantsInArrears": 6
  }
}
```

---

#### Get Tenants with Arrears

```http
GET /dashboard/arrears
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "tenantId": 1,
      "tenantName": "Jane Smith",
      "unitName": "A1",
      "propertyName": "Sunrise Apartments",
      "arrearsAmount": 50000,
      "daysOverdue": 45
    }
  ]
}
```

---

### 📑 Reports

#### Payment Report

```http
GET /reports/payments
```

**Query Parameters:**
- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD
- `format` (optional): json, csv, excel

**Response:** `200 OK`

---

#### Arrears Report

```http
GET /reports/arrears
```

**Query Parameters:**
- `format` (optional): json, csv, excel

**Response:** `200 OK`

---

#### Occupancy Report

```http
GET /reports/occupancy
```

**Query Parameters:**
- `format` (optional): json, csv, excel

**Response:** `200 OK`

---

### 📎 Documents

#### Get All Documents

```http
GET /documents
```

**Query Parameters:**
- `tenantId` (optional): Filter by tenant
- `propertyId` (optional): Filter by property

**Response:** `200 OK`

---

#### Upload Document

```http
POST /documents
```

**Content-Type:** `multipart/form-data`

**Body:**
- `file`: File to upload
- `tenantId` (optional): Associated tenant
- `propertyId` (optional): Associated property
- `documentType`: Type of document
- `description`: Document description

**Response:** `201 Created`

---

#### Download Document

```http
GET /documents/:id/download
```

**Response:** File download

---

#### Delete Document

```http
DELETE /documents/:id
```

**Response:** `200 OK`

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Common Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Rate Limits

- **General API:** 100 requests per 15 minutes
- **Authentication:** 5 attempts per 15 minutes
- **File Uploads:** 50 requests per hour

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Date Formats

All dates use ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

Example: `2024-01-15T10:30:00.000Z`

---

## Currency

All amounts are in **Kenyan Shillings (KES)** as integer values (no decimal points).

Example: `25000` = KES 25,000

---

## File Uploads

- Maximum file size: **10MB**
- Supported formats: PDF, JPG, PNG, DOCX
- Files stored in `/uploads` directory

---

## Health Check

```http
GET /health
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

