import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ordersApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.full_name || '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    phone: ''
  });

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const orderData = {
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: totalPrice(),
        shipping_address: shippingAddress
      };
      return ordersApi.create(orderData);
    },
    onSuccess: () => {
      toast.success(t('checkout.orderSuccess'));
      clearCart();
      navigate('/');
    },
    onError: () => {
      toast.error(t('checkout.orderFailed'));
    }
  });

  const handleAddressChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!shippingAddress.full_name || !shippingAddress.street_address || 
        !shippingAddress.city || !shippingAddress.state || 
        !shippingAddress.zip_code || !shippingAddress.phone) {
      toast.error(t('checkout.fillAllFields'));
      return;
    }
    
    createOrderMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" data-testid="checkout-page">
      <h1 className="text-4xl font-bold mb-8" data-testid="checkout-title">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">{t('checkout.shippingAddress')}</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">{t('auth.fullName')} *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={shippingAddress.full_name}
                    onChange={(e) => handleAddressChange('full_name', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="street">{t('checkout.streetAddress')} *</Label>
                  <Input
                    id="street"
                    type="text"
                    value={shippingAddress.street_address}
                    onChange={(e) => handleAddressChange('street_address', e.target.value)}
                    placeholder={t('checkout.streetAddressPlaceholder')}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">{t('checkout.city')} *</Label>
                    <Input
                      id="city"
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder={t('checkout.cityPlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="state">{t('checkout.state')} *</Label>
                    <Select value={shippingAddress.state} onValueChange={(value) => handleAddressChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('checkout.selectState')} />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zip">{t('checkout.zipCode')} *</Label>
                    <Input
                      id="zip"
                      type="text"
                      value={shippingAddress.zip_code}
                      onChange={(e) => handleAddressChange('zip_code', e.target.value)}
                      placeholder={t('checkout.zipCodePlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">{t('checkout.phone')} *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      placeholder={t('checkout.phonePlaceholder')}
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">{t('checkout.paymentMethod')}</h2>
              <div className="space-y-4">
                <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold">{t('checkout.paymentMethod')}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('checkout.securePayment')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-4 sm:p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">{t('checkout.orderSummary')}</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm" data-testid={`order-item-${item.id}`}>
                    <span>{t(`entity.product.${item.id}.name`, { defaultValue: item.name })} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>{t('cart.total')}</span>
                    <span className="text-blue-600" data-testid="order-total">${totalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={createOrderMutation.isPending} data-testid="place-order-button">
                {createOrderMutation.isPending ? t('checkout.processing') : t('checkout.placeOrder')}
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}