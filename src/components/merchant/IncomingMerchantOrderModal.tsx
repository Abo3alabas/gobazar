import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { Order } from '../../types';
import {
  ChefHat,
  Clock,
  MapPin,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Volume2,
  DollarSign,
  Sparkles
} from 'lucide-react';

interface IncomingMerchantOrderModalProps {
  order: Order;
  onClose: () => void;
}

export const IncomingMerchantOrderModal: React.FC<IncomingMerchantOrderModalProps> = ({
  order,
  onClose,
}) => {
  const { merchantAcceptOrder, merchantRejectOrder, lang, isRtl, setRole } = useApp();
  const t = translations[lang];

  const prepPresets = [10, 15, 20, 25, 30, 45];
  const [selectedPrepTime, setSelectedPrepTime] = useState<number>(order.prepTimeMinutes || 15);
  const [customTime, setCustomTime] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectForm, setShowRejectForm] = useState<boolean>(false);

  const handleAccept = () => {
    const finalPrepTime = isCustom && customTime && parseInt(customTime, 10) > 0
      ? parseInt(customTime, 10)
      : selectedPrepTime;
    
    merchantAcceptOrder(order.id, finalPrepTime);
    onClose();
  };

  const handleReject = () => {
    merchantRejectOrder(order.id, rejectReason || (isRtl ? 'المتجر مشغول حالياً' : 'Store is currently at full capacity'));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-emerald-500 overflow-hidden animate-scale-in">
        
        {/* Urgent Header Banner with Sound wave effect */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-700 via-emerald-800 to-stone-900 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-lg animate-bounce">
              <ChefHat className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-black uppercase tracking-wider">
                  {isRtl ? 'طلب جديد وارد' : 'Incoming Order'}
                </span>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                {t.merchantApp.incomingModalTitle}
              </h3>
            </div>
          </div>

          <div className="text-right rtl:text-left relative z-10">
            <span className="text-[10px] text-emerald-200 font-bold block">
              {isRtl ? 'رقم الطلب' : 'Order ID'}
            </span>
            <span className="text-sm sm:text-base font-black text-amber-300">
              #{order.trackingNumber}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Customer & Location Summary */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                {order.customerName.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-stone-900">{order.customerName}</h4>
                <p className="text-stone-500 text-[11px] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span className="truncate max-w-[220px]">{order.customerAddress}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="px-2.5 py-1 rounded-xl bg-white border border-stone-200 font-black text-emerald-700 shadow-xs">
                {order.total} {t.store.sar}
              </span>
              <span className="px-2 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                {order.paymentMethod === 'cash' ? (isRtl ? 'دفع عند الاستلام' : 'Cash on Delivery') : (isRtl ? 'مدفوع إلكترونياً ✓' : 'Paid Online ✓')}
              </span>
            </div>
          </div>

          {/* Items Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                {isRtl ? 'الأصناف المطلوبة' : 'Ordered Items'} ({order.items.length})
              </span>
            </div>

            <div className="rounded-2xl border border-stone-200 divide-y divide-stone-100 bg-white overflow-hidden shadow-xs">
              {order.items.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-stone-100 font-black text-stone-800 flex items-center justify-center text-xs shrink-0 border border-stone-200">
                      {item.quantity}x
                    </div>
                    <div>
                      <span className="font-black text-stone-900">
                        {lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                      </span>
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-[11px] text-stone-500">
                          {item.selectedOptions.map(o => o.optionName).join(' + ')}
                        </p>
                      )}
                      {item.specialInstructions && (
                        <p className="text-[10px] text-amber-700 font-medium mt-0.5">
                          ⚠️ {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-bold text-stone-700 shrink-0">
                    {item.totalPrice} {t.store.sar}
                  </span>
                </div>
              ))}
            </div>

            {order.notes && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <span className="text-base">📝</span>
                <div>
                  <span className="font-bold block">{isRtl ? 'ملاحظة خاصة من العميل:' : 'Customer Note:'}</span>
                  <p className="mt-0.5 text-stone-700 font-medium">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Time Specification Section */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" />
                {t.merchantApp.setPrepTime}
              </label>
              <span className="text-xs font-black text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
                {isCustom && customTime ? customTime : selectedPrepTime} {t.store.mins}
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {prepPresets.map((mins) => {
                const isSelected = !isCustom && selectedPrepTime === mins;
                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => {
                      setIsCustom(false);
                      setSelectedPrepTime(mins);
                    }}
                    className={`py-2 px-1 rounded-xl text-xs font-black transition-all border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm scale-105'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-emerald-300'
                    }`}
                  >
                    {mins} {t.store.mins}
                  </button>
                );
              })}
            </div>

            {/* Custom Minutes Option */}
            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustom(!isCustom)}
                className={`text-[11px] font-bold underline transition-colors ${
                  isCustom ? 'text-emerald-800' : 'text-stone-500 hover:text-emerald-700'
                }`}
              >
                {t.merchantApp.customMinutes}
              </button>
              {isCustom && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    placeholder="25"
                    className="w-20 px-2.5 py-1 text-xs font-bold rounded-lg border border-emerald-400 bg-white text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-stone-600">{t.store.mins}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reject Reason Form (if toggled) */}
          {showRejectForm && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2 animate-fade-in">
              <label className="text-xs font-bold text-red-900 block">
                {isRtl ? 'سبب الاعتذار عن الطلب:' : 'Reason for rejection:'}
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={isRtl ? 'مثال: نفاد أحد الأصناف أو ضغط شديد بالمطبخ' : 'e.g., Item out of stock or kitchen over-capacity'}
                className="w-full px-3 py-2 text-xs bg-white border border-red-200 rounded-xl focus:outline-hidden focus:border-red-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white shadow-xs hover:bg-red-700"
                >
                  {isRtl ? 'تأكيد الاعتذار' : 'Confirm Decline'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {!showRejectForm ? (
            <>
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 text-xs font-black transition-all flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>{t.merchantApp.rejectOrder}</span>
              </button>

              <button
                type="button"
                onClick={handleAccept}
                className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-sm shadow-lg shadow-emerald-700/20 transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <ChefHat className="w-5 h-5" />
                <span>{t.merchantApp.acceptAndStart}</span>
              </button>
            </>
          ) : null}
        </div>

      </div>
    </div>
  );
};
