import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { Store, Product } from '../../types';
import {
  Footprints,
  Clock,
  QrCode,
  MapPin,
  CheckCircle2,
  Zap,
  ShoppingBag,
  Sparkles
} from 'lucide-react';

interface SmartWalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStore?: (store: Store) => void;
}

export const SmartWalkInModal: React.FC<SmartWalkInModalProps> = ({ isOpen, onClose, onSelectStore }) => {
  const { stores, products, addToCart, setIsCartOpen, lang, isRtl } = useApp();
  const t = translations[lang];

  const [pickupCode, setPickupCode] = useState('WALK-IN-382');
  const [selectedStore, setSelectedStore] = useState(stores[0]);

  if (!isOpen) return null;

  const nearbyStores = stores.slice(0, 3);
  const fastPickupItems = products.filter((p) => p.storeId === selectedStore.id);

  const handleQuickPickup = (product: Product) => {
    addToCart(product, 1, []);
    setIsCartOpen(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-amber-700 text-white p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl">
                🚶‍♂️
              </div>
              <div>
                <h3 className="text-base font-black leading-tight">
                  {isRtl ? 'Smart Walk-In (الاستلام السريع الذاتي)' : 'Smart Walk-In Pickup'}
                </h3>
                <p className="text-[11px] text-amber-100 font-medium">
                  {isRtl ? 'لا تنتظر في الطابور! اطلب الآن واستلم بنفسك بدون رسوم توصيل' : 'Skip the line! Order now & pick up in minutes'}
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

          {/* Proximity banner */}
          <div className="mt-3 flex items-center gap-2 bg-black/25 border border-white/20 rounded-xl px-3 py-1.5 text-[11px] font-bold">
            <MapPin className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>
              {isRtl ? 'تنبيه الموقع: أنت على بعد 120 متراً من المطاعم! طعامك يجهز فوراً.' : 'Proximity alert: You are 120m away! Food prepares now.'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Pickup Pass Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 text-white border border-stone-800 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block">
                {isRtl ? 'كود الاستلام المباشر' : 'Express Pickup Code'}
              </span>
              <span className="text-xl font-black tracking-widest text-white mt-0.5 block">
                {pickupCode}
              </span>
              <span className="text-[10px] text-stone-400 mt-1 block">
                {isRtl ? 'أظهره للكاشير لاستلام طلبك الساخن فوراً' : 'Show to cashier for instant pickup'}
              </span>
            </div>
            <div className="w-16 h-16 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md">
              <QrCode className="w-full h-full text-stone-950" />
            </div>
          </div>

          {/* Store Selector */}
          <div>
            <span className="text-xs font-black text-stone-800 block mb-2">
              {isRtl ? 'المطاعم القريبة للاستلام الفوري (0€ توصيل):' : 'Nearby Express Pickup Spots (0€ delivery):'}
            </span>
            <div className="grid grid-cols-3 gap-2">
              {nearbyStores.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStore(s)}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    selectedStore.id === s.id
                      ? 'border-amber-500 bg-amber-50/70 text-amber-900 shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-700'
                  }`}
                >
                  <span className="text-xs font-black block truncate">{lang === 'ar' ? s.nameAr : s.nameEn}</span>
                  <span className="text-[10px] text-stone-500 font-bold block mt-0.5">
                    ⏱️ ~8 {isRtl ? 'دقائق' : 'min'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fast Items for Selected Store */}
          <div className="space-y-2">
            <span className="text-xs font-black text-stone-800 block">
              {isRtl ? `وجبات جاهزة للاستلام السريع من ${lang === 'ar' ? selectedStore.nameAr : selectedStore.nameEn}:` : 'Express Meals:'}
            </span>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {fastPickupItems.map((prod) => (
                <div
                  key={prod.id}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white hover:border-amber-400 flex items-center justify-between gap-3 shadow-2xs transition-all"
                >
                  <img src={prod.image} alt={prod.nameAr} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-black text-stone-900 truncate">
                      {lang === 'ar' ? prod.nameAr : prod.nameEn}
                    </h5>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                      <span className="text-amber-700 font-black">{prod.price.toFixed(2)}€</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded text-[10px]">
                        0.00€ {isRtl ? 'رسوم توصيل' : 'fee'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleQuickPickup(prod)}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 cursor-pointer transition-all shadow-xs flex items-center gap-1"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'استلام سريع' : 'Pickup'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee banner */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-[11px] text-stone-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-stone-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isRtl ? 'ضمان عدم الانتظار في الطابور' : 'No Waiting Line Guarantee'}</span>
            </div>
            <p className="text-stone-500 leading-relaxed">
              {isRtl ? 'طلبك يوضع في ركن الاستلام السريع مع اسمك ورقم الكود فور وصولك، معبأً وساخناً.' : 'Your meal will be packaged and hot at the express pickup desk.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
