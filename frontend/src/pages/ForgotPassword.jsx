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
      toast.success(t('auth.resetEmailSent') || 'Password reset link sent to your email');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || t('auth.emailNotFound') || 'Email not found');
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token: resetToken,
        new_password: newPassword
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('auth.passwordResetSuccess') || 'Password reset successfully');
      navigate('/login');
    },
    onError: (error) => {
      if (error.message.includes('do not match')) {
        toast.error(t('auth.passwordMismatch') || 'Passwords do not match');
      } else {
        toast.error(error.response?.data?.detail || t('auth.resetFailed') || 'Failed to reset password');
      }
    }
  });

  const handleRequestReset = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('auth.emailRequired') || 'Email is required');
      return;
    }
    requestResetMutation.mutate();
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error(t('auth.allFieldsRequired') || 'All fields are required');
      return;
    }
    resetPasswordMutation.mutate();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {t('auth.forgotPassword') || 'Forgot Password'}
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
                placeholder={t('auth.enterYourEmail') || 'Enter your email'}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={requestResetMutation.isPending}
            >
              {requestResetMutation.isPending
                ? t('common.sending') || 'Sending...'
                : t('auth.sendResetLink') || 'Send Reset Link'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {t('auth.resetLinkSent') || 'Password reset link has been sent to your email. Please check your email for the token.'}
              </p>
            </div>

            <div>
              <Label htmlFor="newPassword">{t('profile.newPassword') || 'New Password'}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('profile.enterNewPassword') || 'Enter new password'}
                required
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
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending
                ? t('common.resetting') || 'Resetting...'
                : t('auth.resetPassword') || 'Reset Password'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('auth.rememberedPassword') || 'Remembered your password?'}{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </Card>
    </div>
  );
}
