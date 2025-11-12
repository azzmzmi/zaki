import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingCart, User, LogOut, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import ThemeSwitcher from "./ThemeSwitcher";
import { useState, useEffect } from "react";

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
    <nav
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50"
      data-testid="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <img
              src={process.env.PUBLIC_URL + "/logo.png"}
              alt="Your Store"
              className="h-12 w-auto"
            />
            <br/>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {" "}{t("app.name")}
            </span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link to="/products" data-testid="products-link">
              <Button variant="ghost">{t("nav.products")}</Button>
            </Link>

            {isAuthenticated() && isAdmin() && (
              <Link to="/admin" data-testid="admin-link">
                <Button variant="ghost">{t("nav.admin")}</Button>
              </Link>
            )}

            <Link to="/cart" className="relative" data-testid="cart-link">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                    data-testid="cart-badge"
                  >
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              data-testid="theme-toggle"
            >
              <ThemeSwitcher />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="language-menu">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => changeLanguage("en")}
                  data-testid="lang-en"
                >
                  English
                </DropdownMenuItem>
{/*                 <DropdownMenuItem
                  onClick={() => changeLanguage("es")}
                  data-testid="lang-es"
                >
                  Español
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  onClick={() => changeLanguage("ar")}
                  data-testid="lang-ar"
                >
                  عربي
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {isAuthenticated() ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="user-menu">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="px-2 py-1.5 text-sm font-semibold">
                    {user?.full_name}
                  </div>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" data-testid="login-link">
                <Button>{t("nav.login")}</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
