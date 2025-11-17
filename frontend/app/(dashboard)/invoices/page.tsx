'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getInvoices, generateInvoices } from '@/lib/api/invoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText, Plus } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const generateSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format'),
  dueDate: z.string().min(1, 'Due date is required'),
  additionalCharges: z.number().min(0).optional(),
});

type GenerateFormData = z.infer<typeof generateSchema>;

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
];

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [period, setPeriod] = useState('');
  const [page, setPage] = useState(1);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genError, setGenError] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['invoices', { status, period, page }],
    queryFn: () => getInvoices({
      status: status || undefined,
      period: period || undefined,
      page,
      pageSize: 20,
    }),
  });

  const generateForm = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      period: new Date().toISOString().slice(0, 7),
      dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
        .toISOString().split('T')[0],
      additionalCharges: 0,
    },
  });

  const generateMutation = useMutation({
    mutationFn: generateInvoices,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowGenerate(false);
      generateForm.reset();
      alert(`Successfully generated ${result.count} invoices for ${result.period}`);
    },
    onError: (err: any) => {
      setGenError(err.response?.data?.error?.message || 'Failed to generate invoices');
    },
  });

  const handleGenerate = (data: GenerateFormData) => {
    setGenError('');
    generateMutation.mutate({
      ...data,
      additionalCharges: data.additionalCharges || 0,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      PENDING: 'warning',
      PARTIALLY_PAID: 'info',
      PAID: 'success',
      OVERDUE: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage rent invoices and billing</p>
        </div>
        <Button onClick={() => setShowGenerate(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Generate Invoices
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs text-gray-600 mb-1">Period (YYYY-MM)</Label>
            <Input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value.slice(0, 7))}
            />
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs text-gray-600 mb-1">Status</Label>
            <Select
              options={statusOptions}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Invoices Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      ) : error ? (
        <Card className="p-8">
          <div className="text-center text-red-600">
            <p className="font-medium">Error loading invoices</p>
          </div>
        </Card>
      ) : !data || data.data.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600 mb-6">
              {status || period
                ? 'Try adjusting your filters'
                : 'Generate invoices for active tenancies'}
            </p>
            <Button onClick={() => setShowGenerate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Generate Invoices
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
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((invoice: any) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        {invoice.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/tenants/${invoice.tenant.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {invoice.tenant.firstName} {invoice.tenant.lastName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {invoice.unit.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                        {formatCurrency(Number(invoice.totalAmount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={Number(invoice.paidAmount) > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                          {formatCurrency(Number(invoice.paidAmount))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
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

      {/* Generate Dialog */}
      <Dialog open={showGenerate} onOpenChange={setShowGenerate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Invoices</DialogTitle>
            <DialogDescription>
              Create invoices for all active tenancies for a specific month
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={generateForm.handleSubmit(handleGenerate)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="period" required>Period (Month)</Label>
              <Input
                id="period"
                type="month"
                {...generateForm.register('period')}
              />
              {generateForm.formState.errors.period && (
                <p className="text-sm text-red-600">{generateForm.formState.errors.period.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" required>Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...generateForm.register('dueDate')}
              />
              <p className="text-xs text-gray-500">Typically 1st of the month</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalCharges">Additional Charges (KES)</Label>
              <Input
                id="additionalCharges"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                {...generateForm.register('additionalCharges', { valueAsNumber: true })}
              />
              <p className="text-xs text-gray-500">
                Optional extra charges to add to all invoices
              </p>
            </div>

            {genError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{genError}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? 'Generating...' : 'Generate Invoices'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowGenerate(false)}
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

