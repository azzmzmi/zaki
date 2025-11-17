import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, ShoppingBag, TrendingUp, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { productsApi, categoriesApi, api } from '@/lib/api';
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

  // Fetch partners from API
  const { data: partners = [] } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      try {
        const response = await api.get('/partners');
        return response.data || [];
      } catch (error) {
        console.error('Failed to fetch partners:', error);
        return [];
      }
    },
  });

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

      {categories && categories.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.id}`}>
                  <Card className="overflow-hidden group relative h-64 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 hover:shadow-2xl transition-all duration-300 flex flex-col shadow-md" data-testid={`category-card-${cat.id}`}>
                    {/* Content Section - Top */}
                    <div className="flex-1 p-6 flex flex-col justify-start relative z-10">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:from-blue-700 group-hover:to-indigo-700 transition-all" data-testid={`category-name-${cat.id}`}>
                        {t(`entity.category.${cat.id}.name`, { defaultValue: cat.name })}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2" data-testid={`category-description-${cat.id}`}>
                        {t(`entity.category.${cat.id}.description`, { defaultValue: cat.description })}
                      </p>
                    </div>
                    
                    {/* Image Section - Bottom Aligned */}
                    <div className="h-auto bg-gradient-to-t from-black/5 to-transparent flex items-center justify-center border-t border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden">
                      {cat.image_url ? (
                        <>
                          <img
                            src={getImageUrl(cat.image_url)}
                            alt={t(`entity.category.${cat.id}.name`, { defaultValue: cat.name })}
                            className="h-auto w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                          />
                          {/* Gradient mask - transparent top to bottom */}
                          <div className="absolute inset-0 bg-gradient-to-b from-slate-100/90 via-slate-100/40 to-transparent dark:from-slate-800/90 dark:via-slate-800/40 dark:to-transparent pointer-events-none" />
                        </>
                      ) : (
                        <img
                          src={process.env.PUBLIC_URL + '/logo.png'}
                          alt={t(`entity.category.${cat.id}.name`, { defaultValue: cat.name })}
                          className="h-100 w-auto object-contain opacity-40 group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                    </div>
                    
                    {/* Hover Effect Border */}
                    <div className="absolute inset-0 rounded-xl border-2 border-blue-500/0 group-hover:border-blue-500/30 transition-all duration-300 pointer-events-none" />
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}


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
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center" data-testid="featured-products-title">
              {t('home.mostPopular')}
            </h2> 
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

      {/* Logo Carousel Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" data-testid="logo-carousel">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">
            {t('home.ourPartners')}
          </h2>
          <div className="relative overflow-hidden" style={{ height: '120px' }}>
            <style>{`
              @keyframes slideFromRight {
                from {
                  transform: translateX(100%);
                }
                to {
                  transform: translateX(0);
                }
              }
              
              @keyframes scrollLogos {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(calc(-100% / 2));
                }
              }
              
              .logo-carousel-container {
                display: flex;
                animation: scrollLogos 30s linear infinite;
                will-change: transform;
              }
              
              .logo-carousel-container:hover {
                animation-play-state: paused;
              }
              
              .logo-item {
                flex: 0 0 calc(100% / 8);
                min-width: 150px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 20px;
                opacity: 0.6;
                transition: opacity 0.3s ease;
              }
              
              .logo-item:hover {
                opacity: 1;
              }
              
              .logo-item img {
                max-height: 100px;
                max-width: 140px;
                object-fit: contain;
                filter: brightness(0.9) contrast(1.1);
              }
              
              .logo-item:hover img {
                filter: brightness(1) contrast(1.2);
              }
            `}</style>
            <div className="logo-carousel-container">
              {partners && partners.length > 0
                ? [...partners, ...partners].map((partner, idx) => (
                    <div key={`${partner.id}-${idx}`} className="logo-item">
                      <img
                        src={getImageUrl(partner.logo_url)}
                        alt={partner.name}
                        title={partner.name}
                      />
                    </div>
                  ))
                : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}