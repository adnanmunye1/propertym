'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { createUnit } from '@/lib/api/units';
import { getProperties } from '@/lib/api/properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const unitSchema = z.object({
  propertyId: z.string().min(1, 'Property is required'),
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

export default function NewUnitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedPropertyId = searchParams.get('propertyId');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch properties for dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['properties', 'all'],
    queryFn: () => getProperties({ pageSize: 1000 }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      propertyId: preSelectedPropertyId || '',
      status: 'VACANT',
    },
  });

  // Set property if pre-selected
  useEffect(() => {
    if (preSelectedPropertyId) {
      setValue('propertyId', preSelectedPropertyId);
    }
  }, [preSelectedPropertyId, setValue]);

  const onSubmit = async (data: UnitFormData) => {
    setLoading(true);
    setError('');

    try {
      const unit = await createUnit({
        ...data,
        bedrooms: data.bedrooms ? Number(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? Number(data.bathrooms) : undefined,
        size: data.size ? Number(data.size) : undefined,
        rentAmount: Number(data.rentAmount),
        depositAmount: Number(data.depositAmount),
      });
      router.push(`/units/${unit.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create unit');
      setLoading(false);
    }
  };

  const propertyOptions = [
    { value: '', label: 'Select Property' },
    ...(propertiesData?.data.map((p: any) => ({
      value: p.id,
      label: p.name,
    })) || []),
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/units">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Unit</h1>
          <p className="text-gray-600 mt-1">Create a new rental unit</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Unit Information</CardTitle>
            <CardDescription>Enter the details of the rental unit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Property Selection */}
            <div className="space-y-2">
              <Label htmlFor="propertyId" required>Property</Label>
              <Select
                id="propertyId"
                options={propertyOptions}
                {...register('propertyId')}
                disabled={loading || !!preSelectedPropertyId}
              />
              {errors.propertyId && (
                <p className="text-sm text-red-600">{errors.propertyId.message}</p>
              )}
            </div>

            {/* Unit Name */}
            <div className="space-y-2">
              <Label htmlFor="name" required>Unit Name/Number</Label>
              <Input
                id="name"
                placeholder="e.g., A1, House 3, Unit 101"
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
                  placeholder="0"
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
                  placeholder="0"
                  min="0"
                  {...register('bathrooms', { valueAsNumber: true })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Floor/Level</Label>
                <Input
                  id="floor"
                  placeholder="e.g., Ground, 1st"
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
                placeholder="0"
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
                  placeholder="0"
                  min="1"
                  step="0.01"
                  {...register('rentAmount', { valueAsNumber: true })}
                  disabled={loading}
                />
                {errors.rentAmount && (
                  <p className="text-sm text-red-600">{errors.rentAmount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositAmount" required>Security Deposit (KES)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="0"
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
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this unit..."
                rows={3}
                {...register('notes')}
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Unit'}
              </Button>
              <Link href="/units">
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

