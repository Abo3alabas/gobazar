import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { AddProductModal } from './AddProductModal';
import { IncomingMerchantOrderModal } from './IncomingMerchantOrderModal';
import {
  Store as StoreIcon,
  ChefHat,
  Clock,
  DollarSign,
  ShoppingBag,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ToggleLeft,
  ToggleRight,
  Flame,
  Search,
  ArrowRight,
  Bike,
  Sparkles,
  Timer,
  UserCheck,
  PackageCheck,
  Volume2
} from 'lucide-react';
import { Order } from '../../types';

interface MerchantAppProps {
  activeTab?: 'kitchen' | 'menu' | 'sales' | 'store';
}

export const MerchantApp: React.FC<MerchantAppProps> = ({ activeTab: externalTab = 'kitchen' }) => {
  const {
    stores,
    products,
    orders,
    merchantAcceptOrder,
    merchantMarkReady,
    merchantHandoverToDriver,
    toggleProductAvailability,
    merchantIncomingOrder,
    setMerchantIncomingOrder,
    lang,
    isRtl
  } = useApp();

  const t = translations[lang];

  // Current active merchant store selection
  const [selectedStoreId, setSelectedStoreId] = useState<string>(stores[0].id);
  const [internalTab, setInternalTab] = useState<'kitchen' | 'menu' | 'sales' | 'store'>('kitchen');
  const activeTab = externalTab || internalTab;
  const [showAddModal, setShowAddModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);

  // In-card quick prep time selector state (orderId -> minutes)
  const [cardPrepTimes, setCardPrepTimes] = useState<Record<string, number>>({});

  const currentStore = stores.find(s => s.id === selectedStoreId) || stores[0];
  const storeOrders = orders.filter(o => o.storeId === currentStore.id);
  const storeProducts = products.filter(p => p.storeId === currentStore.id);

  // Group orders for kitchen kanban board
  const newOrders = storeOrders.filter(o => o.status === 'pending');
  const preparingOrders = storeOrders.filter(o => o.status === 'preparing');
  const readyOrders = storeOrders.filter(o => o.status === 'ready_for_pickup' || o.status === 'driver_assigned');
  const onWayOrders = storeOrders.filter(o => o.status === 'on_the_way');
  const completedOrders = storeOrders.filter(o => o.status === 'delivered');

  const todayRevenue = storeOrders.reduce((sum, o) => o.status !== 'cancelled' ? sum + o.total : sum, 0);

  const activeIncomingOrder = merchantIncomingOrder && merchantIncomingOrder.storeId === currentStore.id
    ? merchantIncomingOrder
    : selectedOrderForModal;

  const handleCardAccept = (order: Order) => {
    const chosenMins = cardPrepTimes[order.id] || order.prepTimeMinutes || 15;
    merchantAcceptOrder(order.id, chosenMins);
  };

  return (
    <div className="px-3.5 py-3 space-y-3.5 animate-fade-in pb-16">
      
      {/* Merchant Incoming Order Modal Popup */}
      {activeIncomingOrder && (
        <IncomingMerchantOrderModal
          order={activeIncomingOrder}
          onClose={() => {
            setMerchantIncomingOrder(null);
            setSelectedOrderForModal(null);
          }}
        />
      )}

      {/* Merchant Header & Store Selector */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 text-white shadow-md border border-stone-800 space-y-2.5">
        <div className="flex items-center gap-3">
          <img
            src={currentStore.image}
            alt={currentStore.nameAr}
            className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shadow-xs bg-white shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/40">
                {currentStore.type === 'restaurant' ? (isRtl ? 'مطعم شريك 🇧🇬' : 'Partner Restaurant 🇧🇬') : (isRtl ? 'بقالة شريكة 🇧🇬' : 'Partner Grocery 🇧🇬')}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-sm font-black text-white truncate mt-0.5">
              {lang === 'ar' ? currentStore.nameAr : currentStore.nameEn}
            </h1>
            <p className="text-[11px] text-stone-400 truncate">
              {lang === 'ar' ? currentStore.addressAr : currentStore.addressEn}
            </p>
          </div>
        </div>

        {/* Switch store dropdown */}
        <div className="flex items-center gap-2 pt-1 border-t border-stone-800">
          <label className="text-[11px] text-stone-400 font-bold shrink-0">
            {isRtl ? 'المتجر:' : 'Store:'}
          </label>
          <select
            value={selectedStoreId}
            onChange={e => setSelectedStoreId(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl bg-stone-800 text-stone-200 text-xs font-bold border border-stone-700 focus:outline-hidden focus:border-emerald-500"
          >
            {stores.map(s => (
              <option key={s.id} value={s.id}>
                {lang === 'ar' ? s.nameAr : s.nameEn} ({s.type === 'restaurant' ? '🍔' : '🛒'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold text-stone-500 block">{t.merchantApp.ordersCount}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-stone-900">{storeOrders.length}</span>
            <span className="text-[10px] text-stone-500 font-bold">{isRtl ? 'طلب' : 'orders'}</span>
          </div>
          <span className="text-[9px] text-emerald-600 font-semibold block">
            {newOrders.length + preparingOrders.length} {isRtl ? 'نشطة الآن بالمطبخ' : 'active now'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold text-stone-500 block">{t.merchantApp.salesTotal}</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-emerald-700">{todayRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-stone-500 font-bold">€</span>
          </div>
          <span className="text-[9px] text-stone-400 block">
            {isRtl ? 'مبيعات اليوم' : 'Gross revenue'}
          </span>
        </div>
      </div>

      {/* Main Mode Tabs: Kitchen Board vs Products Catalog */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setInternalTab('kitchen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'kitchen'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>{t.merchantApp.liveBoard}</span>
            {newOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black animate-pulse">
                {newOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setInternalTab('menu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'menu'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{t.merchantApp.menuManagement}</span>
          </button>
        </div>

        {activeTab === 'menu' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.merchantApp.addNewItem}</span>
          </button>
        )}
      </div>

      {/* 1. Kitchen Kanban Board View */}
      {activeTab === 'kitchen' && (
        <div className="space-y-4">
          
          {/* Column 1: New Incoming Orders */}
          <div className="space-y-2.5">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                {t.merchantApp.columns.new}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-black">
                {newOrders.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {newOrders.length === 0 ? (
                <p className="text-center text-xs text-stone-400 py-4 bg-white rounded-xl border border-dashed border-stone-200">
                  {isRtl ? 'لا توجد طلبات جديدة معلقة' : 'No new pending orders'}
                </p>
              ) : (
                newOrders.map((order) => {
                  const currentMins = cardPrepTimes[order.id] || order.prepTimeMinutes || 15;
                  return (
                    <div
                      key={order.id}
                      className="p-3 rounded-2xl bg-white border-2 border-amber-400 shadow-xs space-y-2.5 animate-pulse-ring"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-black text-stone-900 block">
                            #{order.trackingNumber}
                          </span>
                          <span className="text-[10px] text-stone-400">
                            {order.customerName}
                          </span>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold">
                          {order.timestamps.created}
                        </span>
                      </div>

                      <div className="space-y-1 divide-y divide-stone-100 text-xs">
                        {order.items.map((item) => (
                          <div key={item.id} className="pt-1 flex justify-between">
                            <span className="font-bold text-stone-800">
                              {item.quantity}x {lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                            </span>
                            <span className="text-stone-500 font-semibold">{item.totalPrice.toFixed(2)} €</span>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <p className="text-[10px] p-1.5 bg-amber-50 text-amber-900 rounded-lg">
                          📝 {order.notes}
                        </p>
                      )}

                      {/* In-Card Quick Prep Time Selector */}
                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-stone-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {isRtl ? 'وقت التجهيز المقدر:' : 'Prep Duration:'}
                          </span>
                          <span className="font-black text-emerald-700">{currentMins} {t.store.mins}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {[10, 15, 20, 30].map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setCardPrepTimes(prev => ({ ...prev, [order.id]: m }))}
                              className={`py-1 rounded-lg text-[10px] font-black border transition-colors ${
                                currentMins === m
                                  ? 'bg-amber-500 text-white border-amber-600'
                                  : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
                              }`}
                            >
                              {m}m
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForModal(order)}
                          className="px-2.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors shrink-0"
                          title={isRtl ? 'مراجعة وتخصيص' : 'Review & Customize'}
                        >
                          👁️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCardAccept(order)}
                          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1"
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          <span>{t.merchantApp.acceptPrep} ({currentMins}m)</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: In Preparation */}
          <div className="space-y-2.5">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-blue-600" />
                {t.merchantApp.columns.preparing}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-900 text-[11px] font-black">
                {preparingOrders.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {preparingOrders.length === 0 ? (
                <p className="text-center text-xs text-stone-400 py-4 bg-white rounded-xl border border-dashed border-stone-200">
                  {isRtl ? 'لا توجد طلبات قيد التجهيز' : 'No orders in prep'}
                </p>
              ) : (
                preparingOrders.map((order) => {
                  const prepTime = order.prepTimeMinutes || 15;
                  return (
                    <div
                      key={order.id}
                      className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-stone-900">
                          #{order.trackingNumber}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <Timer className="w-3 h-3 text-blue-500" />
                          {prepTime} {t.store.mins}
                        </span>
                      </div>

                      {/* Prep timer indicator */}
                      <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-[11px]">
                        <span className="text-blue-900 font-bold flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          {isRtl ? 'المطبخ شغال بالتحضير' : 'In Kitchen cooking'}
                        </span>
                        <span className="font-black text-blue-800">
                          ~{prepTime} {t.store.mins}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-xs">
                        {order.items.map((item) => (
                          <p key={item.id} className="text-stone-700 font-semibold">
                            • {item.quantity}x {lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                          </p>
                        ))}
                      </div>

                      <button
                        onClick={() => merchantMarkReady(order.id)}
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>{t.merchantApp.readyForPickup}</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 3: Ready for Pickup & On the Way */}
          <div className="space-y-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-emerald-600" />
                {t.merchantApp.columns.ready} / {t.merchantApp.columns.onWay}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[11px] font-black">
                {readyOrders.length + onWayOrders.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {[...readyOrders, ...onWayOrders].length === 0 ? (
                <p className="text-center text-xs text-stone-400 py-4 bg-white rounded-xl border border-dashed border-stone-200">
                  {isRtl ? 'لا توجد طلبات جاهزة للاستلام' : 'No orders ready'}
                </p>
              ) : (
                [...readyOrders, ...onWayOrders].map((order) => {
                  const isHandedOver = order.status === 'on_the_way';
                  return (
                    <div
                      key={order.id}
                      className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-stone-900">
                          #{order.trackingNumber}
                        </span>
                        <span className="text-xs font-bold text-emerald-700">
                          {order.total.toFixed(2)} €
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-2 text-xs">
                        <Bike className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-stone-800 block text-[11px]">
                            {order.driver ? order.driver.name : (isRtl ? 'الكابتن في الطريق للاستلام' : 'Courier heading to store')}
                          </span>
                        </div>
                      </div>

                      {!isHandedOver ? (
                        <button
                          type="button"
                          onClick={() => merchantHandoverToDriver(order.id)}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{t.merchantApp.handoverToDriver}</span>
                        </button>
                      ) : (
                        <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-center text-[11px] font-bold border border-emerald-200 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{t.merchantApp.handoverSuccess}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* 2. Menu Catalog Management Tab */}
      {activeTab === 'menu' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={isRtl ? 'بحث في أصناف القائمة...' : 'Search menu items...'}
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 rounded-xl bg-white border border-stone-200 text-xs font-medium focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {storeProducts
              .filter(p => (lang === 'ar' ? p.nameAr : p.nameEn).toLowerCase().includes(productSearch.toLowerCase()))
              .map((product) => (
                <div
                  key={product.id}
                  className={`p-2.5 rounded-2xl bg-white border transition-all ${
                    product.isAvailable
                      ? 'border-stone-200 shadow-2xs'
                      : 'border-stone-200 bg-stone-50/80 opacity-60'
                  }`}
                >
                  <img
                    src={product.image}
                    alt={product.nameAr}
                    className="w-full h-24 rounded-xl object-cover mb-2"
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-[11px] font-black text-stone-900 line-clamp-1">
                        {lang === 'ar' ? product.nameAr : product.nameEn}
                      </h4>
                      <span className="text-[11px] font-black text-emerald-700 shrink-0">
                        {product.price.toFixed(2)} €
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 line-clamp-1">
                      {lang === 'ar' ? product.descriptionAr : product.descriptionEn}
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between">
                    <span className={`text-[9px] font-black ${product.isAvailable ? 'text-emerald-700' : 'text-stone-400'}`}>
                      {product.isAvailable ? t.merchantApp.available : t.merchantApp.outOfStock}
                    </span>
                    <button
                      onClick={() => toggleProductAvailability(product.id)}
                      className="p-0.5 text-stone-400 hover:text-emerald-600 transition-colors"
                      title={t.merchantApp.toggleStock}
                    >
                      {product.isAvailable ? (
                        <ToggleRight className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-stone-300" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 3. Sales & Analytics Tab */}
      {activeTab === 'sales' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-900 to-stone-950 text-white shadow-md space-y-2">
            <span className="text-xs text-blue-300 font-bold block">{t.merchantApp.todaySales}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black">{todayRevenue.toFixed(2)}</span>
              <span className="text-base font-bold text-blue-400">€</span>
            </div>
            <p className="text-[10px] text-stone-300">
              {isRtl ? 'إجمالي الطلبات المستلمة اليوم: ' : 'Total orders received today: '}{storeOrders.length} {isRtl ? 'طلب' : 'orders'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-bold text-stone-500 block">{isRtl ? 'متوسط وقت التحضير' : 'Avg Prep Time'}</span>
              <span className="text-base font-black text-stone-900">14 {t.store.mins}</span>
              <span className="text-[9px] text-emerald-600 block mt-0.5">⚡ {isRtl ? 'أسرع من المعدل' : 'Fast prep rate'}</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
              <span className="text-[10px] font-bold text-stone-500 block">{isRtl ? 'نسبة القبول' : 'Acceptance Rate'}</span>
              <span className="text-base font-black text-emerald-700">99.4%</span>
              <span className="text-[9px] text-stone-400 block mt-0.5">{isRtl ? 'متجر معتمد' : 'Verified Partner'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Store Information & Settings Tab */}
      {activeTab === 'store' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2.5">
              <img
                src={currentStore.image}
                alt={currentStore.nameAr}
                className="w-12 h-12 rounded-xl object-cover border border-stone-200"
              />
              <div>
                <h3 className="text-xs font-black text-stone-900">
                  {lang === 'ar' ? currentStore.nameAr : currentStore.nameEn}
                </h3>
                <p className="text-[11px] text-stone-500">
                  {lang === 'ar' ? currentStore.cuisineOrCategoryAr : currentStore.cuisineOrCategoryEn}
                </p>
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  ★ {currentStore.rating} ({currentStore.ratingCount} {isRtl ? 'تقييم' : 'ratings'})
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">{isRtl ? 'العنوان في صوفيا:' : 'Sofia Address:'}</span>
                <span className="font-bold text-stone-800">{lang === 'ar' ? currentStore.addressAr : currentStore.addressEn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{isRtl ? 'وقت التوصيل التقديري:' : 'Delivery ETA:'}</span>
                <span className="font-bold text-stone-800">{currentStore.deliveryTimeMin}-{currentStore.deliveryTimeMax} {t.store.mins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{isRtl ? 'رسوم التوصيل:' : 'Delivery Fee:'}</span>
                <span className="font-bold text-stone-800">{currentStore.deliveryFee === 0 ? (isRtl ? 'مجاني' : 'Free') : `${currentStore.deliveryFee.toFixed(2)} €`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">{isRtl ? 'الحد الأدنى للطلب:' : 'Min Order:'}</span>
                <span className="font-bold text-stone-800">{currentStore.minOrder.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          storeId={currentStore.id}
          onClose={() => setShowAddModal(false)}
        />
      )}

    </div>
  );
};
