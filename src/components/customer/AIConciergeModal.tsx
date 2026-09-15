import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../services/api';
import { AIConciergeRecommendation, Product, Store } from '../../types';
import {
  Sparkles,
  Bot,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Zap,
  Tag,
  ArrowRight,
  ShoppingBag,
  Flame,
  Star
} from 'lucide-react';

interface AIConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCheckout?: () => void;
}

export const AIConciergeModal: React.FC<AIConciergeModalProps> = ({ isOpen, onClose, onOpenCheckout }) => {
  const { products, stores, addToCart, setIsCartOpen, lang, isRtl } = useApp();
  const t = translations[lang];

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AIConciergeRecommendation | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      label: isRtl ? '🥗 جائع، عندي 12€، أريد شيئاً صحياً خلال 20 دقيقة' : '🥗 Hungry, 12€ budget, healthy in 20 min',
      text: 'أنا جائع، عندي 12 يورو، أريد شيئاً صحياً يصل خلال 20 دقيقة',
      budget: 12,
      maxMinutes: 20,
    },
    {
      label: isRtl ? '☕ هل تريد طلبك المعتاد؟ (قهوة وبانيتسا ساخنة)' : '☕ Your usual breakfast order',
      text: 'طلبك المعتاد: قهوة الصباح وبانيتسا دافئة من فرن صوفيا',
      budget: 6,
      maxMinutes: 15,
    },
    {
      label: isRtl ? '☀️ اليوم الجو 38°: سلطة باردة وعصير منعش' : '☀️ Hot day 38°: Cold salad & drink',
      text: 'اليوم الجو حار 38°، أريد سلطة خضار بلقانية وعصير بارد منعش',
      budget: 10,
      maxMinutes: 25,
    },
    {
      label: isRtl ? '⚡ مطعمك المفضل مزدحم: بديل أرخص بـ 3€ وأسرع' : '⚡ Alternative 3€ cheaper & faster',
      text: 'مطعمك المفضل مزدحم، ابحث لي عن وجبة بديلة أرخص بـ 3 يورو وأسرع في الوصول',
      budget: 10,
      maxMinutes: 20,
    },
  ];

  const handleSearch = async (textToSearch?: string, budgetNum?: number, timeNum?: number) => {
    const searchText = textToSearch || query;
    if (!searchText.trim()) return;

    setLoading(true);
    try {
      const res = await apiService.askAIConcierge(searchText, budgetNum || 15, timeNum || 25, lang);
      if (res) {
        setRecommendation(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderNow = (productId: string) => {
    const product = products.find((p) => p.id === productId) || products[0];
    addToCart(product, 1, []);
    setIsCartOpen(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-emerald-950 text-white p-4 relative border-b border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-black leading-tight flex items-center gap-1.5">
                  <span>{isRtl ? 'المساعد الذكي الشخصي للطعام' : 'AI Food Concierge'}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 text-[9px] font-bold border border-emerald-400/40">
                    Gemini AI
                  </span>
                </h3>
                <p className="text-[11px] text-stone-300 font-medium">
                  {isRtl ? 'اكتب ما تشتهيه بميزانيتك ووقتك، وسنختار لك أفضل عرض فوراً' : 'Tell us your craving, budget & time'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Natural Language Search Input */}
          <div className="mt-3.5 flex items-center gap-2 bg-stone-800/90 border border-stone-700 rounded-2xl p-1.5">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={isRtl ? 'مثلاً: أنا جائع، عندي 12€، أريد وجبة صحية خلال 20 دقيقة...' : 'e.g. Hungry, 12€ budget, healthy in 20 min...'}
              className="w-full bg-transparent px-2.5 py-1 text-xs text-white placeholder-stone-400 focus:outline-none font-bold"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shrink-0 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRtl ? 'بحث ذكي' : 'Ask'}</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Proactive Quick Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              {isRtl ? 'أوامر مقترحة وتنبيهات ذكية:' : 'Smart Suggestions & Routine:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(p.text);
                    handleSearch(p.text, p.budget, p.maxMinutes);
                  }}
                  className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 text-stone-700 text-[11px] font-bold transition-all text-start cursor-pointer flex items-center gap-1"
                >
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt State when no recommendation yet */}
          {!recommendation && !loading && (
            <div className="p-6 rounded-3xl bg-stone-50 border border-dashed border-stone-200 text-center flex flex-col items-center justify-center gap-2 text-stone-500">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-stone-800 mt-1">
                {isRtl ? 'بانتظار طلبك الذكي' : 'Awaiting Your Request'}
              </h4>
              <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
                {isRtl
                  ? 'اكتب ما تشتهيه أو انقر على أحد الأوامر المقترحة أعلاه. سيقوم المساعد الذكي بمقارنة المطاعم وتحليل الأسعار فوراً وتقديم الخيار الفائز.'
                  : 'Enter what you crave or click a suggestion above. The AI will compare Sofia menus and select the best match.'}
              </p>
            </div>
          )}

          {/* AI Result Card (Single Screen Decision - User doesn't need to search or compare!) */}
          {recommendation && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-950 text-white shadow-xl border border-emerald-500/40 relative overflow-hidden">
                {/* Confidence Badge */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{isRtl ? `تطابق بنسبة ${recommendation.confidenceScore}% مع طلبك` : `${recommendation.confidenceScore}% Match`}</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold">
                    ⚡ {isRtl ? 'قرار في شاشة واحدة' : 'Instant 1-Screen Choice'}
                  </span>
                </div>

                <h4 className="text-base font-black text-white leading-tight">
                  {recommendation.title}
                </h4>

                {/* Product Box */}
                <div className="mt-3 bg-stone-800/80 rounded-2xl p-3 border border-stone-700/80 flex items-center gap-3">
                  <img
                    src={recommendation.recommendedItem.image}
                    alt={recommendation.recommendedItem.productName}
                    className="w-18 h-18 rounded-xl object-cover shrink-0 shadow-sm border border-stone-600"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-amber-400 block">
                      📍 {recommendation.recommendedItem.storeName}
                    </span>
                    <h5 className="text-xs font-black text-white truncate mt-0.5">
                      {recommendation.recommendedItem.productName}
                    </h5>
                    <div className="mt-1 flex items-center gap-2 text-[11px]">
                      <span className="text-emerald-400 font-black text-sm">
                        {recommendation.recommendedItem.price.toFixed(2)}€
                      </span>
                      <span className="text-stone-400">
                        +{recommendation.recommendedItem.deliveryFee.toFixed(2)}€ {isRtl ? 'توصيل' : 'delivery'}
                      </span>
                      <span className="text-stone-300 font-bold bg-stone-700/60 px-1.5 py-0.5 rounded">
                        ⏱️ ~{recommendation.recommendedItem.deliveryTimeMin} {isRtl ? 'د' : 'min'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Why this is the winner breakdown */}
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-100 leading-relaxed font-medium">
                  💡 <span className="font-bold text-amber-300">{isRtl ? 'سبب الاختيار الذكي:' : 'Why this is chosen:'}</span> {recommendation.reason}
                </div>

                {/* Action button */}
                <button
                  onClick={() => handleOrderNow(recommendation.recommendedItem.productId)}
                  className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4 fill-stone-950" />
                  <span>{isRtl ? `طلب فوري (${recommendation.recommendedItem.totalPrice.toFixed(2)}€ مع التوصيل)` : `Order Now (${recommendation.recommendedItem.totalPrice.toFixed(2)}€)`}</span>
                </button>
              </div>

              {/* Alternative Bargain Card (If user wants cheaper or different) */}
              {recommendation.alternativeItem && (
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-black">
                        {recommendation.alternativeItem.priceDiff}
                      </span>
                      <span className="font-black text-stone-900 truncate">
                        {recommendation.alternativeItem.productName}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-600 mt-0.5 truncate">
                      {recommendation.alternativeItem.reason}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOrderNow('p-8')}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-900 text-white text-[11px] font-bold shrink-0 cursor-pointer hover:bg-stone-800 transition-all"
                  >
                    {isRtl ? 'اختر البديل' : 'Select'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
