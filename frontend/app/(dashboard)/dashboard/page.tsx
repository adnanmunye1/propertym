'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getDashboardMetrics, getTenantsWithArrears } from '@/lib/api/invoices';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Home, Users, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: getDashboardMetrics,
  });

  const { data: arrearsData } = useQuery({
    queryKey: ['dashboard', 'arrears'],
    queryFn: getTenantsWithArrears,
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  const m = metrics || {
    totalProperties: 0,
    totalUnits: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    rentDueThisMonth: 0,
    rentReceivedThisMonth: 0,
    totalArrears: 0,
    tenantsInArrears: 0,
  };

  const topArrears = arrearsData?.slice(0, 5) || [];

  // Calculate collection rate
  const collectionRate = m.rentDueThisMonth > 0 
    ? Math.round((m.rentReceivedThisMonth / m.rentDueThisMonth) * 100) 
    : 0;

  // Data for Rent Collection Chart
  const rentCollectionData = [
    {
      name: 'This Month',
      'Rent Due': m.rentDueThisMonth / 1000, // Convert to thousands for readability
      'Rent Received': m.rentReceivedThisMonth / 1000,
      'Outstanding': (m.rentDueThisMonth - m.rentReceivedThisMonth) / 1000,
    },
  ];

  // Data for Occupancy Pie Chart
  const occupancyData = [
    { name: 'Occupied', value: m.occupiedUnits, color: '#10b981' },
    { name: 'Vacant', value: m.vacantUnits, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your property management dashboard</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Properties */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{m.totalProperties}</div>
            <p className="text-sm text-gray-600">Total Properties</p>
          </CardContent>
        </Card>

        {/* Units */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Home className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{m.totalUnits}</div>
            <p className="text-sm text-gray-600">
              {m.occupiedUnits} occupied · {m.vacantUnits} vacant
            </p>
          </CardContent>
        </Card>

        {/* Rent This Month */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-700 mb-1">
              {formatCurrency(m.rentReceivedThisMonth)}
            </div>
            <p className="text-sm text-gray-600">
              of {formatCurrency(m.rentDueThisMonth)} due
            </p>
          </CardContent>
        </Card>

        {/* Arrears */}
        <Card className={m.totalArrears > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${m.totalArrears > 0 ? 'bg-red-100' : 'bg-gray-50'}`}>
                <AlertCircle className={`w-5 h-5 ${m.totalArrears > 0 ? 'text-red-600' : 'text-gray-400'}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold mb-1 ${m.totalArrears > 0 ? 'text-red-700' : 'text-gray-900'}`}>
              {formatCurrency(m.totalArrears)}
            </div>
            <p className="text-sm text-gray-600">
              {m.tenantsInArrears} {m.tenantsInArrears === 1 ? 'tenant' : 'tenants'} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Rent Collection Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rent Collection Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{collectionRate}%</span>
                <span className="text-sm text-gray-600">collection rate</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(m.rentReceivedThisMonth)} of {formatCurrency(m.rentDueThisMonth)} collected
              </p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={rentCollectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis 
                  label={{ value: 'Amount (KES 000s)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: any) => `KES ${(value * 1000).toLocaleString()}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="Rent Due" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Rent Received" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Outstanding" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Occupancy Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Unit Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  {m.totalUnits > 0 ? Math.round((m.occupiedUnits / m.totalUnits) * 100) : 0}%
                </span>
                <span className="text-sm text-gray-600">occupancy rate</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {m.occupiedUnits} of {m.totalUnits} units occupied
              </p>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={occupancyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Occupied ({m.occupiedUnits})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm text-gray-600">Vacant ({m.vacantUnits})</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Arrears Alert */}
      {topArrears.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="border-b border-red-100">
            <CardTitle className="text-red-900 flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5" />
              Tenants in Arrears
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {topArrears.map((tenant: any) => (
                <Link
                  key={tenant.tenantId}
                  href={`/tenants/${tenant.tenantId}`}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-sm transition-all"
                >
                  <div>
                    <p className="font-medium text-gray-900">{tenant.tenantName}</p>
                    <p className="text-sm text-gray-600">
                      {tenant.unitName} - {tenant.propertyName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-700">
                      {formatCurrency(tenant.arrearsAmount)}
                    </p>
                    <p className="text-xs text-red-600">{tenant.daysOverdue} days overdue</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/reports">
              <Button variant="outline" className="w-full mt-4">
                View Full Arrears Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/properties/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add Property</h3>
                  <p className="text-sm text-gray-600">Register new building</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tenants/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Add Tenant</h3>
                  <p className="text-sm text-gray-600">Register new tenant</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/payments/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Record Payment</h3>
                  <p className="text-sm text-gray-600">Log rent payment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

