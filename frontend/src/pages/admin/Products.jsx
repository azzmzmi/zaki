import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productsApi, categoriesApi, uploadApi, translationsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Upload } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { getImageUrl } from '@/lib/imageUtils';
import i18n from '@/i18n';

export default function AdminProducts() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category_id: '', stock: '', image_url: '', name_ar: '', description_ar: '' });
  const [uploading, setUploading] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await productsApi.getAll();
      return response.data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      return response.data;
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
      toast.success('Product created');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      handleCloseDialog();
    },
    onError: () => toast.error('Failed to create product')
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
      toast.success('Product updated');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      handleCloseDialog();
    },
    onError: () => toast.error('Failed to update product')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productsApi.delete(id),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
    onError: () => toast.error('Failed to delete product')
  });

  const handleOpenDialog = async (product) => {
    if (product) {
      setEditingProduct(product);
      // Fetch existing Arabic translations
      try {
        const arTranslations = await translationsApi.getByLang('ar');
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
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
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

  return (
    <AdminLayout>
      <div data-testid="admin-products-page">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold" data-testid="admin-products-title">{t('admin.products')}</h1>
          <Button onClick={() => handleOpenDialog()} data-testid="add-product-button">
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.addProduct')}
          </Button>
        </div>

        {isLoading ? (
          <div data-testid="loading-indicator">{t('common.loading')}</div>
        ) : (
          <div className="grid gap-4">
            {products?.map((product) => (
              <Card key={product.id} className="p-4" data-testid={`product-row-${product.id}`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0">
                    <img src={getImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold" data-testid={`product-name-${product.id}`}>{t(`entity.product.${product.id}.name`, { defaultValue: product.name })}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">${product.price} • Stock: {product.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenDialog(product)} data-testid={`edit-product-${product.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteMutation.mutate(product.id)} data-testid={`delete-product-${product.id}`}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent data-testid="product-dialog">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : t('admin.addProduct')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required data-testid="product-name-input" />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required data-testid="product-description-input" />
              </div>
              <div>
                <Label>Arabic Name</Label>
                <Input dir="rtl" value={formData.name_ar} onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })} data-testid="product-ar-name-input" />
              </div>
              <div>
                <Label>Arabic Description</Label>
                <Textarea dir="rtl" value={formData.description_ar} onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })} data-testid="product-ar-description-input" />
              </div>
              <div>
                <Label>Price *</Label>
                <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required data-testid="product-price-input" />
              </div>
              <div>
                <Label>Stock *</Label>
                <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required data-testid="product-stock-input" />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })} required>
                  <SelectTrigger data-testid="product-category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Image</Label>
                <div className="flex gap-2">
                  <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} data-testid="product-image-input" />
                  {uploading && <span className="text-sm">Uploading...</span>}
                </div>
                {formData.image_url && <img src={getImageUrl(formData.image_url)} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded" />}
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