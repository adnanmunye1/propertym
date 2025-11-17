'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getTenantById, moveIn, moveOut, getTenantBalance } from '@/lib/api/tenants';
import { getUnits } from '@/lib/api/units';
import { getTenantInvoices } from '@/lib/api/invoices';
import { getPayments } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowLeft, Edit, Home, LogOut, Phone, Mail, User } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

const moveInSchema = z.object({
  unitId: z.string().min(1, 'Unit is required'),
  moveInDate: z.string().min(1, 'Move-in date is required'),
  depositPaid: z.number().min(0, 'Deposit must be 0 or greater'),
  depositPaidDate: z.string().optional(),
});

const moveOutSchema = z.object({
  moveOutDate: z.string().min(1, 'Move-out date is required'),
  depositRefunded: z.number().min(0).optional(),
  depositRefundDate: z.string().optional(),
  depositStatus: z.enum(['REFUNDED', 'FORFEITED']),
});

type MoveInFormData = z.infer<typeof moveInSchema>;
type MoveOutFormData = z.infer<typeof moveOutSchema>;

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  
  const [showMoveIn, setShowMoveIn] = useState(false);
  const [showMoveOut, setShowMoveOut] = useState(false);
  const [error, setError] = useState('');

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => getTenantById(id),
  });

  const { data: balance } = useQuery({
    queryKey: ['tenant', id, 'balance'],
    queryFn: () => getTenantBalance(id),
    enabled: !!tenant,
  });

  const { data: invoices } = useQuery({
    queryKey: ['tenant', id, 'invoices'],
    queryFn: () => getTenantInvoices(id),
    enabled: !!tenant,
  });

  const { data: paymentsData } = useQuery({
    queryKey: ['tenant', id, 'payments'],
    queryFn: () => getPayments({ tenantId: id, pageSize: 50 }),
    enabled: !!tenant,
  });

  const { data: unitsData } = useQuery({
    queryKey: ['units', 'vacant'],
    queryFn: () => getUnits({ status: 'VACANT', pageSize: 100 }),
    enabled: showMoveIn,
  });

  const moveInForm = useForm<MoveInFormData>({
    resolver: zodResolver(moveInSchema),
    defaultValues: {
      moveInDate: new Date().toISOString().split('T')[0],
      depositPaid: 0,
    },
  });

  const moveOutForm = useForm<MoveOutFormData>({
    resolver: zodResolver(moveOutSchema),
    defaultValues: {
      moveOutDate: new Date().toISOString().split('T')[0],
      depositStatus: 'REFUNDED',
      depositRefunded: 0,
    },
  });

  const moveInMutation = useMutation({
    mutationFn: (data: MoveInFormData) => moveIn({
      tenantId: id,
      unitId: data.unitId,
      moveInDate: data.moveInDate,
      depositPaid: data.depositPaid,
      depositPaidDate: data.depositPaidDate,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setShowMoveIn(false);
      moveInForm.reset();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to move in tenant');
    },
  });

  const moveOutMutation = useMutation({
    mutationFn: (data: MoveOutFormData) => {
      if (!tenant?.currentTenancy?.id) throw new Error('No active tenancy');
      return moveOut(tenant.currentTenancy.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', id] });
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['units'] });
      setShowMoveOut(false);
      moveOutForm.reset();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error?.message || 'Failed to move out tenant');
    },
  });

  const handleMoveIn = (data: MoveInFormData) => {
    setError('');
    moveInMutation.mutate(data);
  };

  const handleMoveOut = (data: MoveOutFormData) => {
    setError('');
    moveOutMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: 'success',
      NOTICE_GIVEN: 'warning',
      FORMER: 'secondary',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading tenant...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-red-600 font-medium">Tenant not found</p>
          <Link href="/tenants">
            <Button className="mt-4">Back to Tenants</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const unitOptions = [
    { value: '', label: 'Select Unit' },
    ...(unitsData?.data.map((u: any) => ({
      value: u.id,
      label: `${u.name} - ${u.property?.name} (${formatCurrency(Number(u.rentAmount))}/mo)`,
    })) || []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tenants">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {tenant.firstName} {tenant.lastName}
              </h1>
              {getStatusBadge(tenant.status)}
            </div>
            <p className="text-gray-600 mt-1">{tenant.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!tenant.currentTenancy && tenant.status !== 'FORMER' && (
            <Button onClick={() => setShowMoveIn(true)} className="gap-2">
              <Home className="w-4 h-4" />
              Move In
            </Button>
          )}
          {tenant.currentTenancy && (
            <Button onClick={() => setShowMoveOut(true)} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              Move Out
            </Button>
          )}
          <Link href={`/tenants/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Current Unit Info with Next Payment */}
      {tenant.currentUnit && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium mb-1">Currently Renting</p>
                <p className="text-lg font-bold text-blue-900">
                  Unit {tenant.currentUnit.name} - {tenant.currentProperty?.name}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Moved in: {formatDate(tenant.currentTenancy?.moveInDate)}
                </p>
                {invoices && invoices.length > 0 && (() => {
                  const nextUnpaid = invoices.find((inv: any) => Number(inv.paidAmount) < Number(inv.totalAmount));
                  return nextUnpaid ? (
                    <p className="text-sm text-blue-700 mt-2">
                      <span className="font-semibold">Next Payment Due:</span> {formatDate(nextUnpaid.dueDate)} - {formatCurrency(Number(nextUnpaid.totalAmount) - Number(nextUnpaid.paidAmount))}
                    </p>
                  ) : null;
                })()}
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-700">Monthly Rent</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatCurrency(Number(tenant.currentUnit.rentAmount))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Balance Card */}
      {balance && (balance.totalBilled > 0 || balance.arrears > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-600">Total Billed</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(balance.totalBilled)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-600">Total Paid</p>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(balance.totalPaid)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-600">Balance</p>
              <p className={`text-lg font-bold ${balance.balance > 0 ? 'text-orange-700' : 'text-gray-900'}`}>
                {formatCurrency(balance.balance)}
              </p>
            </CardContent>
          </Card>
          <Card className={balance.arrears > 0 ? 'border-red-300 bg-red-50' : ''}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-600">Arrears</p>
              <p className={`text-lg font-bold ${balance.arrears > 0 ? 'text-red-700' : 'text-gray-900'}`}>
                {formatCurrency(balance.arrears)}
              </p>
              {balance.daysOverdue > 0 && (
                <p className="text-xs text-red-600 mt-1">{balance.daysOverdue} days late</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tenant Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">{tenant.firstName} {tenant.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID/Passport Number</p>
              <p className="font-medium">{tenant.idNumber}</p>
            </div>
            {tenant.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Notes</p>
                <p className="text-gray-900 text-sm">{tenant.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{tenant.phone}</p>
              </div>
            </div>
            {tenant.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{tenant.email}</p>
                </div>
              </div>
            )}
            {tenant.emergencyContactName && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Emergency Contact</p>
                <p className="font-medium">{tenant.emergencyContactName}</p>
                {tenant.emergencyContactPhone && (
                  <p className="text-sm text-gray-600">{tenant.emergencyContactPhone}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tenancy History */}
      <Card>
        <CardHeader>
          <CardTitle>Tenancy History</CardTitle>
        </CardHeader>
        <CardContent>
          {tenant.tenancies && tenant.tenancies.length > 0 ? (
            <div className="space-y-4">
              {tenant.tenancies.map((tenancy: any) => (
                <div
                  key={tenancy.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      Unit {tenancy.unit.name} - {tenancy.unit.property.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(tenancy.moveInDate)} 
                      {tenancy.moveOutDate && ` - ${formatDate(tenancy.moveOutDate)}`}
                    </p>
                    {tenancy.depositPaid > 0 && (
                      <p className="text-sm text-gray-600">
                        Deposit: {formatCurrency(Number(tenancy.depositPaid))}
                        {tenancy.depositRefunded > 0 && 
                          ` (Refunded: ${formatCurrency(Number(tenancy.depositRefunded))})`}
                      </p>
                    )}
                  </div>
                  <Badge variant={tenancy.isActive ? 'success' : 'secondary'}>
                    {tenancy.isActive ? 'Current' : 'Ended'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">No tenancy history</p>
          )}
        </CardContent>
      </Card>

      {/* Move-In Dialog */}
      <Dialog open={showMoveIn} onOpenChange={setShowMoveIn}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Tenant In</DialogTitle>
            <DialogDescription>
              Assign {tenant.firstName} {tenant.lastName} to a vacant unit
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={moveInForm.handleSubmit(handleMoveIn)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unitId" required>Select Unit</Label>
              <Select
                id="unitId"
                options={unitOptions}
                {...moveInForm.register('unitId')}
              />
              {moveInForm.formState.errors.unitId && (
                <p className="text-sm text-red-600">{moveInForm.formState.errors.unitId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="moveInDate" required>Move-in Date</Label>
              <Input
                id="moveInDate"
                type="date"
                {...moveInForm.register('moveInDate')}
              />
              {moveInForm.formState.errors.moveInDate && (
                <p className="text-sm text-red-600">{moveInForm.formState.errors.moveInDate.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depositPaid">Deposit Paid (KES)</Label>
                <Input
                  id="depositPaid"
                  type="number"
                  min="0"
                  step="0.01"
                  {...moveInForm.register('depositPaid', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositPaidDate">Deposit Date</Label>
                <Input
                  id="depositPaidDate"
                  type="date"
                  {...moveInForm.register('depositPaidDate')}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" disabled={moveInMutation.isPending}>
                {moveInMutation.isPending ? 'Moving In...' : 'Move In'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMoveIn(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Move-Out Dialog */}
      <Dialog open={showMoveOut} onOpenChange={setShowMoveOut}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Tenant Out</DialogTitle>
            <DialogDescription>
              End tenancy for {tenant.firstName} {tenant.lastName}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={moveOutForm.handleSubmit(handleMoveOut)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="moveOutDate" required>Move-out Date</Label>
              <Input
                id="moveOutDate"
                type="date"
                {...moveOutForm.register('moveOutDate')}
              />
              {moveOutForm.formState.errors.moveOutDate && (
                <p className="text-sm text-red-600">{moveOutForm.formState.errors.moveOutDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="depositStatus" required>Deposit Status</Label>
              <Select
                id="depositStatus"
                options={[
                  { value: 'REFUNDED', label: 'Refunded' },
                  { value: 'FORFEITED', label: 'Forfeited' },
                ]}
                {...moveOutForm.register('depositStatus')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="depositRefunded">Refund Amount (KES)</Label>
                <Input
                  id="depositRefunded"
                  type="number"
                  min="0"
                  step="0.01"
                  {...moveOutForm.register('depositRefunded', { valueAsNumber: true })}
                />
                <p className="text-xs text-gray-500">
                  Deposit paid: {formatCurrency(Number(tenant.currentTenancy?.depositPaid || 0))}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositRefundDate">Refund Date</Label>
                <Input
                  id="depositRefundDate"
                  type="date"
                  {...moveOutForm.register('depositRefundDate')}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" disabled={moveOutMutation.isPending}>
                {moveOutMutation.isPending ? 'Moving Out...' : 'Move Out'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMoveOut(false)}
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

