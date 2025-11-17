'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { getPropertyById, deleteProperty } from '@/lib/api/properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Plus, Home } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [deleting, setDeleting] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getPropertyById(id),
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to archive this property?')) return;

    setDeleting(true);
    try {
      await deleteProperty(id);
      router.push('/properties');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete property');
      setDeleting(false);
    }
  };

  const getUnitStatusBadge = (status: string) => {
    const variants = {
      VACANT: 'success',
      OCCUPIED: 'info',
      RESERVED: 'warning',
      INACTIVE: 'secondary',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'default'}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading property...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-red-600 font-medium">Property not found</p>
          <Link href="/properties">
            <Button className="mt-4">Back to Properties</Button>
          </Link>
        </div>
      </Card>
    );
  }

  // Cast to access units array from API
  const propertyWithUnits = property as any;

  const propertyTypeLabels: Record<string, string> = {
    APARTMENT_BLOCK: 'Apartment Block',
    SINGLE_HOUSE: 'Single House',
    BEDSITTER_BLOCK: 'Bedsitter Block',
    COMMERCIAL: 'Commercial',
    OTHER: 'Other',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/properties">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
              {!property.isActive && <Badge variant="secondary">Inactive</Badge>}
            </div>
            <p className="text-gray-600 mt-1">{property.type.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/properties/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {property.area && (
              <div>
                <p className="text-sm text-gray-600">Area/Estate</p>
                <p className="font-medium">{property.area}</p>
              </div>
            )}
            {property.town && (
              <div>
                <p className="text-sm text-gray-600">Town/City</p>
                <p className="font-medium">{property.town}</p>
              </div>
            )}
            {property.county && (
              <div>
                <p className="text-sm text-gray-600">County</p>
                <p className="font-medium">{property.county}</p>
              </div>
            )}
            {property.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Full Address</p>
                <p className="font-medium">{property.address}</p>
              </div>
            )}
          </div>

          {property.description && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Description</p>
              <p className="text-gray-900">{property.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Units Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Units ({propertyWithUnits.units?.length || 0})</h2>
        <Link href={`/units/new?propertyId=${id}`}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Unit
          </Button>
        </Link>
      </div>

      {/* Units List */}
      {!propertyWithUnits.units || propertyWithUnits.units.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No units yet</h3>
            <p className="text-gray-600 mb-6">Add units to this property to start managing rentals</p>
            <Link href={`/units/new?propertyId=${id}`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Unit
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {propertyWithUnits.units.map((unit: any) => (
            <Link key={unit.id} href={`/units/${unit.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold">{unit.name}</h3>
                    {getUnitStatusBadge(unit.status)}
                  </div>

                  <div className="space-y-2 text-sm">
                    {unit.bedrooms && (
                      <p className="text-gray-600">{unit.bedrooms} BR · {unit.bathrooms} BA</p>
                    )}
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(Number(unit.rentAmount))}/mo
                    </p>
                    {unit.tenancies && unit.tenancies.length > 0 && unit.tenancies[0].tenant && (
                      <p className="text-gray-600">
                        Tenant: {unit.tenancies[0].tenant.firstName} {unit.tenancies[0].tenant.lastName}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

