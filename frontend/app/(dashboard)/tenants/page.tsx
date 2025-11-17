'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTenants } from '@/lib/api/tenants';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { QuickPaymentModal } from '@/components/shared/quick-payment-modal';
import { EmptyState } from '@/components/shared/empty-state';
import { Plus, Search, Users, DollarSign } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'NOTICE_GIVEN', label: 'Notice Given' },
  { value: 'FORMER', label: 'Former' },
];

export default function TenantsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [quickPaymentModal, setQuickPaymentModal] = useState<{
    tenantId: string;
    tenantName: string;
  } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tenants', { search, status, page }],
    queryFn: () => getTenants({
      search: search || undefined,
      status: status || undefined,
      page,
      pageSize: 20,
    }),
  });


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-600 mt-1">Manage tenant profiles and rental agreements</p>
        </div>
        <Link href="/tenants/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Tenant
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, or ID number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
        </div>
      </Card>

      {/* Tenants Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tenants...</p>
        </div>
      ) : error ? (
        <Card className="p-8">
          <div className="text-center text-red-600">
            <p className="font-medium">Error loading tenants</p>
            <p className="text-sm mt-1">Please try refreshing the page</p>
          </div>
        </Card>
      ) : !data || data.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No tenants found"
            description={
              search || status
                ? 'Try adjusting your filters to see more results'
                : 'Get started by adding your first tenant to the system'
            }
            actionLabel={search || status ? undefined : 'Add Your First Tenant'}
            actionHref="/tenants/new"
          />
        </Card>
      ) : (
        <>
          {/* Tenants Table */}
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Move-in Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((tenant: any) => (
                    <tr
                      key={tenant.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/tenants/${tenant.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">
                          {tenant.firstName} {tenant.lastName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tenant.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tenant.idNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tenant.currentUnit?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tenant.currentProperty?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tenant.currentTenancy?.moveInDate 
                          ? formatDate(tenant.currentTenancy.moveInDate)
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(tenant.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
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

      {/* Quick Payment Modal */}
      {quickPaymentModal && (
        <QuickPaymentModal
          tenantId={quickPaymentModal.tenantId}
          tenantName={quickPaymentModal.tenantName}
          onClose={() => setQuickPaymentModal(null)}
          onSuccess={() => {
            setQuickPaymentModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
