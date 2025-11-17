import { useTranslation } from 'react-i18next';
import { Facebook, MessageCircle, Instagram, TrendingUp, Mail, Phone, MapPin } from 'lucide-react';
import { CONTACT_INFO } from '@/config/contact';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gradient-to-r from-amber-900 via-orange-800 to-yellow-700 dark:from-amber-900 dark:via-orange-800 dark:to-yellow-800 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-base sm:text-lg font-bold mb-4">{CONTACT_INFO.company_name}</h3>
            <p className="text-xs sm:text-sm text-gray-300 mb-4">
              {t('footer.description')}
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
            <h4 className="text-base sm:text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
              <li><a href="/" className="hover:text-white transition-colors">{t('nav.home')}</a></li>
              <li><a href="/products" className="hover:text-white transition-colors">{t('nav.products')}</a></li>
              <li><a href="/cart" className="hover:text-white transition-colors">{t('cart.title')}</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">{t('auth.login')}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base sm:text-lg font-semibold mb-4">{t('footer.contactInfo')}</h4>
            <div className="space-y-3 text-xs sm:text-sm text-gray-300">
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
        <div className="border-t border-white/20 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-400 gap-4 sm:gap-0">
          <p>&copy; {currentYear} {CONTACT_INFO.company_name}. {t('footer.allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
}
