
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { productsApi, categoriesApi } from '@/lib/api';
import { Search } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/imageUtils';

export default function Products() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const addItem = useCartStore(state => state.addItem);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      return response.data;
    }
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, search],
    queryFn: async () => {
      const response = await productsApi.getAll(
        selectedCategory === 'all' ? undefined : selectedCategory,
        search || undefined
      );
      return response.data;
    }
  });

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url
      });
      toast.success(`${t(`entity.product.${product.id}.name`, { defaultValue: product.name })} added to cart`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="products-page">
      <h1 className="text-4xl font-bold mb-8" data-testid="products-title">{t('products.title')}</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="search-input"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]" data-testid="category-filter">
            <SelectValue placeholder={t('products.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('products.allCategories')}</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{t(`entity.category.${cat.id}.name`, { defaultValue: cat.name })}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-12" data-testid="loading-indicator">{t('common.loading')}</div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="products-grid">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group" data-testid={`product-card-${product.id}`}>
              <Link to={`/products/${product.id}`}>
                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={getImageUrl(product.image_url)}
                    alt={t(`entity.product.${product.id}.name`, { defaultValue: product.name })}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </Link>
              <div className="p-4 space-y-3">
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-semibold text-lg line-clamp-2 hover:text-blue-600" data-testid={`product-name-${product.id}`}>{t(`entity.product.${product.id}.name`, { defaultValue: product.name })}</h3>
                </Link>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600" data-testid={`product-price-${product.id}`}>${product.price}</span>
                  <span className="text-sm text-gray-500">{t('products.stock')}: {product.stock}</span>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                  data-testid={`add-to-cart-${product.id}`}
                >
                  {product.stock > 0 ? t('products.addToCart') : t('products.outOfStock')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500" data-testid="no-products">No products found</div>
      )}
    </div>
  );
}