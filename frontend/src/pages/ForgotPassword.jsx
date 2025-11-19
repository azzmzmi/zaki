import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' or 'reset'
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const requestResetMutation = useMutation({
    mutationFn: async () => {
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      return response.data;
    },
    onSuccess: (data) => {
      setResetToken(data.token);
      setStep('reset');
      toast.success(t('auth.resetEmailSent'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || t('auth.emailNotFound'));
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error(t('auth.passwordMismatch'));
      }

      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token: resetToken,
        new_password: newPassword
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('auth.resetPasswordSuccess'));
      navigate('/login');
    },
    onError: (error) => {
      if (error.message.includes('do not match')) {
        toast.error(t('auth.passwordMismatch'));
      } else {
        toast.error(error.response?.data?.detail || t('auth.resetFailed'));
      }
    }
  });

  const handleRequestReset = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('auth.emailRequired'));
      return;
    }
    requestResetMutation.mutate();
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error(t('auth.allFieldsRequired'));
      return;
    }
    resetPasswordMutation.mutate();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {t('auth.forgotPassword')}
        </h1>

        {step === 'email' ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.enterYourEmail')}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={requestResetMutation.isPending}
            >
              {requestResetMutation.isPending
                ? t('common.sending')
                : t('auth.sendResetLink')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t('auth.resetLinkSent')}
              </p>
            </div>

            <div>
              <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('auth.enterNewPassword')}
                required
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
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending
                ? t('common.resetting')
                : t('auth.resetPassword')}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('auth.rememberedPassword')}{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
