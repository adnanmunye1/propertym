import api, { ApiResponse, PaginatedResponse } from '../api';

export interface UploadDocumentDto {
  file: File;
  documentType: 'AGREEMENT' | 'NOTICE' | 'ID' | 'RECEIPT' | 'OTHER';
  entityType: 'PROPERTY' | 'UNIT' | 'TENANT' | 'SYSTEM';
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  notes?: string;
}

export interface DocumentFilters {
  page?: number;
  pageSize?: number;
  documentType?: string;
  entityType?: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  search?: string;
}

/**
 * Get all documents
 */
export async function getDocuments(filters?: DocumentFilters): Promise<PaginatedResponse<any>> {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.documentType) params.append('documentType', filters.documentType);
    if (filters.entityType) params.append('entityType', filters.entityType);
    if (filters.propertyId) params.append('propertyId', filters.propertyId);
    if (filters.unitId) params.append('unitId', filters.unitId);
    if (filters.tenantId) params.append('tenantId', filters.tenantId);
    if (filters.search) params.append('search', filters.search);
  }

  const response = await api.get<PaginatedResponse<any>>(`/documents?${params.toString()}`);
  return response.data;
}

/**
 * Upload document
 */
export async function uploadDocument(data: UploadDocumentDto): Promise<any> {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('documentType', data.documentType);
  formData.append('entityType', data.entityType);
  if (data.propertyId) formData.append('propertyId', data.propertyId);
  if (data.unitId) formData.append('unitId', data.unitId);
  if (data.tenantId) formData.append('tenantId', data.tenantId);
  if (data.notes) formData.append('notes', data.notes);

  const response = await api.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data.data;
}

/**
 * Delete document
 */
export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}

/**
 * Get entity documents
 */
export async function getEntityDocuments(entityType: string, entityId: string): Promise<any[]> {
  const response = await api.get<ApiResponse<any[]>>(`/documents/${entityType}/${entityId}`);
  return response.data.data;
}

