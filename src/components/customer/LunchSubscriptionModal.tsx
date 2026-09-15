import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../services/api';
import { LunchSubscription } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  MapPin,
  Utensils,
  ThumbsUp,
  Flame,
  Check
} from 'lucide-react';

interface LunchSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LunchSubscriptionModal: React.FC<LunchSubscriptionModalProps> = ({ isOpen, onClose }) => {
  const { lang, isRtl } = useApp();
  const t = translations[lang];

  const [subData, setSubData] = useState<LunchSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [approvedToast, setApprovedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getLunchSubscription();
      if (data) {
        setSubData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleApproveToday = async () => {
    setLoading(true);
    try {
      const res = await apiService.approveLunchMeal();
      if (res) {
        setSubData(res.data || res);
        setApprovedToast(true);
        setTimeout(() => setApprovedToast(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapToday = async () => {
    setLoading(true);
    try {
      const res = await apiService.swapLunchMeal({
        newDishName: 'برجر كرافت آنجوس دايت مشوي مع بطاطا ويدجز',
        newStoreName: 'برجر كرافت صوفيا',
        newImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80',
      });
      if (res) {
        setSubData(res.data || res);
        alert(isRtl ? 'تم تغيير وجبة اليوم بنجاح إلى برجر كرافت آنجوس!' : 'Meal swapped to Craft Angus Burger!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl">
                🍱
              </div>
              <div>
                <h3 className="text-base font-black leading-tight">
                  {isRtl ? 'اشتراك الغداء الذكي (20 وجبة شهرياً)' : 'Smart Lunch Subscription'}
                </h3>
                <p className="text-[11px] text-blue-100 font-medium">
                  {isRtl ? 'وفر 35% واستلم غداء عملك يومياً في موعدك المحدد' : 'Save 35% with daily scheduled office lunch'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 bg-blue-950/40 rounded-xl p-2.5 border border-blue-400/30">
            <div className="flex justify-between text-[11px] font-bold mb-1">
              <span>{isRtl ? 'الرصيد المتبقي:' : 'Remaining Balance:'}</span>
              <span className="text-amber-300">
                {subData?.remainingDays || 16} {isRtl ? 'من أصل 20 وجبة' : 'of 20 meals'}
              </span>
            </div>
            <div className="w-full bg-blue-900/60 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${((20 - (subData?.remainingDays || 16)) / 20) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Today's Proposed Meal Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 text-white border border-stone-800 shadow-xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{isRtl ? 'وجبة اليوم المقترحة تلقائياً' : "Today's Selected Meal"}</span>
              </span>
              <span className="text-[11px] text-stone-300 font-bold bg-stone-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-400" />
                <span>{subData?.preferredTime || '13:00'}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={subData?.todayMeal?.image || 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=500&auto=format&fit=crop&q=80'}
                alt={subData?.todayMeal?.dishName}
                className="w-16 h-16 rounded-xl object-cover border border-stone-700 shadow-sm shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-blue-300 block">
                  📍 {subData?.todayMeal?.storeName || 'شاورما الشام'}
                </span>
                <h4 className="text-xs font-black text-white truncate mt-0.5">
                  {subData?.todayMeal?.dishName}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-300">
                  <span className="flex items-center gap-0.5 text-amber-400">
                    <Flame className="w-3 h-3" />
                    <span>{subData?.todayMeal?.calories || 680} سعرة</span>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">
                    {isRtl ? 'مشملولة في الاشتراك (5.99€)' : 'Included in Plan'}
                  </span>
                </div>
              </div>
            </div>

            {/* Approval and swap buttons */}
            <div className="pt-2 border-t border-stone-800 flex gap-2">
              <button
                onClick={handleApproveToday}
                disabled={loading || subData?.todayMeal?.status === 'approved'}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
                  subData?.todayMeal?.status === 'approved'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>
                  {subData?.todayMeal?.status === 'approved'
                    ? isRtl ? 'تمت الموافقة وسنرسلها بالموعد! ✅' : 'Approved for delivery! ✅'
                    : isRtl ? 'وافق على وجبة اليوم' : 'Approve Today'}
                </span>
              </button>

              <button
                onClick={handleSwapToday}
                disabled={loading}
                className="px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isRtl ? 'تغيير' : 'Swap'}</span>
              </button>
            </div>
          </div>

          {/* Delivery Details */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-800">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{isRtl ? 'عنوان التوصيل المعتمد للغداء:' : 'Lunch Delivery Address:'}</span>
            </div>
            <p className="text-stone-600 text-[11px]">
              {subData?.deliveryAddress || 'شارع فيتوشا 15، الطابق الثالث، صوفيا'}
            </p>
          </div>

          {/* 5-Day Upcoming Calendar Preview */}
          <div>
            <span className="text-xs font-black text-stone-800 block mb-2">
              {isRtl ? 'جدول الوجبات للأيام القادمة:' : 'Upcoming Menu Calendar:'}
            </span>
            <div className="space-y-1.5">
              {subData?.calendar?.map((c) => (
                <div
                  key={c.dayNumber}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-black text-[10px] flex items-center justify-center shrink-0">
                      {c.dayNumber}
                    </span>
                    <div className="min-w-0">
                      <h5 className="font-black text-stone-900 truncate text-[11px]">{c.dishName}</h5>
                      <span className="text-[10px] text-stone-400 block">{c.date} • {c.storeName}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                    {c.calories} ك.سعرة
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
