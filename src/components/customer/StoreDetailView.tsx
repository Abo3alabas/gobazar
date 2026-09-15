import React, { useState } from 'react';
import { Store, Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { ProductModal } from './ProductModal';
import {
  Star,
  Clock,
  Bike,
  MapPin,
  Search,
  Plus,
  ArrowLeft,
  Flame,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

interface StoreDetailViewProps {
  store: Store;
  onBack: () => void;
  onOpenCart: () => void;
}

export const StoreDetailView: React.FC<StoreDetailViewProps> = ({ store, onBack, onOpenCart }) => {
  const { products, cart, cartTotal, lang, isRtl } = useApp();
  const t = translations[lang];

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);

  const storeProducts = products.filter(p => p.storeId === store.id);

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(storeProducts.map(p => p.category)))];

  const filteredProducts = storeProducts.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const nameMatch = (lang === 'ar' ? p.nameAr : p.nameEn).toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (lang === 'ar' ? p.descriptionAr : p.descriptionEn).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && (nameMatch || descMatch);
  });

  const cartItemsFromThisStore = cart.filter(i => i.product.storeId === store.id);
  const totalItemsCount = cartItemsFromThisStore.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="px-3.5 py-3 space-y-3 animate-fade-in pb-24">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-bold shadow-2xs hover:bg-stone-50 transition-colors cursor-pointer"
      >
        {isRtl ? <ArrowLeft className="w-3.5 h-3.5 rotate-180" /> : <ArrowLeft className="w-3.5 h-3.5" />}
        <span>{isRtl ? 'الرجوع للمتاجر' : 'Back to stores'}</span>
      </button>

      {/* Store Banner & Info Card */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-stone-200 shadow-2xs">
        <div className="h-28 w-full relative overflow-hidden bg-stone-900">
          <img
            src={store.banner}
            alt={lang === 'ar' ? store.nameAr : store.nameEn}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
          
          {store.discountBadge && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{store.discountBadge}</span>
            </div>
          )}
        </div>

        <div className="p-3 relative -mt-8 flex flex-col gap-2.5">
          <div className="flex items-end gap-2.5">
            <img
              src={store.image}
              alt="Logo"
              className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-md bg-white shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-black text-stone-900 leading-tight truncate">
                {lang === 'ar' ? store.nameAr : store.nameEn}
              </h1>
              <p className="text-[11px] text-stone-500 truncate">
                {lang === 'ar' ? store.cuisineOrCategoryAr : store.cuisineOrCategoryEn}
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
            <div className="flex items-center gap-0.5 bg-amber-50 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{store.rating}</span>
              <span className="text-stone-400 font-normal">({store.reviewCount})</span>
            </div>

            <div className="flex items-center gap-0.5 bg-stone-100 text-stone-700 px-2 py-0.5 rounded-lg font-bold">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>{store.deliveryTimeMin}-{store.deliveryTimeMax} {t.store.mins}</span>
            </div>

            <div className="flex items-center gap-0.5 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200 font-bold">
              <Bike className="w-3 h-3 text-emerald-600" />
              <span>{store.deliveryFee === 0 ? (isRtl ? 'توصيل مجاني' : 'Free Delivery') : `${store.deliveryFee.toFixed(2)} €`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Search & Category Filters */}
      <div className="space-y-2 sticky top-0 z-20 bg-stone-100/95 backdrop-blur-xs py-1">
        <div className="relative">
          <Search className={`w-3.5 h-3.5 absolute top-1/2 -translate-y-1/2 text-stone-400 ${isRtl ? 'right-2.5' : 'left-2.5'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isRtl ? 'ابحث في قائمة المتجر...' : 'Search within menu...'}
            className={`w-full py-1.5 text-xs bg-white border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-hidden text-stone-900 ${
              isRtl ? 'pr-8 pl-2.5' : 'pl-8 pr-2.5'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {cat === 'all' ? t.categories.all : (t.categories[cat as keyof typeof t.categories] || cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-2.5">
        {filteredProducts.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-xs">
            {isRtl ? 'لا توجد نتائج مطابقة لبحثك' : 'No items match your search'}
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setActiveProductModal(product)}
              className="group p-2.5 bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-500 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex gap-2.5 relative overflow-hidden"
            >
              {/* Product Thumbnail */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                <img
                  src={product.image}
                  alt={lang === 'ar' ? product.nameAr : product.nameEn}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                {product.calories && (
                  <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/60 backdrop-blur-xs text-white text-[8px] font-bold flex items-center gap-0.5">
                    <Flame className="w-2 h-2 text-amber-400" />
                    {product.calories}
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <h3 className="text-xs font-black text-stone-900 truncate leading-snug">
                    {lang === 'ar' ? product.nameAr : product.nameEn}
                  </h3>
                  <p className="text-[10px] text-stone-500 line-clamp-2 mt-0.5 leading-tight">
                    {lang === 'ar' ? product.descriptionAr : product.descriptionEn}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-stone-100">
                  <div>
                    <span className="text-xs font-black text-emerald-700">
                      {product.price.toFixed(2)} €
                    </span>
                    {product.originalPrice && (
                      <span className="text-[9px] line-through text-stone-400 ms-1">
                        {product.originalPrice.toFixed(2)} €
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveProductModal(product);
                    }}
                    className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-2xs transition-transform active:scale-90"
                    title={t.store.add}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Bottom Cart Bar if items exist */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-16 inset-x-4 max-w-[390px] mx-auto z-40">
          <button
            onClick={onOpenCart}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-between font-black text-xs transition-transform active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-white text-emerald-700 text-[10px] flex items-center justify-center font-black">
                {totalItemsCount}
              </div>
              <span>{t.cart.title}</span>
            </div>
            <span>{cartTotal.toFixed(2)} €</span>
          </button>
        </div>
      )}

      {/* Product Customization Modal */}
      {activeProductModal && (
        <ProductModal
          product={activeProductModal}
          onClose={() => setActiveProductModal(null)}
        />
      )}
    </div>
  );
};
