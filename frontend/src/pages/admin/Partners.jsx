import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, Upload, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';

export default function AdminPartners() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', file: null });
  const [uploading, setUploading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch partners from backend
  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await api.get('/partners');
      setPartners(response.data || []);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
      toast.error(t('partners.failedToLoadPartners'));
    } finally {
      setLoading(false);
    }
  };

  // Upload partner logo
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!formData.name.trim()) {
      toast.error(t('partners.enterName'));
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('category', 'partners');

      const response = await api.post('/upload', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const logoUrl = response.data.url;

      // Save partner to database
      await api.post('/partners', {
        name: formData.name,
        logo_url: logoUrl,
      });

      toast.success(t('partners.addedSuccessfully'));
      setFormData({ name: '', file: null });
      setIsDialogOpen(false);
      fetchPartners();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(t('partners.failedToUpload'));
    } finally {
      setUploading(false);
    }
  };

  // Delete partner
  const deletePartner = async (partnerId) => {
    try {
      await api.delete(`/partners/${partnerId}`);
      toast.success(t('partners.deletedSuccessfully'));
      fetchPartners();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(t('partners.failedToDelete'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('partners.manageTitle')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('partners.manageDescription')}
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2"
            data-testid="add-partner-button"
          >
            <Plus className="w-4 h-4" />
            {t('partners.addButton')}
          </Button>
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="text-center py-12">{t('common.loading')}</div>
        ) : partners.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <Card
                key={partner.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                data-testid={`partner-card-${partner.id}`}
              >
                <div className="flex-1 p-4 flex items-center justify-center bg-white dark:bg-gray-800 min-h-[200px]">
                  <img
                    src={getImageUrl(partner.logo_url)}
                    alt={partner.name}
                    className="max-h-40 max-w-40 object-contain"
                  />
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {partner.name}
                  </h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deletePartner(partner.id)}
                    className="w-full gap-2"
                    data-testid={`delete-partner-${partner.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('partner.deleteButton')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('partners.noPartners')}
            </p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline">
              {t('partners.addFirstPartner')}
            </Button>
          </Card>
        )}
      </div>

      {/* Add Partner Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('partners.addTitle')}</DialogTitle>
            <DialogDescription>
              {t('partners.addDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="partner-name">
                {t('partners.partnerName')} *
              </Label>
              <Input
                id="partner-name"
                placeholder={t('partners.partnerName')}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                data-testid="partner-name-input"
              />
            </div>

            <div>
              <Label htmlFor="partner-logo">
                {t('partners.logoImage')} *
              </Label>
              <div className="mt-2 relative">
                <input
                  id="partner-logo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                  data-testid="partner-logo-input"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => document.getElementById('partner-logo').click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? t('partners.uploading') : t('partners.chooseImage')}
                </Button>
              </div>
              {formData.file && (
                <p className="text-sm text-gray-500 mt-2">
                  {t('partner.selectedFile')} {formData.file.name}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setFormData({ name: '', file: null });
                }}
                disabled={uploading}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
