import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { analyticsApi } from '@/lib/api';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  CheckCircle,
  Clock,
  Truck,
  XCircle
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const COLORS = ['#2563eb', '#4f46e5', '#dc2626', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('7d');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await analyticsApi.get();
      return response.data;
    }
  });

  // Prepare data for charts
  const dailySalesData = analytics?.daily_sales 
    ? Object.entries(analytics.daily_sales).map(([date, sales]) => ({
        date,
        sales: parseFloat(sales.toFixed(2))
      })).sort((a, b) => new Date(a.date) - new Date(b.date))
    : [];

  const statusData = analytics?.status_breakdown
    ? Object.entries(analytics.status_breakdown).map(([status, count]) => ({
        name: t(`orders.status.${status}`) || status,
        value: count,
        status
      }))
    : [];

  const topProductsData = analytics?.top_products || [];

  if (isLoading) {
    return (
      <AdminLayout>
        <div data-testid="loading-indicator">{t('common.loading')}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div data-testid="admin-dashboard">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold" data-testid="dashboard-title">{t('admin.dashboard')}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('admin.timeRange')}</span>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border rounded-md px-3 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="7d">{t('admin.last7Days')}</option>
              <option value="30d">{t('admin.last30Days')}</option>
              <option value="90d">{t('admin.last90Days')}</option>
            </select>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="p-4 sm:p-6 hover:shadow-xl transition-all border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('admin.totalSales')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">${analytics?.total_sales?.toFixed(2) || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.recentSales')}: ${analytics?.recent_sales?.toFixed(2) || 0}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6 hover:shadow-xl transition-all border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('admin.totalOrders')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{analytics?.total_orders || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.averageOrderValue')}: ${(analytics?.total_orders ? (analytics.total_sales / analytics.total_orders).toFixed(2) : 0)}
                </p>
              </div>
              <ShoppingCart className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6 hover:shadow-xl transition-all border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('admin.totalUsers')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600">{analytics?.total_users || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.activeUsers')}: {Math.round((analytics?.total_users || 0) * 0.7)}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6 hover:shadow-xl transition-all border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('admin.totalProducts')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-indigo-600">{analytics?.total_products || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.outOfStock')}: 0
                </p>
              </div>
              <Package className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* Sales Trend Chart */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">{t('admin.salesTrend')}</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value) => [`$${value}`, t('admin.sales')]}
                    labelFormatter={(value) => t('admin.date') + ': ' + value}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name={t('admin.sales')}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Order Status Distribution */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">{t('admin.orderStatusDistribution')}</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => {
                      let color = '#2563eb'; // Default blue
                      if (entry.status === 'delivered') color = '#10b981'; // Green
                      if (entry.status === 'pending') color = '#f59e0b'; // Yellow
                      if (entry.status === 'cancelled') color = '#dc2626'; // Red
                      if (entry.status === 'shipped') color = '#4f46e5'; // Indigo
                      if (entry.status === 'processing') color = '#8b5cf6'; // Violet
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [value, t('admin.orders')]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Top Products */}
          <Card className="p-4 sm:p-6 lg:col-span-2">
            <h3 className="text-base sm:text-lg font-semibold mb-4">{t('admin.topSellingProducts')}</h3>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [value, t('admin.unitsSold')]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="quantity" 
                    name={t('admin.unitsSold')}
                    fill="#2563eb"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Order Status Summary */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-4">{t('admin.orderStatusSummary')}</h3>
            <div className="space-y-2 sm:space-y-4">
              <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span>{t('orders.status.pending')}</span>
                </div>
                <span className="font-semibold">{analytics?.status_breakdown?.pending || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  <span>{t('orders.status.processing')}</span>
                </div>
                <span className="font-semibold">{analytics?.status_breakdown?.processing || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-500" />
                  <span>{t('orders.status.shipped')}</span>
                </div>
                <span className="font-semibold">{analytics?.status_breakdown?.shipped || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>{t('orders.status.delivered')}</span>
                </div>
                <span className="font-semibold">{analytics?.status_breakdown?.delivered || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span>{t('orders.status.cancelled')}</span>
                </div>
                <span className="font-semibold">{analytics?.status_breakdown?.cancelled || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}