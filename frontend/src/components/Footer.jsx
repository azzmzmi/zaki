import { useTranslation } from 'react-i18next';
import { Facebook, WhatsApp, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-slate-900 to-blue-900 dark:from-black dark:to-slate-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Sand Valley, LLC</h3>
            <p className="text-sm text-gray-300 mb-4">
              {t('footer_description') || 'Your trusted online shopping destination for quality products and excellent service.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://wa.me/" className="text-gray-300 hover:text-white transition-colors">
                <WhatsApp size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              
             
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('quick_links') || 'Quick Links'}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/" className="hover:text-white transition-colors">{t('home') || 'Home'}</a></li>
              <li><a href="/products" className="hover:text-white transition-colors">{t('products') || 'Products'}</a></li>
              <li><a href="/cart" className="hover:text-white transition-colors">{t('cart') || 'Cart'}</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">{t('login') || 'Login'}</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('customer_service') || 'Customer Service'}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">{t('about_us') || 'About Us'}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('contact_us') || 'Contact Us'}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('privacy_policy') || 'Privacy Policy'}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('terms_conditions') || 'Terms & Conditions'}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('contact_info') || 'Contact Info'}</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex gap-2 items-start">
                <Phone size={18} className="mt-0.5 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex gap-2 items-start">
                <Mail size={18} className="mt-0.5 flex-shrink-0" />
                <span>support@shophub.com</span>
              </div>
              <div className="flex gap-2 items-start">
                <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                <span>123 Shopping Street, Commerce City, CC 12345</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {currentYear} ShopHub. {t('all_rights_reserved') || 'All rights reserved.'}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">{t('privacy') || 'Privacy'}</a>
            <a href="#" className="hover:text-white transition-colors">{t('terms') || 'Terms'}</a>
            <a href="#" className="hover:text-white transition-colors">{t('sitemap') || 'Sitemap'}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
