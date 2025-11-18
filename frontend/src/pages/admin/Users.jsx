import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { usersApi } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import { Edit } from 'lucide-react';
import { useState } from 'react';
import EditUserModal from '@/components/admin/EditUserModal';

export default function AdminUsers() {
  const { t } = useTranslation();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['admin-users', currentPage],
    queryFn: async () => {
      const response = await usersApi.getAll(currentPage, ITEMS_PER_PAGE);
      return response.data;
    }
  });

  const users = usersResponse?.data || [];
  const pagination = usersResponse?.pagination;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columns = [
    {
      key: 'full_name',
      label: t('user.fullName')
    },
    {
      key: 'email',
      label: t('auth.email')
    },
    {
      key: 'role',
      label: t('user.role'),
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          value === 'admin' 
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'created_at',
      label: t('user.joined'),
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const actions = (row) => (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => {
        setSelectedUser(row);
        setIsEditModalOpen(true);
      }}
      data-testid={`edit-user-${row.id}`}
    >
      <Edit className="w-4 h-4" />
    </Button>
  );

  return (
    <AdminLayout>
      <div data-testid="admin-users-page">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold" data-testid="admin-users-title">{t('admin.users')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('admin.manageYourUsers')}</p>
          </div>
        </div>

        <DataTable
          data={users}
          columns={columns}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          actions={actions}
          rowKey="id"
        />
        
        {selectedUser && (
          <EditUserModal
            user={selectedUser}
            open={isEditModalOpen}
            onOpenChange={setIsEditModalOpen}
          />
        )}
      </div>
    </AdminLayout>
  );
}
