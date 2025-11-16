import { useTranslation } from 'react-i18next';
import { Facebook, MessageCircle, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { CONTACT_INFO } from '@/config/contact';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-r from-slate-900 to-blue-900 dark:from-black dark:to-slate-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">{CONTACT_INFO.company_name}</h3>
            <p className="text-sm text-gray-300 mb-4">
              {t('footer_description') || 'Your trusted online shopping destination for quality products and excellent service.'}
            </p>
            <div className="flex gap-4">
              <a href={CONTACT_INFO.social.facebook} className="text-gray-300 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href={CONTACT_INFO.social.whatsapp} className="text-gray-300 hover:text-white transition-colors">
                <MessageCircle size={20} />
              </a>
              <a href={CONTACT_INFO.social.instagram} className="text-gray-300 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('quick_links') || 'Quick Links'}</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="/" className="hover:text-white transition-colors">{t('nav.home') || 'Home'}</a></li>
              <li><a href="/products" className="hover:text-white transition-colors">{t('nav.products') || 'Products'}</a></li>
              <li><a href="/cart" className="hover:text-white transition-colors">{t('cart.title') || 'Cart'}</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">{t('auth.login') || 'Login'}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('contact_info') || 'Contact Info'}</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex gap-2 items-start">
                <Phone size={18} className="mt-0.5 flex-shrink-0" />
                <a href={`tel:${CONTACT_INFO.phone}`} className="hover:text-white transition-colors">{CONTACT_INFO.phone}</a>
              </div>
              <div className="flex gap-2 items-start">
                <Mail size={18} className="mt-0.5 flex-shrink-0" />
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-white transition-colors">{CONTACT_INFO.email}</a>
              </div>
              <div className="flex gap-2 items-start">
                <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                <span>{CONTACT_INFO.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>&copy; {currentYear} {CONTACT_INFO.company_name}. {t('all_rights_reserved') || 'All rights reserved.'}</p>
        </div>
      </div>
    </footer>
  );
}
