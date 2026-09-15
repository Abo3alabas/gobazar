import React, { useState } from 'react';
import { DriverProfile } from '../../types';
import { X, Bike, Phone, Star, ShieldCheck, Sparkles, User } from 'lucide-react';

interface DriverModalProps {
  driver?: DriverProfile | null; // If null, mode is 'add'
  onClose: () => void;
  onSave: (driverData: Omit<DriverProfile, 'id'> | Partial<DriverProfile>) => void;
  isRtl: boolean;
}

export const DriverModal: React.FC<DriverModalProps> = ({
  driver,
  onClose,
  onSave,
  isRtl
}) => {
  const isEditing = !!driver;

  const [name, setName] = useState(driver?.name || '');
  const [phone, setPhone] = useState(driver?.phone || '+359 88 123 4567');
  const [vehiclePlate, setVehiclePlate] = useState(driver?.vehiclePlate || 'CB 8899 PK');
  const [vehicleType, setVehicleType] = useState<'scooter' | 'car' | 'bicycle'>(
    driver?.vehicleType || 'scooter'
  );
  const [status, setStatus] = useState<'online' | 'busy' | 'offline'>(
    driver?.status || 'online'
  );
  const [avatar, setAvatar] = useState(
    driver?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );
  const [rating, setRating] = useState<number>(driver?.rating ?? 4.9);
  const [totalDeliveries, setTotalDeliveries] = useState<number>(driver?.totalDeliveries ?? 35);
  const [acceptanceRate, setAcceptanceRate] = useState<number>(driver?.acceptanceRate ?? 98);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && driver) {
      onSave({
        name,
        phone,
        vehiclePlate,
        vehicleType,
        status,
        avatar,
        rating: Number(rating),
        totalDeliveries: Number(totalDeliveries),
        acceptanceRate: Number(acceptanceRate),
      });
    } else {
      onSave({
        name,
        phone,
        vehiclePlate,
        vehicleType,
        status,
        avatar,
        rating: Number(rating),
        ratingCount: 15,
        totalDeliveries: Number(totalDeliveries),
        acceptanceRate: Number(acceptanceRate),
        walletBalance: 0,
        todayEarnings: 0,
        todayTrips: 0,
        coordinates: { lat: 42.6977, lng: 23.3219, addressName: 'Sofia Center' },
        praises: [
          isRtl ? 'سريع ودقيق ⚡' : 'Fast & On Time ⚡',
          isRtl ? 'تعامل راقي ومحترم 🤝' : 'Polite & Courteous 🤝'
        ],
      });
    }
  };

  const sampleAvatars = [
    { label: 'سائق 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
    { label: 'سائق 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
    { label: 'سائق 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
    { label: 'سائق 4', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 p-4 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">
                {isEditing
                  ? (isRtl ? 'تعديل بيانات الكابتن / المندوب' : 'Edit Courier Profile')
                  : (isRtl ? 'تسجيل مندوب توصيل جديد' : 'Register New Courier')}
              </h3>
              <p className="text-[10px] text-stone-500">
                {isRtl ? 'إدارة أسطول المناديب في صوفيا، بلغاريا' : 'Fleet & courier management in Sofia'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-3 space-y-3.5 flex-1 pr-1">
          
          {/* Driver Name */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">
              {isRtl ? 'اسم المندوب الكامل *' : 'Courier Full Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: ستيفان إيفانوف / Stefan Ivanov"
              className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
            />
          </div>

          {/* Phone & Vehicle Plate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'رقم الهاتف *' : 'Phone Number *'}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+359 88 123 4567"
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'رقم لوحة المركبة *' : 'Vehicle Plate Number *'}
              </label>
              <input
                type="text"
                required
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                placeholder="CB 8899 PK"
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Vehicle Type Selector */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">
              {isRtl ? 'نوع وسيلة التوصيل' : 'Vehicle Type'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['scooter', 'car', 'bicycle'] as const).map((vt) => (
                <button
                  key={vt}
                  type="button"
                  onClick={() => setVehicleType(vt)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                    vehicleType === vt
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span>
                    {vt === 'scooter' && '🛵 سكوتر'}
                    {vt === 'car' && '🚗 سيارة'}
                    {vt === 'bicycle' && '🚲 دراجة'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Shift Status Selector */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">
              {isRtl ? 'حالة الوردية والاتصال' : 'Shift & Availability'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['online', 'busy', 'offline'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border cursor-pointer ${
                    status === st
                      ? st === 'online'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : st === 'busy'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-stone-800 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    st === 'online' ? 'bg-emerald-400' : st === 'busy' ? 'bg-amber-400' : 'bg-stone-400'
                  }`} />
                  <span>
                    {st === 'online' && (isRtl ? 'متصل' : 'Online')}
                    {st === 'busy' && (isRtl ? 'في مهمة' : 'Busy')}
                    {st === 'offline' && (isRtl ? 'غير متصل' : 'Offline')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Rating, Trips, Acceptance Rate */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'التقييم (★)' : 'Rating (★)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value) || 5)}
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'إجمالي الرحلات' : 'Total Trips'}
              </label>
              <input
                type="number"
                min="0"
                value={totalDeliveries}
                onChange={(e) => setTotalDeliveries(parseInt(e.target.value) || 0)}
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-700 block mb-1">
                {isRtl ? 'نسبة القبول (%)' : 'Acceptance (%)'}
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={acceptanceRate}
                onChange={(e) => setAcceptanceRate(parseInt(e.target.value) || 95)}
                className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Avatar URL & Quick Presets */}
          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">
              {isRtl ? 'رابط الصورة الشخصية' : 'Avatar Photo URL'}
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-hidden mb-1.5"
            />
            <div className="flex flex-wrap gap-1">
              {sampleAvatars.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(s.url)}
                  className="px-2 py-0.5 text-[9px] font-bold rounded-lg bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-800 border border-stone-200 cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isEditing ? (isRtl ? 'حفظ بيانات المندوب' : 'Save Courier Profile') : (isRtl ? 'تسجيل المندوب الآن' : 'Enroll Courier')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
