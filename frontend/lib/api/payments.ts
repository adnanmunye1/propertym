import api, { ApiResponse, PaginatedResponse } from '../api';
import { Payment } from '@/types';

export interface CreatePaymentDto {
  tenantId: string;
  unitId: string;
  invoiceId?: string;
  paymentDate: string;
  amount: number;
  method: 'MPESA' | 'BANK_TRANSFER' | 'CASH' | 'AIRTEL_MONEY' | 'OTHER';
  reference?: string;
  notes?: string;
}

export interface PaymentFilters {
  page?: number;
  pageSize?: number;
  tenantId?: string;
  unitId?: string;
  propertyId?: string;
  method?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Get all payments
 */
export async function getPayments(filters?: PaymentFilters): Promise<PaginatedResponse<Payment>> {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.tenantId) params.append('tenantId', filters.tenantId);
    if (filters.unitId) params.append('unitId', filters.unitId);
    if (filters.propertyId) params.append('propertyId', filters.propertyId);
    if (filters.method) params.append('method', filters.method);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
  }

  const response = await api.get<PaginatedResponse<Payment>>(`/payments?${params.toString()}`);
  return response.data;
}

/**
 * Record payment
 */
export async function createPayment(data: CreatePaymentDto): Promise<Payment> {
  const response = await api.post<ApiResponse<Payment>>('/payments', data);
  return response.data.data;
}

/**
 * Get tenant payments
 */
export async function getTenantPayments(tenantId: string): Promise<Payment[]> {
  const response = await api.get<ApiResponse<Payment[]>>(`/payments/tenant/${tenantId}`);
  return response.data.data;
}

/**
 * Delete payment
 */
export async function deletePayment(id: string): Promise<void> {
  await api.delete(`/payments/${id}`);
}

