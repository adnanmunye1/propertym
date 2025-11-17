import api, { ApiResponse, PaginatedResponse } from '../api';
import { Property } from '@/types';

export interface CreatePropertyDto {
  name: string;
  type: string;
  area?: string;
  town?: string;
  county?: string;
  address?: string;
  description?: string;
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  isActive?: boolean;
}

export interface PropertyFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  type?: string;
  isActive?: boolean;
  county?: string;
  town?: string;
}

/**
 * Get all properties
 */
export async function getProperties(filters?: PropertyFilters): Promise<PaginatedResponse<Property>> {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters.county) params.append('county', filters.county);
    if (filters.town) params.append('town', filters.town);
  }

  const response = await api.get<PaginatedResponse<Property>>(`/properties?${params.toString()}`);
  return response.data;
}

/**
 * Get property by ID
 */
export async function getPropertyById(id: string): Promise<Property> {
  const response = await api.get<ApiResponse<Property>>(`/properties/${id}`);
  return response.data.data;
}

/**
 * Create property
 */
export async function createProperty(data: CreatePropertyDto): Promise<Property> {
  const response = await api.post<ApiResponse<Property>>('/properties', data);
  return response.data.data;
}

/**
 * Update property
 */
export async function updateProperty(id: string, data: UpdatePropertyDto): Promise<Property> {
  const response = await api.patch<ApiResponse<Property>>(`/properties/${id}`, data);
  return response.data.data;
}

/**
 * Delete property
 */
export async function deleteProperty(id: string, force: boolean = false): Promise<void> {
  await api.delete(`/properties/${id}?force=${force}`);
}

/**
 * Upload property image
 */
export async function uploadPropertyImage(id: string, file: File, isPrimary: boolean = false) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('isPrimary', isPrimary.toString());

  const response = await api.post(`/properties/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

/**
 * Delete property image
 */
export async function deletePropertyImage(propertyId: string, imageId: string): Promise<void> {
  await api.delete(`/properties/${propertyId}/images/${imageId}`);
}

/**
 * Get property stats
 */
export async function getPropertyStats(id: string) {
  const response = await api.get(`/properties/${id}/stats`);
  return response.data.data;
}

