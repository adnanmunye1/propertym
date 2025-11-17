# Week 5 Implementation Plan

## Goal: Dashboard Polish, Arrears Alerts, Documents, and Reports

This week enhances the dashboard, adds document management, implements reporting, and creates arrears reminder templates.

### Week 5 Objectives:
1. ✅ Implement Document upload and management
2. ✅ Link documents to properties, units, and tenants
3. ✅ Document preview/download functionality
4. ✅ Basic reporting (payments, arrears, occupancy)
5. ✅ CSV/Excel export for reports
6. ✅ Dashboard visualizations (charts)
7. ✅ Arrears reminder message templates
8. ✅ Enhanced dashboard with more insights
9. ✅ Document organization and filtering
10. ✅ Report date range selection

---

## Backend Implementation

### 1. Document Controller (`src/controllers/document.controller.ts`)
- **Upload document** - With file validation
- **List documents** - Filtered by entity type, property, unit, tenant
- **Get document** - By ID with signed/temporary URL
- **Delete document** - Remove file and database record
- **Link to entities** - Property, Unit, Tenant, or System-level
- **Document types** - Agreement, Notice, ID, Receipt, Other

### 2. Reports Controller (`src/controllers/report.controller.ts`)
- **Payments report** - Filtered by date range, property, tenant
- **Arrears report** - All tenants with arrears details
- **Occupancy report** - Units occupied vs vacant by property
- **CSV export** - Generate CSV for each report type
- **Excel export** - Generate XLSX files (using library)

### 3. Document Upload Service
- Already have multer setup from Week 2
- Extend to handle PDF, images, and common doc types
- File type validation (PDF, DOCX, JPG, PNG, etc.)
- Size validation (max 10MB per file)
- Generate secure filenames

### 4. Export Utilities (`src/utils/export.ts`)
- CSV generation helper
- XLSX generation helper
- Date formatting for exports
- Currency formatting for exports

---

## Frontend Implementation

### 1. Documents Module

**Pages:**
- `/documents` - List all documents (table with filters)
- Document sections on:
  - Property detail page
  - Unit detail page
  - Tenant detail page

**Components:**
- `DocumentList` - Table with type, entity, date
- `DocumentUpload` - Upload component with drag-drop
- `DocumentCard` - Visual document card
- `FileTypeIcon` - Icons for different file types

**Features:**
- Upload documents (PDF, images, Word docs)
- Organize by type (Agreement, Notice, ID, Receipt, Other)
- Link to specific property, unit, or tenant
- Filter by entity type
- Search by filename
- Preview/download documents
- Delete documents

### 2. Reports Module

**Pages:**
- `/reports` - Main reports page with tabs:
  - Payments Report
  - Arrears Report
  - Occupancy Report

**Components:**
- `PaymentsReport` - Table with export button
- `ArrearsReport` - Table with tenant arrears
- `OccupancyReport` - Property-wise occupancy stats
- `DateRangePicker` - Select start/end dates
- `ExportButton` - Download CSV/Excel

**Features:**
- Date range selection
- Property filter
- Tenant filter
- Export to CSV
- Export to Excel
- Print-friendly view

### 3. Dashboard Enhancements

**New Features:**
- **Occupancy chart** - Pie or bar chart showing occupied vs vacant
- **Monthly rent trend** - Line chart (if data available)
- **Recent payments** - Last 5 payments list
- **Recent invoices** - Last 5 invoices generated
- **Enhanced arrears section** - With severity indicators
- **Collection rate** - Percentage of rent collected

### 4. Arrears Reminder Templates

**Component: `ArrearsReminderTemplate`**
- Pre-filled message template
- Variables: [Tenant Name], [Amount], [Month], [Days]
- Copy to clipboard button
- SMS/WhatsApp ready format
- Example:
  ```
  Dear [Tenant Name], your rent of KES [Amount] for [Month] 
  is now [X] days overdue. Please arrange payment as soon as 
  possible. If you have already paid, please share your 
  payment confirmation.
  ```

---

## Document Types

### Supported File Types:
- **Images**: JPG, JPEG, PNG, WebP
- **Documents**: PDF, DOC, DOCX
- **Spreadsheets**: XLS, XLSX (optional)
- **Max Size**: 10MB per file

### Document Categories:
- **AGREEMENT** - Tenancy agreements
- **NOTICE** - Notices (vacate, rent increase)
- **ID** - ID/Passport scans
- **RECEIPT** - Payment receipts
- **OTHER** - Miscellaneous documents

### Document Linking:
- **PROPERTY** - Property-related docs
- **UNIT** - Unit-specific docs
- **TENANT** - Tenant-related docs
- **SYSTEM** - System-wide docs

---

## Reports Implementation

### 1. Payments Report

**Columns:**
- Date
- Tenant Name
- Unit
- Property
- Amount
- Method
- Reference

**Filters:**
- Date range (start/end)
- Property dropdown
- Tenant dropdown
- Payment method

**Export:**
- CSV with all columns
- Excel with formatting

### 2. Arrears Report

**Columns:**
- Tenant Name
- Unit
- Property
- Total Billed
- Total Paid
- Balance
- Arrears Amount
- Days Overdue
- Oldest Invoice Period

**Filters:**
- Days overdue threshold (>0, >7, >30)
- Property dropdown

**Export:**
- CSV with all data
- Excel with conditional formatting (red for high arrears)

### 3. Occupancy Report

**Data:**
- Property name
- Total units
- Occupied count
- Vacant count
- Reserved count
- Inactive count
- Occupancy rate (%)

**Filters:**
- Property dropdown (or all)
- Active/inactive properties

**Export:**
- CSV format
- Excel with charts

---

## API Endpoints to Implement

### Documents:
```
GET    /api/documents                List (filtered)
POST   /api/documents                Upload
GET    /api/documents/:id            Get/download
DELETE /api/documents/:id            Delete
GET    /api/documents/property/:id   Property docs
GET    /api/documents/unit/:id       Unit docs
GET    /api/documents/tenant/:id     Tenant docs
```

### Reports:
```
GET    /api/reports/payments         Payments report
GET    /api/reports/arrears          Arrears report
GET    /api/reports/occupancy        Occupancy report
GET    /api/reports/export/:type     Export to CSV/Excel
```

---

## Validation Rules

### Document Upload:
- ✅ File type: Must be allowed type
- ✅ File size: Max 10MB
- ✅ Entity link: Must specify property, unit, tenant, or system
- ✅ Document type: Required (Agreement, Notice, ID, Receipt, Other)
- ✅ Entity must exist if linking

### Report Filters:
- ✅ Date range: End date >= start date
- ✅ Period format: Valid YYYY-MM if applicable
- ✅ Entity IDs: Must exist if filtering

---

## Implementation Order

### Day 1-2: Documents Backend
1. Document controller
2. Upload handling (extend multer for PDFs)
3. Document routes
4. File validation
5. Signed URL generation (if using S3)

### Day 3: Reports Backend
6. Reports controller
7. CSV generation utility
8. Excel generation (using xlsx package)
9. Report routes

### Day 4-5: Documents Frontend
10. Documents list page
11. Document upload component
12. Integrate into property/unit/tenant pages
13. File type icons
14. Preview/download functionality

### Day 6: Reports Frontend
15. Reports page with tabs
16. Date range picker
17. Export buttons
18. Report tables

### Day 7: Dashboard & Polish
19. Dashboard charts (recharts)
20. Arrears reminder templates
21. Recent activity lists
22. Final polish and testing

---

## Success Criteria

By end of Week 5:
- ✅ Can upload documents and link to entities
- ✅ Can view/download documents
- ✅ Can filter documents by type and entity
- ✅ Can generate payments report with export
- ✅ Can generate arrears report with export
- ✅ Can generate occupancy report
- ✅ Dashboard has charts and visualizations
- ✅ Arrears reminder templates available
- ✅ All reports exportable to CSV/Excel
- ✅ Document management fully integrated

---

Let's begin Week 5! 🚀

