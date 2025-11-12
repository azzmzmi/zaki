import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { analyticsApi } from '@/lib/api';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

export default function Dashboard() {
  const { t } = useTranslation();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await analyticsApi.get();
      return response.data;
    }
  });

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
        <h1 className="text-4xl font-bold mb-8" data-testid="dashboard-title">{t('admin.dashboard')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-xl transition-all" data-testid="stat-sales">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.totalSales')}</p>
                <p className="text-3xl font-bold text-green-600">${analytics?.total_sales?.toFixed(2) || 0}</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all" data-testid="stat-orders">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.totalOrders')}</p>
                <p className="text-3xl font-bold text-blue-600">{analytics?.total_orders || 0}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all" data-testid="stat-users">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.totalUsers')}</p>
                <p className="text-3xl font-bold text-purple-600">{analytics?.total_users || 0}</p>
              </div>
              <Users className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-xl transition-all" data-testid="stat-products">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('admin.totalProducts')}</p>
                <p className="text-3xl font-bold text-indigo-600">{analytics?.total_products || 0}</p>
              </div>
              <Package className="w-12 h-12 text-indigo-600 opacity-20" />
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}