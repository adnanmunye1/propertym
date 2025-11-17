'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPayments } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const methodOptions = [
  { value: '', label: 'All Methods' },
  { value: 'MPESA', label: 'M-Pesa' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH', label: 'Cash' },
  { value: 'AIRTEL_MONEY', label: 'Airtel Money' },
  { value: 'OTHER', label: 'Other' },
];

export default function PaymentsPage() {
  const router = useRouter();
  const [method, setMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['payments', { method, startDate, endDate, page }],
    queryFn: () => getPayments({
      method: method || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      pageSize: 20,
    }),
  });

  const getMethodBadge = (method: string) => {
    const variants: any = {
      MPESA: 'success',
      BANK_TRANSFER: 'info',
      CASH: 'warning',
      AIRTEL_MONEY: 'secondary',
      OTHER: 'default',
    };

    const labels: any = {
      MPESA: 'M-Pesa',
      BANK_TRANSFER: 'Bank',
      CASH: 'Cash',
      AIRTEL_MONEY: 'Airtel',
      OTHER: 'Other',
    };

    return (
      <Badge variant={variants[method] || 'default'}>
        {labels[method] || method}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">Track all rent payments and transactions</p>
        </div>
        <Link href="/payments/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Record Payment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs text-gray-600 mb-1">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-xs text-gray-600 mb-1">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs text-gray-600 mb-1">Payment Method</Label>
            <Select
              options={methodOptions}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Payments Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      ) : error ? (
        <Card className="p-8">
          <div className="text-center text-red-600">
            <p className="font-medium">Error loading payments</p>
          </div>
        </Card>
      ) : !data || data.data.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments recorded</h3>
            <p className="text-gray-600 mb-6">
              {startDate || endDate || method
                ? 'Try adjusting your filters'
                : 'Start recording rent payments'}
            </p>
            <Link href="/payments/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Record First Payment
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.data.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/tenants/${payment.tenant.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {payment.tenant.firstName} {payment.tenant.lastName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.unit.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.unit.property.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-green-700">
                          {formatCurrency(Number(payment.amount))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getMethodBadge(payment.method)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.reference || '-'}
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
    </div>
  );
}
