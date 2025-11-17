'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';
import { getPropertyById, updateProperty } from '@/lib/api/properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const propertySchema = z.object({
  name: z.string().min(1, 'Property name is required').max(255),
  type: z.enum(['APARTMENT_BLOCK', 'SINGLE_HOUSE', 'BEDSITTER_BLOCK', 'COMMERCIAL', 'OTHER']),
  area: z.string().optional(),
  town: z.string().optional(),
  county: z.string().optional(),
  address: z.string().optional(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const propertyTypeOptions = [
  { value: 'APARTMENT_BLOCK', label: 'Apartment Block' },
  { value: 'SINGLE_HOUSE', label: 'Single House' },
  { value: 'BEDSITTER_BLOCK', label: 'Bedsitter Block' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'OTHER', label: 'Other' },
];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getPropertyById(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
  });

  // Pre-fill form when property data loads
  useEffect(() => {
    if (property) {
      reset({
        name: property.name,
        type: property.type,
        area: property.area || '',
        town: property.town || '',
        county: property.county || '',
        address: property.address || '',
        description: property.description || '',
        isActive: property.isActive,
      });
    }
  }, [property, reset]);

  const onSubmit = async (data: PropertyFormData) => {
    setLoading(true);
    setError('');

    try {
      await updateProperty(id, data);
      router.push(`/properties/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update property');
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-red-600">Property not found</p>
          <Link href="/properties">
            <Button className="mt-4">Back to Properties</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/properties/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-600 mt-1">{property.name}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
            <CardDescription>Update the property details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" required>Property Name</Label>
              <Input
                id="name"
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
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area/Estate</Label>
                <Input
                  id="area"
                  {...register('area')}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="town">Town/City</Label>
                <Input
                  id="town"
                  {...register('town')}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
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
                {...register('address')}
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                {...register('description')}
                disabled={loading}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                {...register('isActive')}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                disabled={loading}
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Property is active
              </Label>
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
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href={`/properties/${id}`}>
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


