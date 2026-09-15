import React, { useState } from 'react';
import { Store, StoreCategoryType } from '../../types';
import { X, Store as StoreIcon, Image, MapPin, DollarSign, Clock, Tag, Sparkles } from 'lucide-react';

interface StoreModalProps {
  store?: Store | null; // If null, mode is 'add'
  onClose: () => void;
  onSave: (storeData: Omit<Store, 'id'> | Partial<Store>) => void;
  isRtl: boolean;
}

export const StoreModal: React.FC<StoreModalProps> = ({
  store,
  onClose,
  onSave,
  isRtl
}) => {
  const isEditing = !!store;

  const [nameAr, setNameAr] = useState(store?.nameAr || '');
  const [nameEn, setNameEn] = useState(store?.nameEn || '');
  const [type, setType] = useState<StoreCategoryType>(store?.type || 'restaurant');
  const [cuisineOrCategoryAr, setCuisineOrCategoryAr] = useState(store?.cuisineOrCategoryAr || 'مشويات ووجبات سريعة');
  const [cuisineOrCategoryEn, setCuisineOrCategoryEn] = useState(store?.cuisineOrCategoryEn || 'Fast Food & Grills');
  const [deliveryFee, setDeliveryFee] = useState<number>(store?.deliveryFee ?? 1.99);
  const [deliveryTimeMin, setDeliveryTimeMin] = useState<number>(store?.deliveryTimeMin ?? 20);
  const [deliveryTimeMax, setDeliveryTimeMax] = useState<number>(store?.deliveryTimeMax ?? 35);
  const [minOrder, setMinOrder] = useState<number>(store?.minOrder ?? 10);
  const [image, setImage] = useState(
    store?.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80'
  );
  const [banner, setBanner] = useState(
    store?.banner || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80'
  );
  const [addressAr, setAddressAr] = useState(store?.addressAr || 'شارع فيتوشا 45، وسط صوفيا');
  const [addressEn, setAddressEn] = useState(store?.addressEn || '45 Vitosha Blvd, Sofia Center');
  const [isOpen, setIsOpen] = useState(store?.isOpen ?? true);
  const [isFeatured, setIsFeatured] = useState(store?.isFeatured ?? false);
  const [discountBadge, setDiscountBadge] = useState(store?.discountBadge || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr.trim() || !nameEn.trim()) return;

    if (isEditing && store) {
      onSave({
        nameAr,
        nameEn,
        type,
        cuisineOrCategoryAr,
        cuisineOrCategoryEn,
        deliveryFee: Number(deliveryFee),
        deliveryTimeMin: Number(deliveryTimeMin),
        deliveryTimeMax: Number(deliveryTimeMax),
        minOrder: Number(minOrder),
        image,
        banner,
        addressAr,
        addressEn,
        isOpen,
        isFeatured,
        discountBadge: discountBadge.trim() || undefined,
      });
    } else {
      onSave({
        nameAr,
        nameEn,
        type,
        cuisineOrCategoryAr,
        cuisineOrCategoryEn,
        rating: 4.9,
        reviewCount: 24,
        deliveryFee: Number(deliveryFee),
        deliveryTimeMin: Number(deliveryTimeMin),
        deliveryTimeMax: Number(deliveryTimeMax),
        minOrder: Number(minOrder),
        image,
        banner,
        addressAr,
        addressEn,
        coordinates: { lat: 42.6977, lng: 23.3219, addressName: addressEn },
        isOpen,
        isFeatured,
        discountBadge: discountBadge.trim() || undefined,
        tagsAr: ['طازج', 'توصيل سريع', 'معتمد'],
        tagsEn: ['Fresh', 'Fast Delivery', 'Verified'],
      });
    }
  };

  const sampleImages = [
    { label: 'Burger / Fast Food', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80' },
    { label: 'Pizza / Italian', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80' },
    { label: 'Supermarket / Grocery', url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80' },
    { label: 'Bakery / Sweets', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 p-4 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <StoreIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">
                {isEditing
                  ? (isRtl ? 'تعديل بيانات المتجر / المطعم' : 'Edit Store / Restaurant')
                  : (isRtl ? 'إضافة متجر / مطعم جديد' : 'Add New Store / Restaurant')}
              </h3>
              <p className="text-[10px] text-stone-500">
                {isRtl ? 'إدارة الشركاء والمتاجر في صوفيا، بلغاريا' : 'Partner store catalog management in Sofia'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-3 space-y-3.5 flex-1 pr-1">
          
          {/* Store Type Selector */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">
              {isRtl ? 'نوع المنشأة' : 'Store Type'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('restaurant')}
                className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 border cursor-pointer ${
                  type === 'restaurant'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>🍔 {isRtl ? 'مطعم ووجبات' : 'Restaurant & Food'}</span>
              </button>
              <button
                type="button"
                onClick={() => setType('grocery')}
                className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 border cursor-pointer ${
                  type === 'grocery'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span>🛒 {isRtl ? 'سوبرماركت وبقالة' : 'Grocery & Market'}</span>
              </button>
            </div>
          </div>

          {/* Names in AR & EN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'الاسم بالعربية *' : 'Name (Arabic) *'}
              </label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="مثال: برجر شيف صوفيا"
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'الاسم بالإنجليزية *' : 'Name (English) *'}
              </label>
              <input
                type="text"
                required
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Burger Chef Sofia"
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Category / Cuisine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'التصنيف والمطبخ (عربي)' : 'Category / Cuisine (AR)'}
              </label>
              <input
                type="text"
                value={cuisineOrCategoryAr}
                onChange={(e) => setCuisineOrCategoryAr(e.target.value)}
                placeholder="مثال: برجر، بطاطس، وجبات سريعة"
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'التصنيف والمطبخ (إنجليزي)' : 'Category / Cuisine (EN)'}
              </label>
              <input
                type="text"
                value={cuisineOrCategoryEn}
                onChange={(e) => setCuisineOrCategoryEn(e.target.value)}
                placeholder="e.g. Burgers, Fries, Fast Food"
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Financials & Delivery Timings */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'أجور التوصيل (€)' : 'Delivery (€)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'الوقت المقدر (د)' : 'Time (min)'}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="5"
                  value={deliveryTimeMin}
                  onChange={(e) => setDeliveryTimeMin(parseInt(e.target.value) || 15)}
                  className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-center"
                />
                <span>-</span>
                <input
                  type="number"
                  min="10"
                  value={deliveryTimeMax}
                  onChange={(e) => setDeliveryTimeMax(parseInt(e.target.value) || 35)}
                  className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'الحد الأدنى (€)' : 'Min Order (€)'}
              </label>
              <input
                type="number"
                min="0"
                value={minOrder}
                onChange={(e) => setMinOrder(parseFloat(e.target.value) || 0)}
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'العنوان في صوفيا (عربي)' : 'Sofia Address (AR)'}
              </label>
              <input
                type="text"
                value={addressAr}
                onChange={(e) => setAddressAr(e.target.value)}
                placeholder="مثال: شارع فيتوشا 45، صوفيا"
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'العنوان في صوفيا (إنجليزي)' : 'Sofia Address (EN)'}
              </label>
              <input
                type="text"
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
                placeholder="e.g. 45 Vitosha Blvd, Sofia"
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Image URL & Quick Presets */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">
              {isRtl ? 'رابط صورة المتجر' : 'Store Image URL'}
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden mb-1.5"
            />
            <div className="flex flex-wrap gap-1">
              {sampleImages.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImage(s.url)}
                  className="px-2 py-0.5 text-[9px] font-bold rounded-lg bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-200"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches: Status & Featured */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-stone-800">
                {isOpen ? (isRtl ? '🟢 المتجر نشط ومفتوح' : '🟢 Store is Open') : (isRtl ? '🔴 مغلق مؤقتاً' : '🔴 Closed')}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded-md focus:ring-amber-500"
              />
              <span className="text-xs font-bold text-stone-800">
                ⭐ {isRtl ? 'مميز بالرئيسية' : 'Featured Store'}
              </span>
            </label>
          </div>

          {/* Discount Promo Badge (optional) */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">
              {isRtl ? 'شارة الخصم أو العرض (اختياري)' : 'Promo Badge (Optional)'}
            </label>
            <input
              type="text"
              value={discountBadge}
              onChange={(e) => setDiscountBadge(e.target.value)}
              placeholder={isRtl ? 'مثال: خصم 20% | كود SOFIA' : 'e.g. 20% OFF | Code SOFIA'}
              className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEditing ? (isRtl ? 'حفظ التعديلات' : 'Save Changes') : (isRtl ? 'إضافة المتجر الآن' : 'Add Store Now')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
