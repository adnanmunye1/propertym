'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPaymentsReport, getArrearsReport, getOccupancyReport, exportReport } from '@/lib/api/reports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Download, BarChart3 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'arrears' | 'occupancy'>('payments');
  
  // Payments filters
  const [payStartDate, setPayStartDate] = useState('');
  const [payEndDate, setPayEndDate] = useState('');
  const [payMethod, setPayMethod] = useState('');

  // Arrears filters
  const [minDays, setMinDays] = useState(0);

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['reports', 'payments', { payStartDate, payEndDate, payMethod }],
    queryFn: () => getPaymentsReport({
      startDate: payStartDate || undefined,
      endDate: payEndDate || undefined,
      method: payMethod || undefined,
    }),
    enabled: activeTab === 'payments',
  });

  const { data: arrearsData, isLoading: arrearsLoading } = useQuery({
    queryKey: ['reports', 'arrears', { minDays }],
    queryFn: () => getArrearsReport({
      minDays: minDays || undefined,
    }),
    enabled: activeTab === 'arrears',
  });

  const { data: occupancyData, isLoading: occupancyLoading } = useQuery({
    queryKey: ['reports', 'occupancy'],
    queryFn: () => getOccupancyReport(),
    enabled: activeTab === 'occupancy',
  });

  const handleExport = async () => {
    const filters: any = {};
    
    if (activeTab === 'payments') {
      if (payStartDate) filters.startDate = payStartDate;
      if (payEndDate) filters.endDate = payEndDate;
      if (payMethod) filters.method = payMethod;
    } else if (activeTab === 'arrears') {
      if (minDays > 0) filters.minDays = minDays;
    }

    await exportReport(activeTab, filters);
  };

  const tabs = [
    { id: 'payments' as const, label: 'Payments Report' },
    { id: 'arrears' as const, label: 'Arrears Report' },
    { id: 'occupancy' as const, label: 'Occupancy Report' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and export financial reports</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export to CSV
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payments Report */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-gray-600 mb-1">Start Date</Label>
                <Input
                  type="date"
                  value={payStartDate}
                  onChange={(e) => setPayStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600 mb-1">End Date</Label>
                <Input
                  type="date"
                  value={payEndDate}
                  onChange={(e) => setPayEndDate(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs text-gray-600 mb-1">Payment Method</Label>
                <Select
                  options={[
                    { value: '', label: 'All Methods' },
                    { value: 'MPESA', label: 'M-Pesa' },
                    { value: 'BANK_TRANSFER', label: 'Bank' },
                    { value: 'CASH', label: 'Cash' },
                    { value: 'AIRTEL_MONEY', label: 'Airtel' },
                    { value: 'OTHER', label: 'Other' },
                  ]}
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {paymentsLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading payments...</p>
            </div>
          ) : paymentsData?.payments?.length > 0 ? (
            <>
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Payments</p>
                    <p className="text-2xl font-bold text-gray-900">{paymentsData.summary.totalPayments}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(paymentsData.summary.totalAmount)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentsData.payments.map((payment: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{payment.date}</td>
                          <td className="px-4 py-3 text-sm">{payment.tenant}</td>
                          <td className="px-4 py-3 text-sm">{payment.unit}</td>
                          <td className="px-4 py-3 text-sm">{payment.property}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-700">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3 text-sm">{payment.method}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-gray-600">No payments found for the selected criteria</p>
            </Card>
          )}
        </div>
      )}

      {/* Arrears Report */}
      {activeTab === 'arrears' && (
        <div className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-gray-600 mb-1">Minimum Days Overdue</Label>
                <Select
                  options={[
                    { value: '0', label: 'All Overdue' },
                    { value: '7', label: '7+ days' },
                    { value: '30', label: '30+ days' },
                    { value: '60', label: '60+ days' },
                  ]}
                  value={minDays.toString()}
                  onChange={(e) => setMinDays(parseInt(e.target.value))}
                />
              </div>
            </div>
          </Card>

          {arrearsLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading arrears...</p>
            </div>
          ) : arrearsData?.arrears?.length > 0 ? (
            <>
              <Card className="p-6 bg-red-50 border-red-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Tenants in Arrears</p>
                    <p className="text-2xl font-bold text-gray-900">{arrearsData.summary.totalTenantsInArrears}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Arrears</p>
                    <p className="text-2xl font-bold text-red-700">
                      {formatCurrency(arrearsData.summary.totalArrearsAmount)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrears</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Overdue</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {arrearsData.arrears.map((tenant: any) => (
                        <tr key={tenant.tenantId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{tenant.tenantName}</td>
                          <td className="px-4 py-3 text-sm">{tenant.unitName}</td>
                          <td className="px-4 py-3 text-sm">{tenant.propertyName}</td>
                          <td className="px-4 py-3 text-sm font-bold text-red-700">
                            {formatCurrency(tenant.arrearsAmount)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="destructive">{tenant.daysOverdue} days</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-green-600 font-medium text-lg">🎉 No tenants in arrears!</p>
              <p className="text-gray-600 mt-2">All tenants are up to date with payments</p>
            </Card>
          )}
        </div>
      )}

      {/* Occupancy Report */}
      {activeTab === 'occupancy' && (
        <div className="space-y-6">
          {occupancyLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading occupancy data...</p>
            </div>
          ) : occupancyData?.properties?.length > 0 ? (
            <>
              <Card className="p-6 bg-blue-50 border-blue-200">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Units</p>
                    <p className="text-2xl font-bold text-gray-900">{occupancyData.summary.totalUnits}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Occupied</p>
                    <p className="text-2xl font-bold text-green-700">{occupancyData.summary.totalOccupied}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-blue-700">{occupancyData.summary.overallOccupancyRate}%</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Units</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupied</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vacant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy Rate</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {occupancyData.properties.map((property: any) => (
                        <tr key={property.propertyId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">{property.propertyName}</td>
                          <td className="px-4 py-3 text-sm">{property.propertyType.replace('_', ' ')}</td>
                          <td className="px-4 py-3 text-sm">{property.totalUnits}</td>
                          <td className="px-4 py-3 text-sm text-green-700 font-semibold">{property.occupied}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{property.vacant}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={property.occupancyRate >= 80 ? 'success' : property.occupancyRate >= 50 ? 'warning' : 'destructive'}>
                              {property.occupancyRate}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No occupancy data available</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
