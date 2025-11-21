import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { 
  Palette, 
  Globe, 
  User, 
  Bell, 
  Shield, 
  ArrowLeft 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [language, setLanguage] = useState(i18n.language || 'en');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('i18nextLng', lang);
    toast.success(t('common.success'));
  };

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-[80vh] px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('common.back') || 'Back'}
          </Button>
          <h1 className="text-4xl font-bold mb-2">{t('nav.settings') || 'Settings'}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('settings.description') || 'Manage your account settings and preferences'}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Appearance Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">
                {t('settings.appearance') || 'Appearance'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">
                  {t('nav.theme') || 'Theme'}
                </Label>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm">
                    {t('settings.chooseTheme') || 'Choose your preferred theme'}
                  </span>
                  <ThemeSwitcher />
                </div>
              </div>
            </div>
          </Card>

          {/* Language Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">
                {t('settings.language') || 'Language'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="language" className="mb-2 block">
                  {t('nav.language') || 'Language'}
                </Label>
                <Select value={language} onValueChange={changeLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  {t('settings.languageDescription') || 'Change the interface language'}
                </p>
              </div>
            </div>
          </Card>

          {/* Account Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">
                {t('settings.account') || 'Account'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('settings.accountDescription') || 'Manage your account information and password'}
                </p>
                <Link to="/profile">
                  <Button variant="outline" className="w-full">
                    <User className="w-4 h-4 mr-2" />
                    {t('profile.title') || 'View Profile'}
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">
                {t('settings.privacy') || 'Privacy & Security'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">
                  {t('settings.accountInfo') || 'Account Information'}
                </Label>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="font-medium">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('profile.role') || 'Role'}:
                    </span>
                    <span className="font-medium capitalize">{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">
              {t('settings.additionalInfo') || 'Additional Information'}
            </h2>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              {t('settings.infoText') || 'Your settings are saved automatically and synced across all your devices.'}
            </p>
            {user?.created_at && (
              <p>
                {t('user.joined') || 'Member since'}: {new Date(user.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

