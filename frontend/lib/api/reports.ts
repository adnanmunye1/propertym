import api, { ApiResponse } from '../api';

export interface PaymentsReportFilters {
  startDate?: string;
  endDate?: string;
  propertyId?: string;
  tenantId?: string;
  method?: string;
}

export interface ArrearsReportFilters {
  minDays?: number;
  propertyId?: string;
}

/**
 * Get payments report
 */
export async function getPaymentsReport(filters?: PaymentsReportFilters): Promise<any> {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.propertyId) params.append('propertyId', filters.propertyId);
    if (filters.tenantId) params.append('tenantId', filters.tenantId);
    if (filters.method) params.append('method', filters.method);
  }

  const response = await api.get<ApiResponse<any>>(`/reports/payments?${params.toString()}`);
  return response.data.data;
}

/**
 * Get arrears report
 */
export async function getArrearsReport(filters?: ArrearsReportFilters): Promise<any> {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.minDays) params.append('minDays', filters.minDays.toString());
    if (filters.propertyId) params.append('propertyId', filters.propertyId);
  }

  const response = await api.get<ApiResponse<any>>(`/reports/arrears?${params.toString()}`);
  return response.data.data;
}

/**
 * Get occupancy report
 */
export async function getOccupancyReport(propertyId?: string): Promise<any> {
  const params = new URLSearchParams();
  if (propertyId) params.append('propertyId', propertyId);

  const response = await api.get<ApiResponse<any>>(`/reports/occupancy?${params.toString()}`);
  return response.data.data;
}

/**
 * Export report
 */
export async function exportReport(type: string, filters?: any): Promise<void> {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
  }

  const response = await api.get(`/reports/export/${type}?${params.toString()}`, {
    responseType: 'blob',
  });

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${type}-report-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

