
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
import OptimizedImage from '@/components/OptimizedImage';
import { getImageUrl, getSizeForContext } from '@/lib/imageUtils';

export default function Products() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;
  const addItem = useCartStore(state => state.addItem);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      // Handle both paginated and non-paginated responses
      return response.data?.data || response.data || [];
    }
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory, search, sortBy, currentPage],
    queryFn: async () => {
      const response = await productsApi.getAll(
        selectedCategory === 'all' ? undefined : selectedCategory,
        search || undefined,
        currentPage,
        ITEMS_PER_PAGE
      );
      let result = response.data.data || [];
      const pagination = response.data.pagination;

      // Apply sorting
      switch (sortBy) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'popular':
          result.sort((a, b) => b.stock - a.stock);
          break;
        case 'stock':
          result.sort((a, b) => b.stock - a.stock);
          break;
        case 'newest':
        default:
          if (result.length > 0 && result[0].created_at) {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          }
          break;
      }

      return { products: result, pagination };
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
      toast.success(`${t(`entity.product.${product.id}.name`, { defaultValue: product.name })} ${t('cart.addedToCart')}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8" data-testid="products-page">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8" data-testid="products-title">{t('products.title')}</h1>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
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
          <SelectTrigger className="w-full sm:w-auto" data-testid="category-filter">
            <SelectValue placeholder={t('products.allCategories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('products.allCategories')}</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{t(`entity.category.${cat.id}.name`, { defaultValue: cat.name })}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-auto" data-testid="sort-filter">
            <SelectValue placeholder={t('products.sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('products.sortNewest')}</SelectItem>
            <SelectItem value="price-asc">{t('products.sortPriceAsc')}</SelectItem>
            <SelectItem value="price-desc">{t('products.sortPriceDesc')}</SelectItem>
            <SelectItem value="popular">{t('products.sortPopular')}</SelectItem>
            <SelectItem value="stock">{t('products.sortStock')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-12" data-testid="loading-indicator">{t('common.loading')}</div>
      ) : products?.products && products.products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="products-grid">
            {products.products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group" data-testid={`product-card-${product.id}`}>
              <Link to={`/products/${product.id}`}>
                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <OptimizedImage
                    src={product.image_url}
                    alt={t(`entity.product.${product.id}.name`, { defaultValue: product.name })}
                    size={getSizeForContext('grid')}
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
          
          {/* Pagination */}
          {products?.pagination && products.pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-12">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {t('pagination.page')} {products.pagination.page} {t('pagination.of')} {products.pagination.pages} • {products.pagination.total}{' '}
                {products.pagination.total === 1 ? 'item' : 'items'}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  data-testid="pagination-prev"
                >
                  {t('pagination.previous')}
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(products.pagination.pages, 5) }, (_, i) => {
                    let pageNum;
                    if (products.pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= products.pagination.pages - 2) {
                      pageNum = products.pagination.pages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                        data-testid={`pagination-page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(products.pagination.pages, p + 1))}
                  disabled={currentPage === products.pagination.pages}
                  data-testid="pagination-next"
                >
                  {t('pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-500" data-testid="no-products">{t('products.noProductsFound')}</div>
      )}
    </div>
  );
}