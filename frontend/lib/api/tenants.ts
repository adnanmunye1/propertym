import api, { ApiResponse, PaginatedResponse } from '../api';
import { Tenant } from '@/types';

export interface CreateTenantDto {
  firstName: string;
  lastName: string;
  idNumber: string;
  phone: string;
  email?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  openingBalance?: number;
  notes?: string;
}

export interface UpdateTenantDto extends Partial<CreateTenantDto> {
  status?: string;
}

export interface TenantFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  propertyId?: string;
  unitId?: string;
}

export interface MoveInDto {
  tenantId: string;
  unitId: string;
  moveInDate: string;
  depositPaid: number;
  depositPaidDate?: string;
  notes?: string;
}

export interface MoveOutDto {
  moveOutDate: string;
  depositRefunded?: number;
  depositRefundDate?: string;
  depositStatus?: 'REFUNDED' | 'FORFEITED';
  notes?: string;
}

/**
 * Get all tenants
 */
export async function getTenants(filters?: TenantFilters): Promise<PaginatedResponse<Tenant>> {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.propertyId) params.append('propertyId', filters.propertyId);
    if (filters.unitId) params.append('unitId', filters.unitId);
  }

  const response = await api.get<PaginatedResponse<Tenant>>(`/tenants?${params.toString()}`);
  return response.data;
}

/**
 * Get tenant by ID
 */
export async function getTenantById(id: string): Promise<any> {
  const response = await api.get<ApiResponse<any>>(`/tenants/${id}`);
  return response.data.data;
}

/**
 * Create tenant
 */
export async function createTenant(data: CreateTenantDto): Promise<Tenant> {
  const response = await api.post<ApiResponse<Tenant>>('/tenants', data);
  return response.data.data;
}

/**
 * Update tenant
 */
export async function updateTenant(id: string, data: UpdateTenantDto): Promise<Tenant> {
  const response = await api.patch<ApiResponse<Tenant>>(`/tenants/${id}`, data);
  return response.data.data;
}

/**
 * Move tenant into unit
 */
export async function moveIn(data: MoveInDto): Promise<any> {
  const response = await api.post('/tenancies/move-in', data);
  return response.data.data;
}

/**
 * Move tenant out of unit
 */
export async function moveOut(tenancyId: string, data: MoveOutDto): Promise<any> {
  const response = await api.patch(`/tenancies/${tenancyId}/move-out`, data);
  return response.data.data;
}

/**
 * Get tenant balance
 */
export async function getTenantBalance(id: string): Promise<any> {
  const response = await api.get(`/tenants/${id}/balance`);
  return response.data.data;
}

/**
 * Get tenant invoices
 */
export async function getTenantInvoices(tenantId: string): Promise<any[]> {
  const response = await api.get(`/invoices/tenant/${tenantId}`);
  return response.data.data;
}

/**
 * Get tenant payments
 */
export async function getTenantPayments(tenantId: string): Promise<any[]> {
  const response = await api.get(`/payments/tenant/${tenantId}`);
  return response.data.data;
}

