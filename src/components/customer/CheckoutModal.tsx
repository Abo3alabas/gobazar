import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import {
  X,
  CreditCard,
  Wallet,
  Banknote,
  MapPin,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Plus
} from 'lucide-react';
import { PaymentMethod } from '../../types';

interface CheckoutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onSuccess }) => {
  const {
    cart,
    cartSubtotal,
    cartDeliveryFee,
    cartServiceFee,
    cartDiscount,
    cartTotal,
    appliedPromo,
    applyPromoCode,
    placeOrder,
    customerWallet,
    rechargeWallet,
    selectedDeliveryAddress,
    setSelectedDeliveryAddress,
    lang,
    isRtl
  } = useApp();

  const t = translations[lang];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressEditor, setShowAddressEditor] = useState(false);
  const [addressInput, setAddressInput] = useState(selectedDeliveryAddress);

  // Card details state for electronic payment
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 8842');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('890');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    if (!promoInput.trim()) return;
    const success = applyPromoCode(promoInput);
    if (!success) {
      setPromoError(isRtl ? 'رمز الكوبون غير صحيح أو منتهي الصلاحية' : 'Invalid or expired promo code');
    }
  };

  const handleConfirmOrder = async () => {
    if (paymentMethod === 'wallet' && customerWallet < cartTotal) {
      setPromoError(isRtl ? 'رصيد المحفظة غير كافٍ. يرجى شحن المحفظة أو اختيار طريقة دفع أخرى.' : 'Insufficient wallet balance. Please recharge or choose another method.');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate secure tokenized payment gateway check
      setTimeout(() => {
        placeOrder(paymentMethod, deliveryNotes);
        setIsProcessing(false);
        onSuccess();
      }, 1200);
    } catch {
      setIsProcessing(false);
    }
  };

  const paymentOptions: { id: PaymentMethod; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'card',
      title: isRtl ? 'بطاقة بنكية (فيزا / ماستركارد)' : 'Debit / Credit Card (Visa / MC)',
      subtitle: isRtl ? 'دفع إلكتروني آمن ومشفر 3D Secure' : 'Visa, Mastercard, 3D Secure SSL',
      icon: <CreditCard className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'apple_pay',
      title: t.checkout.methods.applePay,
      subtitle: isRtl ? 'دفع فوري بلمسة واحدة آمنة' : 'Touch ID / Face ID 1-Tap Pay',
      icon: <div className="font-black text-sm text-stone-900">Pay</div>,
    },
    {
      id: 'mada',
      title: isRtl ? 'ريفولوت وبطاقات الاتحاد الأوروبي (Revolut / SEPA)' : 'Revolut & SEPA Transfer',
      subtitle: isRtl ? 'دفع فوري عبر الحسابات المصرفية الأوروبية' : 'Instant European Bank & Revolut Checkout',
      icon: <span className="font-bold text-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">EU SEPA</span>,
    },
    {
      id: 'wallet',
      title: `${t.checkout.methods.wallet} (${customerWallet.toFixed(2)} €)`,
      subtitle: customerWallet >= cartTotal ? (isRtl ? 'الرصيد يغطي الطلب بالكامل' : 'Balance covers order') : (isRtl ? 'الرصيد غير كافٍ' : 'Insufficient balance'),
      icon: <Wallet className="w-5 h-5 text-amber-500" />,
    },
    {
      id: 'cash',
      title: isRtl ? 'الدفع نقداً باليورو عند الاستلام (COD)' : 'Cash on Delivery (EUR €)',
      subtitle: isRtl ? 'تسليم المبلغ مباشرة لمندوب التوصيل' : 'Pay in cash in EUR to the courier',
      icon: <Banknote className="w-5 h-5 text-stone-600" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-green-800 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
            <h3 className="font-black text-base sm:text-lg">
              {t.checkout.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Delivery Address Box */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black text-stone-900">
                  {t.checkout.deliveryAddress}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressEditor(!showAddressEditor)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
              >
                {t.checkout.changeAddress}
              </button>
            </div>

            {showAddressEditor ? (
              <div className="mt-2 space-y-2">
                <textarea
                  rows={2}
                  value={addressInput}
                  onChange={e => setAddressInput(e.target.value)}
                  className="w-full p-2.5 text-xs bg-white border border-stone-300 rounded-xl focus:border-emerald-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDeliveryAddress(addressInput);
                    setShowAddressEditor(false);
                  }}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  {isRtl ? 'حفظ العنوان' : 'Save Address'}
                </button>
              </div>
            ) : (
              <p className="text-xs text-stone-700 leading-relaxed">
                {selectedDeliveryAddress}
              </p>
            )}

            <input
              type="text"
              value={deliveryNotes}
              onChange={e => setDeliveryNotes(e.target.value)}
              placeholder={t.checkout.deliveryNotes}
              className="mt-3 w-full px-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Promo Code Form */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
            <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <input
                type="text"
                value={promoInput}
                onChange={e => setPromoInput(e.target.value)}
                placeholder={t.cart.couponPlaceholder}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-emerald-300 rounded-xl uppercase font-bold text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
              >
                {isRtl ? 'تطبيق' : 'Apply'}
              </button>
            </form>
            {appliedPromo && (
              <p className="text-xs font-bold text-emerald-700 mt-2 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {t.cart.couponApplied} ({appliedPromo.code} - {appliedPromo.discountPercent}%)
              </p>
            )}
            {promoError && (
              <p className="text-xs font-bold text-red-600 mt-1.5">
                {promoError}
              </p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <h4 className="text-xs font-black text-stone-900 mb-2.5 flex items-center justify-between">
              <span>{t.checkout.paymentMethod}</span>
              <span className="text-[11px] font-normal text-stone-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                {isRtl ? 'دفع إلكتروني مشفر وآمن 100%' : '100% Encrypted & PCI-Compliant'}
              </span>
            </h4>

            <div className="space-y-2">
              {paymentOptions.map(opt => {
                const isSelected = paymentMethod === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center">
                          {opt.icon}
                        </div>
                        <div>
                          <p className="text-xs font-black text-stone-900">
                            {opt.title}
                          </p>
                          <p className="text-[10px] text-stone-500">
                            {opt.subtitle}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    {/* Electronic Card Extra inputs simulation if card selected */}
                    {isSelected && (opt.id === 'card' || opt.id === 'mada') && (
                      <div className="mt-3 pt-3 border-t border-emerald-200 grid grid-cols-3 gap-2">
                        <div className="col-span-3">
                          <label className="text-[10px] font-bold text-stone-600">{isRtl ? 'رقم البطاقة' : 'Card Number'}</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-800"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-stone-600">{isRtl ? 'تاريخ الانتهاء' : 'Expiry'}</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-600">CVV</label>
                          <input
                            type="password"
                            maxLength={3}
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-stone-800"
                          />
                        </div>
                      </div>
                    )}

                    {/* Wallet Recharge button shortcut if selected and low balance */}
                    {isSelected && opt.id === 'wallet' && customerWallet < cartTotal && (
                      <div className="mt-2.5 pt-2 border-t border-amber-200 flex items-center justify-between">
                        <span className="text-[11px] text-amber-800 font-bold">
                          {isRtl ? 'اشحن محفظتك بضغطة زر:' : 'Quick wallet top-up:'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            rechargeWallet(100);
                          }}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <Plus className="w-3 h-3" />
                          +100 {t.store.sar}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Breakdown Summary */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>{t.cart.subtotal} ({cart.reduce((s, i) => s + i.quantity, 0)} {t.cart.itemsCount})</span>
              <span className="font-semibold">{cartSubtotal.toFixed(2)} {t.store.sar}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{t.cart.deliveryFee}</span>
              <span className="font-semibold">{cartDeliveryFee === 0 ? (isRtl ? 'مجاناً 🎁' : 'Free 🎁') : `${cartDeliveryFee.toFixed(2)} ${t.store.sar}`}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{t.cart.serviceFee}</span>
              <span className="font-semibold">{cartServiceFee.toFixed(2)} {t.store.sar}</span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>{t.cart.discount} ({appliedPromo?.code})</span>
                <span>-{cartDiscount.toFixed(2)} {t.store.sar}</span>
              </div>
            )}
            <div className="pt-2 border-t border-stone-200 flex justify-between text-sm font-black text-stone-900">
              <span>{t.cart.total}</span>
              <span className="text-emerald-700 text-base">{cartTotal.toFixed(2)} {t.store.sar}</span>
            </div>
          </div>
        </div>

        {/* Modal Action Button */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center gap-3">
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-2xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs transition-colors"
          >
            {isRtl ? 'رجوع' : 'Back'}
          </button>

          <button
            onClick={handleConfirmOrder}
            disabled={isProcessing}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t.checkout.processing}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span>{t.checkout.confirmAndPay}</span>
                <span className="bg-white/20 px-2.5 py-1 rounded-xl text-xs font-black">
                  {cartTotal.toFixed(2)} {t.store.sar}
                </span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
