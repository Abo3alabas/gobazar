import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { MobileShell } from './components/common/MobileShell';
import { FloatingBottomNav } from './components/common/FloatingBottomNav';
import { CustomerHome } from './components/customer/CustomerHome';
import { CustomerExploreView } from './components/customer/CustomerExploreView';
import { CustomerOrdersView } from './components/customer/CustomerOrdersView';
import { CustomerProfileView } from './components/customer/CustomerProfileView';
import { StoreDetailView } from './components/customer/StoreDetailView';
import { LiveTrackingView } from './components/customer/LiveTrackingView';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { DriverRatingModal } from './components/customer/DriverRatingModal';
import { LiveChatDrawer } from './components/chat/LiveChatDrawer';
import { FloatingAIAssistant } from './components/common/FloatingAIAssistant';
import { OrderTogetherModal } from './components/customer/OrderTogetherModal';
import { PremiumTablesModal } from './components/customer/PremiumTablesModal';
import { LunchSubscriptionModal } from './components/customer/LunchSubscriptionModal';
import { CookingChefModal } from './components/customer/CookingChefModal';
import { DriverApp } from './components/driver/DriverApp';
import { MerchantApp } from './components/merchant/MerchantApp';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Store } from './types';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    role,
    setRole,
    selectedStore,
    setSelectedStore,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    setIsCheckoutOpen,
    activeChatOrderId,
    setActiveChatOrderId,
    ratingModalOrderId,
    setRatingModalOrderId,
    activeTrackingOrderId,
    setActiveTrackingOrderId,
    merchantIncomingOrder,
    merchantAcceptOrder,
    cart,
    cartTotal,
    lang,
    isRtl,
    isInitialLoading,
    isDatabaseConnected,
    refreshDatabaseData
  } = useApp();

  // Active Tab state per role for mobile navigation
  const [customerTab, setCustomerTab] = useState<'home' | 'search' | 'orders' | 'profile'>('home');
  const [customerDetailView, setCustomerDetailView] = useState<'none' | 'store' | 'tracking'>('none');
  const [driverTab, setDriverTab] = useState<'trips' | 'radar' | 'earnings' | 'shift'>('trips');
  const [merchantTab, setMerchantTab] = useState<'kitchen' | 'menu' | 'sales' | 'store'>('kitchen');
  const [adminTab, setAdminTab] = useState<'overview' | 'orders' | 'couriers' | 'merchants'>('overview');

  // Smart Modals state triggerable from Floating AI Assistant
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isOrderTogetherOpen, setIsOrderTogetherOpen] = useState(false);
  const [isPremiumTablesOpen, setIsPremiumTablesOpen] = useState(false);
  const [isLunchSubOpen, setIsLunchSubOpen] = useState(false);
  const [isCookingChefOpen, setIsCookingChefOpen] = useState(false);
  const [cookingChefInitialDish, setCookingChefInitialDish] = useState<string | undefined>(undefined);

  const handleOpenCookingChef = (dishName?: string) => {
    setCookingChefInitialDish(dishName);
    setIsCookingChefOpen(true);
  };

  const handleSelectStore = (store: Store) => {
    setSelectedStore(store);
    setCustomerDetailView('store');
  };

  const handleOpenTracking = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    setCustomerDetailView('tracking');
  };

  // Get current active tab ID based on role
  const getCurrentTab = () => {
    switch (role) {
      case 'customer':
        return customerTab;
      case 'driver':
        return driverTab;
      case 'merchant':
        return merchantTab;
      case 'admin':
        return adminTab;
      default:
        return 'home';
    }
  };

  const handleTabChange = (newTab: string) => {
    // If switching customer tab, reset any nested detail view so we see the tab content
    if (role === 'customer') {
      setCustomerDetailView('none');
      setCustomerTab(newTab as 'home' | 'search' | 'orders' | 'profile');
    } else if (role === 'driver') {
      setDriverTab(newTab as 'trips' | 'radar' | 'earnings' | 'shift');
    } else if (role === 'merchant') {
      setMerchantTab(newTab as 'kitchen' | 'menu' | 'sales' | 'store');
    } else if (role === 'admin') {
      setAdminTab(newTab as 'overview' | 'orders' | 'couriers' | 'merchants');
    }
  };

  // The entire app depends exclusively on the MySQL database via the PHP API —
  // there is no local/mock data to render in the meantime, so show a loading
  // screen until the very first sync completes, and a clear connection error
  // if the database is unreachable once that first attempt finishes.
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-300 text-sm">
          {isRtl ? 'جاري الاتصال بقاعدة البيانات...' : 'Connecting to database...'}
        </p>
      </div>
    );
  }

  if (!isDatabaseConnected) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-lg font-semibold">
          {isRtl ? 'تعذّر الاتصال بقاعدة البيانات' : 'Could not connect to the database'}
        </p>
        <p className="text-stone-400 text-sm max-w-sm">
          {isRtl
            ? 'هذا التطبيق يعتمد بالكامل على قاعدة بيانات MySQL. يرجى التأكد من إعداد بيانات الاتصال في public/api/db_config.php ثم إعادة المحاولة.'
            : 'This app relies entirely on the MySQL database. Please verify the credentials in public/api/db_config.php, then retry.'}
        </p>
        <button
          onClick={() => refreshDatabaseData(false)}
          className="mt-2 px-5 py-2.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
        >
          {isRtl ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900/90 text-stone-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Application Navigation Bar: Universal Switcher & Platform Controls */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenActiveOrder={() => {
          if (activeTrackingOrderId) {
            handleOpenTracking(activeTrackingOrderId);
          }
        }}
      />

      {/* Floating Notification for Incoming Merchant Order if currently viewing another role */}
      {merchantIncomingOrder && role !== 'merchant' && (
        <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-900 text-white px-4 py-2.5 shadow-lg border-b border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-2 animate-fade-in z-30">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold">
              {isRtl
                ? `🔔 وصل طلب جديد للمتجر (#${merchantIncomingOrder.trackingNumber}) بقيمة ${merchantIncomingOrder.total.toFixed(2)} €`
                : `🔔 New store order received (#${merchantIncomingOrder.trackingNumber}) for ${merchantIncomingOrder.total.toFixed(2)} €`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRole('merchant')}
              className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-stone-950 text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer"
            >
              {isRtl ? 'فتح شاشة المتجر وتحديد وقت التجهيز 👨‍🍳' : 'Open Merchant Kitchen 👨‍🍳'}
            </button>
            <button
              onClick={() => merchantAcceptOrder(merchantIncomingOrder.id, 15)}
              className="px-2.5 py-1 bg-emerald-600/60 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl border border-emerald-400/40 cursor-pointer"
            >
              {isRtl ? 'قبول سريع (15 د)' : 'Quick Accept (15m)'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile App Canvas Shell */}
      <main className="flex-1 flex justify-center w-full">
        <MobileShell activeRole={role}>
          {/* 1. CUSTOMER MOBILE APP */}
          {role === 'customer' && (
            <>
              {customerDetailView === 'store' && selectedStore ? (
                <StoreDetailView
                  store={selectedStore}
                  onBack={() => setCustomerDetailView('none')}
                  onOpenCart={() => setIsCartOpen(true)}
                />
              ) : customerDetailView === 'tracking' ? (
                <LiveTrackingView
                  orderId={activeTrackingOrderId || 'ord-101'}
                  onBackToHome={() => setCustomerDetailView('none')}
                />
              ) : (
                <>
                  {customerTab === 'home' && (
                    <CustomerHome
                      onSelectStore={handleSelectStore}
                      onOpenTracking={handleOpenTracking}
                      onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
                      onOpenCookingChef={handleOpenCookingChef}
                    />
                  )}
                  {customerTab === 'search' && (
                    <CustomerExploreView onSelectStore={handleSelectStore} />
                  )}
                  {customerTab === 'orders' && (
                    <CustomerOrdersView onOpenTracking={handleOpenTracking} />
                  )}
                  {customerTab === 'profile' && <CustomerProfileView />}
                </>
              )}
            </>
          )}

          {/* 2. DRIVER MOBILE APP */}
          {role === 'driver' && <DriverApp activeTab={driverTab} />}

          {/* 3. MERCHANT MOBILE APP */}
          {role === 'merchant' && <MerchantApp activeTab={merchantTab} />}

          {/* 4. ADMIN OPERATIONS APP */}
          {role === 'admin' && <AdminDashboard activeTab={adminTab} />}
        </MobileShell>
      </main>

      {/* Floating Cart Capsule Pill for Customer (Docked right above bottom nav) */}
      {role === 'customer' && cart.length > 0 && customerDetailView !== 'tracking' && (
        <div className="fixed bottom-20 inset-x-0 z-40 flex justify-center px-4 pointer-events-none animate-bounce-short">
          <button
            onClick={() => setIsCartOpen(true)}
            className="pointer-events-auto w-full max-w-md bg-stone-900 hover:bg-black text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center justify-between transition-all active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                {cart.length}
              </span>
              <span className="text-xs font-bold text-stone-200">
                {isRtl ? 'سلة الطلبات' : 'Cart Items'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-emerald-400">
                {cartTotal.toFixed(2)} €
              </span>
              <span className="text-xs font-bold text-stone-300 flex items-center gap-1 bg-stone-800 px-2.5 py-1 rounded-xl">
                <span>{isRtl ? 'عرض السلة' : 'View Cart'}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Floating Bottom Navigation Bar */}
      <FloatingBottomNav
        currentTab={getCurrentTab()}
        onTabChange={handleTabChange}
      />

      {/* Slide-over Cart Drawer */}
      {isCartOpen && (
        <CartDrawer
          onClose={() => setIsCartOpen(false)}
          onProceedToCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* Safe Electronic Payment & Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            setCustomerDetailView('tracking');
          }}
        />
      )}

      {/* Real-time Order Chat Drawer (Customer <-> Driver / Support) */}
      {activeChatOrderId && (
        <LiveChatDrawer
          orderId={activeChatOrderId}
          onClose={() => setActiveChatOrderId(null)}
        />
      )}

      {/* Customer Rating Modal (Restricted strictly to customer role) */}
      {role === 'customer' && ratingModalOrderId && (
        <DriverRatingModal
          orderId={ratingModalOrderId}
          onClose={() => setRatingModalOrderId(null)}
        />
      )}

      {/* Persistent Floating AI Personal Assistant (Grounded in application catalog) */}
      {role === 'customer' && customerDetailView !== 'tracking' && (
        <FloatingAIAssistant
          onSelectStore={handleSelectStore}
          onOpenOrderTogether={() => setIsOrderTogetherOpen(true)}
          onOpenTableBooking={() => setIsPremiumTablesOpen(true)}
          onOpenLunchSub={() => setIsLunchSubOpen(true)}
          onOpenCookingChef={handleOpenCookingChef}
          externalIsOpen={isAIAssistantOpen}
          onExternalOpenChange={setIsAIAssistantOpen}
        />
      )}

      {/* Modals triggered from Floating AI Assistant */}
      <OrderTogetherModal
        isOpen={isOrderTogetherOpen}
        onClose={() => setIsOrderTogetherOpen(false)}
        onSelectStore={handleSelectStore}
      />

      <PremiumTablesModal
        isOpen={isPremiumTablesOpen}
        onClose={() => setIsPremiumTablesOpen(false)}
      />

      <LunchSubscriptionModal
        isOpen={isLunchSubOpen}
        onClose={() => setIsLunchSubOpen(false)}
      />

      <CookingChefModal
        isOpen={isCookingChefOpen}
        onClose={() => {
          setIsCookingChefOpen(false);
          setCookingChefInitialDish(undefined);
        }}
        initialDishName={cookingChefInitialDish}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
