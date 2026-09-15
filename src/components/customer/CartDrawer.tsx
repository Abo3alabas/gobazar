import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck
} from 'lucide-react';

interface CartDrawerProps {
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onClose, onProceedToCheckout }) => {
  const {
    cart,
    cartSubtotal,
    cartDeliveryFee,
    cartServiceFee,
    cartDiscount,
    cartTotal,
    appliedPromo,
    applyPromoCode,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    selectedStore,
    lang,
    isRtl
  } = useApp();

  const t = translations[lang];
  const [promoInput, setPromoInput] = useState('');
  const [promoMsg, setPromoMsg] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoMsg('');
    if (!promoInput.trim()) return;
    const ok = applyPromoCode(promoInput);
    if (!ok) {
      setPromoMsg(isRtl ? 'الكوبون غير صالح' : 'Invalid coupon');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs flex justify-end">
      <div
        className={`w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-all duration-300 ${
          isRtl ? 'animate-slide-left' : 'animate-slide-right'
        }`}
      >
        {/* Cart Header */}
        <div className="px-5 py-4 bg-stone-900 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-black text-sm sm:text-base">
                {t.cart.title}
              </h3>
              {selectedStore && (
                <p className="text-[11px] text-stone-400 truncate max-w-[200px]">
                  {lang === 'ar' ? selectedStore.nameAr : selectedStore.nameEn}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-red-400 hover:text-red-300 font-bold px-2 py-1"
              >
                {isRtl ? 'إفراغ' : 'Clear'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        {cart.length === 0 ? (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-300">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h4 className="text-base font-black text-stone-800">{t.cart.empty}</h4>
            <p className="text-xs text-stone-500 max-w-xs">{t.cart.emptySubtitle}</p>
            <button
              onClick={onClose}
              className="mt-3 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
            >
              {isRtl ? 'تصفح المطاعم والمتاجر' : 'Browse Stores'}
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex gap-3 relative"
              >
                <img
                  src={item.product.image}
                  alt={lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                  className="w-16 h-16 rounded-xl object-cover bg-stone-200 shrink-0"
                />

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-black text-stone-900 leading-snug">
                        {lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-red-500 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {item.selectedOptions.map(o => o.optionName).join(' + ')}
                      </p>
                    )}
                    {item.specialInstructions && (
                      <p className="text-[10px] text-amber-700 mt-0.5 italic">
                        "{item.specialInstructions}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/60">
                    <span className="text-xs font-black text-emerald-700">
                      {item.totalPrice.toFixed(1)} {t.store.sar}
                    </span>

                    <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg p-0.5">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Promo Code Input In Drawer */}
            <div className="pt-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder={t.cart.couponPlaceholder}
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-stone-100 uppercase font-bold border border-stone-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-stone-800 text-white rounded-xl text-xs font-bold hover:bg-stone-900 transition-colors"
                >
                  {isRtl ? 'تطبيق' : 'Apply'}
                </button>
              </form>
              {appliedPromo && (
                <p className="text-[11px] font-bold text-emerald-700 mt-1">
                  ✓ {t.cart.couponApplied} ({appliedPromo.code} - {appliedPromo.discountPercent}%)
                </p>
              )}
              {promoMsg && (
                <p className="text-[11px] font-bold text-red-500 mt-1">
                  {promoMsg}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cart Total & Checkout Footer */}
        {cart.length > 0 && (
          <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3 shrink-0">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>{t.cart.subtotal}</span>
                <span className="font-semibold">{cartSubtotal.toFixed(2)} {t.store.sar}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.cart.deliveryFee}</span>
                <span className="font-semibold">{cartDeliveryFee === 0 ? (isRtl ? 'مجاني 🎁' : 'Free 🎁') : `${cartDeliveryFee.toFixed(2)} ${t.store.sar}`}</span>
              </div>
              <div className="flex justify-between">
                <span>{t.cart.serviceFee}</span>
                <span className="font-semibold">{cartServiceFee.toFixed(2)} ${t.store.sar}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>{t.cart.discount}</span>
                  <span>-{cartDiscount.toFixed(2)} {t.store.sar}</span>
                </div>
              )}
              <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-black text-stone-900">
                <span>{t.cart.total}</span>
                <span className="text-emerald-700 text-base">{cartTotal.toFixed(2)} {t.store.sar}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-between transition-transform active:scale-98 cursor-pointer"
            >
              <span>{t.cart.checkout}</span>
              <div className="flex items-center gap-1">
                <span>{cartTotal.toFixed(1)} {t.store.sar}</span>
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
