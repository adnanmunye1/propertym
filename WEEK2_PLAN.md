# Week 2 Implementation Plan

## Goal: Properties, Units, and Basic Navigation

### Week 2 Objectives:
1. ✅ Implement Property CRUD operations (backend + frontend)
2. ✅ Implement Unit CRUD operations (backend + frontend)
3. ✅ Property-Unit relationship management
4. ✅ Image upload functionality
5. ✅ Modern list and detail pages
6. ✅ Forms with comprehensive validation
7. ✅ Navigation wiring for all main sections

---

## Backend Implementation

### 1. Property Controller (`src/controllers/property.controller.ts`)
- **Create** property with validation
- **List** properties (paginated, filterable, searchable)
- **Get** property by ID with units
- **Update** property details
- **Archive/Delete** property (soft delete if has units)
- **Upload** property images
- **Delete** property images

### 2. Unit Controller (`src/controllers/unit.controller.ts`)
- **Create** unit with property relationship
- **List** units (paginated, filterable by property, status)
- **Get** unit by ID with current tenant
- **Update** unit details
- **Archive** unit
- **Upload** unit images
- **Delete** unit images
- **Validate** no duplicate unit names per property

### 3. Image Upload Service (`src/services/upload.service.ts`)
- Local file storage handler
- File validation (type, size)
- Generate unique filenames
- Clean up on delete
- S3-ready architecture for production

### 4. Validation Middleware
- Property validation rules
- Unit validation rules
- Image validation rules

---

## Frontend Implementation

### 1. Properties Module

**Pages:**
- `/properties` - List all properties (table/cards)
- `/properties/new` - Create new property
- `/properties/[id]` - Property detail with units
- `/properties/[id]/edit` - Edit property

**Components:**
- `PropertyList` - Table with search, filters, pagination
- `PropertyCard` - Metric card for property
- `PropertyForm` - Create/edit form
- `PropertyDetail` - Detail view with units
- `ImageUpload` - Multi-image upload component

**Features:**
- Search by name, area, town
- Filter by type, status (active/inactive)
- Pagination (20 per page)
- Sort by name, date
- Inline validation

### 2. Units Module

**Pages:**
- `/units` - List all units (table)
- `/units/new` - Create new unit
- `/units/[id]` - Unit detail
- `/units/[id]/edit` - Edit unit

**Components:**
- `UnitList` - Table with filters
- `UnitCard` - Status indicator card
- `UnitForm` - Create/edit form
- `UnitDetail` - Detail with tenant info
- `StatusBadge` - Visual status indicators

**Features:**
- Filter by property, status
- Search by unit name
- Show current tenant
- Rent amount display (KES format)
- Validation for duplicate names

### 3. Shared Components

**UI Components:**
- `DataTable` - Reusable table with sorting
- `Select` - Dropdown component
- `Textarea` - Multi-line input
- `Badge` - Status indicators
- `Dialog` - Modal dialogs
- `Toast` - Success/error notifications

**Layout:**
- Empty states for lists
- Loading skeletons
- Error boundaries
- Confirmation dialogs for delete

---

## Validation Rules

### Property Validation:
- ✅ Name: Required, max 255 chars
- ✅ Type: Required, valid enum value
- ✅ Area, Town, County: Optional, max 100 chars
- ✅ Description: Optional, max 1000 chars

### Unit Validation:
- ✅ Property ID: Required, must exist
- ✅ Name: Required, max 100 chars, unique per property
- ✅ Rent Amount: Required, must be > 0, max 10,000,000
- ✅ Deposit Amount: Required, must be >= 0
- ✅ Bedrooms/Bathrooms: Optional, must be >= 0 if provided
- ✅ Size: Optional, must be > 0 if provided
- ✅ Status: Required, valid enum

### Image Validation:
- ✅ Type: jpg, jpeg, png, webp only
- ✅ Size: Max 5MB per image
- ✅ Max 10 images per property/unit

---

## API Endpoints to Implement

### Properties:
```
GET    /api/properties              List (paginated, filtered)
POST   /api/properties              Create
GET    /api/properties/:id          Get detail with units
PATCH  /api/properties/:id          Update
DELETE /api/properties/:id          Archive/delete
POST   /api/properties/:id/images   Upload image
DELETE /api/properties/:id/images/:imageId   Delete image
```

### Units:
```
GET    /api/units                   List (paginated, filtered)
POST   /api/units                   Create
GET    /api/units/:id               Get detail
PATCH  /api/units/:id               Update
DELETE /api/units/:id               Archive
POST   /api/units/:id/images        Upload image
DELETE /api/units/:id/images/:imageId      Delete image
```

---

## Implementation Order

### Day 1-2: Backend Foundation
1. Property controller and routes
2. Unit controller and routes
3. Validation middleware
4. Image upload service

### Day 3-4: Frontend Lists & Forms
5. Property list page
6. Property create/edit forms
7. Unit list page
8. Unit create/edit forms

### Day 5-6: Detail Pages & Images
9. Property detail page with units
10. Unit detail page
11. Image upload component
12. Delete confirmations

### Day 7: Polish & Navigation
13. Wire up all navigation routes
14. Add empty states
15. Loading states
16. Error handling
17. Responsive testing

---

## Success Criteria

By end of Week 2:
- ✅ Can create, view, edit, archive properties
- ✅ Can create, view, edit, archive units
- ✅ Units properly linked to properties
- ✅ Can upload/delete images
- ✅ Proper validation on all forms
- ✅ Clean, modern UI throughout
- ✅ Navigation works between all pages
- ✅ Responsive on desktop and tablet

---

Let's begin! 🚀

