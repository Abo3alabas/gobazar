import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { DeliveryMap } from '../common/DeliveryMap';
import { IncomingOrderModal } from './IncomingOrderModal';
import {
  Bike,
  Power,
  DollarSign,
  TrendingUp,
  Award,
  Star,
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface DriverAppProps {
  activeTab?: 'trips' | 'radar' | 'earnings' | 'shift';
}

export const DriverApp: React.FC<DriverAppProps> = ({ activeTab = 'trips' }) => {
  const {
    drivers,
    orders,
    driverIncomingOffer,
    driverAcceptOffer,
    driverDeclineOffer,
    driverUpdateTripStatus,
    toggleDriverOnline,
    setActiveChatOrderId,
    lang,
    isRtl
  } = useApp();

  const t = translations[lang];
  const driver = drivers[0]; // Active driver profile (Stefan Ivanov)

  // Find currently active assigned delivery trip for driver
  const activeOrder = orders.find(o =>
    (o.driver?.id === driver.id || o.status === 'on_the_way' || o.status === 'driver_assigned' || o.status === 'ready_for_pickup') &&
    o.status !== 'delivered' &&
    o.status !== 'cancelled'
  );

  const isOnline = driver.status === 'online' || driver.status === 'busy';

  const handleNextStep = () => {
    if (!activeOrder) return;
    if (activeOrder.status === 'ready_for_pickup' || activeOrder.status === 'driver_assigned') {
      driverUpdateTripStatus(activeOrder.id, 'on_the_way');
    } else if (activeOrder.status === 'on_the_way') {
      driverUpdateTripStatus(activeOrder.id, 'delivered');
    }
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in pb-12">
      
      {/* Driver Header & Shift Status Toggle */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white shadow-xl border border-stone-800 flex items-center justify-between gap-3">
        {/* Profile Details */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={driver.avatar}
              alt={driver.name}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <span
              className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-stone-900 ${
                isOnline ? 'bg-emerald-500' : 'bg-stone-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-black text-white truncate max-w-[140px]">
                {driver.name}
              </h2>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/40">
                🛵 {driver.vehiclePlate}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="font-black">{driver.rating}</span>
              <span className="text-stone-400 text-[10px]">
                ({driver.ratingCount} • {driver.acceptanceRate}%)
              </span>
            </div>
          </div>
        </div>

        {/* Online / Offline Toggle Button */}
        <button
          onClick={toggleDriverOnline}
          className={`px-3 py-2 rounded-2xl flex items-center gap-1.5 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
            isOnline
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isOnline ? (isRtl ? 'متصل' : 'Online') : (isRtl ? 'غير متصل' : 'Offline')}</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE TRIPS */}
      {activeTab === 'trips' && (
        <div className="space-y-4">
          {/* Active Trip Navigation & Action Screen */}
          {activeOrder ? (
            <div className="p-4 rounded-3xl bg-white border-2 border-emerald-500/80 shadow-lg space-y-4">
              {/* Active Trip Header Bar */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <Bike className="w-4 h-4 animate-pulse" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black text-emerald-700 uppercase">
                        {isRtl ? 'مهمة توصيل نشطة' : 'Active Mission'}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-stone-100 text-[9px] font-black text-stone-700">
                        #{activeOrder.trackingNumber}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-stone-900">
                      {lang === 'ar' ? activeOrder.storeNameAr : activeOrder.storeNameEn}
                    </h3>
                  </div>
                </div>

                {/* Quick Customer Communication Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveChatOrderId(activeOrder.id)}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`tel:${activeOrder.customerPhone}`}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Interactive Turn-by-Turn Map View */}
              <div className="rounded-2xl overflow-hidden shadow-inner border border-stone-200">
                <DeliveryMap
                  progressPercent={activeOrder.driverProgressPercent}
                  storeName={lang === 'ar' ? activeOrder.storeNameAr : activeOrder.storeNameEn}
                  driverName={driver.name}
                  estimatedMinutes={activeOrder.estimatedDeliveryMinutes}
                  heightClass="h-[220px]"
                  isRtl={isRtl}
                />
              </div>

              {/* Trip Destination & Customer Notes Box */}
              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-0.5">
                  <span className="text-[10px] font-bold text-stone-500 block">{t.driverApp.dropoffLocation}</span>
                  <p className="font-black text-stone-900">{activeOrder.customerAddress}</p>
                  <p className="text-[11px] text-stone-600">{activeOrder.customerName} ({activeOrder.customerPhone})</p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs space-y-0.5">
                  <span className="text-[10px] font-bold text-amber-800 block">{t.driverApp.customerNotes}</span>
                  <p className="text-amber-950 font-medium text-[11px]">
                    {activeOrder.notes || (isRtl ? 'لا توجد ملاحظات خاصة من العميل' : 'No specific customer instructions')}
                  </p>
                  <p className="text-emerald-800 font-bold text-[11px]">
                    💶 {isRtl ? 'طريقة الدفع: ' : 'Payment: '}
                    {activeOrder.paymentMethod === 'cash'
                      ? (isRtl ? 'تحصيل نقدي باليورو عند التسليم' : 'Cash on Delivery (EUR)')
                      : (isRtl ? 'مدفوع إلكترونياً بالكامل ✓' : 'Pre-paid Online ✓')}
                  </p>
                </div>
              </div>

              {/* Mission Progression Action Button */}
              <button
                onClick={handleNextStep}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-between transition-transform active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {activeOrder.status === 'ready_for_pickup' || activeOrder.status === 'driver_assigned'
                      ? t.driverApp.actions.orderCollected
                      : t.driverApp.actions.confirmDelivered}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-2.5 py-0.5 rounded-lg text-[11px]">
                  <span>{isRtl ? 'عمولة التوصيل: 4.80 €' : 'Payout: 4.80 €'}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </div>
              </button>
            </div>
          ) : (
            /* Idle / Radar Searching State */
            <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center space-y-3 shadow-xs">
              <div className="relative inline-block mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border-4 border-emerald-100 shadow-inner">
                  <Bike className="w-8 h-8 animate-pulse" />
                </div>
                {isOnline && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-black text-stone-900">
                  {isOnline
                    ? (isRtl ? 'أنت متصل وجاهز لاستقبال الطلبات في صوفيا 📡' : 'Online & ready for orders in Sofia 📡')
                    : (isRtl ? 'أنت غير متصل حالياً (في استراحة) ☕' : 'You are currently offline (On Break) ☕')}
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                  {isOnline
                    ? (isRtl ? 'ستصلك عروض توصيل جديدة فورا بأجر موحد باليورو (€).' : 'You will receive incoming delivery offers with EUR (€) payouts.')
                    : (isRtl ? 'اضغط زر "اتصال" بالأعلى للبدء.' : 'Tap "Go Online" above to receive orders.')}
                </p>
              </div>
            </div>
          )}

          {/* Quick Metrics Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 block">{t.driverApp.todayEarnings}</span>
              <span className="text-lg font-black text-emerald-700">{driver.todayEarnings.toFixed(2)} €</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-stone-200">
              <span className="text-[10px] font-bold text-stone-500 block">{t.driverApp.todayTrips}</span>
              <span className="text-lg font-black text-stone-900">{driver.todayTrips} {isRtl ? 'رحلات' : 'trips'}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RADAR MAP */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-stone-900">
                  {isRtl ? 'خريطة الرادار الحية - صوفيا' : 'Live Radar Map - Sofia'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {isRtl ? '4 مناطق نشطة' : '4 Active Hotspots'}
              </span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-inner">
              <DeliveryMap
                progressPercent={activeOrder?.driverProgressPercent || 50}
                storeName={activeOrder ? (lang === 'ar' ? activeOrder.storeNameAr : activeOrder.storeNameEn) : 'Sofia Center'}
                driverName={driver.name}
                estimatedMinutes={activeOrder?.estimatedDeliveryMinutes || 10}
                heightClass="h-[210px]"
                isRtl={isRtl}
              />
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
              <p className="font-black text-stone-900">📍 {isRtl ? 'موقعك الحالي:' : 'Your Location:'} {driver.coordinates.addressName}</p>
              <p className="text-[11px] text-stone-500">{isRtl ? 'تتواجد بالقرب من شارع فيتوشا بوليفارد التجاري ذو الكثافة العالية للطلبات.' : 'Near Vitosha Blvd commercial corridor with high order density.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EARNINGS & WALLET */}
      {activeTab === 'earnings' && (
        <div className="space-y-4">
          {/* Main Earnings Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-stone-950 text-white shadow-xl space-y-3">
            <span className="text-xs text-emerald-300 font-bold block">{t.driverApp.walletBalance}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black">{driver.walletBalance.toFixed(2)}</span>
              <span className="text-lg font-bold text-emerald-400">€</span>
            </div>
            <p className="text-[11px] text-stone-300">
              {isRtl ? 'الأرباح اليومية: ' : 'Today: '}{driver.todayEarnings.toFixed(2)} € • {driver.todayTrips} {isRtl ? 'رحلات مكتملة' : 'completed trips'}
            </p>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <span className="text-[10px] font-bold text-stone-500 block">{isRtl ? 'متوسط الرحلة' : 'Avg per trip'}</span>
              <span className="text-lg font-black text-stone-900">5.33 €</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">+{isRtl ? 'شامل الإكراميات' : 'incl. tips'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
              <span className="text-[10px] font-bold text-stone-500 block">{isRtl ? 'إجمالي الرحلات' : 'Total Lifetime'}</span>
              <span className="text-lg font-black text-stone-900">{driver.totalDeliveries}</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">{isRtl ? 'رحلة موثقة' : 'trips'}</span>
            </div>
          </div>

          {/* Action Payout */}
          <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-sm cursor-pointer">
            {isRtl ? 'طلب تحويل بنكي فوري (SEPA / Revolut)' : 'Request Instant Payout (SEPA / Revolut)'}
          </button>
        </div>
      )}

      {/* TAB 4: SHIFT & PROFILE */}
      {activeTab === 'shift' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-stone-900 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-emerald-600" />
              <span>{t.driverApp.recentFeedback}</span>
            </h4>

            <div className="flex flex-wrap gap-2">
              {driver.praises.map((praise, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold"
                >
                  {praise}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2 text-xs">
            <h4 className="font-black text-stone-900">{isRtl ? 'بيانات المركبة والترخيص' : 'Vehicle & Permit'}</h4>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">{isRtl ? 'النوع:' : 'Type:'}</span>
              <span className="font-bold">{isRtl ? 'سكوتر توصيل سريع 🛵' : 'Delivery Scooter 🛵'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500">{isRtl ? 'رقم اللوحة:' : 'Plate:'}</span>
              <span className="font-mono font-bold">{driver.vehiclePlate}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-stone-500">{isRtl ? 'منطقة العمل:' : 'Zone:'}</span>
              <span className="font-bold">{isRtl ? 'صوفيا الكبرى، بلغاريا' : 'Greater Sofia, Bulgaria'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Incoming Order Offer Popup Modal */}
      {driverIncomingOffer && (
        <IncomingOrderModal
          order={driverIncomingOffer}
          onAccept={() => driverAcceptOffer(driverIncomingOffer.id)}
          onDecline={driverDeclineOffer}
        />
      )}
    </div>
  );
};

