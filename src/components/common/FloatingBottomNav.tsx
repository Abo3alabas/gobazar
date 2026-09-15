import React from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import {
  Home,
  Compass,
  Package,
  User,
  Bike,
  Navigation,
  DollarSign,
  Power,
  ChefHat,
  MenuSquare,
  BarChart3,
  Store,
  ShieldCheck,
  Users,
  Activity,
  ShoppingBag
} from 'lucide-react';
import { AppRole } from '../../types';

interface FloatingBottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const FloatingBottomNav: React.FC<FloatingBottomNavProps> = ({
  currentTab,
  onTabChange
}) => {
  const { role, lang, isRtl, cart, orders, merchantIncomingOrder } = useApp();
  const t = translations[lang];

  // Active counts for badges
  const pendingOrdersCount = orders.filter(
    o => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const activeDriverOrders = orders.filter(
    o => o.status === 'on_the_way' || o.status === 'ready_for_pickup' || o.status === 'driver_assigned'
  ).length;

  const activeKitchenOrders = orders.filter(
    o => o.status === 'pending' || o.status === 'preparing'
  ).length;

  // Define tabs per role
  const getNavItems = () => {
    switch (role) {
      case 'customer':
        return [
          {
            id: 'home',
            label: isRtl ? 'الرئيسية' : 'Home',
            icon: Home,
            badge: undefined
          },
          {
            id: 'search',
            label: isRtl ? 'استكشاف' : 'Explore',
            icon: Compass,
            badge: undefined
          },
          {
            id: 'orders',
            label: isRtl ? 'طلباتي' : 'Orders',
            icon: Package,
            badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
          },
          {
            id: 'profile',
            label: isRtl ? 'حسابي' : 'Profile',
            icon: User,
            badge: undefined
          }
        ];

      case 'driver':
        return [
          {
            id: 'trips',
            label: isRtl ? 'المهام' : 'Trips',
            icon: Bike,
            badge: activeDriverOrders > 0 ? activeDriverOrders : undefined
          },
          {
            id: 'radar',
            label: isRtl ? 'الرادار' : 'Radar',
            icon: Navigation,
            badge: undefined
          },
          {
            id: 'earnings',
            label: isRtl ? 'الأرباح' : 'Earnings',
            icon: DollarSign,
            badge: undefined
          },
          {
            id: 'shift',
            label: isRtl ? 'الوردية' : 'Shift',
            icon: Power,
            badge: undefined
          }
        ];

      case 'merchant':
        return [
          {
            id: 'kitchen',
            label: isRtl ? 'المطبخ' : 'Kitchen',
            icon: ChefHat,
            badge: activeKitchenOrders > 0 ? activeKitchenOrders : undefined
          },
          {
            id: 'menu',
            label: isRtl ? 'الأصناف' : 'Menu',
            icon: MenuSquare,
            badge: undefined
          },
          {
            id: 'sales',
            label: isRtl ? 'المبيعات' : 'Sales',
            icon: BarChart3,
            badge: undefined
          },
          {
            id: 'store',
            label: isRtl ? 'المتجر' : 'Store',
            icon: Store,
            badge: undefined
          }
        ];

      case 'admin':
        return [
          {
            id: 'overview',
            label: isRtl ? 'المؤشرات' : 'Overview',
            icon: Activity,
            badge: undefined
          },
          {
            id: 'orders',
            label: isRtl ? 'العمليات' : 'Orders',
            icon: Package,
            badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
          },
          {
            id: 'couriers',
            label: isRtl ? 'الأسطول' : 'Couriers',
            icon: Bike,
            badge: undefined
          },
          {
            id: 'merchants',
            label: isRtl ? 'المتاجر' : 'Stores',
            icon: Store,
            badge: undefined
          }
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Role themed active styles
  const getRoleAccent = () => {
    switch (role) {
      case 'customer':
        return 'text-emerald-600 bg-emerald-50';
      case 'driver':
        return 'text-amber-600 bg-amber-50';
      case 'merchant':
        return 'text-blue-600 bg-blue-50';
      case 'admin':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-emerald-600 bg-emerald-50';
    }
  };

  const getRoleGlow = () => {
    switch (role) {
      case 'customer':
        return 'shadow-emerald-500/10 border-emerald-200/80';
      case 'driver':
        return 'shadow-amber-500/10 border-amber-200/80';
      case 'merchant':
        return 'shadow-blue-500/10 border-blue-200/80';
      case 'admin':
        return 'shadow-purple-500/10 border-purple-200/80';
      default:
        return 'shadow-emerald-500/10 border-emerald-200/80';
    }
  };

  return (
    <div className="fixed bottom-3 sm:bottom-5 inset-x-0 z-40 flex justify-center px-3 pointer-events-none">
      <nav
        aria-label="Mobile Bottom Navigation"
        className={`pointer-events-auto w-full max-w-md bg-white/95 backdrop-blur-xl border ${getRoleGlow()} shadow-2xl rounded-3xl p-1.5 flex items-center justify-around transition-all duration-300 ring-1 ring-stone-900/5`}
      >
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? `${getRoleAccent()} font-black scale-102`
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/60 font-medium'
              }`}
            >
              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className="text-[11px] mt-1 tracking-tight leading-none truncate max-w-[70px]">
                {item.label}
              </span>

              {/* Active Indicator Dot */}
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-current" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
