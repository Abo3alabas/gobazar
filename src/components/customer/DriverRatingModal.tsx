import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import {
  Star,
  Heart,
  ThumbsUp,
  X,
  Sparkles,
  Award,
  Store as StoreIcon,
  Bike,
  CheckCircle2,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { OrderRating } from '../../types';

interface DriverRatingModalProps {
  orderId: string;
  onClose: () => void;
}

export const DriverRatingModal: React.FC<DriverRatingModalProps> = ({ orderId, onClose }) => {
  const { orders, submitOrderRating, lang, isRtl } = useApp();
  const t = translations[lang];
  const order = orders.find(o => o.id === orderId) || orders[0];

  // Rating flow step: 'restaurant' | 'driver'
  const [activeStep, setActiveStep] = useState<'restaurant' | 'driver'>('restaurant');

  // 1. Restaurant / Store Rating state
  const [storeStars, setStoreStars] = useState(5);
  const [storeHoverStars, setStoreHoverStars] = useState(0);
  const [storeSelectedTags, setStoreSelectedTags] = useState<string[]>([
    isRtl ? 'طعام لذيذ وساخن 🍲' : 'Delicious & Hot Food 🍲',
    isRtl ? 'تغليف ممتاز ومحكم 📦' : 'Great Packaging 📦'
  ]);
  const [storeComment, setStoreComment] = useState('');

  // 2. Delivery Driver Rating state
  const [driverStars, setDriverStars] = useState(5);
  const [driverHoverStars, setDriverHoverStars] = useState(0);
  const [driverSelectedTags, setDriverSelectedTags] = useState<string[]>([
    isRtl ? 'دقيق في الموعد ⏱️' : 'On Time ⏱️',
    isRtl ? 'تعامل راقي ومحترم 🤝' : 'Polite & Courteous 🤝'
  ]);
  const [tipAmount, setTipAmount] = useState<number>(2);
  const [customTip, setCustomTip] = useState<string>('');
  const [driverComment, setDriverComment] = useState('');

  if (!order) return null;

  const storeTagList = [
    isRtl ? 'طعام لذيذ وساخن 🍲' : 'Delicious & Hot Food 🍲',
    isRtl ? 'تغليف ممتاز ومحكم 📦' : 'Great Packaging 📦',
    isRtl ? 'مطابق للطلب 100% ✅' : '100% Accurate Order ✅',
    isRtl ? 'مكونات طازجة وجودة عالية 🍅' : 'Fresh & High Quality 🍅',
    isRtl ? 'كمية وفيرة ومشبعة 🌟' : 'Generous Portions 🌟'
  ];

  const driverTagList = [
    isRtl ? 'دقيق في الموعد ⏱️' : 'On Time ⏱️',
    isRtl ? 'تعامل راقي ومحترم 🤝' : 'Polite & Courteous 🤝',
    isRtl ? 'توصيل فائق السرعة ⚡' : 'Super Fast Delivery ⚡',
    isRtl ? 'حافظ على سخونة وحماية الطلب 🎒' : 'Protected in Thermal Bag 🎒',
    isRtl ? 'التزم بجميع ملاحظات التوصيل 📝' : 'Followed Delivery Notes 📝'
  ];

  const toggleStoreTag = (tag: string) => {
    setStoreSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleDriverTag = (tag: string) => {
    setDriverSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleTipSelect = (amount: number) => {
    setTipAmount(amount);
    setCustomTip('');
  };

  const handleCustomTipChange = (val: string) => {
    setCustomTip(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      setTipAmount(parsed);
    } else {
      setTipAmount(0);
    }
  };

  const handleSubmit = () => {
    const finalRating: OrderRating = {
      // Driver & Delivery
      driverStars,
      driverSpeedRating: driverStars >= 4 ? 5 : 4,
      driverPoliteness: driverStars,
      driverTags: driverSelectedTags,
      tipAmount,
      driverComment: driverComment.trim(),

      // Store & Food
      storeStars,
      storeFoodQuality: storeStars,
      storePackaging: storeStars >= 4 ? 5 : 4,
      storeTags: storeSelectedTags,
      storeComment: storeComment.trim(),

      // General fallback
      stars: Math.round((storeStars + driverStars) / 2),
      tags: [...storeSelectedTags, ...driverSelectedTags],
      comment: `${storeComment ? `[المطعم: ${storeComment}] ` : ''}${driverComment ? `[المندوب: ${driverComment}]` : ''}`.trim(),
      createdAt: new Date().toISOString(),
    };

    submitOrderRating(order.id, finalRating);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-100 p-4 sm:p-6 overflow-hidden space-y-4">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header & Tabs Navigation */}
        <div className="text-center space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black border border-emerald-200">
            {isRtl ? 'تقييم الطلب المكتمل' : 'Delivered Order Rating'} #{order.trackingNumber}
          </span>
          <h2 className="text-base font-black text-stone-900">
            {isRtl ? 'شاركنا تجربتك ورأيك' : 'Rate Your Experience'}
          </h2>
          <p className="text-[11px] text-stone-500">
            {isRtl
              ? 'تقييمك يساعدنا على تحسين جودة المطاعم وتقدير جهود المناديب'
              : 'Your review elevates food quality and recognizes courier efforts'}
          </p>
        </div>

        {/* Stepper / Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-100 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveStep('restaurant')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeStep === 'restaurant'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <StoreIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. {isRtl ? 'تقييم المطعم' : 'Store & Food'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStep('driver')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
              activeStep === 'driver'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-amber-500" />
            <span>2. {isRtl ? 'تقييم التوصيل' : 'Courier & Trip'}</span>
          </button>
        </div>

        {/* STEP 1: RESTAURANT & FOOD RATING */}
        {activeStep === 'restaurant' && (
          <div className="space-y-3.5 animate-fade-in">
            {/* Store Profile Card */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 flex items-center gap-3">
              <img
                src={order.storeImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80'}
                alt={lang === 'ar' ? order.storeNameAr : order.storeNameEn}
                className="w-12 h-12 rounded-xl object-cover border border-stone-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-stone-900 truncate">
                    {lang === 'ar' ? order.storeNameAr : order.storeNameEn}
                  </span>
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md">
                    {order.storeType === 'restaurant' ? (isRtl ? 'مطعم' : 'Restaurant') : (isRtl ? 'سوبرماركت' : 'Grocery')}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  {order.items.length} {t.cart.itemsCount} • {order.total.toFixed(2)} €
                </p>
              </div>
            </div>

            {/* Store Star Rating */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-center">
              <p className="text-xs font-bold text-stone-700 mb-1.5">
                {isRtl ? 'كيف تقيّم جودة الطعام والتغليف؟' : 'How was the food quality & packaging?'}
              </p>
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((starIdx) => {
                  const active = (storeHoverStars || storeStars) >= starIdx;
                  return (
                    <button
                      key={starIdx}
                      type="button"
                      onMouseEnter={() => setStoreHoverStars(starIdx)}
                      onMouseLeave={() => setStoreHoverStars(0)}
                      onClick={() => setStoreStars(starIdx)}
                      className="p-1 transition-transform active:scale-125 focus:outline-hidden cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          active
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-black text-emerald-700 mt-1 block">
                {storeStars === 5
                  ? (isRtl ? 'طعام استثنائي ولذيذ جداً! ⭐⭐⭐⭐⭐' : 'Outstanding taste & packaging! ⭐⭐⭐⭐⭐')
                  : storeStars >= 4
                  ? (isRtl ? 'جيد جداً ومرضي 👍' : 'Very good 👍')
                  : (isRtl ? 'مقبول وبحاجة لتحسين' : 'Average')}
              </span>
            </div>

            {/* Store Praise Tags */}
            <div>
              <p className="text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isRtl ? 'ما الذي نال إعجابك في تحضير الطلب؟' : 'What did you like about the food?'}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {storeTagList.map((tag) => {
                  const isSelected = storeSelectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleStoreTag(tag)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Store Comments */}
            <div>
              <textarea
                rows={2}
                value={storeComment}
                onChange={(e) => setStoreComment(e.target.value)}
                placeholder={isRtl ? 'اكتب ملاحظاتك للمطعم أو إشادة خاصة بالأطباق...' : 'Leave a note for the kitchen or favorite dishes...'}
                className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-emerald-500 focus:outline-hidden transition-all"
              />
            </div>

            {/* Next Button to Courier Rating */}
            <button
              type="button"
              onClick={() => setActiveStep('driver')}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>{isRtl ? 'متابعة لتقييم المندوب والتوصيل' : 'Next: Rate Courier & Delivery'}</span>
              <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}

        {/* STEP 2: DELIVERY & COURIER RATING */}
        {activeStep === 'driver' && (
          <div className="space-y-3.5 animate-fade-in">
            {/* Driver Profile Badge */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center gap-3">
              <div className="relative">
                <img
                  src={order.driver?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={order.driver?.name || 'Courier'}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500"
                />
                <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-500 text-white">
                  <Award className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-stone-900 truncate">
                    {order.driver?.name || 'كابتن التوصيل'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-bold rounded-md">
                    🛵 {order.driver?.vehiclePlate || 'SOF-4421'}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 mt-0.5">
                  {isRtl ? 'مندوب التوصيل المعتمد لطلبك' : 'Verified Sofia Courier'}
                </p>
              </div>
            </div>

            {/* Driver Star Rating */}
            <div className="p-3 rounded-2xl bg-stone-50 border border-stone-100 text-center">
              <p className="text-xs font-bold text-stone-700 mb-1.5">
                {t.rating.driverScore}
              </p>
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((starIdx) => {
                  const active = (driverHoverStars || driverStars) >= starIdx;
                  return (
                    <button
                      key={starIdx}
                      type="button"
                      onMouseEnter={() => setDriverHoverStars(starIdx)}
                      onMouseLeave={() => setDriverHoverStars(0)}
                      onClick={() => setDriverStars(starIdx)}
                      className="p-1 transition-transform active:scale-125 focus:outline-hidden cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          active
                            ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-black text-amber-600 mt-1 block">
                {driverStars === 5
                  ? (isRtl ? 'سريع ولبق وخدمة ممتازة! 🌟' : 'Fast & Courteous Service! 🌟')
                  : (isRtl ? 'جيد جداً 👍' : 'Very Good 👍')}
              </span>
            </div>

            {/* Courier Praise Tags */}
            <div>
              <p className="text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1">
                <ThumbsUp className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.rating.tagsTitle}</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {driverTagList.map((tag) => {
                  const isSelected = driverSelectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDriverTag(tag)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Courier Tip Section (€ Euro) */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                  <span>{isRtl ? 'إكرامية (Tip) للكابتن' : 'Add Courier Tip'}</span>
                </span>
                <span className="text-[9px] text-amber-800 font-bold">
                  {isRtl ? '100% تذهب مباشرة للمندوب' : '100% goes directly to driver'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleTipSelect(amount)}
                    className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                      tipAmount === amount && !customTip
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100/50'
                    }`}
                  >
                    {amount === 0 ? (isRtl ? 'بدون' : 'None') : `${amount} €`}
                  </button>
                ))}
              </div>

              <div className="mt-2">
                <input
                  type="number"
                  min="0"
                  placeholder={isRtl ? 'مبلغ إكرامية مخصص باليورو (€)...' : 'Custom tip in Euro (€)...'}
                  value={customTip}
                  onChange={(e) => handleCustomTipChange(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs rounded-xl bg-white border border-amber-200 text-stone-800 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* Driver Comment Box */}
            <div>
              <textarea
                rows={2}
                value={driverComment}
                onChange={(e) => setDriverComment(e.target.value)}
                placeholder={isRtl ? 'رسالة شكر أو ملاحظات للكابتن...' : 'Thank you note or courier feedback...'}
                className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-amber-500 focus:outline-hidden transition-all"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveStep('restaurant')}
                className="py-3 px-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                <span>{isRtl ? 'السابق' : 'Back'}</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-transform active:scale-98 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isRtl ? 'إرسال التقييمين معاً ⭐' : 'Submit Full Review ⭐'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
