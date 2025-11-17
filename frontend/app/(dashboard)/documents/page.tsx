'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getDocuments, uploadDocument, deleteDocument } from '@/lib/api/documents';
import { getProperties } from '@/lib/api/properties';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Trash2, Download, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';

const uploadSchema = z.object({
  documentType: z.enum(['AGREEMENT', 'NOTICE', 'ID', 'RECEIPT', 'OTHER']),
  entityType: z.enum(['PROPERTY', 'UNIT', 'TENANT', 'SYSTEM']),
  propertyId: z.string().optional(),
  unitId: z.string().optional(),
  tenantId: z.string().optional(),
  notes: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

const documentTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'AGREEMENT', label: 'Agreement' },
  { value: 'NOTICE', label: 'Notice' },
  { value: 'ID', label: 'ID/Passport' },
  { value: 'RECEIPT', label: 'Receipt' },
  { value: 'OTHER', label: 'Other' },
];

const entityTypeOptions = [
  { value: '', label: 'All Entities' },
  { value: 'PROPERTY', label: 'Property' },
  { value: 'UNIT', label: 'Unit' },
  { value: 'TENANT', label: 'Tenant' },
  { value: 'SYSTEM', label: 'System' },
];

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [documentType, setDocumentType] = useState('');
  const [entityType, setEntityType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', { documentType, entityType, search, page }],
    queryFn: () => getDocuments({
      documentType: documentType || undefined,
      entityType: entityType || undefined,
      search: search || undefined,
      page,
      pageSize: 20,
    }),
  });

  const uploadForm = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      documentType: 'OTHER',
      entityType: 'SYSTEM',
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadFormData & { file: File }) => {
      return uploadDocument(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setShowUpload(false);
      setSelectedFile(null);
      uploadForm.reset();
    },
    onError: (err: any) => {
      setUploadError(err.response?.data?.error?.message || 'Failed to upload document');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleUpload = (data: UploadFormData) => {
    if (!selectedFile) {
      setUploadError('Please select a file');
      return;
    }

    setUploadError('');
    uploadMutation.mutate({ ...data, file: selectedFile });
  };

  const handleDelete = async (id: string, fileName: string) => {
    if (confirm(`Delete document "${fileName}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const getDocTypeLabel = (type: string) => {
    const option = documentTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    return '📎';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">Manage agreements, IDs, receipts, and other documents</p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by filename..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            options={documentTypeOptions}
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          />

          <Select
            options={entityTypeOptions}
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          />
        </div>
      </Card>

      {/* Documents List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      ) : error ? (
        <Card className="p-8">
          <div className="text-center text-red-600">
            <p className="font-medium">Error loading documents</p>
          </div>
        </Card>
      ) : !data || data.data.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-6">
              {search || documentType || entityType
                ? 'Try adjusting your filters'
                : 'Upload your first document'}
            </p>
            <Button onClick={() => setShowUpload(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Linked To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getFileIcon(doc.mimeType)}</span>
                          <div>
                            <p className="font-medium text-gray-900">{doc.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {(doc.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary">{getDocTypeLabel(doc.documentType)}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {doc.property && `Property: ${doc.property.name}`}
                        {doc.unit && `Unit: ${doc.unit.name}`}
                        {doc.tenant && `Tenant: ${doc.tenant.firstName} ${doc.tenant.lastName}`}
                        {doc.entityType === 'SYSTEM' && 'System-wide'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <a
                            href={`http://localhost:8000${doc.storageUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="gap-1">
                              <Download className="w-3 h-3" />
                              View
                            </Button>
                          </a>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleDelete(doc.id, doc.fileName)}
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document and link it to a property, unit, or tenant
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={uploadForm.handleSubmit(handleUpload)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file" required>Select File</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-gray-500">
                PDF, Word, Excel, or Images (max 10MB)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documentType" required>Document Type</Label>
                <Select
                  id="documentType"
                  options={[
                    { value: 'AGREEMENT', label: 'Agreement' },
                    { value: 'NOTICE', label: 'Notice' },
                    { value: 'ID', label: 'ID/Passport' },
                    { value: 'RECEIPT', label: 'Receipt' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                  {...uploadForm.register('documentType')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entityType" required>Link To</Label>
                <Select
                  id="entityType"
                  options={[
                    { value: 'SYSTEM', label: 'System-wide' },
                    { value: 'PROPERTY', label: 'Property' },
                    { value: 'UNIT', label: 'Unit' },
                    { value: 'TENANT', label: 'Tenant' },
                  ]}
                  {...uploadForm.register('entityType')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                rows={3}
                {...uploadForm.register('notes')}
              />
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" disabled={uploadMutation.isPending || !selectedFile}>
                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUpload(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
