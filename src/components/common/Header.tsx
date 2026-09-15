import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Logo } from './Logo';
import { translations } from '../../utils/translations';
import {
  Bell,
  ShoppingBag,
  Wallet,
  Globe,
  User,
  Bike,
  Store as StoreIcon,
  BarChart3,
  CheckCheck,
  CheckCircle2,
  Clock,
  ChevronDown
} from 'lucide-react';
import { AppRole } from '../../types';

interface HeaderProps {
  onOpenCart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart }) => {
  const {
    role,
    setRole,
    lang,
    setLang,
    isRtl,
    notifications,
    unreadNotifsCount,
    markAllNotifsRead,
    cart,
    cartTotal,
    customerWallet,
    orders,
    drivers,
  } = useApp();

  const t = translations[lang];
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Active counts for badges
  const pendingOrdersCount = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const driverActiveTasks = orders.filter(o => o.status === 'on_the_way' || o.status === 'ready_for_pickup').length;
  const merchantActivePrep = orders.filter(o => o.status === 'pending' || o.status === 'preparing').length;

  const roleConfig: Record<AppRole, { label: string; icon: React.ReactNode; badge?: number; color: string }> = {
    customer: {
      label: t.roles.customer,
      icon: <User className="w-4 h-4" />,
      badge: cart.length > 0 ? cart.length : undefined,
      color: 'bg-emerald-600 text-white',
    },
    driver: {
      label: t.roles.driver,
      icon: <Bike className="w-4 h-4" />,
      badge: driverActiveTasks > 0 ? driverActiveTasks : undefined,
      color: 'bg-amber-600 text-white',
    },
    merchant: {
      label: t.roles.merchant,
      icon: <StoreIcon className="w-4 h-4" />,
      badge: merchantActivePrep > 0 ? merchantActivePrep : undefined,
      color: 'bg-blue-600 text-white',
    },
    admin: {
      label: t.roles.admin,
      icon: <BarChart3 className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      color: 'bg-purple-600 text-white',
    },
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Top Banner Notice for Multi-Role Switching Experience */}
      <div className="bg-emerald-800 text-emerald-100 px-4 py-1 text-[11px] font-bold text-center flex items-center justify-center gap-1.5 border-b border-emerald-700/50">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          {isRtl
            ? '🚀 تجربة متعددة الأدوار: بدّل بين (العميل • السائق • المتجر • الإدارة) من الشريط العلوي'
            : '🚀 Multi-Role Platform: Switch between Customer, Driver, Merchant & Admin at any time'}
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setRole('customer')}>
            <Logo size="md" showSubtitle={false} />
          </div>

          {/* Role Switcher Pills - Desktop & Tablet */}
          <div className="hidden lg:flex items-center p-1 bg-stone-100/90 rounded-2xl border border-stone-200/80 shadow-inner">
            {(['customer', 'driver', 'merchant', 'admin'] as AppRole[]).map((r) => {
              const item = roleConfig[r];
              const isActive = role === r;
              return (
                <button
                  key={r}
                  id={`role-btn-${r}`}
                  onClick={() => setRole(r)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? `${item.color} shadow-sm scale-102`
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black rounded-full ${
                        isActive ? 'bg-white text-stone-900' : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Mobile Role Switcher Dropdown */}
            <div className="relative lg:hidden">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${roleConfig[role].color}`}
              >
                {roleConfig[role].icon}
                <span className="max-w-[70px] truncate">{roleConfig[role].label}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showRoleMenu && (
                <div
                  className={`absolute top-full mt-2 ${
                    isRtl ? 'left-0' : 'right-0'
                  } w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50`}
                >
                  {(['customer', 'driver', 'merchant', 'admin'] as AppRole[]).map((r) => {
                    const item = roleConfig[r];
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          setRole(r);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors ${
                          role === r ? 'bg-emerald-50 text-emerald-700' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded-full text-[10px]">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Language Toggle Button */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
              title="Change Language / تغيير اللغة"
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Customer Wallet Balance (if in customer or driver mode) */}
            {role === 'customer' && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                <span>{customerWallet.toFixed(1)} {t.store.sar}</span>
              </div>
            )}

            {/* Smart Notification Bell Center */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  if (unreadNotifsCount > 0) markAllNotifsRead();
                }}
                className="relative p-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
                title={t.notifications.title}
                aria-label={t.notifications.title}
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                )}
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifMenu && (
                <div
                  className={`absolute top-full mt-2 ${
                    isRtl ? 'left-0 sm:left-auto sm:right-auto' : 'right-0'
                  } w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 p-3 z-50 max-h-[420px] overflow-y-auto`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-black text-stone-900">
                        {t.notifications.title}
                      </span>
                    </div>
                    <button
                      onClick={markAllNotifsRead}
                      className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      {t.notifications.markAllRead}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-stone-400 py-6">
                        {t.notifications.empty}
                      </p>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl border transition-all ${
                            n.read
                              ? 'bg-stone-50 border-stone-100 text-stone-600'
                              : 'bg-emerald-50/60 border-emerald-200/80 text-stone-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-stone-900">
                              {lang === 'ar' ? n.titleAr : n.titleEn}
                            </span>
                            <span className="text-[10px] text-stone-400 whitespace-nowrap">
                              {n.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                            {lang === 'ar' ? n.messageAr : n.messageEn}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Button for Customer Mode */}
            {role === 'customer' && (
              <button
                id="cart-header-button"
                onClick={onOpenCart}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md shadow-emerald-600/20 text-xs sm:text-sm font-bold transition-all active:scale-95"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-400 text-stone-950 font-black text-[9px] flex items-center justify-center shadow-xs">
                      {cart.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-bold">
                  {cartTotal > 0 ? `${cartTotal.toFixed(1)} ${t.store.sar}` : t.cart.title}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
