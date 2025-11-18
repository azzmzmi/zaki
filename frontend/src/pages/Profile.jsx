import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8002';

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setAuth, accessToken } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  if (!user) {
    navigate('/login');
    return null;
  }

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      console.log('Updating profile with data:', data);
      const response = await axios.put(`${API_URL}/api/auth/profile`, data, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    },
    onSuccess: (updatedUser) => {
      setAuth(updatedUser, accessToken, useAuthStore.getState().refreshToken);
      toast.success(t('auth.profileUpdateSuccess') || 'Profile updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to update profile';
      toast.error(errorMessage);
    }
  });

  const handleUpdateProfile = (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error(t('auth.passwordMismatch') || 'Passwords do not match');
      return;
    }

    const updateData = { full_name: fullName };
    if (newPassword) {
      updateData.password = newPassword;
    }

    updateMutation.mutate(updateData);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-2xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('profile.title') || 'My Profile'}</h1>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Account Info Section */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4">{t('profile.accountInfo') || 'Account Information'}</h2>

            

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">{t('profile.email') || 'Email'}</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
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
                <Label htmlFor="role">{t('profile.role') || 'Role'}</Label>
                <Input
                  id="role"
                  type="text"
                  value={user.role}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800 capitalize"
                />
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('profile.changePassword') || 'Change Password'}</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">{t('profile.newPassword') || 'New Password'}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('profile.leaveBlankNoChange') || 'Leave blank if no change'}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t('profile.confirmPassword') || 'Confirm Password'}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('profile.confirmPassword')}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? t('common.saving') || 'Saving...' : t('common.save') || 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
