import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { categoriesApi, translationsApi, uploadApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import i18n from '@/i18n';

export default function AdminCategories() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', name_ar: '', description_ar: '', image_url: '' });
  const [uploading, setUploading] = useState(false);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => categoriesApi.create(data),
    onSuccess: (response) => {
      const category = response.data;
      translationsApi.upsert({ key: `entity.category.${category.id}.name`, en: category.name, ar: formData.name_ar || category.name, type: 'category', ref_id: category.id });
      translationsApi.upsert({ key: `entity.category.${category.id}.description`, en: category.description || '', ar: formData.description_ar || category.description || '', type: 'category', ref_id: category.id });
      i18n.addResource('en', 'translation', `entity.category.${category.id}.name`, category.name);
      i18n.addResource('ar', 'translation', `entity.category.${category.id}.name`, formData.name_ar || category.name);
      i18n.addResource('en', 'translation', `entity.category.${category.id}.description`, category.description || '');
      i18n.addResource('ar', 'translation', `entity.category.${category.id}.description`, formData.description_ar || category.description || '');
      toast.success(t('category.created'));
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      handleCloseDialog();
    },
    onError: () => toast.error(t('category.createFailed'))
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoriesApi.update(id, data),

    onSuccess: (response) => {
      const category = response.data;
      translationsApi.upsert({ key: `entity.category.${category.id}.name`, en: category.name, ar: formData.name_ar || category.name, type: 'category', ref_id: category.id });
      translationsApi.upsert({ key: `entity.category.${category.id}.description`, en: category.description || '', ar: formData.description_ar || category.description || '', type: 'category', ref_id: category.id });
      i18n.addResource('en', 'translation', `entity.category.${category.id}.name`, category.name);
      i18n.addResource('ar', 'translation', `entity.category.${category.id}.name`, formData.name_ar || category.name);
      i18n.addResource('en', 'translation', `entity.category.${category.id}.description`, category.description || '');
      i18n.addResource('ar', 'translation', `entity.category.${category.id}.description`, formData.description_ar || category.description || '');
      toast.success(t('category.updated'));
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      handleCloseDialog();
    },
    onError: () => toast.error(t('category.updateFailed'))
  });

  const deleteMutation = useMutation({
  mutationFn: (id) => categoriesApi.delete(id),
    onSuccess: () => {
      toast.success(t('category.deleted'));
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: () => toast.error(t('category.deleteFailed'))
  }); 

  const handleOpenDialog = async (category) => {
    if (category) {
      setEditingCategory(category);
      // Fetch existing Arabic translations
      try {
        const arTranslations = await translationsApi.getByLang('ar');
        const nameKey = `entity.category.${category.id}.name`;
        const descKey = `entity.category.${category.id}.description`;
        const arName = arTranslations.data[nameKey] || '';
        const arDesc = arTranslations.data[descKey] || '';
        setFormData({ 
          name: category.name, 
          description: category.description || '', 
          name_ar: arName, 
          description_ar: arDesc,
          image_url: category.image_url || ''
        });
      } catch (error) {
        setFormData({ name: category.name, description: category.description || '', name_ar: '', description_ar: '', image_url: category.image_url || '' });
      }
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', name_ar: '', description_ar: '', image_url: '' });
    }
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadApi.upload(file);
      setFormData({ ...formData, image_url: response.data.url });
      toast.success(t('category.imageUploaded') || 'Image uploaded successfully');
    } catch (error) {
      toast.error(t('category.imageUploadFailed') || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <AdminLayout>
      <div data-testid="admin-categories-page">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold" data-testid="admin-categories-title">{t('admin.categories')}</h1>
          <Button onClick={() => handleOpenDialog()} data-testid="add-category-button">
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.addCategory')}
          </Button>
        </div>

        {isLoading ? (
          <div data-testid="loading-indicator">{t('common.loading')}</div>
        ) : (
          <div className="grid gap-4">
            {categories?.map((category) => (
              <Card key={category.id} className="p-4" data-testid={`category-row-${category.id}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg" data-testid={`category-name-${category.id}`}>{t(`entity.category.${category.id}.name`, { defaultValue: category.name })}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t(`entity.category.${category.id}.description`, { defaultValue: category.description })  }</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(category)} data-testid={`edit-category-${category.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(category.id)} data-testid={`delete-category-${category.id}`}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent data-testid="category-dialog">
            <DialogHeader>
              <DialogTitle>{editingCategory ? t('category.editTitle') : t('admin.addCategory')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('category.name')} {t('form.required')}</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="category-name-input" />
              </div>
              <div>
                <Label>{t('category.description')}</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} data-testid="category-description-input" />
              </div>
              <div>
                <Label>{t('category.arabicName')}</Label>
                <Input dir="rtl" value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} data-testid="category-ar-name-input" />
              </div>
              <div>
                <Label>{t('category.arabicDescription')}</Label>
                <Textarea dir="rtl" value={ formData.description_ar } onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })} data-testid="category-ar-description-input" />
              </div>
              <div>
                <Label>{t('category.image')}</Label>
                <div className="mt-2 relative">
                  <input
                    id="category-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    data-testid="category-image-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => document.getElementById('category-image').click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  {formData.image_url && (
                    <div className="mt-2">
                      <img src={formData.image_url} alt="Category preview" className="max-h-32 max-w-32 object-contain" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseDialog} data-testid="cancel-category-button">{t('common.cancel')}</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="save-category-button">{t('common.save')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}