import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { getImageUrl, getSizeForContext } from '@/lib/imageUtils';
import OptimizedImage from '@/components/OptimizedImage';
export default function ProductDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const addItem = useCartStore(state => state.addItem);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productsApi.getById(id);
      return response.data;
    },
    enabled: !!id
  });

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url
        
      });
      toast.success(`${t(`entity.product.${product.id}.name`, { defaultValue: product.name })} ${t('products.addedToCart')}`);
    }
  };

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-center" data-testid="loading-indicator">{t('common.loading')}</div>;
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-center" data-testid="product-not-found">{t('products.notFound')}</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="product-detail-page">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6" data-testid="back-button">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('products.back')}
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <Card className="overflow-hidden h-fit">
          <div className="aspect-square bg-gray-100 dark:bg-gray-800">
            <OptimizedImage
              src={product.image_url}
              alt={t(`entity.product.${product.id}.name`, { defaultValue: product.name })}
              size={getSizeForContext('detail')}
              className="w-full h-full object-cover"
              data-testid="product-image"
            />
          </div>
        </Card>

        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-4xl font-bold" data-testid="product-name">{t(`entity.product.${product.id}.name`, { defaultValue: product.name })}</h1>
//          <div className="text-2xl sm:text-4xl font-bold text-blue-600" data-testid="product-price">${product.price}</div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">{t('products.description')}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed" data-testid="product-description">{t(`entity.product.${product.id}.description`, { defaultValue: product.description })}</p>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {t('products.stock')}: <span className="font-semibold" data-testid="product-stock">{product.stock}</span>
            </span>
          </div>

          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            data-testid="add-to-cart-button"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {product.stock > 0 ? t('products.addToCart') : t('products.outOfStock')}
          </Button>
        </div>
      </div>
    </div>
  );
}
