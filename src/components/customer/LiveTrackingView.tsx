import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { DeliveryMap } from '../common/DeliveryMap';
import {
  Phone,
  MessageSquare,
  Star,
  CheckCircle2,
  Clock,
  Bike,
  Store as StoreIcon,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface LiveTrackingViewProps {
  orderId: string;
  onBackToHome: () => void;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({ orderId, onBackToHome }) => {
  const {
    orders,
    setActiveChatOrderId,
    setRatingModalOrderId,
    lang,
    isRtl,
  } = useApp();

  const t = translations[lang];
  const order = orders.find(o => o.id === orderId) || orders[0];

  // Dynamic progress animation for live tracking simulation
  const [animatedProgress, setAnimatedProgress] = useState(order?.driverProgressPercent || 50);

  useEffect(() => {
    if (!order) return;
    setAnimatedProgress(order.driverProgressPercent);

    // If order is in on_the_way state, let's slowly increment driver progress towards destination for thrill
    if (order.status === 'on_the_way') {
      const interval = setInterval(() => {
        setAnimatedProgress(prev => {
          if (prev >= 96) return prev;
          return prev + 0.5;
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [order?.driverProgressPercent, order?.status]);

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <p className="text-stone-500">{isRtl ? 'لا يوجد طلب نشط بهذا الرقم' : 'No active order found'}</p>
        <button onClick={onBackToHome} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs">
          {isRtl ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
      </div>
    );
  }

  const statusSteps: { key: OrderStatus; label: string; time?: string; done: boolean; active: boolean }[] = [
    {
      key: 'pending',
      label: t.tracking.status.pending,
      time: order.timestamps.created,
      done: true,
      active: order.status === 'pending',
    },
    {
      key: 'preparing',
      label: t.tracking.status.preparing,
      time: order.timestamps.preparing || order.timestamps.accepted,
      done: ['preparing', 'ready_for_pickup', 'driver_assigned', 'on_the_way', 'delivered'].includes(order.status),
      active: order.status === 'preparing',
    },
    {
      key: 'ready_for_pickup',
      label: t.tracking.status.ready_for_pickup,
      time: order.timestamps.readyForPickup,
      done: ['ready_for_pickup', 'driver_assigned', 'on_the_way', 'delivered'].includes(order.status),
      active: order.status === 'ready_for_pickup',
    },
    {
      key: 'on_the_way',
      label: t.tracking.status.on_the_way,
      time: order.timestamps.pickedUp,
      done: ['on_the_way', 'delivered'].includes(order.status),
      active: order.status === 'on_the_way',
    },
    {
      key: 'delivered',
      label: t.tracking.status.delivered,
      time: order.timestamps.delivered,
      done: order.status === 'delivered',
      active: order.status === 'delivered',
    },
  ];

  return (
    <div className="px-3.5 py-3 space-y-3 animate-fade-in pb-8">
      
      {/* Top Breadcrumb & Status Alert */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-1 text-xs font-bold text-stone-600 hover:text-emerald-700 transition-colors"
        >
          {isRtl ? <ArrowLeft className="w-3.5 h-3.5 rotate-180" /> : <ArrowLeft className="w-3.5 h-3.5" />}
          <span>{isRtl ? 'العودة للتسوق' : 'Continue Shopping'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
            #{order.trackingNumber}
          </span>
        </div>
      </div>

      {/* Live Map Telemetry Component */}
      <div className="relative rounded-2xl overflow-hidden shadow-md border border-stone-200">
        <DeliveryMap
          progressPercent={animatedProgress}
          storeName={lang === 'ar' ? order.storeNameAr : order.storeNameEn}
          driverName={order.driver?.name || 'كابتن جو بازار'}
          estimatedMinutes={order.status === 'delivered' ? 0 : order.estimatedDeliveryMinutes}
          heightClass="h-[180px]"
          isRtl={isRtl}
        />
      </div>

      {/* Driver Card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 text-white shadow-md border border-stone-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
            <Bike className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.tracking.driverInfo}</span>
          </span>
          <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
            {isRtl ? 'كابتن معتمد 🇧🇬' : 'Verified Driver 🇧🇬'}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={order.driver?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt="Driver"
              className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-500"
            />
            <span className="absolute -bottom-1 -right-1 p-0.5 bg-amber-500 rounded-full text-white text-[8px]">
              <Star className="w-2.5 h-2.5 fill-white" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-black text-white truncate">
              {order.driver?.name || 'Stefan Ivanov'}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="font-bold">{order.driver?.rating || 4.96}</span>
              <span className="text-stone-400 text-[10px]">
                ({order.driver?.totalDeliveries || 1250}+ {isRtl ? 'رحلة' : 'trips'})
              </span>
            </div>
            <p className="text-[10px] text-stone-400">
              🛵 {order.driver?.vehiclePlate || 'CB 8842 AB (Sofia)'}
            </p>
          </div>
        </div>

        {/* Direct Communication Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
          <button
            onClick={() => setActiveChatOrderId(order.id)}
            className="py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t.tracking.chatWithDriver}</span>
          </button>

          <a
            href={`tel:${order.driver?.phone || '+359888123456'}`}
            className="py-1.5 px-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t.tracking.callDriver}</span>
          </a>
        </div>
      </div>

      {/* Status Progression Card */}
      <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <h3 className="text-xs font-black text-stone-900">
              {t.tracking.title}
            </h3>
            <p className="text-[10px] text-stone-500">
              {lang === 'ar' ? order.storeNameAr : order.storeNameEn}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-stone-400 block">{t.tracking.estimatedArrival}</span>
            <span className="text-xs font-black text-emerald-600">
              {order.status === 'delivered' ? (isRtl ? 'تم التسليم 🎉' : 'Delivered 🎉') : `~${order.estimatedDeliveryMinutes} ${t.store.mins}`}
            </span>
          </div>
        </div>

        {/* Vertical Timeline Steps */}
        <div className="relative border-s-2 border-emerald-500 ms-2.5 space-y-3.5 py-1">
          {statusSteps.map((step, idx) => (
            <div key={idx} className="ms-4 relative">
              <span
                className={`absolute -start-[23px] top-0 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white ${
                  step.done
                    ? 'bg-emerald-600 text-white'
                    : step.active
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-stone-200 text-stone-400'
                }`}
              >
                {step.done ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Clock className="w-2.5 h-2.5" />
                )}
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <h4
                    className={`text-[11px] font-bold ${
                      step.done || step.active ? 'text-stone-900' : 'text-stone-400'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {step.key === 'preparing' && (order.status === 'preparing' || order.prepTimeMinutes) && (
                    <p className="text-[10px] text-amber-700 font-medium">
                      ⏱️ {isRtl ? `وقت التجهيز: ${order.prepTimeMinutes || 15} د` : `Prep time: ${order.prepTimeMinutes || 15} min`}
                    </p>
                  )}
                </div>
                {step.time && (
                  <span className="text-[9px] text-stone-400 font-medium">
                    {step.time}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ordered Items Summary Card */}
      <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
        <h4 className="text-xs font-black text-stone-900 border-b border-stone-100 pb-1.5">
          {isRtl ? 'تفاصيل محتويات الطلب' : 'Order Basket Items'}
        </h4>
        <div className="divide-y divide-stone-100">
          {order.items.map((item) => (
            <div key={item.id} className="py-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                  {item.quantity}x
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-xs">
                    {lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                  </p>
                </div>
              </div>
              <span className="font-black text-stone-800">
                {item.totalPrice.toFixed(2)} €
              </span>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-stone-100 flex justify-between text-xs font-black text-stone-900">
          <span>{t.cart.total}</span>
          <span className="text-emerald-700">{order.total.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
};
