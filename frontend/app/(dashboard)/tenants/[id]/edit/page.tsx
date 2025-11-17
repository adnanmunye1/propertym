'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { getTenantById, updateTenant } from '@/lib/api/tenants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const kenyanPhoneRegex = /^(\+254|254|0)?[17]\d{8}$/;

const tenantSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  idNumber: z.string().min(1, 'ID/Passport number is required').max(50),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(kenyanPhoneRegex, 'Enter a valid Kenyan phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  emergencyContactName: z.string().max(200).optional(),
  emergencyContactPhone: z.string()
    .regex(kenyanPhoneRegex, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  notes: z.string().optional(),
});

type TenantFormData = z.infer<typeof tenantSchema>;

export default function EditTenantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: () => getTenantById(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
  });

  useEffect(() => {
    if (tenant) {
      reset({
        firstName: tenant.firstName,
        lastName: tenant.lastName,
        idNumber: tenant.idNumber,
        phone: tenant.phone,
        email: tenant.email || '',
        emergencyContactName: tenant.emergencyContactName || '',
        emergencyContactPhone: tenant.emergencyContactPhone || '',
        notes: tenant.notes || '',
      });
    }
  }, [tenant, reset]);

  const onSubmit = async (data: TenantFormData) => {
    setLoading(true);
    setError('');

    try {
      await updateTenant(id, {
        ...data,
        email: data.email || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactPhone: data.emergencyContactPhone || undefined,
      });
      router.push(`/tenants/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update tenant');
      setLoading(false);
    }
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
          <p className="text-red-600">Tenant not found</p>
          <Link href="/tenants">
            <Button className="mt-4">Back to Tenants</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/tenants/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Tenant</h1>
          <p className="text-gray-600 mt-1">{tenant.firstName} {tenant.lastName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
            <CardDescription>Update the tenant's details</CardDescription>
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
                    {...register('phone')}
                    disabled={loading}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
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
                    {...register('emergencyContactName')}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    {...register('emergencyContactPhone')}
                    disabled={loading}
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-sm text-red-600">{errors.emergencyContactPhone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 pt-4 border-t">
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
              <Link href={`/tenants/${id}`}>
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


