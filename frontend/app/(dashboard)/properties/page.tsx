'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getProperties } from '@/lib/api/properties';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Building2, Home } from 'lucide-react';

const propertyTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'APARTMENT_BLOCK', label: 'Apartment Block' },
  { value: 'SINGLE_HOUSE', label: 'Single House' },
  { value: 'BEDSITTER_BLOCK', label: 'Bedsitter Block' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'OTHER', label: 'Other' },
];

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export default function PropertiesPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [isActive, setIsActive] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['properties', { search, type, isActive, page }],
    queryFn: () => getProperties({
      search: search || undefined,
      type: type || undefined,
      isActive: isActive ? isActive === 'true' : undefined,
      page,
      pageSize: 20,
    }),
  });

  const getPropertyTypeLabel = (type: string) => {
    const option = propertyTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600 mt-1">Manage your properties and buildings</p>
        </div>
        <Link href="/properties/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, area, or town..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Type Filter */}
          <Select
            options={propertyTypeOptions}
            value={type}
            onChange={(e) => setType(e.target.value)}
          />

          {/* Status Filter */}
          <Select
            options={statusOptions}
            value={isActive}
            onChange={(e) => setIsActive(e.target.value)}
          />
        </div>
      </Card>

      {/* Properties List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      ) : error ? (
        <Card className="p-8">
          <div className="text-center text-red-600">
            <p className="font-medium">Error loading properties</p>
            <p className="text-sm mt-1">Please try refreshing the page</p>
          </div>
        </Card>
      ) : !data || data.data.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-600 mb-6">
              {search || type || isActive
                ? 'Try adjusting your filters'
                : 'Get started by adding your first property'}
            </p>
            <Link href="/properties/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Property
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((property: any) => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  {/* Image */}
                  {property.images && property.images.length > 0 ? (
                    <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={property.images[0].storageUrl}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-t-lg flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-blue-300" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                      {!property.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      {getPropertyTypeLabel(property.type)}
                    </p>

                    {(property.area || property.town) && (
                      <p className="text-sm text-gray-500 mb-4">
                        {[property.area, property.town, property.county]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Home className="w-4 h-4" />
                        <span>{property._count?.units || 0} units</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {data.pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

