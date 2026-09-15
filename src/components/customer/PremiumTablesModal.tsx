import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../services/api';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  MapPin,
  Utensils,
  Award,
  Crown
} from 'lucide-react';

interface PremiumTablesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumTablesModal: React.FC<PremiumTablesModalProps> = ({ isOpen, onClose }) => {
  const { stores, lang, isRtl } = useApp();
  const t = translations[lang];

  const [selectedStoreId, setSelectedStoreId] = useState(stores[2]?.id || stores[0]?.id || 'st-3');
  const [customerName, setCustomerName] = useState('سارة المنصور');
  const [customerPhone, setCustomerPhone] = useState('+359 88 123 4567');
  const [guestsCount, setGuestsCount] = useState(2);
  const [seatingArea, setSeatingArea] = useState<'terrace' | 'vip' | 'quiet'>('terrace');
  const [timeSlot, setTimeSlot] = useState('20:00');
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentStore = stores.find((s) => s.id === selectedStoreId) || stores[0];

  const handleBookTable = async () => {
    setLoading(true);
    try {
      const booking = await apiService.bookTable({
        storeId: currentStore.id,
        storeName: lang === 'ar' ? currentStore.nameAr : currentStore.nameEn,
        customerName,
        customerPhone,
        date: 'اليوم',
        timeSlot,
        guestsCount,
        seatingArea,
      });
      if (booking) {
        setConfirmedBooking(booking);
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
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 text-white p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
                👑
              </div>
              <div>
                <h3 className="text-base font-black leading-tight flex items-center gap-1.5">
                  <span>{isRtl ? 'حجز طاولات VIP المميزة' : 'Premium Table Booking'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-950/40 text-amber-200 text-[9px] font-bold">
                    VIP
                  </span>
                </h3>
                <p className="text-[11px] text-amber-100 font-medium">
                  {isRtl ? 'احجز أفضل موقع لطاولتك في أرقى مطاعم صوفيا فوراً' : 'Reserve top-tier tables & terrace spots in Sofia'}
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
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {confirmedBooking ? (
            <div className="space-y-4 animate-fade-in">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 text-white shadow-xl border border-amber-500/40 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center text-2xl">
                  ✓
                </div>
                <h4 className="text-base font-black text-white">
                  {isRtl ? 'تم تأكيد حجز طاولتك بنجاح!' : 'Table Reservation Confirmed!'}
                </h4>
                <div className="p-3 bg-stone-800/80 rounded-2xl border border-stone-700 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-400">{isRtl ? 'المطعم:' : 'Restaurant:'}</span>
                    <span className="font-bold text-amber-300">{confirmedBooking.storeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">{isRtl ? 'الموعد:' : 'Time:'}</span>
                    <span className="font-bold">{confirmedBooking.timeSlot} ({confirmedBooking.date})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">{isRtl ? 'عدد الضيوف:' : 'Guests:'}</span>
                    <span className="font-bold">{confirmedBooking.guestsCount} {isRtl ? 'أشخاص' : 'guests'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">{isRtl ? 'منطقة الجلوس:' : 'Area:'}</span>
                    <span className="font-bold text-emerald-400">{confirmedBooking.seatingArea}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-stone-700">
                    <span className="text-stone-400">{isRtl ? 'رمز الحجز:' : 'Booking Code:'}</span>
                    <span className="font-mono font-black text-amber-400">{confirmedBooking.bookingCode}</span>
                  </div>
                </div>
                <p className="text-[11px] text-stone-300">
                  {isRtl ? 'طاولتك مجهزة باسمك في الموعد المحدد مع ضيافة مجانية ترحيبية!' : 'Your table will be reserved with complimentary welcome treats.'}
                </p>
              </div>

              <button
                onClick={() => setConfirmedBooking(null)}
                className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold cursor-pointer hover:bg-stone-800"
              >
                {isRtl ? 'حجز طاولة أخرى' : 'Book Another Table'}
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Select Restaurant */}
              <div>
                <label className="block text-xs font-black text-stone-800 mb-1">
                  {isRtl ? 'المطعم المطلوب:' : 'Restaurant:'}
                </label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white font-bold"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === 'ar' ? s.nameAr : s.nameEn} ({s.cuisineOrCategoryAr} • تقييم: {s.rating}★)
                    </option>
                  ))}
                </select>
              </div>

              {/* Seating Area */}
              <div>
                <label className="block text-xs font-black text-stone-800 mb-1.5">
                  {isRtl ? 'اختر موقع الطاولة المميز:' : 'Select Seating Area:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSeatingArea('terrace')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      seatingArea === 'terrace'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-black shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 font-bold'
                    }`}
                  >
                    <span className="text-base block">🌅</span>
                    <span className="text-[11px] block mt-1">{isRtl ? 'تراس خارجي' : 'Terrace'}</span>
                  </button>

                  <button
                    onClick={() => setSeatingArea('vip')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      seatingArea === 'vip'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-black shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 font-bold'
                    }`}
                  >
                    <span className="text-base block">👑</span>
                    <span className="text-[11px] block mt-1">{isRtl ? 'صالة VIP' : 'VIP Lounge'}</span>
                  </button>

                  <button
                    onClick={() => setSeatingArea('quiet')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      seatingArea === 'quiet'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-black shadow-xs'
                        : 'border-stone-200 bg-stone-50 text-stone-700 font-bold'
                    }`}
                  >
                    <span className="text-base block">🌿</span>
                    <span className="text-[11px] block mt-1">{isRtl ? 'ركن هادئ' : 'Quiet Corner'}</span>
                  </button>
                </div>
              </div>

              {/* Time & Guests */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {isRtl ? 'عدد الضيوف:' : 'Guests:'}
                  </label>
                  <select
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} {isRtl ? (num === 1 ? 'شخص واحد' : num === 2 ? 'شخصان' : 'أشخاص') : `${num} guests`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {isRtl ? 'الوقت:' : 'Time Slot:'}
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white font-bold"
                  >
                    <option value="18:30">18:30</option>
                    <option value="19:30">19:30</option>
                    <option value="20:00">20:00</option>
                    <option value="21:00">21:00</option>
                    <option value="21:30">21:30</option>
                  </select>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {isRtl ? 'الاسم:' : 'Name:'}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {isRtl ? 'رقم الهاتف:' : 'Phone:'}
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-bold"
                  />
                </div>
              </div>

              <button
                onClick={handleBookTable}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 text-amber-200" />
                <span>{loading ? 'جارٍ حجز الطاولة...' : isRtl ? 'تأكيد حجز الطاولة فوراً' : 'Confirm Table Reservation'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
