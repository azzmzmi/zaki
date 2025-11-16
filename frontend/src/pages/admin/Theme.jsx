import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { themeApi } from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { toast } from 'sonner';

const hexToHsl = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '221.2 83.2% 53.3%';
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const applyThemeToDom = (primaryColor, secondaryColor, accentColor, fontSize, borderRadius) => {
  const root = document.documentElement;
  root.style.setProperty('--primary', hexToHsl(primaryColor));
  root.style.setProperty('--secondary', hexToHsl(secondaryColor));
  root.style.setProperty('--accent', hexToHsl(accentColor));
  
  const fontSizeMap = {
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem'
  };
  root.style.setProperty('--font-size', fontSizeMap[fontSize] || '1rem');
  
  const borderRadiusMap = {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem'
  };
  root.style.setProperty('--radius', borderRadiusMap[borderRadius] || '0.5rem');
};

export default function AdminTheme() {
  const { t } = useTranslation();
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [secondaryColor, setSecondaryColor] = useState('#4f46e5');
  const [accentColor, setAccentColor] = useState('#dc2626');
  const [fontSize, setFontSize] = useState('base');
  const [borderRadius, setBorderRadius] = useState('md');

  // Load current theme settings
  const { data: currentTheme, isLoading } = useQuery({
    queryKey: ['theme-settings'],
    queryFn: async () => {
      const response = await themeApi.get();
      return response.data;
    },
    onSuccess: (data) => {
      setPrimaryColor(data.primary_color);
      setSecondaryColor(data.secondary_color);
      setAccentColor(data.accent_color);
      setFontSize(data.font_size);
      setBorderRadius(data.border_radius);
    }
  });

  // Update theme
  const updateMutation = useMutation({
    mutationFn: async () => {
      const response = await themeApi.update({
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        font_size: fontSize,
        border_radius: borderRadius
      });
      return response.data;
    },
    onSuccess: () => {
      // Apply theme to DOM immediately
      applyThemeToDom(primaryColor, secondaryColor, accentColor, fontSize, borderRadius);
      toast.success(t('theme.updateSuccess') || 'Theme updated successfully');
    },
    onError: () => {
      toast.error(t('theme.updateError') || 'Failed to update theme');
    }
  });

  const handleSave = () => {
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div>{t('common.loading')}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">{t('admin.theme') || 'Theme Settings'}</h1>

        <Card className="p-8 space-y-6">
          {/* Primary Color */}
          <div>
            <Label htmlFor="primaryColor">{t('theme.primaryColor') || 'Primary Color'}</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                id="primaryColor"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-12 w-20"
              />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#2563eb"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">{t('theme.usedFor') || 'Used for main buttons and links'}</p>
          </div>

          {/* Secondary Color */}
          <div>
            <Label htmlFor="secondaryColor">{t('theme.secondaryColor') || 'Secondary Color'}</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                id="secondaryColor"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-12 w-20"
              />
              <Input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#4f46e5"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">{t('theme.usedForSecondary') || 'Used for gradient and accents'}</p>
          </div>

          {/* Accent Color */}
          <div>
            <Label htmlFor="accentColor">{t('theme.accentColor') || 'Accent Color'}</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                id="accentColor"
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-12 w-20"
              />
              <Input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#dc2626"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">{t('theme.usedForAccent') || 'Used for alerts and highlights'}</p>
          </div>

          {/* Font Size */}
          <div>
            <Label htmlFor="fontSize">{t('theme.fontSize') || 'Font Size'}</Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">{t('theme.fontSizeSmall') || 'Small'}</SelectItem>
                <SelectItem value="base">{t('theme.fontSizeBase') || 'Base'}</SelectItem>
                <SelectItem value="lg">{t('theme.fontSizeLarge') || 'Large'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Border Radius */}
          <div>
            <Label htmlFor="borderRadius">{t('theme.borderRadius') || 'Border Radius'}</Label>
            <Select value={borderRadius} onValueChange={setBorderRadius}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">{t('theme.borderRadiusSmall') || 'Small'}</SelectItem>
                <SelectItem value="md">{t('theme.borderRadiusMedium') || 'Medium'}</SelectItem>
                <SelectItem value="lg">{t('theme.borderRadiusLarge') || 'Large'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="mt-8 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">{t('theme.preview') || 'Preview'}</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                className="px-6 py-2 text-white rounded font-semibold"
                style={{ backgroundColor: primaryColor }}
              >
                {t('theme.primaryButton') || 'Primary Button'}
              </button>
              <button
                className="px-6 py-2 text-white rounded font-semibold"
                style={{ backgroundColor: secondaryColor }}
              >
                {t('theme.secondaryButton') || 'Secondary Button'}
              </button>
              <button
                className="px-6 py-2 text-white rounded font-semibold"
                style={{ backgroundColor: accentColor }}
              >
                {t('theme.accentButton') || 'Accent Button'}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setPrimaryColor(currentTheme?.primary_color || '#2563eb');
                setSecondaryColor(currentTheme?.secondary_color || '#4f46e5');
                setAccentColor(currentTheme?.accent_color || '#dc2626');
                setFontSize(currentTheme?.font_size || 'base');
                setBorderRadius(currentTheme?.border_radius || 'md');
              }}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? t('common.saving') || 'Saving...' : t('common.save') || 'Save Changes'}
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
