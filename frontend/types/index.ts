// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'OWNER' | 'STAFF';
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// Property types
export type PropertyType = 
  | 'APARTMENT_BLOCK' 
  | 'SINGLE_HOUSE' 
  | 'BEDSITTER_BLOCK' 
  | 'COMMERCIAL' 
  | 'OTHER';

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  area?: string;
  town?: string;
  county?: string;
  address?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Unit types
export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'RESERVED' | 'INACTIVE';

export interface Unit {
  id: string;
  propertyId: string;
  name: string;
  bedrooms?: number;
  bathrooms?: number;
  floor?: string;
  size?: number;
  rentAmount: number;
  depositAmount: number;
  status: UnitStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Tenant types
export type TenantStatus = 'ACTIVE' | 'NOTICE_GIVEN' | 'FORMER';

export interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status: TenantStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  currentTenancy?: any;
  currentUnit?: any;
  currentProperty?: any;
  tenancies?: any[];
}

// Tenancy types
export type DepositStatus = 'HELD' | 'REFUNDED' | 'FORFEITED';

export interface Tenancy {
  id: string;
  tenantId: string;
  unitId: string;
  moveInDate: string;
  moveOutDate?: string;
  depositPaid: number;
  depositPaidDate?: string;
  depositRefunded: number;
  depositRefundDate?: string;
  depositStatus: DepositStatus;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice types
export type InvoiceStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';

export interface Invoice {
  id: string;
  tenancyId: string;
  tenantId: string;
  unitId: string;
  period: string;
  dueDate: string;
  rentAmount: number;
  additionalCharges: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Payment types
export type PaymentMethod = 
  | 'MPESA' 
  | 'BANK_TRANSFER' 
  | 'CASH' 
  | 'AIRTEL_MONEY' 
  | 'OTHER';

export interface Payment {
  id: string;
  tenantId: string;
  unitId: string;
  invoiceId?: string;
  paymentDate: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard types
export interface DashboardMetrics {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  rentDueThisMonth: number;
  rentReceivedThisMonth: number;
  totalArrears: number;
  tenantsInArrears: number;
}

export interface TenantArrears {
  tenantId: string;
  tenantName: string;
  unitName: string;
  propertyName: string;
  arrearsAmount: number;
  daysOverdue: number;
}

