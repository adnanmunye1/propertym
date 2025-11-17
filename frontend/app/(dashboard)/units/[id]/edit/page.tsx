'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { getUnitById, updateUnit } from '@/lib/api/units';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const unitSchema = z.object({
  name: z.string().min(1, 'Unit name is required').max(100),
  bedrooms: z.number().min(0).optional().or(z.literal('')),
  bathrooms: z.number().min(0).optional().or(z.literal('')),
  floor: z.string().optional(),
  size: z.number().min(0).optional().or(z.literal('')),
  rentAmount: z.number().min(1, 'Rent must be greater than 0'),
  depositAmount: z.number().min(0, 'Deposit must be 0 or greater'),
  status: z.enum(['VACANT', 'OCCUPIED', 'RESERVED', 'INACTIVE']),
  notes: z.string().optional(),
});

type UnitFormData = z.infer<typeof unitSchema>;

const statusOptions = [
  { value: 'VACANT', label: 'Vacant' },
  { value: 'OCCUPIED', label: 'Occupied' },
  { value: 'RESERVED', label: 'Reserved' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function EditUnitPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: unit, isLoading } = useQuery({
    queryKey: ['unit', id],
    queryFn: () => getUnitById(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
  });

  useEffect(() => {
    if (unit) {
      reset({
        name: unit.name,
        bedrooms: unit.bedrooms || undefined,
        bathrooms: unit.bathrooms || undefined,
        floor: unit.floor || '',
        size: unit.size ? Number(unit.size) : undefined,
        rentAmount: Number(unit.rentAmount),
        depositAmount: Number(unit.depositAmount),
        status: unit.status,
        notes: unit.notes || '',
      });
    }
  }, [unit, reset]);

  const onSubmit = async (data: UnitFormData) => {
    setLoading(true);
    setError('');

    try {
      await updateUnit(id, {
        ...data,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
        size: data.size ? Number(data.size) : undefined,
        rentAmount: Number(data.rentAmount),
        depositAmount: Number(data.depositAmount),
      });
      router.push(`/units/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update unit');
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading unit...</p>
      </div>
    );
  }

  if (!unit) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-red-600">Unit not found</p>
          <Link href="/units">
            <Button className="mt-4">Back to Units</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/units/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Unit</h1>
          <p className="text-gray-600 mt-1">{unit.name} - {(unit as any).property?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Unit Information</CardTitle>
            <CardDescription>Update the unit details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Display (Read-only) */}
            <div className="space-y-2">
              <Label>Property</Label>
              <Input
                value={(unit as any).property?.name || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                Cannot change unit's property. Create new unit if needed.
              </p>
            </div>

            {/* Unit Name */}
            <div className="space-y-2">
              <Label htmlFor="name" required>Unit Name/Number</Label>
              <Input
                id="name"
                {...register('name')}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Unit Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  {...register('bedrooms', { valueAsNumber: true })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  {...register('bathrooms', { valueAsNumber: true })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Floor/Level</Label>
                <Input
                  id="floor"
                  {...register('floor')}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Size */}
            <div className="space-y-2">
              <Label htmlFor="size">Size (Square Meters)</Label>
              <Input
                id="size"
                type="number"
                min="0"
                step="0.01"
                {...register('size', { valueAsNumber: true })}
                disabled={loading}
              />
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentAmount" required>Monthly Rent (KES)</Label>
                <Input
                  id="rentAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  {...register('rentAmount', { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.rentAmount && (
                  <p className="text-sm text-red-600">{errors.rentAmount.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Note: Changing rent won't affect existing invoices
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositAmount" required>Security Deposit (KES)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('depositAmount', { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.depositAmount && (
                  <p className="text-sm text-red-600">{errors.depositAmount.message}</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" required>Status</Label>
              <Select
                id="status"
                options={statusOptions}
                {...register('status')}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Note: Status may be overridden by move-in/move-out operations
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
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
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href={`/units/${id}`}>
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


