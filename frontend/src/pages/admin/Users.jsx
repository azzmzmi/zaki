import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { usersApi } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { User } from 'lucide-react';

export default function AdminUsers() {
  const { t } = useTranslation();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await usersApi.getAll();
      return response.data;
    }
  });

  return (
    <AdminLayout>
      <div data-testid="admin-users-page">
        <h1 className="text-4xl font-bold mb-8" data-testid="admin-users-title">{t('admin.users')}</h1>

        {isLoading ? (
          <div data-testid="loading-indicator">{t('common.loading')}</div>
        ) : (
          <div className="grid gap-4">
            {users?.map((user) => (
              <Card key={user.id} className="p-6" data-testid={`user-row-${user.id}`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg" data-testid={`user-name-${user.id}`}>{user.full_name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`user-email-${user.id}`}>{user.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`} data-testid={`user-role-${user.id}`}>
                    {user.role}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}