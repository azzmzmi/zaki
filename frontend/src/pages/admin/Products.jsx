import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productsApi, categoriesApi, uploadApi, translationsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import OptimizedImage from '@/components/OptimizedImage';
import { getSizeForContext } from '@/lib/imageUtils';
import DataTable from '@/components/DataTable';
import i18n from '@/i18n';

export default function AdminProducts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category_id: '', stock: '', image_url: '', name_ar: '', description_ar: '' });
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const ITEMS_PER_PAGE = 10;

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['admin-products', currentPage, searchQuery],
    queryFn: async () => {
      const response = await productsApi.getAll(undefined, searchQuery || undefined, currentPage, ITEMS_PER_PAGE);
      return response.data;
    }
  });

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination;

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      // Handle both paginated and non-paginated responses
      return response.data?.data || response.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => productsApi.create(data),
    onSuccess: (response) => {
      const product = response.data;
      translationsApi.upsert({ key: `entity.product.${product.id}.name`, en: product.name, ar: formData.name_ar || product.name, type: 'product', ref_id: product.id });
      translationsApi.upsert({ key: `entity.product.${product.id}.description`, en: product.description, ar: formData.description_ar || product.description, type: 'product', ref_id: product.id });
      i18n.addResource('en', 'translation', `entity.product.${product.id}.name`, product.name);
      i18n.addResource('ar', 'translation', `entity.product.${product.id}.name`, formData.name_ar || product.name);
      i18n.addResource('en', 'translation', `entity.product.${product.id}.description`, product.description);
      i18n.addResource('ar', 'translation', `entity.product.${product.id}.description`, formData.description_ar || product.description);
      toast.success(t('product.created'));
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setCurrentPage(1);
      handleCloseDialog();
    },
    onError: () => toast.error(t('product.createFailed'))
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productsApi.update(id, data),
    onSuccess: (response) => {
      const product = response.data;
      translationsApi.upsert({ key: `entity.product.${product.id}.name`, en: product.name, ar: formData.name_ar || product.name, type: 'product', ref_id: product.id });
      translationsApi.upsert({ key: `entity.product.${product.id}.description`, en: product.description, ar: formData.description_ar || product.description, type: 'product', ref_id: product.id });
      i18n.addResource('en', 'translation', `entity.product.${product.id}.name`, product.name);
      i18n.addResource('ar', 'translation', `entity.product.${product.id}.name`, formData.name_ar || product.name);
      i18n.addResource('en', 'translation', `entity.product.${product.id}.description`, product.description);
      i18n.addResource('ar', 'translation', `entity.product.${product.id}.description`, formData.description_ar || product.description);
      toast.success(t('product.updated'));
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      handleCloseDialog();
    },
    onError: () => toast.error(t('product.updateFailed'))
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productsApi.delete(id),
    onSuccess: () => {
      toast.success(t('product.deleted'));
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => toast.error(t('product.deleteFailed'))
  });

  const handleOpenDialog = async (product) => {
    if (product) {
      setEditingProduct(product);
      // Fetch only this product's translations
      try {
        const arTranslations = await translationsApi.getByLang('ar', product.id);
        const nameKey = `entity.product.${product.id}.name`;
        const descKey = `entity.product.${product.id}.description`;
        const arName = arTranslations.data[nameKey] || '';
        const arDesc = arTranslations.data[descKey] || '';
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          category_id: product.category_id,
          stock: product.stock.toString(),
          image_url: product.image_url || '',
          name_ar: arName,
          description_ar: arDesc
        });
      } catch (error) {
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          category_id: product.category_id,
          stock: product.stock.toString(),
          image_url: product.image_url || '',
          name_ar: '',
          description_ar: ''
        });
      }
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category_id: '', stock: '', image_url: '', name_ar: '', description_ar: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;


    setUploading(true);
    try {
      const response = await uploadApi.upload(file);
      

      setFormData({ ...formData, image_url: response.data.url });
      toast.success(t('product.imageUploaded'));
    } catch (error) {
      console.error('❌ [Upload] Failed!', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        fullError: error
      });
      toast.error(t('product.uploadImageFailed'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    {
      key: 'image_url',
      label: t('product.image'),
      render: (value) => (
        value ? (
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
            <OptimizedImage src={value} alt="" size={getSizeForContext('thumbnail')} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-xs text-gray-400">{t('product.noImage')}</div>
        )
      )
    },
    {
      key: 'name',
      label: t('product.name'),
      render: (_, row) => t(`entity.product.${row.id}.name`, { defaultValue: row.name })
    },
    {
      key: 'price',
      label: t('product.price'),
      render: (value) => `$${value}`
    },
    {
      key: 'stock',
      label: t('product.stock'),
      render: (value) => value
    }
  ];

  const actions = (row) => (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleOpenDialog(row)}
        data-testid={`edit-product-${row.id}`}
      >
        <Pencil className="w-4 h-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => deleteMutation.mutate(row.id)}
        data-testid={`delete-product-${row.id}`}
      >
        <Trash2 className="w-4 h-4 text-red-500" />
      </Button>
    </>
  );

  return (
    <AdminLayout>
      <div data-testid="admin-products-page">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold" data-testid="admin-products-title">{t('admin.products')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{t('admin.manageYourProducts')}</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto" data-testid="add-product-button">
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.addProduct')}
          </Button>
        </div>

        <DataTable
          data={products}
          columns={columns}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          searchPlaceholder={t('common.searchProducts')}
          actions={actions}
          rowKey="id"
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-[95vw] sm:max-w-lg" data-testid="product-dialog">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{editingProduct ? t('product.editTitle') : t('admin.addProduct')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <Label htmlFor="product-name">{t('product.name')} {t('form.required')}</Label>
                <Input id="product-name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="product-name-input" />
              </div>
              <div>
                <Label htmlFor="product-description">{t('product.description')} {t('form.required')}</Label>
                <Textarea id="product-description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required data-testid="product-description-input" />
              </div>
              <div>
                <Label htmlFor="product-ar-name">{t('product.arabicName')}</Label>
                <Input id="product-ar-name" dir="rtl" value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} data-testid="product-ar-name-input" />
              </div>
              <div>
                <Label htmlFor="product-ar-description">{t('product.arabicDescription')}</Label>
                <Textarea id="product-ar-description" dir="rtl" value={formData.description_ar} onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })} data-testid="product-ar-description-input" />
              </div>
              <div>
                <Label htmlFor="product-price">{t('product.price')} {t('form.required')}</Label>
                <Input id="product-price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required data-testid="product-price-input" />
              </div>
              <div>
                <Label htmlFor="product-stock">{t('product.stock')} {t('form.required')}</Label>
                <Input id="product-stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required data-testid="product-stock-input" />
              </div>
              <div>
                <Label htmlFor="product-category">{t('product.category')} {t('form.required')}</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })} required>
                  <SelectTrigger id="product-category" data-testid="product-category-select">
                    <SelectValue placeholder={t('product.categorySelect')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('product.image')}</Label>
                <div className="flex gap-2">
                  <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} data-testid="product-image-input" />
                  {uploading && <span className="text-sm">{t('product.uploading')}</span>}
                </div>
                {formData.image_url && <OptimizedImage src={formData.image_url} alt="Preview" size={getSizeForContext('thumbnail')} className="mt-2 w-24 h-24 object-cover rounded" />}
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCloseDialog} data-testid="cancel-product-button">{t('common.cancel')}</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="save-product-button">{t('common.save')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}