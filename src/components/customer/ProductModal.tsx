import React, { useState } from 'react';
import { Product, CartItemOption } from '../../types';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { X, Plus, Minus, Check, Flame, ShoppingBag } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart, lang, isRtl } = useApp();
  const t = translations[lang];

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<CartItemOption[]>(() => {
    // Select first required option by default
    const defaults: CartItemOption[] = [];
    product.optionGroups?.forEach(group => {
      if (group.required && group.options.length > 0) {
        defaults.push({
          groupId: group.id,
          groupTitle: lang === 'ar' ? group.titleAr : group.titleEn,
          optionId: group.options[0].id,
          optionName: lang === 'ar' ? group.options[0].nameAr : group.options[0].nameEn,
          priceDelta: group.options[0].priceDelta,
        });
      }
    });
    return defaults;
  });

  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleOptionToggle = (
    groupId: string,
    groupTitle: string,
    optionId: string,
    optionName: string,
    priceDelta: number,
    required: boolean
  ) => {
    setSelectedOptions(prev => {
      if (required) {
        // Radio behavior: replace group selection
        const filtered = prev.filter(o => o.groupId !== groupId);
        return [...filtered, { groupId, groupTitle, optionId, optionName, priceDelta }];
      } else {
        // Checkbox behavior: toggle selection
        const exists = prev.some(o => o.groupId === groupId && o.optionId === optionId);
        if (exists) {
          return prev.filter(o => !(o.groupId === groupId && o.optionId === optionId));
        } else {
          return [...prev, { groupId, groupTitle, optionId, optionName, priceDelta }];
        }
      }
    });
  };

  const optionsTotal = selectedOptions.reduce((sum, o) => sum + o.priceDelta, 0);
  const unitPrice = product.price + optionsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedOptions, specialInstructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
        
        {/* Product Image Header */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-stone-100 shrink-0">
          <img
            src={product.image}
            alt={lang === 'ar' ? product.nameAr : product.nameEn}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-black/20" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {product.calories && (
            <div className="absolute bottom-4 left-4 px-2.5 py-1 rounded-full bg-stone-900/70 text-white text-xs font-bold flex items-center gap-1 backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{product.calories} {isRtl ? 'سعرة حرارية' : 'kcal'}</span>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-black text-stone-900 leading-snug">
                {lang === 'ar' ? product.nameAr : product.nameEn}
              </h2>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-600">
                  {product.price} {t.store.sar}
                </span>
                {product.originalPrice && (
                  <span className="block text-xs line-through text-stone-400">
                    {product.originalPrice} {t.store.sar}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              {lang === 'ar' ? product.descriptionAr : product.descriptionEn}
            </p>
          </div>

          {/* Option Groups (Sizes, Sauces, Extras) */}
          {product.optionGroups?.map(group => (
            <div key={group.id} className="pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-black text-stone-900">
                  {lang === 'ar' ? group.titleAr : group.titleEn}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                  {group.required ? (isRtl ? 'إلزامي' : 'Required') : (isRtl ? 'اختياري' : 'Optional')}
                </span>
              </div>

              <div className="space-y-2">
                {group.options.map(opt => {
                  const isSelected = selectedOptions.some(
                    o => o.groupId === group.id && o.optionId === opt.id
                  );
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        handleOptionToggle(
                          group.id,
                          lang === 'ar' ? group.titleAr : group.titleEn,
                          opt.id,
                          lang === 'ar' ? opt.nameAr : opt.nameEn,
                          opt.priceDelta,
                          group.required
                        )
                      }
                      className={`w-full flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-2xs'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-${group.required ? 'full' : 'md'} border flex items-center justify-center ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-stone-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span>{lang === 'ar' ? opt.nameAr : opt.nameEn}</span>
                      </div>
                      {opt.priceDelta > 0 && (
                        <span className="text-stone-500 font-semibold">
                          +{opt.priceDelta} {t.store.sar}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special Instructions */}
          <div className="pt-3 border-t border-stone-100">
            <label className="block text-xs font-black text-stone-900 mb-1.5">
              {t.store.specialInstructions}
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              placeholder={isRtl ? 'مثال: بدون مايونيز، تسخين إضافي...' : 'e.g. No mayo, extra warm...'}
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer Actions (Quantity & Add Button) */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-white border border-stone-200 rounded-2xl p-1 shadow-2xs">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center font-black text-sm text-stone-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/25 flex items-center justify-between transition-transform active:scale-98 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>{t.store.add}</span>
            </div>
            <span>{totalPrice.toFixed(1)} {t.store.sar}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
