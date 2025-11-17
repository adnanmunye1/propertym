import api, { ApiResponse, PaginatedResponse } from '../api';
import { Invoice } from '@/types';

export interface GenerateInvoicesDto {
  period: string; // YYYY-MM
  dueDate: string;
  additionalCharges?: number;
}

export interface InvoiceFilters {
  page?: number;
  pageSize?: number;
  tenantId?: string;
  unitId?: string;
  period?: string;
  status?: string;
}

/**
 * Get all invoices
 */
export async function getInvoices(filters?: InvoiceFilters): Promise<PaginatedResponse<Invoice>> {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.tenantId) params.append('tenantId', filters.tenantId);
    if (filters.unitId) params.append('unitId', filters.unitId);
    if (filters.period) params.append('period', filters.period);
    if (filters.status) params.append('status', filters.status);
  }

  const response = await api.get<PaginatedResponse<Invoice>>(`/invoices?${params.toString()}`);
  return response.data;
}

/**
 * Generate bulk invoices
 */
export async function generateInvoices(data: GenerateInvoicesDto): Promise<any> {
  const response = await api.post<ApiResponse<any>>('/invoices/generate', data);
  return response.data.data;
}

/**
 * Get tenant invoices
 */
export async function getTenantInvoices(tenantId: string): Promise<Invoice[]> {
  const response = await api.get<ApiResponse<Invoice[]>>(`/invoices/tenant/${tenantId}`);
  return response.data.data;
}

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(): Promise<any> {
  const response = await api.get('/dashboard/metrics');
  return response.data.data;
}

/**
 * Get tenants with arrears
 */
export async function getTenantsWithArrears(): Promise<any[]> {
  const response = await api.get('/dashboard/arrears');
  return response.data.data;
}

