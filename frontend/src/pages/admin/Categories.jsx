import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { categoriesApi, translationsApi, uploadApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import OptimizedImage from '@/components/OptimizedImage';
import i18n from '@/i18n';

export default function AdminCategories() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', name_ar: '', description_ar: '', image_url: '' });
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ['admin-categories', currentPage],
    queryFn: async () => {
      const response = await categoriesApi.getAll(currentPage, ITEMS_PER_PAGE);
      return response.data;
    }
  });

  const categories = categoriesResponse?.data || [];
  const pagination = categoriesResponse?.pagination;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      setCurrentPage(1);
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
      // Fetch only this category's translations
      try {
        const arTranslations = await translationsApi.getByLang('ar', category.id);
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
      toast.success(t('category.imageUploaded'));
    } catch (error) {
      toast.error(t('category.imageUploadFailed'));
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

  const columns = [
    {
      key: 'image_url',
      label: t('category.image'),
      render: (value) => (
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
          {value ? (
            <OptimizedImage src={value} alt="" width={48} height={48} quality={60} className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-gray-400">No image</span>
          )}
        </div>
      )
    },
    {
      key: 'name',
      label: t('category.name'),
      render: (_, row) => t(`entity.category.${row.id}.name`, { defaultValue: row.name })
    },
    {
      key: 'description',
      label: t('category.description'),
      render: (value, row) => t(`entity.category.${row.id}.description`, { defaultValue: value || '' }).substring(0, 50) + '...'
    }
  ];

  const actions = (row) => (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleOpenDialog(row)}
        data-testid={`edit-category-${row.id}`}
      >
        <Pencil className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => deleteMutation.mutate(row.id)}
        data-testid={`delete-category-${row.id}`}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </>
  );

  return (
    <AdminLayout>
      <div data-testid="admin-categories-page">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold" data-testid="admin-categories-title">{t('admin.categories')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('admin.manageYourCategories')}</p>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="add-category-button" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.addCategory')}
          </Button>
        </div>

        <DataTable
          data={categories}
          columns={columns}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          actions={actions}
          rowKey="id"
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent data-testid="category-dialog">
            <DialogHeader>
              <DialogTitle>{editingCategory ? t('category.editTitle') : t('admin.addCategory')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="category-name">{t('category.name')} {t('form.required')}</Label>
                <Input id="category-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="category-name-input" />
              </div>
              <div>
                <Label htmlFor="category-description">{t('category.description')}</Label>
                <Textarea id="category-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} data-testid="category-description-input" />
              </div>
              <div>
                <Label htmlFor="category-ar-name">{t('category.arabicName')}</Label>
                <Input id="category-ar-name" dir="rtl" value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} data-testid="category-ar-name-input" />
              </div>
              <div>
                <Label htmlFor="category-ar-description">{t('category.arabicDescription')}</Label>
                <Textarea id="category-ar-description" dir="rtl" value={ formData.description_ar } onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })} data-testid="category-ar-description-input" />
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
                    {uploading ? t('category.imageUploading') : t('category.uploadImageButton')}
                  </Button>
                  {formData.image_url && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">{t('category.imagePreview')}</p>
                      <OptimizedImage src={formData.image_url} alt="Category preview" width={160} height={160} quality={70} className="max-h-40 max-w-full object-contain rounded border border-gray-200 dark:border-gray-700" />
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