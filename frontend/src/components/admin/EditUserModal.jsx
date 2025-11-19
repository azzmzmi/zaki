import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8002';

export default function EditUserModal({ user, open, onOpenChange }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [role, setRole] = useState(user?.role || 'customer');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      console.log(`Updating user ${user.id} with data:`, data);
      const response = await axios.put(
        `${API_URL}/api/auth/profile/${user.id}`,
        data,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      return response.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success(t('user.updatedSuccessfully'));
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('User update error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update user';
      toast.error(errorMessage);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error(t('auth.passwordsDontMatch'));
      return;
    }

    const updateData = { 
      full_name: fullName,
      role: role
    };

    if (newPassword) {
      updateData.password = newPassword;
    }

    updateMutation.mutate(updateData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('profile.editUser') || 'Edit User'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-gray-100 dark:bg-gray-800"
            />
          </div>

          <div>
            <Label htmlFor="fullName">{t('auth.fullName')}</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">{t('profile.role')}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">{t('profile.customer') || 'Customer'}</SelectItem>
                <SelectItem value="admin">{t('profile.admin') || 'Admin'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('profile.leaveBlankNoChange')}
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">{t('profile.confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('profile.confirmPassword')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}