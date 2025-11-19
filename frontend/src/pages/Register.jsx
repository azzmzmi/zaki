import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const registerMutation = useMutation({
    mutationFn: async () => authApi.register(email, password, fullName),
    onSuccess: (response) => {
      const { user, access_token, refresh_token } = response.data;
      setAuth(user, access_token, refresh_token);
      toast.success(t('auth.registerSuccess'));
      navigate('/');
    },
    onError: () => {
      toast.error(t('auth.registerFailed'));
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4" data-testid="register-page">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center" data-testid="register-title">{t('auth.register')}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">{t('auth.fullName')}</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              data-testid="fullname-input"
            />
          </div>
          <div>
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="email-input"
            />
          </div>
          <div>
            <Label htmlFor="password">{t('auth.password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              data-testid="password-input"
            />
          </div>
          <Button type="submit" className="w-full" disabled={registerMutation.isPending} data-testid="register-submit-button">
            {registerMutation.isPending ? t('auth.creatingAccount') : t('auth.register')}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="text-blue-600 hover:underline" data-testid="login-link">
            {t('auth.login')}
          </Link>
        </p>
      </Card>
    </div>
  );
}