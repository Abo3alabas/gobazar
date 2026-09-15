import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { Store, StoreCategoryType } from '../../types';
import { apiService } from '../../services/api';
import { OrderTogetherModal } from './OrderTogetherModal';
import { AIConciergeModal } from './AIConciergeModal';
import { SmartWalkInModal } from './SmartWalkInModal';
import { FoodGiftCardModal } from './FoodGiftCardModal';
import { LunchSubscriptionModal } from './LunchSubscriptionModal';
import { PremiumTablesModal } from './PremiumTablesModal';
import {
  Utensils,
  ShoppingBag,
  Search,
  Star,
  Clock,
  Bike,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Navigation,
  Users,
  Gift,
  Crown,
  Footprints,
  Calendar,
  Edit3,
  MapPin,
  Check,
  ChefHat
} from 'lucide-react';

interface CustomerHomeProps {
  onSelectStore: (store: Store) => void;
  onOpenTracking: (orderId: string) => void;
  onOpenAIAssistant?: () => void;
  onOpenCookingChef?: (dishName?: string) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onSelectStore,
  onOpenTracking,
  onOpenAIAssistant,
  onOpenCookingChef,
}) => {
  const { stores, orders, activeTrackingOrderId, lang, isRtl } = useApp();
  const t = translations[lang];

  const [activeSection, setActiveSection] = useState<StoreCategoryType>('restaurant');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFreeDelivery, setFilterFreeDelivery] = useState(false);
  const [filterTopRated, setFilterTopRated] = useState(false);
  const [filterFastest, setFilterFastest] = useState(false);

  // Active Hero Feature Slide: 'order_together' or 'cooking_chef'
  const [heroSlide, setHeroSlide] = useState<'order_together' | 'cooking_chef'>('order_together');

  // Smart Features Modals State
  const [isOrderTogetherOpen, setIsOrderTogetherOpen] = useState(false);
  const [isAIConciergeOpen, setIsAIConciergeOpen] = useState(false);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);
  const [isLunchSubOpen, setIsLunchSubOpen] = useState(false);
  const [isPremiumTablesOpen, setIsPremiumTablesOpen] = useState(false);

  // 60-Second Quick Modify Window for Active Order
  const [modifySecondsLeft, setModifySecondsLeft] = useState(54);
  const [isQuickEditing, setIsQuickEditing] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const [quickModifySuccess, setQuickModifySuccess] = useState(false);

  useEffect(() => {
    if (modifySecondsLeft > 0) {
      const timer = setInterval(() => {
        setModifySecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [modifySecondsLeft]);

  // Active ongoing order
  const activeOrder = orders.find(o => o.id === activeTrackingOrderId && o.status !== 'delivered' && o.status !== 'cancelled') ||
    orders.find(o => o.status !== 'delivered' && o.status !== 'cancelled');

  const handleSaveQuickModify = async () => {
    if (!activeOrder) return;
    try {
      await apiService.quickModifyOrder(activeOrder.id, { notes: quickNote });
      activeOrder.notes = quickNote;
      setQuickModifySuccess(true);
      setIsQuickEditing(false);
      setTimeout(() => setQuickModifySuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Categories list for restaurants vs groceries
  const restaurantCategories = [
    { id: 'all', name: t.categories.all, icon: '✨' },
    { id: 'shawarma', name: t.categories.shawarma, icon: '🌯' },
    { id: 'burgers', name: t.categories.burgers, icon: '🍔' },
    { id: 'pizza', name: t.categories.pizza, icon: '🍕' },
    { id: 'healthy', name: t.categories.healthy, icon: '🥗' },
    { id: 'desserts', name: t.categories.desserts, icon: '🍰' },
  ];

  const groceryCategories = [
    { id: 'all', name: t.categories.all, icon: '✨' },
    { id: 'supermarket', name: t.categories.supermarket, icon: '🏬' },
    { id: 'fruitsVeg', name: t.categories.fruitsVeg, icon: '🍎' },
    { id: 'meat', name: t.categories.meat, icon: '🥩' },
    { id: 'dairy', name: t.categories.dairy, icon: '🧀' },
    { id: 'bakery', name: t.categories.bakery, icon: '🥐' },
    { id: 'beverages', name: t.categories.beverages, icon: '🧃' },
  ];

  const activeCategoryList = activeSection === 'restaurant' ? restaurantCategories : groceryCategories;

  // Filtered stores
  const filteredStores = stores.filter(store => {
    if (store.type !== activeSection) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (lang === 'ar' ? store.nameAr : store.nameEn).toLowerCase().includes(q);
      const matchCuisine = (lang === 'ar' ? store.cuisineOrCategoryAr : store.cuisineOrCategoryEn).toLowerCase().includes(q);
      const matchTags = (lang === 'ar' ? store.tagsAr : store.tagsEn).some(tag => tag.toLowerCase().includes(q));
      if (!matchName && !matchCuisine && !matchTags) return false;
    }

    if (filterFreeDelivery && store.deliveryFee > 0) return false;
    if (filterTopRated && store.rating < 4.8) return false;
    if (filterFastest && store.deliveryTimeMax > 25) return false;

    return true;
  });

  return (
    <div className="px-3.5 py-3 space-y-3 animate-fade-in pb-12 max-w-lg mx-auto">
      
      {/* 1. TOP HEADER: Delivery Address & Sofia Region */}
      <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-2xl border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[11px] text-stone-400 font-bold">
              <span>{isRtl ? 'التوصيل إلى' : 'Deliver to'}</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </div>
            <span className="text-xs font-black text-stone-900 leading-tight truncate block">
              {isRtl ? 'صوفيا، حي لوزينيتس' : 'Sofia, Lozenets District'}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100/80 px-2.5 py-1 rounded-xl shrink-0">
          🇧🇬 صوفيا
        </span>
      </div>

      {/* 2. UNIFIED ACTIVE ORDER & 60-SEC QUICK MODIFY STATUS (If active order exists) */}
      {activeOrder && (
        <div className="rounded-2xl bg-stone-900 text-white p-3 border border-stone-800 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div
              onClick={() => onOpenTracking(activeOrder.id)}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 relative shadow-xs">
                <Bike className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-emerald-400">
                    {isRtl ? 'قيد التوصيل الآن' : 'In Transit'}
                  </span>
                  <span className="text-[9px] font-mono text-stone-400">
                    #{activeOrder.trackingNumber}
                  </span>
                </div>
                <h4 className="text-xs font-black text-white truncate mt-0.5 group-hover:text-emerald-300 transition-colors">
                  {lang === 'ar' ? activeOrder.storeNameAr : activeOrder.storeNameEn}
                </h4>
              </div>
            </div>

            <button
              onClick={() => onOpenTracking(activeOrder.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black shrink-0 transition-all shadow-xs cursor-pointer"
            >
              <Navigation className="w-3 h-3" />
              <span>{t.tracking.title} (~{activeOrder.estimatedDeliveryMinutes} {t.store.mins})</span>
            </button>
          </div>

          {/* Integrated 60-Second Modification Bar */}
          {modifySecondsLeft > 0 && (
            <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span>
                  {isRtl
                    ? `تعديل الملاحظات متاح (${modifySecondsLeft}ث)`
                    : `Modify notes open (${modifySecondsLeft}s)`}
                </span>
              </div>
              <button
                onClick={() => {
                  setQuickNote(activeOrder.notes || '');
                  setIsQuickEditing(!isQuickEditing);
                }}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                {isQuickEditing ? (isRtl ? 'إغلاق' : 'Close') : (isRtl ? 'تعديل الملاحظات' : 'Edit Notes')}
              </button>
            </div>
          )}

          {/* Inline Edit Notes Input */}
          {isQuickEditing && (
            <div className="pt-2 border-t border-stone-800 space-y-2">
              <input
                type="text"
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder={isRtl ? 'مثال: يرجى زيادة الثومية وتسليم الطلب عند الباب...' : 'e.g. Extra sauce, leave at door...'}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-stone-800 border border-stone-700 font-bold text-white focus:border-amber-400 focus:outline-hidden"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSaveQuickModify}
                  className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-[11px] font-black cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  <span>{isRtl ? 'حفظ التعديل' : 'Save'}</span>
                </button>
              </div>
            </div>
          )}

          {quickModifySuccess && (
            <p className="text-[10px] font-bold text-emerald-400">
              ✓ {isRtl ? 'تم تحديث تفاصيل طلبك بنجاح!' : 'Order updated successfully!'}
            </p>
          )}
        </div>
      )}

      {/* 3. HERO SPOTLIGHT CAROUSEL: Order Together OR Cooking Chef */}
      <div className="rounded-2xl overflow-hidden border shadow-xs transition-all duration-300">
        {/* Toggle Pill at Top of Hero */}
        <div className="bg-stone-900/95 px-3 py-1.5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setHeroSlide('order_together')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                heroSlide === 'order_together'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>{isRtl ? 'الطلب الجماعي' : 'Order Together'}</span>
            </button>

            <button
              onClick={() => setHeroSlide('cooking_chef')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                heroSlide === 'cooking_chef'
                  ? 'bg-amber-500 text-stone-950 shadow-2xs'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <ChefHat className="w-3 h-3" />
              <span>{isRtl ? 'شيف الطبخ' : 'Cooking Chef'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full transition-all ${heroSlide === 'order_together' ? 'bg-emerald-400 w-3' : 'bg-stone-600'}`} />
            <span className={`w-1.5 h-1.5 rounded-full transition-all ${heroSlide === 'cooking_chef' ? 'bg-amber-400 w-3' : 'bg-stone-600'}`} />
          </div>
        </div>

        {/* Hero Card Body */}
        {heroSlide === 'order_together' ? (
          <div className="p-3.5 bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-800 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-200 text-[10px] font-bold">
                <MapPin className="w-3 h-3 text-amber-300" />
                <span>{isRtl ? 'نطاق 1 كم نشط' : '1 km active radius'}</span>
              </span>
              <span className="text-[10px] font-bold text-amber-300">
                {isRtl ? 'وفر رسوم التوصيل' : 'Split delivery fees'}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-white leading-tight">
                {isRtl ? 'الطلب الجماعي مع من حولك (Order Together)' : 'Group Ordering (Order Together)'}
              </h3>
              <p className="text-[11px] text-emerald-100 font-medium leading-relaxed mt-0.5">
                {isRtl
                  ? 'اطلب مع أصدقائك أو جيرانك في نفس البناية أو المحيط، وشارك الرابط عبر وتساب لسائق واحد!'
                  : 'Order together with colleagues or neighbors within 1 km and split delivery costs!'}
              </p>
            </div>

            <div className="pt-0.5">
              <button
                onClick={() => setIsOrderTogetherOpen(true)}
                className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>{isRtl ? 'بدء طلب جماعي الآن' : 'Start Order Together'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-950/25 text-amber-100 text-[10px] font-bold">
                <ChefHat className="w-3 h-3 text-white" />
                <span>{isRtl ? 'مساعد الطبخ التفاعلي' : 'Interactive Recipe Assistant'}</span>
              </span>
              <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
                {isRtl ? 'شراء النواقص فوري' : 'Instant Missing Items'}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-black text-white leading-tight">
                {isRtl ? 'شيف الطبخ: مقادير الأكلات وشراء النواقص' : 'Recipe Chef & Missing Ingredients'}
              </h3>
              <p className="text-[11px] text-amber-100 font-medium leading-relaxed mt-0.5">
                {isRtl
                  ? 'اكتب أي أكلة أو صوّر محتويات ثلاجتك! نجهز مقاديرها ونضيف النواقص لسلتك بنقرة واحدة.'
                  : 'Pick any dish or snap your fridge! Get ingredients, auto-cart missing items, and cook step-by-step.'}
              </p>
            </div>

            {/* Quick Dish Suggestions */}
            <div className="flex items-center gap-1 flex-wrap pt-0.5">
              {[
                { ar: 'باستا ألفريدو', en: 'Alfredo' },
                { ar: 'كبسة دجاج', en: 'Kabsa' },
                { ar: 'بيتزا مارغريتا', en: 'Pizza' },
              ].map((dish, i) => (
                <button
                  key={i}
                  onClick={() => onOpenCookingChef && onOpenCookingChef(dish.ar)}
                  className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold transition-all cursor-pointer"
                >
                  {lang === 'ar' ? dish.ar : dish.en}
                </button>
              ))}
            </div>

            <div className="pt-0.5">
              <button
                onClick={() => onOpenCookingChef && onOpenCookingChef()}
                className="w-full py-2 rounded-xl bg-stone-950 hover:bg-stone-900 text-white text-xs font-black shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                <span>{isRtl ? 'فتح شيف ومساعد الطبخ' : 'Open Cooking Chef'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. QUICK SERVICES DOCK: 4 Symmetric, Elegant Feature Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => setIsWalkInOpen(true)}
          className="p-2 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-xs transition-all text-center cursor-pointer flex flex-col items-center justify-center group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm mb-1 group-hover:scale-105 transition-transform">
            🚶‍♂️
          </div>
          <span className="text-[11px] font-black text-stone-800 leading-tight">
            {isRtl ? 'استلام فوري' : 'Walk-In'}
          </span>
          <span className="text-[9px] text-stone-400 mt-0.2 truncate">
            {isRtl ? 'بدون طابور' : 'No Waiting'}
          </span>
        </button>

        <button
          onClick={() => setIsLunchSubOpen(true)}
          className="p-2 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-xs transition-all text-center cursor-pointer flex flex-col items-center justify-center group"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm mb-1 group-hover:scale-105 transition-transform">
            🍱
          </div>
          <span className="text-[11px] font-black text-stone-800 leading-tight">
            {isRtl ? 'باقة الغداء' : 'Lunch Plan'}
          </span>
          <span className="text-[9px] text-stone-400 mt-0.2 truncate">
            {isRtl ? '20 وجبة' : '20 Meals'}
          </span>
        </button>

        <button
          onClick={() => setIsPremiumTablesOpen(true)}
          className="p-2 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-xs transition-all text-center cursor-pointer flex flex-col items-center justify-center group"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm mb-1 group-hover:scale-105 transition-transform">
            👑
          </div>
          <span className="text-[11px] font-black text-stone-800 leading-tight">
            {isRtl ? 'طاولات VIP' : 'VIP Tables'}
          </span>
          <span className="text-[9px] text-stone-400 mt-0.2 truncate">
            {isRtl ? 'حجز تراس' : 'Lounges'}
          </span>
        </button>

        <button
          onClick={() => setIsGiftCardOpen(true)}
          className="p-2 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-xs transition-all text-center cursor-pointer flex flex-col items-center justify-center group"
        >
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm mb-1 group-hover:scale-105 transition-transform">
            🎁
          </div>
          <span className="text-[11px] font-black text-stone-800 leading-tight">
            {isRtl ? 'إهداء وجبة' : 'Gift Cards'}
          </span>
          <span className="text-[9px] text-stone-400 mt-0.2 truncate">
            {isRtl ? 'كرت لصديق' : 'Gift Meal'}
          </span>
        </button>
      </div>

      {/* 5. MODERN SEGMENTED SWITCH: Restaurants vs Groceries */}
      <div className="bg-stone-200/70 p-1 rounded-2xl flex items-center gap-1">
        <button
          id="tab-restaurants"
          onClick={() => {
            setActiveSection('restaurant');
            setSelectedSubCategory('all');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSection === 'restaurant'
              ? 'bg-white text-emerald-800 shadow-xs scale-100'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.sections.restaurants}</span>
          <span className="text-xs">🍔</span>
        </button>

        <button
          id="tab-grocery"
          onClick={() => {
            setActiveSection('grocery');
            setSelectedSubCategory('all');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSection === 'grocery'
              ? 'bg-white text-emerald-800 shadow-xs scale-100'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.sections.grocery}</span>
          <span className="text-xs">🛒</span>
        </button>
      </div>

      {/* 6. SEARCH BAR & QUICK FILTERS */}
      <div className="space-y-2">
        <div className="relative">
          <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-stone-400 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.filter.searchPlaceholder}
            className={`w-full py-2.5 text-xs bg-white border border-stone-200/90 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden shadow-2xs text-stone-900 ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => setFilterFreeDelivery(!filterFreeDelivery)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
              filterFreeDelivery
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            🎁 {t.filter.freeDelivery}
          </button>

          <button
            onClick={() => setFilterTopRated(!filterTopRated)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
              filterTopRated
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            ⭐ {t.filter.topRated}
          </button>

          <button
            onClick={() => setFilterFastest(!filterFastest)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
              filterFastest
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            ⚡ {t.filter.fastest}
          </button>
        </div>
      </div>

      {/* 7. SUB-CATEGORY CAROUSEL */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {activeCategoryList.map((cat) => {
          const isSelected = selectedSubCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedSubCategory(cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* 8. STORE CARDS SHOWCASE */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-stone-900">
            {activeSection === 'restaurant'
              ? (isRtl ? 'المطاعم المميزة في صوفيا' : 'Featured Restaurants in Sofia')
              : (isRtl ? 'المتاجر والسوبرماركت المعتمدة' : 'Verified Grocery Stores')}
          </h3>
          <span className="text-[10px] font-bold text-stone-400">
            {filteredStores.length} {isRtl ? 'متجر' : 'stores'}
          </span>
        </div>

        <div className="space-y-3">
          {filteredStores.length === 0 ? (
            <div className="py-8 text-center bg-white rounded-2xl border border-stone-200 p-4 space-y-2">
              <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto text-lg">
                🔍
              </div>
              <h4 className="text-xs font-bold text-stone-800">
                {isRtl ? 'لم نجد متاجر تطابق بحثك' : 'No stores match your search'}
              </h4>
            </div>
          ) : (
            filteredStores.map((store) => (
              <div
                key={store.id}
                onClick={() => onSelectStore(store)}
                className="group bg-white rounded-2xl overflow-hidden border border-stone-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
              >
                {/* Banner & Image */}
                <div className="relative h-32 w-full bg-stone-100 overflow-hidden">
                  <img
                    src={store.banner}
                    alt={lang === 'ar' ? store.nameAr : store.nameEn}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-black/10" />

                  {/* Promo Badge */}
                  {store.discountBadge && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{store.discountBadge}</span>
                    </div>
                  )}

                  {/* Delivery time pill */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-stone-950/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/10">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{store.deliveryTimeMin}-{store.deliveryTimeMax} {t.store.mins}</span>
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={store.image}
                          alt="Store Logo"
                          className="w-10 h-10 rounded-xl object-cover border border-stone-200 shadow-2xs shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-stone-900 group-hover:text-emerald-600 transition-colors truncate">
                            {lang === 'ar' ? store.nameAr : store.nameEn}
                          </h4>
                          <p className="text-[10px] text-stone-500 truncate">
                            {lang === 'ar' ? store.cuisineOrCategoryAr : store.cuisineOrCategoryEn}
                          </p>
                        </div>
                      </div>

                      {/* Rating pill */}
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg text-amber-900 font-black text-[11px] border border-amber-200 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{store.rating}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(lang === 'ar' ? store.tagsAr : store.tagsEn).slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-stone-100 text-stone-600"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Fee & Action Footer */}
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 font-bold text-stone-700">
                      <Bike className="w-3 h-3 text-emerald-600" />
                      <span>
                        {store.deliveryFee === 0 ? (
                          <span className="text-emerald-700 font-bold">{isRtl ? 'توصيل مجاني' : 'Free Delivery'}</span>
                        ) : (
                          `${store.deliveryFee.toFixed(2)} €`
                        )}
                      </span>
                    </div>

                    <span className="text-[11px] font-black text-emerald-600 group-hover:text-emerald-700 flex items-center gap-0.5">
                      <span>{t.store.viewMenu}</span>
                      <ChevronRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODALS */}
      <OrderTogetherModal
        isOpen={isOrderTogetherOpen}
        onClose={() => setIsOrderTogetherOpen(false)}
        onSelectStore={onSelectStore}
      />

      <AIConciergeModal
        isOpen={isAIConciergeOpen}
        onClose={() => setIsAIConciergeOpen(false)}
      />

      <SmartWalkInModal
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        onSelectStore={onSelectStore}
      />

      <FoodGiftCardModal
        isOpen={isGiftCardOpen}
        onClose={() => setIsGiftCardOpen(false)}
      />

      <LunchSubscriptionModal
        isOpen={isLunchSubOpen}
        onClose={() => setIsLunchSubOpen(false)}
      />

      <PremiumTablesModal
        isOpen={isPremiumTablesOpen}
        onClose={() => setIsPremiumTablesOpen(false)}
      />
    </div>
  );
};

