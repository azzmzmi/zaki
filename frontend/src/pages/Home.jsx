import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { productsApi, categoriesApi, api } from "@/lib/api";
import OptimizedImage from "@/components/OptimizedImage";
import { getImageUrl, getSizeForContext } from "@/lib/imageUtils";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 12;

  const { data: queryData = {} } = useQuery({
    queryKey: ['homepage-products', currentPage],
    queryFn: async () => {
      const response = await productsApi.getAll(
        undefined,
        undefined,
        currentPage,
        PRODUCTS_PER_PAGE
      );
      
      // Handle both old array format and new paginated format
      const products = response.data?.data || response.data || [];
      const pagination = response.data?.pagination || {};

      
      return {
        products: products?.sort((a, b) => b.stock - a.stock) || [],
        pagination: pagination || {}
      };
    },
  });

  // Extract products and pagination from query data
  const allProducts = queryData.products || [];
  const paginationInfo = queryData.pagination || {};
  
  const totalProducts = paginationInfo.total || 0;
  const totalPages = paginationInfo.pages || 1;

  const products = allProducts;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast({
        title: t('products.outOfStock'),
        description: t('products.productNotAvailable'),
      });
      return;
    }
    
    // Dispatch add to cart event or use cart store
    const event = new CustomEvent('addToCart', { detail: product });
    window.dispatchEvent(event);
    
    toast({
      title: t('products.addedToCart'),
      description: `${product.name} added to cart`,
    });
  };

  const { data: partners = [] } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      try {
        const response = await api.get("/partners");
        const data = response.data || [];
        // Duplicate the array for continuous carousel effect
        return [...data, ...data];
      } catch (error) {
        console.error("Failed to fetch partners:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: categories } = useQuery({
    queryKey: ["categories-home"],
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      // Handle both paginated and non-paginated responses
      return response.data?.data || response.data || [];
    },
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                          {t(`entity.category.${cat.id}.name`, {
                            defaultValue: cat.name,
                          })}
                        </h3>

                        <p
                          className="text-sm text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-2"
                          data-testid={`category-description-${cat.id}`}
                        >
                          {t(`entity.category.${cat.id}.description`, {
                            defaultValue: cat.description,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Image Section - Bottom with Gradient Fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 flex items-center justify-center overflow-hidden">
                      {/* Background Image or Logo */}
                      <OptimizedImage
                        src={cat.image_url}
                        alt={cat.name}
                        size={getSizeForContext("card")}
                        className={`max-h-40 w-auto object-contain object-center group-hover:scale-110 transition-transform duration-300 ${
                          cat.image_url ? "" : "opacity-40"
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
        <section className="py-16 px-4" id="featured-products">
          <div className="max-w-7xl mx-auto">
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-12 text-center"
              data-testid="featured-products-title"
            >
              {t("home.mostPopular")}
            </h2>

            {/* UPDATED RESPONSIVE GRID - 12 products per page */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`}>
                  <Card
                    className="overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                    data-testid={`featured-product-${product.id}`}
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <OptimizedImage
                        src={product.image_url}
                        alt={product.name}
                        size={getSizeForContext("home")}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold mb-2 line-clamp-1">
                          {t(`entity.product.${product.id}.name`, {
                            defaultValue: product.name,
                          })}
                        </h3>
                        <p className="text-xl font-bold text-blue-600">
//                          ${product.price}
                        </p>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        data-testid={`add-to-cart-${product.id}`}
                      >
                        {product.stock > 0
                          ? t("products.addToCart")
                          : t("products.outOfStock")}
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* UPDATED MOBILE-FRIENDLY PAGINATION - 12 products per page */}
          {totalPages > 1 && (
              <div className="flex items-center justify-between pt-12">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {t("pagination.page")} {currentPage} {t("pagination.of")}{" "}
                  {totalPages} • {totalProducts}{" "}
                  {totalProducts === 1
                    ? t("pagination.item")
                    : t("pagination.items")}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="gap-1"
                    data-testid="prev-page-button"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t("pagination.previous")}
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({
                              top: document.getElementById("featured-products")
                                .offsetTop,
                              behavior: "smooth",
                            });
                          }}
                          className="w-10"
                          data-testid={`featured-page-${pageNum}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="gap-1"
                    data-testid="next-page-button"
                  >
                    {t("pagination.next")}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Logo Carousel */}
      {partners.length > 0 && (
        <section
          className="py-16 px-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
          data-testid="logo-carousel"
        >
          <style>{`
            @keyframes slidePartners {
              0% { transform: translateX(0); }
              100% { transform: translateX(calc(-100%)); }
            }
            
            .partnerscard {
              animation: slidePartners 15s linear infinite;
            }
            
            .partnerscard:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-12 text-center text-gray-900 dark:text-white">
              {t("home.ourPartners")}
            </h2>

            <div className="overflow-hidden" data-testid="partners-slider">
              <ul
                className="partnerscard flex gap-8 sm:gap-12 lg:gap-16 justify-center items-center"
                role="list"
              >
                {partners.map((partner, idx) => (
                  <li
                    key={`partner-${partner.id}-${idx}`}
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{ minWidth: "120px", height: "80px" }}
                  >
                    <div className="w-full h-full flex items-center justify-center hover:opacity-100 opacity-70 transition-opacity duration-300">
                      <img
                        src={getImageUrl(partner.logo_url)}
                        alt={partner.name}
                        title={partner.name}
                        loading="lazy"
                        className="max-w-full max-h-full object-contain"
                        style={{
                          filter: "brightness(0.9) contrast(1.1)",
                          transition: "filter 0.3s ease",
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
