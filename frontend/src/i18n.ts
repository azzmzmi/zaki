import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translationsApi } from './lib/api';

const resources = {
  en: {
    translation: {
      // Common
      'app.name': 'SandValley',
      'app.tagline': 'The First Yemeni Products Store in USA',
      'common.welcome': 'High-quality wholesale products, reliable service, and exceptional value every time.',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.confirm': 'Confirm',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.search': 'Search',
      'common.filter': 'Filter',
      
      // Navigation
      'nav.home': 'Home',
      'nav.products': 'Products',
      'nav.cart': 'Cart',
      'nav.admin': 'Admin',
      'nav.login': 'Login',
      'nav.register': 'Register',
      'nav.logout': 'Logout',
      
      // Auth
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.fullName': 'Full Name',
      'auth.loginSuccess': 'Logged in successfully',
      'auth.registerSuccess': 'Registered successfully',
      'auth.loginError': 'Invalid credentials',
      
      // Products
      'products.title': 'Products',
      'products.allCategories': 'All Categories',
      'products.addToCart': 'Add to Cart',
      'products.outOfStock': 'Out of Stock',
      'products.price': 'Price',
      'products.stock': 'Stock',
      'products.category': 'Category',
      'products.description': 'Description',
      
      // Cart
      'cart.title': 'Shopping Cart',
      'cart.empty': 'Your cart is empty',
      'cart.items': 'items',
      'cart.subtotal': 'Subtotal',
      'cart.total': 'Total',
      'cart.checkout': 'Checkout',
      'cart.remove': 'Remove',
      'cart.quantity': 'Quantity',
      
      // Checkout
      'checkout.title': 'Checkout',
      'checkout.shippingAddress': 'Shipping Address',
      'checkout.paymentMethod': 'Payment Method',
      'checkout.placeOrder': 'Place Order',
      'checkout.orderSuccess': 'Order placed successfully!',
      
      // Admin
      'admin.dashboard': 'Dashboard',
      'admin.products': 'Products',
      'admin.categories': 'Categories',
      'admin.orders': 'Orders',
      'admin.users': 'Users',
      'admin.analytics': 'Analytics',
      'admin.addProduct': 'Add Product',
      'admin.addCategory': 'Add Category',
      'admin.totalSales': 'Total Sales',
      'admin.totalOrders': 'Total Orders',
      'admin.totalUsers': 'Total Users',
      'admin.totalProducts': 'Total Products',
      
      // Home Features
      'home.freeShipping': 'Free Shipping',
      'home.freeShippingDesc': 'Free delivery on orders over $50',
      'home.qualityProducts': 'Quality Products',
      'home.qualityProductsDesc': 'Handpicked items of the highest quality',
      'home.securePayment': 'Secure Payment',
      'home.securePaymentDesc': 'Safe and encrypted transactions',
      'home.featuredProducts': 'Featured Products',
      'home.shopByCategory': 'Shop by Category',
      
      // Footer
      'footer_description': 'Your trusted online shopping destination for quality products and excellent service.',
      'quick_links': 'Quick Links',
      'home': 'Home',
      'products': 'Products',
      'cart': 'Cart',
      'login': 'Login',
      'customer_service': 'Customer Service',
      'about_us': 'About Us',
      'contact_us': 'Contact Us',
      'privacy_policy': 'Privacy Policy',
      'terms_conditions': 'Terms & Conditions',
      'contact_info': 'Contact Info',
      'all_rights_reserved': 'All rights reserved.',
      'privacy': 'Privacy',
      'terms': 'Terms',
      'sitemap': 'Sitemap',
    }
  },
 /*  es: {
    translation: {
      // Common
      'app.name': 'SandValley',
      'app.tagline': 'Tu Tienda Todo en Uno',
      'common.loading': 'Cargando...',
      'common.error': 'Error',
      'common.success': 'Éxito',
      'common.cancel': 'Cancelar',
      'common.confirm': 'Confirmar',
      'common.save': 'Guardar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.search': 'Buscar',
      'common.filter': 'Filtrar',
      
      // Navigation
      'nav.home': 'Inicio',
      'nav.products': 'Productos',
      'nav.cart': 'Carrito',
      'nav.admin': 'Admin',
      'nav.login': 'Iniciar Sesión',
      'nav.register': 'Registrarse',
      'nav.logout': 'Cerrar Sesión',
      
      // Auth
      'auth.login': 'Iniciar Sesión',
      'auth.register': 'Registrarse',
      'auth.email': 'Correo Electrónico',
      'auth.password': 'Contraseña',
      'auth.fullName': 'Nombre Completo',
      'auth.loginSuccess': 'Sesión iniciada correctamente',
      'auth.registerSuccess': 'Registrado correctamente',
      'auth.loginError': 'Credenciales inválidas',
      
      // Products
      'products.title': 'Productos',
      'products.allCategories': 'Todas las Categorías',
      'products.addToCart': 'Agregar al Carrito',
      'products.outOfStock': 'Agotado',
      'products.price': 'Precio',
      'products.stock': 'Stock',
      'products.category': 'Categoría',
      'products.description': 'Descripción',
      
      // Cart
      'cart.title': 'Carrito de Compras',
      'cart.empty': 'Tu carrito está vacío',
      'cart.items': 'artículos',
      'cart.subtotal': 'Subtotal',
      'cart.total': 'Total',
      'cart.checkout': 'Pagar',
      'cart.remove': 'Eliminar',
      'cart.quantity': 'Cantidad',
      
      // Checkout
      'checkout.title': 'Pagar',
      'checkout.shippingAddress': 'Dirección de Envío',
      'checkout.paymentMethod': 'Método de Pago',
      'checkout.placeOrder': 'Realizar Pedido',
      'checkout.orderSuccess': '¡Pedido realizado con éxito!',
      
      // Admin
      'admin.dashboard': 'Panel de Control',
      'admin.products': 'Productos',
      'admin.categories': 'Categorías',
      'admin.orders': 'Pedidos',
      'admin.users': 'Usuarios',
      'admin.analytics': 'Analíticas',
      'admin.addProduct': 'Agregar Producto',
      'admin.addCategory': 'Agregar Categoría',
      'admin.totalSales': 'Ventas Totales',
      'admin.totalOrders': 'Pedidos Totales',
      'admin.totalUsers': 'Usuarios Totales',
      'admin.totalProducts': 'Productos Totales',
      
      // Home Features
      'home.freeShipping': 'Envío Gratis',
      'home.freeShippingDesc': 'Entrega gratuita en pedidos superiores a $50',
      'home.qualityProducts': 'Productos de Calidad',
      'home.qualityProductsDesc': 'Artículos seleccionados de la más alta calidad',
      'home.securePayment': 'Pago Seguro',
      'home.securePaymentDesc': 'Transacciones seguras y encriptadas',
      'home.featuredProducts': 'Productos Destacados',
      'home.shopByCategory': 'Comprar por Categoría',
    }
  }, */
  ar: {
    translation: {
      // Common
      'app.name': 'ساندفالي',
      'app.tagline': 'متجر المنتجات اليمنية في الولايات المتحدة الأمريكية', 
      'common.welcome': 'توفير منتجات عالية الجودة . و خدمة موثوقة متميزه لعملائنا الكرام.',
      'common.loading': 'جاري التحميل...',
      'common.error': 'خطأ',
      'common.success': 'نجح',
      'common.cancel': 'إلغاء',
      'common.confirm': 'تأكيد',
      'common.save': 'حفظ',
      'common.delete': 'حذف',
      'common.edit': 'تعديل',
      'common.search': 'بحث',
      'common.filter': 'تصفية',
      
      // Navigation
      'nav.home': 'الرئيسية',
      'nav.products': 'المنتجات',
      'nav.cart': 'السلة',
      'nav.admin': 'الإدارة',
      'nav.login': 'تسجيل الدخول',
      'nav.register': 'التسجيل',
      'nav.logout': 'تسجيل الخروج',
      
      // Auth
      'auth.login': 'تسجيل الدخول',
      'auth.register': 'إنشاء حساب',
      'auth.email': 'البريد الإلكتروني',
      'auth.password': 'كلمة المرور',
      'auth.fullName': 'الاسم الكامل',
      'auth.loginSuccess': 'تم تسجيل الدخول بنجاح',
      'auth.registerSuccess': 'تم التسجيل بنجاح',
      'auth.loginError': 'بيانات اعتماد غير صالحة',
      
      // Products
      'products.title': 'المنتجات',
      'products.allCategories': 'جميع الفئات',
      'products.addToCart': 'إضافة للسلة',
      'products.outOfStock': 'نفذت الكمية',
      'products.price': 'السعر',
      'products.stock': 'المخزون',
      'products.category': 'الفئة',
      'products.description': 'الوصف',
      
      // Cart
      'cart.title': 'سلة التسوق',
      'cart.empty': 'سلتك فارغة',
      'cart.items': 'عناصر',
      'cart.subtotal': 'المجموع الفرعي',
      'cart.total': 'المجموع',
      'cart.checkout': 'الدفع',
      'cart.remove': 'إزالة',
      'cart.quantity': 'الكمية',
      
      // Checkout
      'checkout.title': 'الدفع',
      'checkout.shippingAddress': 'عنوان الشحن',
      'checkout.paymentMethod': 'طريقة الدفع',
      'checkout.placeOrder': 'تقديم الطلب',
      'checkout.orderSuccess': 'تم تقديم الطلب بنجاح!',
      
      // Admin
      'admin.dashboard': 'لوحة التحكم',
      'admin.products': 'المنتجات',
      'admin.categories': 'الفئات',
      'admin.orders': 'الطلبات',
      'admin.users': 'المستخدمون',
      'admin.analytics': 'التحليلات',
      'admin.addProduct': 'إضافة منتج',
      'admin.addCategory': 'إضافة فئة',
      'admin.totalSales': 'إجمالي المبيعات',
      'admin.totalOrders': 'إجمالي الطلبات',
      'admin.totalUsers': 'إجمالي المستخدمين',
      'admin.totalProducts': 'إجمالي المنتجات',
      
      // Home Features
      'home.freeShipping': 'شحن مجاني',
      'home.freeShippingDesc': 'توصيل مجاني للطلبات التي تزيد عن 50 دولار',
      'home.qualityProducts': 'منتجات عالية الجودة',
      'home.qualityProductsDesc': 'منتجات مختارة بعناية من أعلى جودة',
      'home.securePayment': 'دفع آمن',
      'home.securePaymentDesc': 'معاملات آمنة ومشفرة',
      'home.featuredProducts': 'المنتجات المميزة',
      'home.shopByCategory': 'تسوق حسب الفئة',
      'home.contactUs': 'اتصل بنا',
     // Footer
      'footer_description': 'موقع تسوق إلكتروني موثوق به لمنتجات عالية الجودة وخدمة ممتازة.',
      'quick_links': 'الروابط السريعة',
      'home': 'الرئيسية',
      'products': 'المنتجات',
      'cart': 'السلة',
      'login': 'تسجيل الدخول',
      'customer_service': 'خدمة العملاء',
      'about_us': 'عن ساند فالي',
      'contact_us': 'اتصل بنا',
      'privacy_policy': 'سياسة الخصوصية',
      'terms_conditions': 'الشروط والأحكام',
      'contact_info': 'معلومات الاتصال',
      'all_rights_reserved': 'جميع الحقوق محفوظة.',
      'privacy': 'خصوصية',
      'terms': 'بنود',
      'sitemap': 'خرائط الموقع', 
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

// Load dynamic translations from backend
translationsApi.getByLang('en').then(res => {
  i18n.addResourceBundle('en', 'translation', res.data, true, true);
}).catch(() => {});
translationsApi.getByLang('ar').then(res => {
  i18n.addResourceBundle('ar', 'translation', res.data, true, true);
}).catch(() => {});

export default i18n;