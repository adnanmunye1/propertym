'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { createPayment } from '@/lib/api/payments';
import { getTenants } from '@/lib/api/tenants';
import { getTenantInvoices } from '@/lib/api/invoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

const paymentSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  unitId: z.string().min(1, 'Unit is required'),
  invoiceId: z.string().optional(),
  paymentDate: z.string().min(1, 'Payment date is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  method: z.enum(['MPESA', 'BANK_TRANSFER', 'CASH', 'AIRTEL_MONEY', 'OTHER']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const methodOptions = [
  { value: 'MPESA', label: 'M-Pesa' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'AIRTEL_MONEY', label: 'Airtel Money' },
  { value: 'OTHER', label: 'Other' },
];

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedTenantId = searchParams.get('tenantId');
  const preSelectedUnitId = searchParams.get('unitId');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState(preSelectedTenantId || '');

  const { data: tenantsData } = useQuery({
    queryKey: ['tenants', 'active'],
    queryFn: () => getTenants({ status: 'ACTIVE', pageSize: 1000 }),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ['invoices', 'tenant', selectedTenantId],
    queryFn: () => getTenantInvoices(selectedTenantId),
    enabled: !!selectedTenantId,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      tenantId: preSelectedTenantId || '',
      unitId: preSelectedUnitId || '',
      paymentDate: new Date().toISOString().split('T')[0],
      method: 'MPESA',
    },
  });

  const watchedTenantId = watch('tenantId');

  // Update selected tenant when form tenant changes
  if (watchedTenantId !== selectedTenantId) {
    setSelectedTenantId(watchedTenantId);
  }

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true);
    setError('');

    try {
      await createPayment({
        ...data,
        amount: Number(data.amount),
        invoiceId: data.invoiceId || undefined,
      });
      router.push('/payments');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to record payment');
      setLoading(false);
    }
  };

  const tenantOptions = [
    { value: '', label: 'Select Tenant' },
    ...(tenantsData?.data
      .filter((t: any) => t.status === 'ACTIVE')
      .map((t: any) => ({
        value: t.id,
        label: `${t.firstName} ${t.lastName} - ${t.currentUnit?.name || 'No unit'}`,
      })) || []),
  ];

  const selectedTenant = tenantsData?.data.find((t: any) => t.id === selectedTenantId);

  const invoiceOptions = [
    { value: '', label: 'No specific invoice (general payment)' },
    ...(invoicesData?.map((inv: any) => ({
      value: inv.id,
      label: `${inv.period} - ${formatCurrency(Number(inv.totalAmount))} (Paid: ${formatCurrency(Number(inv.paidAmount))})`,
    })) || []),
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/payments">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
          <p className="text-gray-600 mt-1">Record a new rent payment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Enter the payment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tenant Selection */}
            <div className="space-y-2">
              <Label htmlFor="tenantId" required>Tenant</Label>
              <Select
                id="tenantId"
                options={tenantOptions}
                {...register('tenantId')}
                disabled={loading || !!preSelectedTenantId}
              />
              {errors.tenantId && (
                <p className="text-sm text-red-600">{errors.tenantId.message}</p>
              )}
            </div>

            {/* Unit (auto-filled from tenant's current unit) */}
            {selectedTenant?.currentUnit && (
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  value={`${selectedTenant.currentUnit.name} - ${selectedTenant.currentProperty?.name}`}
                  disabled
                />
                <input type="hidden" {...register('unitId')} value={selectedTenant.currentUnit.id} />
              </div>
            )}

            {/* Invoice Selection (optional) */}
            {selectedTenantId && invoicesData && invoicesData.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="invoiceId">Link to Invoice (Optional)</Label>
                <Select
                  id="invoiceId"
                  options={invoiceOptions}
                  {...register('invoiceId')}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  Select an invoice to allocate this payment, or leave blank for general payment
                </p>
              </div>
            )}

            {/* Payment Date */}
            <div className="space-y-2">
              <Label htmlFor="paymentDate" required>Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...register('paymentDate')}
                disabled={loading}
              />
              {errors.paymentDate && (
                <p className="text-sm text-red-600">{errors.paymentDate.message}</p>
              )}
            </div>

            {/* Amount and Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" required>Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  {...register('amount', { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.amount && (
                  <p className="text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="method" required>Payment Method</Label>
                <Select
                  id="method"
                  options={methodOptions}
                  {...register('method')}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <Label htmlFor="reference">Transaction Reference/Code</Label>
              <Input
                id="reference"
                placeholder="e.g., M-Pesa code"
                {...register('reference')}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                M-Pesa confirmation code, bank reference, or receipt number
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                rows={3}
                {...register('notes')}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Recording...' : 'Record Payment'}
              </Button>
              <Link href="/payments">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

