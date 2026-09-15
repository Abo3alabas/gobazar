import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { Store, StoreCategoryType } from '../../types';
import {
  Utensils,
  ShoppingBag,
  Search,
  Star,
  Clock,
  Bike,
  Sparkles,
  Flame,
  Percent,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Navigation,
  ArrowRight
} from 'lucide-react';

interface CustomerHomeProps {
  onSelectStore: (store: Store) => void;
  onOpenTracking: (orderId: string) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({ onSelectStore, onOpenTracking }) => {
  const { stores, orders, activeTrackingOrderId, lang, isRtl } = useApp();
  const t = translations[lang];

  const [activeSection, setActiveSection] = useState<StoreCategoryType>('restaurant');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFreeDelivery, setFilterFreeDelivery] = useState(false);
  const [filterTopRated, setFilterTopRated] = useState(false);
  const [filterFastest, setFilterFastest] = useState(false);

  // Active ongoing order
  const activeOrder = orders.find(o => o.id === activeTrackingOrderId && o.status !== 'delivered' && o.status !== 'cancelled') ||
    orders.find(o => o.status !== 'delivered' && o.status !== 'cancelled');

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
    // Check section match
    if (store.type !== activeSection) return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (lang === 'ar' ? store.nameAr : store.nameEn).toLowerCase().includes(q);
      const matchCuisine = (lang === 'ar' ? store.cuisineOrCategoryAr : store.cuisineOrCategoryEn).toLowerCase().includes(q);
      const matchTags = (lang === 'ar' ? store.tagsAr : store.tagsEn).some(tag => tag.toLowerCase().includes(q));
      if (!matchName && !matchCuisine && !matchTags) return false;
    }

    // Filter pills
    if (filterFreeDelivery && store.deliveryFee > 0) return false;
    if (filterTopRated && store.rating < 4.8) return false;
    if (filterFastest && store.deliveryTimeMax > 25) return false;

    return true;
  });

  return (
    <div className="px-3.5 py-3 space-y-3.5 animate-fade-in pb-8">
      
      {/* Location / Sofia Delivery Header Pill */}
      <div className="flex items-center justify-between bg-white px-3 py-2 rounded-2xl border border-stone-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
            📍
          </div>
          <div>
            <span className="text-[10px] text-stone-400 font-bold block leading-none">
              {isRtl ? 'التوصيل إلى عنوانك في صوفيا' : 'Deliver to in Sofia'}
            </span>
            <span className="text-xs font-black text-stone-800 leading-tight">
              {isRtl ? 'صوفيا، حي لوزينيتس (Lozenets)' : 'Sofia, Lozenets District'}
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
          🇧🇬 Sofia
        </span>
      </div>

      {/* Active Delivery Progress Floating Bar (If customer has an active ongoing trip) */}
      {activeOrder && (
        <div
          onClick={() => onOpenTracking(activeOrder.id)}
          className="p-3 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-950 to-emerald-950 text-white shadow-lg border border-emerald-500/40 flex items-center justify-between gap-2.5 cursor-pointer hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
                <Bike className="w-5 h-5 animate-bounce" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-amber-400">
                  {isRtl ? 'قيد التوصيل الآن' : 'In Transit'}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-stone-800 text-[9px] font-bold text-stone-300">
                  #{activeOrder.trackingNumber}
                </span>
              </div>
              <h4 className="text-xs font-black text-white truncate mt-0.5">
                {lang === 'ar' ? activeOrder.storeNameAr : activeOrder.storeNameEn}
              </h4>
              <p className="text-[10px] text-stone-300">
                {t.tracking.estimatedArrival}: <span className="text-emerald-400 font-bold">~{activeOrder.estimatedDeliveryMinutes} {t.store.mins}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-500 text-white text-[11px] font-black shrink-0 shadow-xs">
            <Navigation className="w-3.5 h-3.5" />
            <span>{t.tracking.title}</span>
          </div>
        </div>
      )}

      {/* Main Section Switcher Tabs: 🍔 المطاعم & 🛒 البقالة والسوبرماركت */}
      <div className="grid grid-cols-2 gap-2">
        <button
          id="tab-restaurants"
          onClick={() => {
            setActiveSection('restaurant');
            setSelectedSubCategory('all');
          }}
          className={`p-2.5 rounded-2xl border text-start transition-all cursor-pointer relative overflow-hidden flex items-center justify-between ${
            activeSection === 'restaurant'
              ? 'bg-gradient-to-br from-emerald-600 to-green-700 text-white border-emerald-600 shadow-md scale-101'
              : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-400 hover:bg-stone-50'
          }`}
        >
          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <Utensils className={`w-4 h-4 ${activeSection === 'restaurant' ? 'text-amber-300' : 'text-emerald-600'}`} />
              <h2 className="text-xs font-black leading-tight truncate">
                {t.sections.restaurants}
              </h2>
            </div>
            <p className={`text-[10px] font-medium mt-0.5 truncate ${activeSection === 'restaurant' ? 'text-emerald-100' : 'text-stone-400'}`}>
              {isRtl ? 'شاورما، برجر، بيتزا' : 'Burgers, Pizza & Grills'}
            </p>
          </div>
          <span className="text-xl shrink-0 opacity-90">🍔</span>
        </button>

        <button
          id="tab-grocery"
          onClick={() => {
            setActiveSection('grocery');
            setSelectedSubCategory('all');
          }}
          className={`p-2.5 rounded-2xl border text-start transition-all cursor-pointer relative overflow-hidden flex items-center justify-between ${
            activeSection === 'grocery'
              ? 'bg-gradient-to-br from-emerald-600 to-green-700 text-white border-emerald-600 shadow-md scale-101'
              : 'bg-white text-stone-800 border-stone-200 hover:border-emerald-400 hover:bg-stone-50'
          }`}
        >
          <div className="min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <ShoppingBag className={`w-4 h-4 ${activeSection === 'grocery' ? 'text-amber-300' : 'text-emerald-600'}`} />
              <h2 className="text-xs font-black leading-tight truncate">
                {t.sections.grocery}
              </h2>
            </div>
            <p className={`text-[10px] font-medium mt-0.5 truncate ${activeSection === 'grocery' ? 'text-emerald-100' : 'text-stone-400'}`}>
              {isRtl ? 'خضار، ألبان، مستلزمات' : 'Produce & Daily Needs'}
            </p>
          </div>
          <span className="text-xl shrink-0 opacity-90">🛒</span>
        </button>
      </div>

      {/* Smart Search Bar & Filter Options */}
      <div className="space-y-2">
        <div className="relative">
          <Search className={`w-4 h-4 absolute top-1/2 -translate-y-1/2 text-stone-400 ${isRtl ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.filter.searchPlaceholder}
            className={`w-full py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden shadow-2xs text-stone-900 ${
              isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        {/* Filter Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => setFilterFreeDelivery(!filterFreeDelivery)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              filterFreeDelivery
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200'
            }`}
          >
            🎁 {t.filter.freeDelivery}
          </button>

          <button
            onClick={() => setFilterTopRated(!filterTopRated)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              filterTopRated
                ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200'
            }`}
          >
            ⭐ {t.filter.topRated}
          </button>

          <button
            onClick={() => setFilterFastest(!filterFastest)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              filterFastest
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200'
            }`}
          >
            ⚡ {t.filter.fastest}
          </button>
        </div>
      </div>

      {/* Sub-Category Horizontal Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {activeCategoryList.map((cat) => {
          const isSelected = selectedSubCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedSubCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Store Cards Showcase */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-stone-900">
            {activeSection === 'restaurant' ? (isRtl ? 'المطاعم المميزة في صوفيا' : 'Featured Restaurants in Sofia') : (isRtl ? 'المتاجر والسوبرماركت المعتمدة' : 'Verified Grocery Stores')}
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
    </div>
  );
};
