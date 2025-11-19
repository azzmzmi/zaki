import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { getImageUrl, getSizeForContext } from '@/lib/imageUtils';
import OptimizedImage from '@/components/OptimizedImage';

export default function Cart() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center" data-testid="empty-cart">
        <h2 className="text-2xl font-bold mb-4">{t('cart.empty')}</h2>
        <Button onClick={() => navigate('/products')} data-testid="continue-shopping-button">{t('nav.products')}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" data-testid="cart-page">
      <h1 className="text-4xl font-bold mb-8 text-center lg:text-left" data-testid="cart-title">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

        {/* Items */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-3 sm:p-4" data-testid={`cart-item-${item.id}`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">

                {/* Image */}
                <div className="w-full sm:w-20 h-40 sm:h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                  <OptimizedImage
                    src={item.image_url}
                    alt={t(`entity.product.${item.id}.name`, { defaultValue: item.name })}
                    size={getSizeForContext('cart')}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name & Price */}
                <div className="flex-1 flex flex-col justify-between">
                  <h3 className="font-semibold text-lg" data-testid={`item-name-${item.id}`}>{t(`entity.product.${item.id}.name`, { defaultValue: item.name })}</h3>
                  <p className="text-xl font-bold text-blue-600" data-testid={`item-price-${item.id}`}>${item.price}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    data-testid={`decrease-quantity-${item.id}`}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold" data-testid={`item-quantity-${item.id}`}>{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    data-testid={`increase-quantity-${item.id}`}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  data-testid={`remove-item-${item.id}`}
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-4 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-2xl font-bold mb-6">{t('checkout.orderSummary')}</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('cart.subtotal')}</span>
                <span className="font-semibold" data-testid="cart-subtotal">${totalPrice().toFixed(2)}</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>{t('cart.total')}</span>
                  <span className="text-blue-600" data-testid="cart-total">${totalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={() => navigate('/checkout')} data-testid="checkout-button">
              {t('cart.checkout')}
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
}
