import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ordersApi } from '@/lib/api';
import { toast } from 'sonner';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import { ChevronDown, Eye, Check, X, Clock } from 'lucide-react';

export default function AdminOrders() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['admin-orders', currentPage],
    queryFn: async () => {
      const response = await ordersApi.getAll(currentPage, ITEMS_PER_PAGE);
      return response.data;
    }
  });

  const orders = ordersResponse?.data || [];
  const pagination = ordersResponse?.pagination;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter and sort orders (client-side filtering on current page)
  const filteredAndSortedOrders = orders ? orders
    .filter(order => filterStatus === 'all' || order.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === 'highest') {
        return b.total - a.total;
      } else if (sortBy === 'lowest') {
        return a.total - b.total;
      }
      return 0;
    }) : [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success(t('orders.statusUpdated'));
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
    onError: () => toast.error(t('orders.updateError'))
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'shipped':
        return <Eye className="w-4 h-4" />;
      case 'delivered':
        return <Check className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const stats = {
    total: pagination?.total || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    processing: orders?.filter(o => o.status === 'processing').length || 0,
    shipped: orders?.filter(o => o.status === 'shipped').length || 0,
    delivered: orders?.filter(o => o.status === 'delivered').length || 0
  };

  return (
    <AdminLayout>
      <div data-testid="admin-orders-page" className="space-y-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" data-testid="admin-orders-title">{t('admin.orders')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('orders.manageDesc')}</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('orders.totalOrders')}</span>
              <span className="text-2xl font-bold text-blue-600">{stats.total}</span>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('orders.pendingCount')}</span>
              <span className="text-2xl font-bold text-yellow-600">{stats.pending}</span>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('orders.processingCount')}</span>
              <span className="text-2xl font-bold text-blue-600">{stats.processing}</span>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('orders.shippedCount')}</span>
              <span className="text-2xl font-bold text-purple-600">{stats.shipped}</span>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('orders.deliveredCount')}</span>
              <span className="text-2xl font-bold text-green-600">{stats.delivered}</span>
            </div>
          </Card>
        </div>

        {/* Filters and Sorting */}
        <Card className="p-3 sm:p-4 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-start sm:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium whitespace-nowrap">{t('orders.filterByStatus')}</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('orders.allOrders')}</SelectItem>
                <SelectItem value="pending">{t('orders.status.pending')}</SelectItem>
                <SelectItem value="processing">{t('orders.status.processing')}</SelectItem>
                <SelectItem value="shipped">{t('orders.status.shipped')}</SelectItem>
                <SelectItem value="delivered">{t('orders.status.delivered')}</SelectItem>
                <SelectItem value="cancelled">{t('orders.status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium whitespace-nowrap">{t('orders.sortBy')}</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('orders.newestFirst')}</SelectItem>
                <SelectItem value="oldest">{t('orders.oldestFirst')}</SelectItem>
                <SelectItem value="highest">{t('orders.highestTotal')}</SelectItem>
                <SelectItem value="lowest">{t('orders.lowestTotal')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Orders List */}
        {isLoading ? (
          <div data-testid="loading-indicator" className="text-center py-8">{t('common.loading')}</div>
        ) : filteredAndSortedOrders.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            {t('orders.noOrdersFound')}
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {filteredAndSortedOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden" data-testid={`order-row-${order.id}`}>
                {/* Order Header */}
                <div 
                  className="p-3 sm:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div>
                        <h3 className="font-semibold text-sm sm:text-lg" data-testid={`order-id-${order.id}`}>
                          {t('orders.orderNumber', { id: order.id.slice(0, 8) })}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="ml-auto sm:ml-auto flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <div className="text-right">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('orders.totalAmount')}</p>
                          <p className="text-xl sm:text-2xl font-bold text-blue-600" data-testid={`order-total-${order.id}`}>
                            ${order.total.toFixed(2)}
                          </p>
                        </div>
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 flex-shrink-0 ${getStatusColor(order.status)}`} data-testid={`order-status-${order.id}`}>
                          {getStatusIcon(order.status)}
                          <span className="hidden sm:inline">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                        </span>
                        <ChevronDown className={`w-5 h-5 transition-transform flex-shrink-0 ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {expandedOrder === order.id && (
                  <div className="border-t px-3 sm:px-6 py-4 sm:py-6 bg-gray-50 dark:bg-gray-800/50 space-y-4 sm:space-y-6">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-3">{t('orders.items')}</h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-700 p-3 rounded">
                            <div>
                              <p className="font-medium">{item.product_name}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{t('orders.qty')} {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">${item.price} {t('orders.each')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-semibold mb-3">{t('orders.shippingAddressLabel')}</h4>
                      <div className="bg-white dark:bg-gray-700 p-4 rounded space-y-1 text-sm">
                        <p className="font-medium">{order.shipping_address?.full_name}</p>
                        <p>{order.shipping_address?.street_address}</p>
                        <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip_code}</p>
                        <p>{order.shipping_address?.country}</p>
                        {order.shipping_address?.phone && <p>{t('orders.phone')} {order.shipping_address.phone}</p>}
                      </div>
                    </div>

                    {/* Status Management */}
                    <div className="border-t pt-4 sm:pt-6">
                      <h4 className="font-semibold mb-3 text-sm sm:text-base">{t('orders.updateStatus')}</h4>
                      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                        <Select
                          value={order.status}
                          onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status })}
                        >
                          <SelectTrigger className="w-full sm:w-48" data-testid={`order-status-select-${order.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t('orders.status.pending')}</SelectItem>
                            <SelectItem value="processing">{t('orders.processingApproved')}</SelectItem>
                            <SelectItem value="shipped">{t('orders.status.shipped')}</SelectItem>
                            <SelectItem value="delivered">{t('orders.status.delivered')}</SelectItem>
                            <SelectItem value="cancelled">{t('orders.status.cancelled')}</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Quick Action Buttons */}
                        {order.status === 'pending' && (
                          <Button 
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'processing' })}
                            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            {t('orders.approveOrder')}
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button 
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'shipped' })}
                            className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {t('orders.markShipped')}
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button 
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'delivered' })}
                            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            {t('orders.markDelivered')}
                          </Button>
                        )}
                        {(order.status === 'pending' || order.status === 'processing') && (
                          <Button 
                            onClick={() => updateStatusMutation.mutate({ id: order.id, status: 'cancelled' })}
                            className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                          >
                            <X className="w-4 h-4 mr-2" />
                            {t('orders.cancelOrder')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 sm:pt-12">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                  {t('pagination.page')} {pagination.page} {t('pagination.of')} {pagination.pages} • {pagination.total}{' '}
                  {pagination.total === 1 ? 'order' : 'orders'}
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    data-testid="pagination-prev"
                  >
                    <ChevronDown className="w-4 h-4 rotate-90" />
                    {t('pagination.previous')}
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={pagination.page === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-10"
                          data-testid={`pagination-page-${pageNum}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    data-testid="pagination-next"
                  >
                    {t('pagination.next')}
                    <ChevronDown className="w-4 h-4 -rotate-90" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}