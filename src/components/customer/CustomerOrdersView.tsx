import React from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { Order } from '../../types';
import {
  Package,
  Bike,
  CheckCircle2,
  Clock,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Navigation,
  MessageSquare,
  Star
} from 'lucide-react';

interface CustomerOrdersViewProps {
  onOpenTracking: (orderId: string) => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({ onOpenTracking }) => {
  const { orders, setActiveChatOrderId, setRatingModalOrderId, lang, isRtl } = useApp();
  const t = translations[lang];

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter(o => o.status === 'delivered' || o.status === 'cancelled');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_the_way':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center gap-1 shadow-xs animate-pulse">
            <Bike className="w-3 h-3" />
            <span>{isRtl ? 'في الطريق إليك 🛵' : 'On the Way 🛵'}</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{isRtl ? 'المطبخ يجهز الطلب 👨‍🍳' : 'In Kitchen 👨‍🍳'}</span>
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-500 text-white text-[10px] font-black flex items-center gap-1">
            <Package className="w-3 h-3" />
            <span>{isRtl ? 'بانتظار استلام المندوب' : 'Ready for Courier'}</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{isRtl ? 'تم التوصيل بنجاح' : 'Delivered'}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 space-y-5 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-stone-900">
          {isRtl ? 'طلباتي وتتبع الشحنات 📦' : 'My Orders & Tracking 📦'}
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {isRtl
            ? 'تتبع حي لموقع المندوب وحالة التحضير في صوفيا، بلغاريا'
            : 'Live GPS courier tracking and order history in Sofia, Bulgaria'}
        </p>
      </div>

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h2 className="text-xs font-black uppercase tracking-wider text-emerald-800">
              {isRtl ? 'الطلبات الجارية الآن' : 'Active Orders Right Now'}
            </h2>
          </div>

          {activeOrders.map(order => (
            <div
              key={order.id}
              className="p-4 rounded-3xl bg-white border-2 border-emerald-500/60 shadow-lg space-y-3 relative overflow-hidden"
            >
              {/* Top Row: Store & Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={order.storeImage}
                    alt={lang === 'ar' ? order.storeNameAr : order.storeNameEn}
                    className="w-12 h-12 rounded-2xl object-cover border border-stone-200"
                  />
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-stone-900">
                      {lang === 'ar' ? order.storeNameAr : order.storeNameEn}
                    </h3>
                    <p className="text-[11px] font-mono text-stone-400">
                      #{order.trackingNumber} • {order.timestamps.created}
                    </p>
                  </div>
                </div>

                {getStatusBadge(order.status)}
              </div>

              {/* Items Summary */}
              <div className="bg-stone-50 rounded-2xl p-3 text-xs text-stone-700 space-y-1">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between font-medium">
                    <span>
                      {item.quantity}x {lang === 'ar' ? item.product.nameAr : item.product.nameEn}
                    </span>
                    <span className="font-bold">{item.totalPrice.toFixed(2)} €</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-stone-900">
                  <span>{isRtl ? 'الإجمالي المدفوع:' : 'Total Paid:'}</span>
                  <span className="text-emerald-700 text-sm">{order.total.toFixed(2)} €</span>
                </div>
              </div>

              {/* Driver Snippet if assigned */}
              {order.driver && (
                <div className="flex items-center justify-between bg-amber-50/80 border border-amber-200/80 rounded-2xl p-2.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={order.driver.avatar}
                      alt={order.driver.name}
                      className="w-8 h-8 rounded-full object-cover border border-amber-400"
                    />
                    <div className="text-[11px]">
                      <p className="font-bold text-stone-900">{order.driver.name}</p>
                      <p className="text-amber-800 text-[10px]">
                        🛵 {order.driver.vehiclePlate} • {isRtl ? 'الوصول خلال' : 'Arriving in'} ~{order.estimatedDeliveryMinutes || 7} {t.store.mins}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveChatOrderId(order.id)}
                    className="p-2 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'محادثة' : 'Chat'}</span>
                  </button>
                </div>
              )}

              {/* Action: Open Live GPS Map */}
              <button
                id={`track-order-btn-${order.id}`}
                onClick={() => onOpenTracking(order.id)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Navigation className="w-4 h-4 animate-bounce" />
                <span>{isRtl ? 'فتح شاشة التتبع المباشر والخريطة 📍' : 'Open Live GPS Tracking Map 📍'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Past Orders Section */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-stone-600">
          {isRtl ? 'سجل الطلبات السابقة' : 'Past Order History'}
        </h2>

        {pastOrders.map(order => (
          <div
            key={order.id}
            className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={order.storeImage}
                  alt={lang === 'ar' ? order.storeNameAr : order.storeNameEn}
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <div>
                  <h4 className="text-xs font-black text-stone-900">
                    {lang === 'ar' ? order.storeNameAr : order.storeNameEn}
                  </h4>
                  <p className="text-[10px] text-stone-400 font-mono">
                    #{order.trackingNumber} • {order.timestamps.created}
                  </p>
                </div>
              </div>

              {getStatusBadge(order.status)}
            </div>

            <div className="flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-stone-100">
              <span>{order.items.length} {t.cart.itemsCount}</span>
              <span className="font-black text-stone-900">{order.total.toFixed(2)} €</span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setRatingModalOrderId(order.id)}
                className="flex-1 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
              >
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>{isRtl ? 'تقييم الخدمة' : 'Rate Order'}</span>
              </button>

              <button
                onClick={() => onOpenTracking(order.id)}
                className="py-1.5 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
              >
                <span>{isRtl ? 'التفاصيل' : 'Details'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {pastOrders.length === 0 && activeOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 p-6">
            <p className="text-3xl mb-2">🛍️</p>
            <p className="text-sm font-black text-stone-800">
              {isRtl ? 'لا توجد طلبات سابقة حتى الآن' : 'No previous orders yet'}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              {isRtl ? 'استكشف المطاعم ومحلات البقالة في صوفيا واطلب الآن!' : 'Explore Sofia eateries and place your first order!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
