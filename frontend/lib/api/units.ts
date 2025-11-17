import api, { ApiResponse, PaginatedResponse } from '../api';
import { Unit } from '@/types';

export interface CreateUnitDto {
  propertyId: string;
  name: string;
  bedrooms?: number;
  bathrooms?: number;
  floor?: string;
  size?: number;
  rentAmount: number;
  depositAmount: number;
  status?: string;
  notes?: string;
}

export interface UpdateUnitDto extends Partial<CreateUnitDto> {}

export interface UnitFilters {
  page?: number;
  pageSize?: number;
  propertyId?: string;
  status?: string;
  search?: string;
}

/**
 * Get all units
 */
export async function getUnits(filters?: UnitFilters): Promise<PaginatedResponse<Unit>> {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.propertyId) params.append('propertyId', filters.propertyId);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
  }

  const response = await api.get<PaginatedResponse<Unit>>(`/units?${params.toString()}`);
  return response.data;
}

/**
 * Get unit by ID
 */
export async function getUnitById(id: string): Promise<Unit> {
  const response = await api.get<ApiResponse<Unit>>(`/units/${id}`);
  return response.data.data;
}

/**
 * Create unit
 */
export async function createUnit(data: CreateUnitDto): Promise<Unit> {
  const response = await api.post<ApiResponse<Unit>>('/units', data);
  return response.data.data;
}

/**
 * Update unit
 */
export async function updateUnit(id: string, data: UpdateUnitDto): Promise<Unit> {
  const response = await api.patch<ApiResponse<Unit>>(`/units/${id}`, data);
  return response.data.data;
}

/**
 * Delete unit
 */
export async function deleteUnit(id: string, force: boolean = false): Promise<void> {
  await api.delete(`/units/${id}?force=${force}`);
}

/**
 * Upload unit image
 */
export async function uploadUnitImage(id: string, file: File, isPrimary: boolean = false) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('isPrimary', isPrimary.toString());

  const response = await api.post(`/units/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

/**
 * Delete unit image
 */
export async function deleteUnitImage(unitId: string, imageId: string): Promise<void> {
  await api.delete(`/units/${unitId}/images/${imageId}`);
}

