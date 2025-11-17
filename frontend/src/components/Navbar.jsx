import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart, User, LogOut, Globe, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, clearAuth } = useAuthStore();
  const totalItems = useCartStore((state) => state.totalItems());

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
<<<<<<< Updated upstream
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
=======
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
>>>>>>> Stashed changes
            <img
              src={process.env.PUBLIC_URL + "/logo.png"}
              alt="Your Store"
              className="h-10 sm:h-12 w-auto"
            />
<<<<<<< Updated upstream
            <span className="text-2xl font-bold ml-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
=======
            <span className="hidden sm:inline text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
>>>>>>> Stashed changes
              {t("app.name")}
            </span>
          </Link>

<<<<<<< Updated upstream
          {/* Desktop buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            {/* Products */}
            <Link to="/products">
              <Button variant="ghost">{t("nav.products")}</Button>
=======
          <div className="flex items-center gap-1 sm:gap-4">
            <Link to="/products" className="hidden sm:inline" data-testid="products-link">
              <Button variant="ghost" className="text-sm">{t("nav.products")}</Button>
>>>>>>> Stashed changes
            </Link>

            {/* Admin */}
            {isAuthenticated() && isAdmin() && (
<<<<<<< Updated upstream
              <Link to="/admin">
                <Button variant="ghost">{t("nav.admin")}</Button>
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
=======
              <Link to="/admin" className="hidden sm:inline" data-testid="admin-link">
                <Button variant="ghost" className="text-sm">{t("nav.admin")}</Button>
              </Link>
            )}

            <Link to="/cart" className="relative" data-testid="cart-link">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
                <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5" />
>>>>>>> Stashed changes
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

<<<<<<< Updated upstream
            {/* Theme toggle */}
            <Button variant="ghost" size="icon">
=======
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-10 sm:w-10"
              data-testid="theme-toggle"
            >
>>>>>>> Stashed changes
              <ThemeSwitcher />
            </Button>

            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
<<<<<<< Updated upstream
                <Button variant="ghost" size="icon">
                  <Globe className="w-5 h-5" />
=======
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" data-testid="language-menu">
                  <Globe className="w-4 sm:w-5 h-4 sm:h-5" />
>>>>>>> Stashed changes
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => changeLanguage("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("ar")}>
                  عربي
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User */}
            {isAuthenticated() ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
<<<<<<< Updated upstream
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
=======
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" data-testid="user-menu">
                    <User className="w-4 sm:w-5 h-4 sm:h-5" />
>>>>>>> Stashed changes
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="px-2 py-1.5 text-sm font-semibold">
                    {user?.full_name}
                  </div>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">{t("profile.title")}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
<<<<<<< Updated upstream
              <Link to="/login">
                <Button>{t("nav.login")}</Button>
=======
              <Link to="/login" data-testid="login-link">
                <Button className="text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4">{t("nav.login")}</Button>
>>>>>>> Stashed changes
              </Link>
            )}
          </div>

          {/* Mobile grouped menu */}
          <div className="flex sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="bottom" align="end" className="w-56">
                {/* Main Links */}
                <DropdownMenuItem asChild>
                  <Link to="/products">{t("nav.products")}</Link>
                </DropdownMenuItem>

                {isAuthenticated() && isAdmin() && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">{t("nav.admin")}</Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link to="/cart">{t("nav.cart")}</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Settings Section */}
                <div className="px-3 py-2">
                  <span className="text-gray-500 text-sm font-semibold">
                    {t("nav.settings")}
                  </span>

                  {/* Theme toggle */}
                  <div className="mt-2 flex items-center justify-between">
                    <span>{t("nav.theme")}</span>
                    <ThemeSwitcher />
                  </div>

                  {/* Language toggle */}
                  {/* Language toggle like Theme */}
                  <div className="mt-2 flex items-center justify-between">
                    <span>{t("nav.language")}</span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          {i18n.language === "en" ? "English" : "عربي"}
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        side="bottom"
                        align="end"
                        className="w-32 p-0"
                      >
                        <DropdownMenuItem
                          onClick={() => changeLanguage("en")}
                          className="text-sm px-3 py-2"
                        >
                          English
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => changeLanguage("ar")}
                          className="text-sm px-3 py-2"
                        >
                          عربي
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <DropdownMenuSeparator />

                {/* User Actions */}
                <div className="px-3 py-2">
                  {isAuthenticated() ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/profile">{t("profile.title")}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout}>
                        {t("nav.logout")}
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link to="/login">{t("nav.login")}</Link>
                    </DropdownMenuItem>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
