import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Palette } from 'lucide-react';
import PropTypes from 'prop-types';

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired
};



export default function AdminLayout({ children }) {
  const { t } = useTranslation();
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: '/admin/products', icon: Package, label: t('admin.products') },
    { path: '/admin/categories', icon: FolderTree, label: t('admin.categories') },
    { path: '/admin/orders', icon: ShoppingCart, label: t('admin.orders') },
    { path: '/admin/users', icon: Users, label: t('admin.users') },
    { path: '/admin/partners', icon: Users, label: t('admin.partners') },
    { path: '/admin/theme', icon: Palette, label: t('admin.theme') || 'Theme' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
        <aside className="md:col-span-1">
          <nav className="space-y-2 sticky top-24" data-testid="admin-sidebar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  data-testid={`admin-nav-${item.path.split('/').pop() || 'dashboard'}`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="md:col-span-3">{children}</main>
      </div>
    </div>
  );
}