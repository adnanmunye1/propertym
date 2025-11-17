'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createProperty } from '@/lib/api/properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required').max(255, 'Name too long'),
  type: z.enum(['APARTMENT_BLOCK', 'SINGLE_HOUSE', 'BEDSITTER_BLOCK', 'COMMERCIAL', 'OTHER']),
  area: z.string().optional(),
  town: z.string().optional(),
  county: z.string().optional(),
  address: z.string().optional(),
  description: z.string().max(1000, 'Description too long').optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const propertyTypeOptions = [
  { value: 'APARTMENT_BLOCK', label: 'Apartment Block' },
  { value: 'SINGLE_HOUSE', label: 'Single House' },
  { value: 'BEDSITTER_BLOCK', label: 'Bedsitter Block' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'OTHER', label: 'Other' },
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'APARTMENT_BLOCK',
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    setLoading(true);
    setError('');

    try {
      const property = await createProperty(data);
      router.push(`/properties/${property.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create property');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/properties">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-600 mt-1">Create a new property in your portfolio</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
            <CardDescription>Enter the details of your property</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" required>Property Name</Label>
              <Input
                id="name"
                placeholder="e.g., Mbagathi Apartments"
                {...register('name')}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type" required>Property Type</Label>
              <Select
                id="type"
                options={propertyTypeOptions}
                {...register('type')}
                disabled={loading}
              />
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area/Estate</Label>
                <Input
                  id="area"
                  placeholder="e.g., Kilimani"
                  {...register('area')}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="town">Town/City</Label>
                <Input
                  id="town"
                  placeholder="e.g., Nairobi"
                  {...register('town')}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  placeholder="e.g., Nairobi"
                  {...register('county')}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                placeholder="Complete address (optional)"
                {...register('address')}
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Any additional details about this property..."
                rows={4}
                {...register('description')}
                disabled={loading}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
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
                {loading ? 'Creating...' : 'Create Property'}
              </Button>
              <Link href="/properties">
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

