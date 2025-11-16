import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, ShoppingBag, TrendingUp, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsApi, categoriesApi } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';

export default function Home() {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 24;
  
  const { data: allProducts } = useQuery({
    queryKey: ['homepage-products'],
    queryFn: async () => {
      const response = await productsApi.getAll();
      // Sort by stock (most popular)
      return (response.data || []).sort((a, b) => b.stock - a.stock);
    }
  });

  // Calculate pagination
  const totalProducts = allProducts?.length || 0;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const products = allProducts?.slice(startIndex, endIndex) || [];

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const { data: categories } = useQuery({
    queryKey: ['categories-home'],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      return response.data;
    }
  });

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
    {/*   <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent" data-testid="hero-title">
              {t('app.name')}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto" data-testid="hero-tagline">
              {t('app.tagline')}
            </p>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto" data-testid="hero-tagline">
              {t('common.welcome')}
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="group" data-testid="shop-now-button">
                  {t('nav.products')}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section> */}

{/*       {/* Categories 
      {categories && categories.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center" data-testid="categories-title">
              {t('home.shopByCategory')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.id}`}>
                  <Card className="overflow-hidden group relative h-48 rounded-xl" data-testid={`category-card-${cat.id}`}>
                    <div
                      className="absolute inset-0 bg-center bg-cover transition-transform duration-300 group-hover:scale-105 blur-xs opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundImage: `url(${getImageUrl(`/api/uploads/${cat.id}.png`)})` }} 
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white text-xl font-bold drop-shadow-xl text-shadow-xl" data-testid={`category-name-${cat.id}`}>{t(`entity.category.${cat.id}.name`, { defaultValue: cat.name })}</h3>
                      <p className="text-white text-sm font-semibold drop-shadow-xl text-shadow-xl" data-testid={`category-description-${cat.id}`}>{t(`entity.category.${cat.id}.description`, { defaultValue: cat.description })}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )} */}  


      {/* Features */}
  {/*     <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-500" data-testid="feature-shipping">
              <ShoppingBag className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('home.freeShipping')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('home.freeShippingDesc')}</p>
            </Card>
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-indigo-500" data-testid="feature-quality">
              <TrendingUp className="w-12 h-12 text-indigo-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('home.qualityProducts')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('home.qualityProductsDesc')}</p>
            </Card>
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-500" data-testid="feature-secure">
              <Shield className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">{t('home.securePayment')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('home.securePaymentDesc')}</p>
            </Card>
          </div>
        </div>
      </section> */}
      

      {/* Featured Products */}
      {products && products.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
{/*             <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center" data-testid="featured-products-title">
              {t('home.mostPopular')}
            </h2> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`}>
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 group" data-testid={`featured-product-${product.id}`}>
                    <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={getImageUrl(product.image_url)}
                        alt={t(`entity.product.${product.id}.name`, { defaultValue: product.name })}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-1">{t(`entity.product.${product.id}.name`, { defaultValue: product.name })}</h3>
                      <p className="text-xl font-bold text-blue-600">${product.price}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="gap-2"
                  data-testid="prev-page-button"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('pagination.previous')}
                </Button>
                
                <div className="flex items-center gap-2" data-testid="pagination-info">
                  <span className="text-sm font-medium">
                    {t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="gap-2"
                  data-testid="next-page-button"
                >
                  {t('pagination.next')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}