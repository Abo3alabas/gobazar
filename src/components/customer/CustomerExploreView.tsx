import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { Store, Product, StoreCategoryType } from '../../types';
import { ProductModal } from './ProductModal';
import {
  Search,
  Star,
  Clock,
  Bike,
  Sparkles,
  UtensilsCrossed,
  ShoppingBag,
  Flame,
  Check,
  Plus,
  ArrowRight,
  ChevronRight,
  Package,
  Layers,
  MapPin,
  Tag
} from 'lucide-react';

interface CustomerExploreViewProps {
  onSelectStore: (store: Store) => void;
}

export const CustomerExploreView: React.FC<CustomerExploreViewProps> = ({ onSelectStore }) => {
  const { stores, products, addToCart, cart, lang, isRtl } = useApp();
  const t = translations[lang];

  // Primary mode: 'restaurant' (dishes/meals) or 'grocery' (merchandise/goods)
  const [selectedType, setSelectedType] = useState<StoreCategoryType>('restaurant');
  
  // Sub-view: 'items' (dishes or goods) or 'stores' (restaurants or supermarkets)
  const [viewMode, setViewMode] = useState<'items' | 'stores'>('items');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [filterFreeDelivery, setFilterFreeDelivery] = useState(false);
  const [filterTopRated, setFilterTopRated] = useState(false);
  const [filterOffersOnly, setFilterOffersOnly] = useState(false);

  // Selected product for customization modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Quick categories for Restaurants
  const restaurantSubCategories = [
    { id: 'all', nameAr: 'الكل ✨', nameEn: 'All ✨' },
    { id: 'shawarma', nameAr: '🌯 شاورما ومشويات', nameEn: '🌯 Shawarma & Grill' },
    { id: 'burgers', nameAr: '🍔 برجر وساندوتشات', nameEn: '🍔 Gourmet Burgers' },
    { id: 'pizza', nameAr: '🍕 بيتزا وباستا', nameEn: '🍕 Pizza & Pasta' },
    { id: 'healthy', nameAr: '🥗 وجبات صحية وسلطات', nameEn: '🥗 Healthy & Salads' },
    { id: 'desserts', nameAr: '🍰 حلويات وكافيه', nameEn: '🍰 Desserts & Coffee' },
  ];

  // Quick categories for Supermarkets & Groceries
  const grocerySubCategories = [
    { id: 'all', nameAr: 'الكل ✨', nameEn: 'All ✨' },
    { id: 'dairy', nameAr: '🥛 ألبان وأجبان طازجة', nameEn: '🥛 Dairy & Fresh Cheeses' },
    { id: 'fruitsVeg', nameAr: '🍎 خضار وفواكه قطاف اليوم', nameEn: '🍎 Bio Fruits & Veg' },
    { id: 'meat', nameAr: '🥩 ملحمة ولحوم طازجة', nameEn: '🥩 Gourmet Butchery' },
    { id: 'bakery', nameAr: '🥐 بانيتسا ومخبوزات دافئة', nameEn: '🥐 Banitsa & Bakery' },
    { id: 'beverages', nameAr: '🧃 مياه ومشروبات بلقانية', nameEn: '🧃 Drinks & Spring Water' },
  ];

  const currentSubCategories = selectedType === 'restaurant' ? restaurantSubCategories : grocerySubCategories;

  // Stores of selected type
  const targetStores = useMemo(() => {
    return stores.filter(s => s.type === selectedType);
  }, [stores, selectedType]);

  const targetStoreIds = useMemo(() => {
    return new Set(targetStores.map(s => s.id));
  }, [targetStores]);

  // Filtered Products (Dishes if restaurant, Goods if grocery)
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Must belong to a store of the selected type
      if (!targetStoreIds.has(product.storeId)) return false;

      // Subcategory match
      if (selectedSubCategory !== 'all' && product.category !== selectedSubCategory) {
        return false;
      }

      // Offers only
      if (filterOffersOnly && (!product.originalPrice || product.originalPrice <= product.price)) {
        return false;
      }

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const name = (lang === 'ar' ? product.nameAr : product.nameEn).toLowerCase();
        const desc = (lang === 'ar' ? product.descriptionAr : product.descriptionEn).toLowerCase();
        const store = stores.find(s => s.id === product.storeId);
        const storeName = store ? (lang === 'ar' ? store.nameAr : store.nameEn).toLowerCase() : '';

        const match = name.includes(query) || desc.includes(query) || storeName.includes(query);
        if (!match) return false;
      }

      return true;
    });
  }, [products, targetStoreIds, selectedSubCategory, filterOffersOnly, searchTerm, lang, stores]);

  // Filtered Stores
  const filteredStores = useMemo(() => {
    return targetStores.filter(store => {
      const name = (lang === 'ar' ? store.nameAr : store.nameEn).toLowerCase();
      const category = (lang === 'ar' ? store.cuisineOrCategoryAr : store.cuisineOrCategoryEn).toLowerCase();
      const tags = (lang === 'ar' ? store.tagsAr.join(' ') : store.tagsEn.join(' ')).toLowerCase();
      const address = (lang === 'ar' ? store.addressAr : store.addressEn).toLowerCase();

      const matchesSearch = !searchTerm.trim() ||
        name.includes(searchTerm.toLowerCase()) ||
        category.includes(searchTerm.toLowerCase()) ||
        tags.includes(searchTerm.toLowerCase()) ||
        address.includes(searchTerm.toLowerCase());

      const matchesFreeDelivery = !filterFreeDelivery || store.deliveryFee === 0;
      const matchesTopRated = !filterTopRated || store.rating >= 4.85;

      return matchesSearch && matchesFreeDelivery && matchesTopRated;
    });
  }, [targetStores, searchTerm, filterFreeDelivery, filterTopRated, lang]);

  // Handle Quick Add to Cart
  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.optionGroups && product.optionGroups.length > 0) {
      // Open modal to configure options
      setSelectedProduct(product);
    } else {
      addToCart(product, 1, []);
    }
  };

  // Get store helper
  const getStoreForProduct = (storeId: string) => {
    return stores.find(s => s.id === storeId);
  };

  // Check quantity in cart
  const getCartQuantity = (productId: string) => {
    return cart
      .filter(item => item.product.id === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="p-3.5 sm:p-4 space-y-4 animate-fade-in pb-16">
      
      {/* Header Title with Dynamic Persona */}
      <div className="space-y-1">
        <h1 className="text-lg sm:text-xl font-black text-stone-900 flex items-center gap-2">
          <span>{selectedType === 'restaurant' ? '🍕' : '🛒'}</span>
          <span>
            {selectedType === 'restaurant'
              ? (isRtl ? 'استكشف أشهى الأكلات والوجبات في صوفيا 🇧🇬' : 'Explore Delicious Dishes & Meals in Sofia 🇧🇬')
              : (isRtl ? 'استكشف بضائع ومنتجات السوبرماركت في صوفيا 🇧🇬' : 'Explore Supermarket Goods & Fresh Grocery 🇧🇬')}
          </span>
        </h1>
        <p className="text-xs text-stone-500">
          {selectedType === 'restaurant'
            ? (isRtl
                ? 'تصفح أشهى الأكلات، الشاورما، المشاوي، البرجر والبيتزا مع التوصيل الفوري باليورو (€)'
                : 'Browse gourmet dishes, shawarma, grills, burgers & pizza with rapid delivery in EUR (€)')
            : (isRtl
                ? 'تصفح الألبان الطازجة، الخضار والفواكه، اللحوم، البانيتسا والمواد التموينية باليورو (€)'
                : 'Browse fresh dairy, organic produce, premium butchery, banitsa & pantry goods in EUR (€)')}
        </p>
      </div>

      {/* Main Mode Switcher: 🍔 المطاعم والأكلات vs 🛒 السوبرماركت والبضائع */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-stone-200/70 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            setSelectedType('restaurant');
            setSelectedSubCategory('all');
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            selectedType === 'restaurant'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/50'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>{isRtl ? 'المطاعم والأكلات الشهية' : 'Restaurants & Dishes'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedType('grocery');
            setSelectedSubCategory('all');
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            selectedType === 'grocery'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/50'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isRtl ? 'السوبرماركت وبضائع البقالة' : 'Supermarket & Goods'}</span>
        </button>
      </div>

      {/* Search Bar Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            selectedType === 'restaurant'
              ? (isRtl ? 'ابحث عن أكلة، شاورما، برجر، بيتزا، باستا، أو اسم المطعم...' : 'Search for a dish, shawarma, burger, pizza, pasta, or restaurant...')
              : (isRtl ? 'ابحث عن بضاعة، حليب، بيض، طماطم، لحوم، بانيتسا، مياه...' : 'Search for goods, milk, eggs, tomatoes, meat, banitsa, water...')
          }
          className="w-full bg-white border border-stone-200 rounded-2xl py-2.5 px-9 text-xs sm:text-sm font-medium placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs text-stone-900"
        />
        <Search className={`w-4 h-4 text-stone-400 absolute top-3 ${isRtl ? 'right-3' : 'left-3'}`} />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className={`text-xs text-stone-400 hover:text-stone-700 absolute top-3 ${isRtl ? 'left-3' : 'right-3'}`}
          >
            ✕
          </button>
        )}
      </div>

      {/* Sub-Categories Horizontal Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {currentSubCategories.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedSubCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
              selectedSubCategory === cat.id
                ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
            }`}
          >
            <span>{lang === 'ar' ? cat.nameAr : cat.nameEn}</span>
          </button>
        ))}
      </div>

      {/* View Switcher: Items Grid (Dishes/Goods) vs Stores List */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('items')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'items'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {selectedType === 'restaurant' ? (
              <>
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>{isRtl ? 'قائمة الأكلات والوجبات' : 'Dishes & Meals'} ({filteredProducts.length})</span>
              </>
            ) : (
              <>
                <Package className="w-3.5 h-3.5" />
                <span>{isRtl ? 'قائمة البضائع والمنتجات' : 'Goods & Products'} ({filteredProducts.length})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setViewMode('stores')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'stores'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>
              {selectedType === 'restaurant'
                ? (isRtl ? 'المطاعم المعتمدة' : 'Restaurants')
                : (isRtl ? 'محلات السوبرماركت' : 'Supermarkets')} ({filteredStores.length})
            </span>
          </button>
        </div>

        {/* Offers filter pill */}
        <button
          type="button"
          onClick={() => setFilterOffersOnly(!filterOffersOnly)}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border cursor-pointer ${
            filterOffersOnly
              ? 'bg-rose-50 border-rose-300 text-rose-700 font-black'
              : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
          }`}
        >
          <Tag className="w-3 h-3 text-rose-500" />
          <span>{isRtl ? 'عروض فقط' : 'Deals only'}</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 1. DISHES & GOODS VIEW (ITEMS GRID)                          */}
      {/* ============================================================ */}
      {viewMode === 'items' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((product) => {
              const store = getStoreForProduct(product.storeId);
              const quantityInCart = getCartQuantity(product.id);
              const isRestaurant = selectedType === 'restaurant';

              return (
                <div
                  key={product.id}
                  id={`explore-item-${product.id}`}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-2xl border border-stone-200 p-3 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex gap-3">
                    {/* Item Image with Badge */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                      <img
                        src={product.image}
                        alt={lang === 'ar' ? product.nameAr : product.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Calories badge for restaurants */}
                      {isRestaurant && product.calories && (
                        <span className="absolute top-1 start-1 bg-stone-950/75 backdrop-blur-xs text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 text-amber-400" />
                          <span>{product.calories}</span>
                        </span>
                      )}

                      {/* Unit badge for supermarkets (e.g. 1 كجم / 1L) */}
                      {!isRestaurant && (product.unitAr || product.unitEn) && (
                        <span className="absolute top-1 start-1 bg-emerald-950/80 backdrop-blur-xs text-emerald-200 text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                          {lang === 'ar' ? product.unitAr : product.unitEn}
                        </span>
                      )}

                      {/* Discount ribbon */}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="absolute bottom-1 end-1 bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                          {isRtl ? 'خصم' : 'SALE'}
                        </span>
                      )}
                    </div>

                    {/* Item Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Store Origin Badge (clickable) */}
                        {store && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStore(store);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md hover:bg-emerald-100 transition-colors mb-1 truncate max-w-full"
                          >
                            <span>{isRestaurant ? '🍔' : '🛒'}</span>
                            <span className="truncate">{lang === 'ar' ? store.nameAr : store.nameEn}</span>
                            <ChevronRight className="w-2.5 h-2.5 shrink-0" />
                          </div>
                        )}

                        <h3 className="text-xs sm:text-sm font-black text-stone-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                          {lang === 'ar' ? product.nameAr : product.nameEn}
                        </h3>

                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5 leading-snug">
                          {lang === 'ar' ? product.descriptionAr : product.descriptionEn}
                        </p>
                      </div>

                      {/* Pricing & Add to Cart Action */}
                      <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-stone-100">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-emerald-700">
                            {product.price.toFixed(2)} €
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-[10px] text-stone-400 line-through">
                              {product.originalPrice.toFixed(2)} €
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(e, product)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-xs ${
                            quantityInCart > 0
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-stone-900 text-white hover:bg-emerald-600'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>
                            {quantityInCart > 0
                              ? `${isRtl ? 'في السلة' : 'In Cart'} (${quantityInCart})`
                              : (isRtl ? 'أضف' : 'Add')}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
              <p className="text-3xl">{selectedType === 'restaurant' ? '🍕' : '🛒'}</p>
              <p className="text-sm font-black text-stone-800">
                {isRtl
                  ? (selectedType === 'restaurant' ? 'لم يتم العثور على أكلات مطابقة' : 'لم يتم العثور على بضائع مطابقة')
                  : (selectedType === 'restaurant' ? 'No dishes matched your search' : 'No goods matched your search')}
              </p>
              <p className="text-xs text-stone-500">
                {isRtl
                  ? 'جرب البحث بكلمة أخرى أو تغيير التصنيف الفرعي'
                  : 'Try searching with another keyword or sub-category'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. STORES VIEW (RESTAURANTS OR SUPERMARKETS)                 */}
      {/* ============================================================ */}
      {viewMode === 'stores' && (
        <div className="space-y-3">
          {filteredStores.map(store => (
            <div
              key={store.id}
              id={`explore-store-${store.id}`}
              onClick={() => onSelectStore(store)}
              className="p-3.5 bg-white rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex gap-3 group"
            >
              {/* Store Image */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-stone-100">
                <img
                  src={store.image}
                  alt={lang === 'ar' ? store.nameAr : store.nameEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {store.discountBadge && (
                  <span className="absolute bottom-1 inset-x-1 bg-rose-600 text-white text-[9px] font-black px-1 py-0.5 rounded text-center truncate shadow-xs">
                    {store.discountBadge}
                  </span>
                )}
              </div>

              {/* Store Info */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="text-xs sm:text-sm font-black text-stone-900 truncate group-hover:text-emerald-700 transition-colors">
                      {lang === 'ar' ? store.nameAr : store.nameEn}
                    </h3>
                    <div className="flex items-center gap-0.5 text-amber-500 text-xs font-black shrink-0">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{store.rating}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 truncate mt-0.5">
                    {lang === 'ar' ? store.cuisineOrCategoryAr : store.cuisineOrCategoryEn}
                  </p>

                  <p className="text-[10px] text-stone-400 truncate mt-0.5 flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5 text-stone-400" />
                    <span>{lang === 'ar' ? store.addressAr : store.addressEn}</span>
                  </p>
                </div>

                {/* Delivery Meta */}
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 pt-1.5 border-t border-stone-100 mt-1">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-emerald-700">
                      <Clock className="w-3 h-3" />
                      <span>{store.deliveryTimeMin}-{store.deliveryTimeMax} {t.store.mins}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bike className="w-3 h-3 text-stone-400" />
                      <span>
                        {store.deliveryFee === 0 ? (
                          <span className="text-emerald-600 font-black">{isRtl ? 'توصيل مجاني (0 €)' : 'Free (0 €)'}</span>
                        ) : (
                          `${store.deliveryFee.toFixed(2)} €`
                        )}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-stone-400">
                    {isRtl ? 'أدنى طلب:' : 'Min:'} {store.minOrder} €
                  </span>
                </div>
              </div>
            </div>
          ))}

          {filteredStores.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-6 space-y-2">
              <p className="text-3xl">🏬</p>
              <p className="text-sm font-black text-stone-800">
                {isRtl ? 'لم يتم العثور على متاجر مطابقة' : 'No stores matched your search'}
              </p>
              <p className="text-xs text-stone-500">
                {isRtl ? 'جرب البحث بكلمات أخرى أو إزالة الفلاتر' : 'Try searching for something else'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Product / Dish Customization Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};
