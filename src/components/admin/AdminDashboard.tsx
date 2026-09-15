import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { StoreModal } from './StoreModal';
import { DriverModal } from './DriverModal';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Bike,
  Store as StoreIcon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  BarChart3,
  Users,
  CreditCard,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  Power,
  MapPin,
  Star,
  Phone,
  AlertCircle
} from 'lucide-react';
import { OrderStatus, Store, DriverProfile } from '../../types';

interface AdminDashboardProps {
  activeTab?: 'overview' | 'orders' | 'couriers' | 'merchants';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab: externalTab = 'overview' }) => {
  const {
    stores,
    orders,
    drivers,
    adminStats,
    addStore,
    updateStore,
    deleteStore,
    addDriver,
    updateDriver,
    deleteDriver,
    setActiveChatOrderId,
    setRatingModalOrderId,
    lang,
    isRtl,
    isDatabaseConnected,
    isSyncing,
    lastSyncTime,
    refreshDatabaseData,
  } = useApp();

  const t = translations[lang];
  const [internalTab, setInternalTab] = useState<'overview' | 'orders' | 'financials' | 'drivers' | 'stores'>('overview');
  
  // Map bottom nav tab to internal tab
  const mappedTab = externalTab === 'couriers' ? 'drivers' : externalTab === 'merchants' ? 'stores' : (externalTab || internalTab);
  const activeTab = mappedTab;
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState('');

  // Store Management State
  const [storeSearch, setStoreSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState<'all' | 'restaurant' | 'grocery' | 'open' | 'closed'>('all');
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);

  // Driver Management State
  const [driverSearch, setDriverSearch] = useState('');
  const [driverFilter, setDriverFilter] = useState<'all' | 'online' | 'busy' | 'offline'>('all');
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverProfile | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<DriverProfile | null>(null);

  const filteredOrders = orders.filter(o => {
    const matchStatus = orderFilter === 'all' || o.status === orderFilter;
    const matchSearch =
      o.trackingNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (lang === 'ar' ? o.storeNameAr : o.storeNameEn).toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredStores = stores.filter(s => {
    const matchType =
      storeFilter === 'all'
        ? true
        : storeFilter === 'open'
        ? s.isOpen
        : storeFilter === 'closed'
        ? !s.isOpen
        : s.type === storeFilter;
    const matchSearch =
      s.nameAr.toLowerCase().includes(storeSearch.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(storeSearch.toLowerCase()) ||
      s.cuisineOrCategoryAr.toLowerCase().includes(storeSearch.toLowerCase()) ||
      s.cuisineOrCategoryEn.toLowerCase().includes(storeSearch.toLowerCase());
    return matchType && matchSearch;
  });

  const filteredDrivers = drivers.filter(d => {
    const matchStatus = driverFilter === 'all' || d.status === driverFilter;
    const matchSearch =
      d.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
      d.phone.includes(driverSearch) ||
      d.vehiclePlate.toLowerCase().includes(driverSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Store CRUD Handlers
  const handleSaveStore = (storeData: Omit<Store, 'id'> | Partial<Store>) => {
    if (editingStore) {
      updateStore(editingStore.id, storeData);
    } else {
      addStore(storeData as Omit<Store, 'id'>);
    }
    setShowStoreModal(false);
    setEditingStore(null);
  };

  const handleConfirmDeleteStore = () => {
    if (deletingStore) {
      deleteStore(deletingStore.id);
      setDeletingStore(null);
    }
  };

  // Driver CRUD Handlers
  const handleSaveDriver = (driverData: Omit<DriverProfile, 'id'> | Partial<DriverProfile>) => {
    if (editingDriver) {
      updateDriver(editingDriver.id, driverData);
    } else {
      addDriver(driverData as Omit<DriverProfile, 'id'>);
    }
    setShowDriverModal(false);
    setEditingDriver(null);
  };

  const handleConfirmDeleteDriver = () => {
    if (deletingDriver) {
      deleteDriver(deletingDriver.id);
      setDeletingDriver(null);
    }
  };

  return (
    <div className="px-3.5 py-3 space-y-3.5 animate-fade-in pb-16">
      
      {/* Admin Header */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-950 to-emerald-950 text-white shadow-md border border-stone-800 space-y-2.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/40 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {t.adminDashboard.systemStatus}: {t.adminDashboard.healthy}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <h1 className="text-sm font-black text-white mt-1">
            {t.adminDashboard.title} 🇧🇬
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
            <p className="text-[10px] text-stone-400">
              {isRtl ? 'مزامنة مباشرة مع قاعدة بيانات MySQL (هوستنجر / PHP)' : 'Live MySQL & PHP REST API Database Sync (Hostinger)'}
            </p>
            <button
              onClick={() => refreshDatabaseData()}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 active:scale-95 text-white text-[10px] font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              title={isRtl ? 'مزامنة وتحديث البيانات من قاعدة البيانات' : 'Sync & reload data from MySQL'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDatabaseConnected ? 'bg-emerald-300' : 'bg-amber-400'} ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (isRtl ? 'جاري المزامنة...' : 'Syncing...') : (isRtl ? 'تحديث من القاعدة' : 'Sync MySQL')}</span>
              {lastSyncTime && <span className="text-[9px] text-emerald-200">({lastSyncTime})</span>}
            </button>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1 overflow-x-auto bg-stone-900/90 p-1 rounded-xl border border-stone-800 no-scrollbar">
          {(['overview', 'orders', 'financials', 'drivers', 'stores'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setInternalTab(tab)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-black whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              {tab === 'overview' && (isRtl ? '📊 نظرة' : '📊 Overview')}
              {tab === 'orders' && (isRtl ? `📦 طلبات (${orders.length})` : `📦 Orders (${orders.length})`)}
              {tab === 'financials' && (isRtl ? '💰 مالية' : '💰 Finance')}
              {tab === 'drivers' && (isRtl ? `🛵 مناديب (${drivers.length})` : `🛵 Drivers (${drivers.length})`)}
              {tab === 'stores' && (isRtl ? `🏬 شركاء (${stores.length})` : `🏬 Stores (${stores.length})`)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-bold">
            <span>{t.adminDashboard.totalRevenue}</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-black text-emerald-700">
              {adminStats.totalPlatformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-bold text-stone-500">€</span>
          </div>
          <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
            +24.8% {isRtl ? 'نمو أسبوعي' : 'growth'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-bold">
            <span>{t.adminDashboard.activeOrders}</span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-black text-stone-900">
              {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}
            </span>
            <span className="text-[10px] font-bold text-stone-500">/ {orders.length}</span>
          </div>
          <span className="text-[9px] text-blue-600 font-semibold block mt-0.5">
            {orders.filter(o => o.status === 'on_the_way').length} {isRtl ? 'في الطريق' : 'in transit'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-bold">
            <span>{t.adminDashboard.driversOnline}</span>
            <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Bike className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-black text-stone-900">
              {adminStats.activeDriversCount}
            </span>
            <span className="text-[10px] font-bold text-stone-500">/ {drivers.length}</span>
          </div>
          <span className="text-[9px] text-amber-600 font-bold block mt-0.5">
            {isRtl ? 'كباتن متصلين' : 'Active drivers'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-[10px] font-bold">
            <span>{t.adminDashboard.successRate}</span>
            <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-black text-purple-700">
              {adminStats.deliverySuccessRate}%
            </span>
          </div>
          <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
            {isRtl ? 'نسبة تسليم قياسية' : 'Success rate'}
          </span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW METRICS */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          
          {/* Operations Quick Board */}
          <div className="space-y-3">
            
            {/* Recent Orders Stream */}
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isRtl ? 'آخر العمليات المباشرة' : 'Live Operations'}</span>
                </h3>
                <button
                  onClick={() => setInternalTab('orders')}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                >
                  {isRtl ? 'عرض الكل' : 'View All'}
                </button>
              </div>

              <div className="divide-y divide-stone-100">
                {orders.slice(0, 4).map((order) => (
                  <div key={order.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-stone-900">
                          #{order.trackingNumber}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'on_the_way'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.tracking.status[order.status]}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 truncate max-w-[170px]">
                        {lang === 'ar' ? order.storeNameAr : order.storeNameEn} → {order.customerName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-700 block">
                        {order.total.toFixed(2)} €
                      </span>
                      <span className="text-[9px] text-stone-400">
                        {order.timestamps.created}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance & Revenue Breakdown */}
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
              <h3 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isRtl ? 'توزيع الإيرادات حسب القطاع' : 'Revenue Distribution'}</span>
              </h3>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-stone-700 mb-1">
                    <span>🍔 {isRtl ? 'المطاعم (62%)' : 'Restaurants (62%)'}</span>
                    <span className="text-emerald-700">{(adminStats.totalPlatformRevenue * 0.62).toFixed(2)} €</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-stone-700 mb-1">
                    <span>🛒 {isRtl ? 'السوبرماركت (38%)' : 'Supermarkets (38%)'}</span>
                    <span className="text-emerald-700">{(adminStats.totalPlatformRevenue * 0.38).toFixed(2)} €</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '38%' }} />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-1 text-[11px]">
                  <div className="flex justify-between text-stone-600">
                    <span>{isRtl ? 'صافي عمولة المنصة (15%):' : 'Platform Fee (15%):'}</span>
                    <span className="font-bold text-stone-900">{(adminStats.totalPlatformRevenue * 0.15).toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>{isRtl ? 'مستحقات المناديب:' : 'Couriers Payouts:'}</span>
                    <span className="font-bold text-stone-900">1,840.00 €</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>{isRtl ? 'مستحقات المتاجر:' : 'Store Settlements:'}</span>
                    <span className="font-bold text-stone-900">10,410.00 €</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="relative w-full">
              <Search className={`w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 text-stone-400 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                placeholder={isRtl ? 'بحث برقم التتبع، اسم المتجر...' : 'Search tracking #, store...'}
                className={`w-full py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-hidden ${
                  isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'
                }`}
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
              {(['all', 'pending', 'preparing', 'on_the_way', 'delivered'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                    orderFilter === st
                      ? 'bg-stone-900 text-white'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {st === 'all' ? (isRtl ? 'الكل' : 'All') : t.tracking.status[st]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-stone-900">
                      #{order.trackingNumber}
                    </span>
                    <span
                      className={`px-2 py-0.2 rounded-full text-[9px] font-black ${
                        order.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'on_the_way'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.tracking.status[order.status]}
                    </span>
                  </div>
                  <span className="font-black text-emerald-700">
                    {order.total.toFixed(2)} €
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-600">
                  <span>🏬 {lang === 'ar' ? order.storeNameAr : order.storeNameEn}</span>
                  <span>👤 {order.customerName}</span>
                </div>

                <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-stone-500">
                    {order.driver ? `🛵 ${order.driver.name}` : (isRtl ? '⏳ قيد التعيين' : '⏳ Unassigned')}
                  </span>
                  <button
                    onClick={() => setActiveChatOrderId(order.id)}
                    className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-bold text-[10px]"
                  >
                    {isRtl ? 'محادثة' : 'Chat'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL REPORTS */}
      {activeTab === 'financials' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
            <h3 className="text-xs font-black text-stone-900">
              {t.adminDashboard.reports}
            </h3>

            <div className="grid grid-cols-1 gap-2">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-500 font-bold">{isRtl ? 'حجم المبيعات الإجمالي (GMV)' : 'Gross Merchandise Value'}</span>
                <p className="text-lg font-black text-stone-900 mt-0.5">14,480.00 €</p>
                <span className="text-[9px] text-emerald-600 font-bold">+31.2% هذا الشهر</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-bold">{isRtl ? 'عمولة المنصة الصافية' : 'Net Platform Commission'}</span>
                <p className="text-lg font-black text-emerald-700 mt-0.5">2,172.00 €</p>
                <span className="text-[9px] text-emerald-600 font-bold">15% متوسط العمولة</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-800 font-bold">{isRtl ? 'مستحقات معلقة للتحويل' : 'Pending Payout Batch'}</span>
                <p className="text-lg font-black text-amber-700 mt-0.5">3,420.00 €</p>
                <span className="text-[9px] text-amber-700 font-bold">{isRtl ? 'موعد الصرف: الخميس القادم' : 'Next Batch: Thursday'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DRIVERS FLEET (CRUD) */}
      {activeTab === 'drivers' && (
        <div className="space-y-3">
          {/* Header Action & Filters */}
          <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-black text-stone-900">
                  {isRtl ? 'إدارة أسطول المناديب في صوفيا' : 'Sofia Courier Fleet'} ({drivers.length})
                </h3>
                <p className="text-[10px] text-stone-500">
                  {isRtl ? 'إضافة، تعديل، إيقاف، وحذف المناديب المسجلين' : 'Add, edit, pause, and manage verified drivers'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingDriver(null);
                  setShowDriverModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إضافة مندوب جديد' : 'Add Courier'}</span>
              </button>
            </div>

            {/* Search and status filter pills */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isRtl ? 'ابحث بالاسم، الهاتف، أو اللوحة...' : 'Search by name, phone, plate...'}
                  value={driverSearch}
                  onChange={(e) => setDriverSearch(e.target.value)}
                  className="w-full ps-8 pe-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {(['all', 'online', 'busy', 'offline'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setDriverFilter(filterKey)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black whitespace-nowrap transition-all border ${
                      driverFilter === filterKey
                        ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {filterKey === 'all' && (isRtl ? 'الكل' : 'All')}
                    {filterKey === 'online' && (isRtl ? '🟢 متصل' : '🟢 Online')}
                    {filterKey === 'busy' && (isRtl ? '🟡 في مهمة' : '🟡 Busy')}
                    {filterKey === 'offline' && (isRtl ? '⚪ استراحة' : '⚪ Offline')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Drivers List */}
          <div className="grid grid-cols-1 gap-2.5">
            {filteredDrivers.map((drv) => (
              <div key={drv.id} className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3 hover:border-amber-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <img
                        src={drv.avatar}
                        alt={drv.name}
                        className="w-11 h-11 rounded-xl object-cover border border-stone-200"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          drv.status === 'online'
                            ? 'bg-emerald-500'
                            : drv.status === 'busy'
                            ? 'bg-amber-500'
                            : 'bg-stone-400'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-stone-900">{drv.name}</h4>
                        <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 text-[9px] font-bold rounded-md border border-amber-200">
                          {drv.vehicleType === 'scooter' ? '🛵 سكوتر' : drv.vehicleType === 'car' ? '🚗 سيارة' : '🚲 دراجة'}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-1">
                        <span>{drv.vehiclePlate}</span>
                        <span>•</span>
                        <Phone className="w-2.5 h-2.5 text-stone-400" />
                        <span>{drv.phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDriver(drv);
                        setShowDriverModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-amber-50 hover:text-amber-700 text-stone-600 transition-colors cursor-pointer"
                      title={isRtl ? 'تعديل بيانات المندوب' : 'Edit Driver'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingDriver(drv)}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-600 transition-colors cursor-pointer"
                      title={isRtl ? 'حذف المندوب' : 'Delete Driver'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Driver Stats */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-stone-100 text-center">
                  <div className="p-1.5 rounded-lg bg-stone-50">
                    <span className="text-[9px] text-stone-400 font-bold block">{isRtl ? 'التقييم' : 'Rating'}</span>
                    <span className="text-xs font-black text-amber-500">★ {drv.rating}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-50">
                    <span className="text-[9px] text-stone-400 font-bold block">{isRtl ? 'الرحلات' : 'Trips'}</span>
                    <span className="text-xs font-black text-stone-900">{drv.totalDeliveries}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-50">
                    <span className="text-[9px] text-stone-400 font-bold block">{isRtl ? 'القبول' : 'Accept'}</span>
                    <span className="text-xs font-black text-emerald-600">{drv.acceptanceRate}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-50">
                    <span className="text-[9px] text-stone-400 font-bold block">{isRtl ? 'الأرباح' : 'Earned'}</span>
                    <span className="text-xs font-black text-emerald-700">{drv.walletBalance.toFixed(1)} €</span>
                  </div>
                </div>

                {/* Quick Status Toggle */}
                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <span className="text-stone-500 font-medium">
                    {isRtl ? 'الحالة الحالية:' : 'Current Shift:'}
                  </span>
                  <div className="flex items-center gap-1">
                    {(['online', 'busy', 'offline'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateDriver(drv.id, { status: st })}
                        className={`px-2 py-0.5 rounded-md font-bold text-[9px] transition-all ${
                          drv.status === st
                            ? st === 'online'
                              ? 'bg-emerald-600 text-white'
                              : st === 'busy'
                              ? 'bg-amber-500 text-white'
                              : 'bg-stone-800 text-white'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                      >
                        {st === 'online' ? (isRtl ? 'متصل' : 'Online') : st === 'busy' ? (isRtl ? 'مهمة' : 'Busy') : (isRtl ? 'استراحة' : 'Offline')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {filteredDrivers.length === 0 && (
              <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-2">
                <p className="text-2xl">🛵</p>
                <p className="text-xs font-black text-stone-800">
                  {isRtl ? 'لم يتم العثور على مناديب يطابقون البحث' : 'No couriers found matching query'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingDriver(null);
                    setShowDriverModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إضافة مندوب جديد' : 'Add Courier'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: STORES & SUPERMARKETS (CRUD) */}
      {activeTab === 'stores' && (
        <div className="space-y-3">
          {/* Header Action & Filters */}
          <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-black text-stone-900">
                  {isRtl ? 'إدارة المتاجر والمطاعم والشركاء' : 'Sofia Stores & Restaurant Partners'} ({stores.length})
                </h3>
                <p className="text-[10px] text-stone-500">
                  {isRtl ? 'إضافة متجر جديد، تعديل الأسعار والأوقات، وحذف الشركاء' : 'Add new stores, edit menus, delivery fees, and catalog'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingStore(null);
                  setShowStoreModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? 'إضافة متجر / مطعم' : 'Add Store'}</span>
              </button>
            </div>

            {/* Search and category filter pills */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute start-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={isRtl ? 'ابحث باسم المتجر أو المطبخ...' : 'Search store or cuisine...'}
                  value={storeSearch}
                  onChange={(e) => setStoreSearch(e.target.value)}
                  className="w-full ps-8 pe-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {(['all', 'restaurant', 'grocery', 'open', 'closed'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    type="button"
                    onClick={() => setStoreFilter(filterKey)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black whitespace-nowrap transition-all border ${
                      storeFilter === filterKey
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {filterKey === 'all' && (isRtl ? 'الكل' : 'All')}
                    {filterKey === 'restaurant' && (isRtl ? '🍔 مطاعم' : '🍔 Restaurants')}
                    {filterKey === 'grocery' && (isRtl ? '🛒 سوبرماركت' : '🛒 Grocery')}
                    {filterKey === 'open' && (isRtl ? '🟢 مفتوح' : '🟢 Open')}
                    {filterKey === 'closed' && (isRtl ? '🔴 مغلق' : '🔴 Closed')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stores List */}
          <div className="grid grid-cols-1 gap-2.5">
            {filteredStores.map((st) => (
              <div key={st.id} className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3 hover:border-emerald-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={st.image}
                      alt={st.nameAr}
                      className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-stone-900">
                          {lang === 'ar' ? st.nameAr : st.nameEn}
                        </h4>
                        <span className="px-1.5 py-0.2 bg-stone-100 text-stone-700 text-[9px] font-bold rounded-md">
                          {st.type === 'restaurant' ? (isRtl ? '🍔 مطعم' : '🍔 Restaurant') : (isRtl ? '🛒 بقالة' : '🛒 Grocery')}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {lang === 'ar' ? st.cuisineOrCategoryAr : st.cuisineOrCategoryEn}
                      </p>
                      <p className="text-[9px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5 text-stone-400" />
                        <span>{lang === 'ar' ? st.addressAr : st.addressEn}</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStore(st);
                        setShowStoreModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-700 text-stone-600 transition-colors cursor-pointer"
                      title={isRtl ? 'تعديل بيانات المتجر' : 'Edit Store'}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingStore(st)}
                      className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-600 transition-colors cursor-pointer"
                      title={isRtl ? 'حذف المتجر' : 'Delete Store'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metrics Bar */}
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-stone-100 text-center">
                  <div className="p-1.5 rounded-lg bg-stone-50">
                    <span className="text-[9px] text-stone-400 font-bold block">{isRtl ? 'التقييم' : 'Rating'}</span>
                    <span className="text-xs font-black text-amber-500">★ {st.rating} ({st.reviewCount})</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-50">
                    <span className="text-[9px] text-stone-400 font-bold block">{isRtl ? 'التوصيل' : 'Fee'}</span>
                    <span className="text-xs font-black text-stone-900">{st.deliveryFee.toFixed(2)} €</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-50">
                    <span className="text-[9px] text-stone-400 font-bold block">{isRtl ? 'الوقت' : 'Time'}</span>
                    <span className="text-xs font-black text-stone-900">{st.deliveryTimeMin}-{st.deliveryTimeMax}د</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-stone-50">
                    <span className="text-[9px] text-stone-400 font-bold block">{isRtl ? 'الحد الأدنى' : 'Min'}</span>
                    <span className="text-xs font-black text-stone-900">{st.minOrder} €</span>
                  </div>
                </div>

                {/* Quick Status Toggle */}
                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <span className="text-stone-500 font-medium">
                    {isRtl ? 'استقبال الطلبات:' : 'Accepting Orders:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateStore(st.id, { isOpen: !st.isOpen })}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer ${
                      st.isOpen
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${st.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span>{st.isOpen ? (isRtl ? 'مفتوح ويستقبل طلبات' : 'Open & Live') : (isRtl ? 'مغلق حالياً' : 'Currently Closed')}</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredStores.length === 0 && (
              <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center space-y-2">
                <p className="text-2xl">🏬</p>
                <p className="text-xs font-black text-stone-800">
                  {isRtl ? 'لم يتم العثور على متاجر تطابق البحث' : 'No stores found matching query'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingStore(null);
                    setShowStoreModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'إضافة متجر جديد' : 'Add Store'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STORE CREATE / EDIT MODAL */}
      {showStoreModal && (
        <StoreModal
          store={editingStore}
          onClose={() => {
            setShowStoreModal(false);
            setEditingStore(null);
          }}
          onSave={handleSaveStore}
          isRtl={isRtl}
        />
      )}

      {/* DRIVER CREATE / EDIT MODAL */}
      {showDriverModal && (
        <DriverModal
          driver={editingDriver}
          onClose={() => {
            setShowDriverModal(false);
            setEditingDriver(null);
          }}
          onSave={handleSaveDriver}
          isRtl={isRtl}
        />
      )}

      {/* DELETE STORE CONFIRMATION DIALOG */}
      {deletingStore && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-stone-900">
              {isRtl ? 'تأكيد حذف المتجر' : 'Confirm Store Deletion'}
            </h3>
            <p className="text-xs text-stone-500">
              {isRtl
                ? `هل أنت متأكد من رغبتك في حذف متجر "${deletingStore.nameAr}" وجميع منتجاته من المنصة نهائياً؟`
                : `Are you sure you want to remove "${deletingStore.nameEn}" and its catalog from Sofia platform?`}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingStore(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStore}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-md"
              >
                {isRtl ? 'نعم، احذف المتجر' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE DRIVER CONFIRMATION DIALOG */}
      {deletingDriver && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-stone-900">
              {isRtl ? 'تأكيد حذف المندوب' : 'Confirm Courier Deletion'}
            </h3>
            <p className="text-xs text-stone-500">
              {isRtl
                ? `هل أنت متأكد من رغبتك في حذف الكابتن "${deletingDriver.name}" (لوحة ${deletingDriver.vehiclePlate}) من أسطول التوصيل؟`
                : `Are you sure you want to remove courier "${deletingDriver.name}" (${deletingDriver.vehiclePlate}) from delivery fleet?`}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDriver(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDriver}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer shadow-md"
              >
                {isRtl ? 'نعم، احذف المندوب' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
