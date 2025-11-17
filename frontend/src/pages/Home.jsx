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
      return (response.data || []).sort((a, b) => b.stock - a.stock);
    }
  });

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

      {/* Category Section */}
      {categories && categories.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
          <div className="max-w-7xl mx-auto">
   {/*          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              {t('home.shopByCategory', { defaultValue: 'Shop by Category' })}
            </h2> */}
            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.id}`}>
                  <Card
                    className="overflow-hidden group relative h-72 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700"
                    data-testid={`category-card-${cat.id}`}
                  >
                    {/* Card Background - Solid Color */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600" />
                    
                    {/* Content Section - Top */}
                    <div className="relative z-20 p-6 pb-0 flex flex-col h-full">
                      <div className="flex-1">
                        <h3
                          className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                          data-testid={`category-name-${cat.id}`}
                        >
                          {t(`entity.category.${cat.id}.name`, { defaultValue: cat.name })}
                        </h3>

                        <p
                          className="text-sm text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2"
                          data-testid={`category-description-${cat.id}`}
                        >
                          {t(`entity.category.${cat.id}.description`, { defaultValue: cat.description })}
                        </p>
                      </div>
                    </div>

                    {/* Image Section - Bottom with Gradient Fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 flex items-center justify-center overflow-hidden">
                      {/* Background Image or Logo */}
                      <img
                        src={cat.image_url ? getImageUrl(cat.image_url) : '/logo.png'}
                        alt={cat.name}
                        className={`h-full w-auto object-contain object-center group-hover:scale-110 transition-transform duration-300 ${
                          cat.image_url ? '' : 'opacity-40'
                        }`}
                      />
                      
                      {/* Gradient Overlay - Fading from transparent top to opaque bottom */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white/80 dark:from-transparent dark:via-slate-800/30 dark:to-slate-800 pointer-events-none" />
                    </div>

                    {/* Border Accent on Hover */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-400/50 transition-colors duration-300 pointer-events-none z-30" />
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products && products.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-12 text-center" data-testid="featured-products-title">
              {t('home.mostPopular')}
            </h2>

            {/* UPDATED RESPONSIVE GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 
                            gap-4 sm:gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`}>
                  <Card
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                    data-testid={`featured-product-${product.id}`}
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={getImageUrl(product.image_url)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-1">
                        {t(`entity.product.${product.id}.name`, { defaultValue: product.name })}
                      </h3>
                      <p className="text-xl font-bold text-blue-600">${product.price}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* UPDATED MOBILE-FRIENDLY PAGINATION */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center 
                              gap-3 sm:gap-4 mt-12">
                
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="gap-2 w-full sm:w-auto"
                  data-testid="prev-page-button"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t('pagination.previous')}
                </Button>

                <div className="text-sm font-medium" data-testid="pagination-info">
                  {t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
                </div>

                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="gap-2 w-full sm:w-auto"
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

      {/* Logo Carousel */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-50 to-gray-100 
                          dark:from-gray-900 dark:to-gray-800"
               data-testid="logo-carousel">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">
            {t('home.ourPartners')}
          </h2>

          <div className="relative overflow-hidden" style={{ height: '120px' }}>
            <style>{`
              @keyframes scrollLogos {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(-100% / 2)); }
              }

              .logo-carousel-container {
                display: flex;
                animation: scrollLogos 30s linear infinite;
              }

              .logo-carousel-container:hover {
                animation-play-state: paused;
              }

              .logo-item {
                flex: 0 0 calc(100% / 3);
                min-width: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 10px;
                opacity: 0.6;
                transition: opacity 0.3s ease;
              }

              @media (min-width: 640px) { 
                .logo-item { flex: 0 0 calc(100% / 5); }
              }

              @media (min-width: 1024px) { 
                .logo-item { flex: 0 0 calc(100% / 8); }
              }

              .logo-item:hover { opacity: 1; }

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
              {partners.length > 0 &&
                [...partners, ...partners].map((partner, idx) => (
                  <div key={`${partner.id}-${idx}`} className="logo-item">
                    <img
                      src={getImageUrl(partner.logo_url)}
                      alt={partner.name}
                      title={partner.name}
                    />
                  </div>
                ))}
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
