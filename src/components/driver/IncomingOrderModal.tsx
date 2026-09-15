import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import {
  Bike,
  MapPin,
  Clock,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  X,
  Navigation,
  Sparkles
} from 'lucide-react';

interface IncomingOrderModalProps {
  order: Order;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingOrderModal: React.FC<IncomingOrderModalProps> = ({ order, onAccept, onDecline }) => {
  const { lang, isRtl } = useApp();
  const t = translations[lang];

  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDecline]);

  const estimatedEarnings = 22.00; // SAR trip base payout + distance bonus

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-stone-900 text-white rounded-3xl shadow-2xl border-2 border-emerald-500 p-6 overflow-hidden">
        
        {/* Urgent Pulsing Alert Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h3 className="font-black text-base text-emerald-400">
              {t.driverApp.incomingOrder}
            </h3>
          </div>

          <div className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40">
            ⏱️ {secondsLeft} {t.driverApp.timer}
          </div>
        </div>

        {/* Guaranteed Earnings Banner */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-stone-950 border border-emerald-500/40 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block font-semibold">{t.driverApp.estEarnings}</span>
            <span className="text-2xl font-black text-emerald-400">
              {estimatedEarnings.toFixed(2)} {t.store.sar}
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            {isRtl ? 'أجرة + حافز فوري' : 'Fare + Instant Bonus'}
          </span>
        </div>

        {/* Route Details (Pickup & Dropoff) */}
        <div className="space-y-3 p-4 rounded-2xl bg-stone-950/60 border border-stone-800">
          {/* Pickup Point */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-bold block">{t.driverApp.pickupLocation}</span>
              <p className="text-xs font-black text-stone-100">
                {lang === 'ar' ? order.storeNameAr : order.storeNameEn}
              </p>
              <p className="text-[11px] text-stone-400">
                {isRtl ? 'المسافة إليك: 1.2 كم (3 دقائق)' : 'Distance to store: 1.2 km (3 mins)'}
              </p>
            </div>
          </div>

          <div className="w-px h-4 bg-stone-700 ms-3.5" />

          {/* Dropoff Point */}
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-500/30">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-bold block">{t.driverApp.dropoffLocation}</span>
              <p className="text-xs font-black text-stone-100">
                {order.customerAddress}
              </p>
              <p className="text-[11px] text-stone-400">
                {isRtl ? 'العميل: ' : 'Customer: '}{order.customerName}
              </p>
            </div>
          </div>
        </div>

        {/* Actions Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <button
            onClick={onDecline}
            className="py-3 px-4 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors cursor-pointer"
          >
            {t.driverApp.rejectOrder}
          </button>

          <button
            onClick={onAccept}
            className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-stone-950 font-black text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-transform active:scale-98 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t.driverApp.acceptOrder}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
