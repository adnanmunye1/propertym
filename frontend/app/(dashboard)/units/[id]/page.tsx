'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { getUnitById, deleteUnit } from '@/lib/api/units';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Building2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [deleting, setDeleting] = useState(false);

  const { data: unit, isLoading, error } = useQuery({
    queryKey: ['unit', id],
    queryFn: () => getUnitById(id),
  });

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this unit?')) return;

    setDeleting(true);
    try {
      await deleteUnit(id);
      router.push('/units');
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete unit');
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
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
        <p className="text-gray-600">Loading unit...</p>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-red-600 font-medium">Unit not found</p>
          <Link href="/units">
            <Button className="mt-4">Back to Units</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const currentTenancy = unit.tenancies?.find((t: any) => t.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/units">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Unit {unit.name}</h1>
              {getStatusBadge(unit.status)}
            </div>
            <Link href={`/properties/${unit.property?.id}`} className="text-gray-600 hover:text-gray-900 mt-1 inline-flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {unit.property?.name}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/units/${id}/edit`}>
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

      {/* Unit Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Unit Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {unit.bedrooms && (
              <div>
                <p className="text-sm text-gray-600">Bedrooms / Bathrooms</p>
                <p className="font-medium">{unit.bedrooms} BR · {unit.bathrooms} BA</p>
              </div>
            )}
            {unit.floor && (
              <div>
                <p className="text-sm text-gray-600">Floor/Level</p>
                <p className="font-medium">{unit.floor}</p>
              </div>
            )}
            {unit.size && (
              <div>
                <p className="text-sm text-gray-600">Size</p>
                <p className="font-medium">{unit.size} m²</p>
              </div>
            )}
            {unit.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Notes</p>
                <p className="text-gray-900 text-sm">{unit.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Info */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Monthly Rent</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(Number(unit.rentAmount))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Security Deposit</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(Number(unit.depositAmount))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Tenant */}
      {currentTenancy && currentTenancy.tenant ? (
        <Card>
          <CardHeader>
            <CardTitle>Current Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">
                  {currentTenancy.tenant.firstName} {currentTenancy.tenant.lastName}
                </p>
              </div>
              {currentTenancy.tenant.phone && (
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{currentTenancy.tenant.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Move-in Date</p>
                <p className="font-medium">
                  {new Date(currentTenancy.moveInDate).toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link href={`/tenants/${currentTenancy.tenant.id}`}>
                <Button variant="outline" size="sm">
                  View Tenant Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">This unit is currently vacant</p>
            {unit.status === 'VACANT' && (
              <Button className="mt-4" variant="outline">
                Assign Tenant
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

