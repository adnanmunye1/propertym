'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createTenant } from '@/lib/api/tenants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Kenyan phone number validation
const kenyanPhoneRegex = /^(\+254|254|0)?[17]\d{8}$/;

const tenantSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  idNumber: z.string().min(1, 'ID/Passport number is required').max(50),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(kenyanPhoneRegex, 'Enter a valid Kenyan phone number (e.g., +2547xxxxxxxx or 07xxxxxxxx)'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  emergencyContactName: z.string().max(200).optional(),
  emergencyContactPhone: z.string()
    .regex(kenyanPhoneRegex, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  openingBalance: z.string().optional().transform((val) => {
    if (!val || val === '') return undefined;
    const num = parseFloat(val);
    return isNaN(num) || num < 0 ? undefined : num;
  }),
  notes: z.string().optional(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

export default function NewTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
  });

  const onSubmit = async (data: TenantFormData) => {
    setLoading(true);
    setError('');

    try {
      const tenant = await createTenant({
        ...data,
        email: data.email || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactPhone: data.emergencyContactPhone || undefined,
        openingBalance: data.openingBalance || undefined,
      });
      router.push(`/tenants/${tenant.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create tenant');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tenants">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Tenant</h1>
          <p className="text-gray-600 mt-1">Create a new tenant profile</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
            <CardDescription>Enter the tenant's personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Personal Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" required>First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...register('firstName')}
                    disabled={loading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" required>Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...register('lastName')}
                    disabled={loading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumber" required>ID or Passport Number</Label>
                <Input
                  id="idNumber"
                  placeholder="12345678"
                  {...register('idNumber')}
                  disabled={loading}
                />
                {errors.idNumber && (
                  <p className="text-sm text-red-600">{errors.idNumber.message}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-gray-900">Contact Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" required>Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+2547xxxxxxxx or 07xxxxxxxx"
                    {...register('phone')}
                    disabled={loading}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Format: +2547xxxxxxxx or 07xxxxxxxx
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    {...register('email')}
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-gray-900">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    placeholder="Jane Doe"
                    {...register('emergencyContactName')}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    placeholder="+2547xxxxxxxx"
                    {...register('emergencyContactPhone')}
                    disabled={loading}
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-sm text-red-600">{errors.emergencyContactPhone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Opening Balance / Arrears */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-gray-900">Opening Balance (For Migration)</h3>
              <p className="text-sm text-gray-600">
                If this tenant is being migrated from another system and has outstanding arrears, enter the amount here. 
                An invoice will be created when the tenant is moved into a unit.
              </p>
              
              <div className="space-y-2">
                <Label htmlFor="openingBalance">Opening Balance (KES)</Label>
                <Input
                  id="openingBalance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register('openingBalance')}
                  disabled={loading}
                />
                {errors.openingBalance && (
                  <p className="text-sm text-red-600">{errors.openingBalance.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Leave empty or 0 if tenant has no outstanding balance
                </p>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information about this tenant..."
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
                {loading ? 'Creating...' : 'Create Tenant'}
              </Button>
              <Link href="/tenants">
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

