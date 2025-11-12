import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ordersApi } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { CreditCard } from 'lucide-react';

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  const [shippingAddress, setShippingAddress] = useState('');

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
      toast.error('Failed to create order');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      toast.error('Please enter shipping address');
      return;
    }
    createOrderMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" data-testid="checkout-page">
      <h1 className="text-4xl font-bold mb-8" data-testid="checkout-title">{t('checkout.title')}</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">{t('checkout.shippingAddress')}</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    rows={4}
                    data-testid="shipping-address-input"
                  />
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
                      <p className="font-semibold">Mock Payment (Demo)</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">No actual charges will be made</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 italic">* This is a demo checkout. No real payment will be processed.</p>
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
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
                {createOrderMutation.isPending ? 'Processing...' : t('checkout.placeOrder')}
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}