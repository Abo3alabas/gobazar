import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../services/api';
import { Product, Store } from '../../types';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  ShoppingBag,
  Clock,
  Check,
  ChevronRight,
  RefreshCw,
  Users,
  Crown,
  Calendar,
  Footprints,
  Flame,
  ArrowUpRight,
  ChefHat
} from 'lucide-react';

interface FloatingAIAssistantProps {
  onSelectStore?: (store: Store) => void;
  onOpenOrderTogether?: () => void;
  onOpenTableBooking?: () => void;
  onOpenLunchSub?: () => void;
  onOpenCookingChef?: (dishName?: string) => void;
  externalIsOpen?: boolean;
  onExternalOpenChange?: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendedProducts?: Product[];
  suggestedFeature?: string | null;
  quickReplies?: string[];
  timestamp: string;
}

export const FloatingAIAssistant: React.FC<FloatingAIAssistantProps> = ({
  onSelectStore,
  onOpenOrderTogether,
  onOpenTableBooking,
  onOpenLunchSub,
  onOpenCookingChef,
  externalIsOpen,
  onExternalOpenChange,
}) => {
  const { stores, products, addToCart, lang, isRtl, cart } = useApp();
  const t = translations[lang];

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const setIsOpen = (val: boolean) => {
    setInternalIsOpen(val);
    if (onExternalOpenChange) {
      onExternalOpenChange(val);
    }
  };
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content:
        lang === 'ar'
          ? 'مرحباً بك! أنا مساعدك الذكي في GO BAZAR. يمكنني مساعدتك في استكشاف وجبات مطاعمنا وسوبرماركت صوفيا، مساعدتك على الطبخ خطوة بخطوة وشراء المكونات الناقصة بنقرة واحدة، أو بدء طلب جماعي (Order Together). كيف أخدمك اليوم؟'
          : 'Welcome! I am your GO BAZAR assistant in Sofia. I can help you find meals, guide you through cooking step-by-step with automatic missing ingredient checkout, or start an Order Together group. How can I assist you?',
      quickReplies: [
        lang === 'ar' ? '👨‍🍳 ساعدني أطبخ واشترِ النواقص' : '👨‍🍳 Recipe & Cooking Assistant',
        lang === 'ar' ? 'أريد وجبة غداء سريعة أقل من 10€' : 'Quick lunch under 10€',
        lang === 'ar' ? 'ما هي أفضل شاورما لديكم؟' : 'Best shawarma in Sofia',
        lang === 'ar' ? 'كيف يعمل الطلب الجماعي Order Together؟' : 'How does Order Together work?',
      ],
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const historyForApi = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await apiService.askAIAssistant(historyForApi, lang);

      if (res && res.replyText) {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: res.replyText,
          recommendedProducts: res.recommendedProducts || [],
          suggestedFeature: res.suggestedFeature || null,
          quickReplies: res.quickReplies || [],
          timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Fallback response
        const fallbackMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content:
            lang === 'ar'
              ? 'يسعدني خدمتك دائماً! يمكنك طلب أي وجبة من قائمة مطاعمنا في صوفيا (شاورما الشام، كرافت برجر، بيلا إيطاليا، أو سوبرماركت صوفيا فريش).'
              : 'I am always happy to help! You can order from our Sofia partners: Al-Sham, Craft Burger, Bella Italia, or Sofia Fresh.',
          timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1, []);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2500);
  };

  const handleViewStore = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    if (store && onSelectStore) {
      setIsOpen(false);
      onSelectStore(store);
    }
  };

  const handleFeatureClick = (feature: string) => {
    setIsOpen(false);
    if (feature === 'order_together' && onOpenOrderTogether) {
      onOpenOrderTogether();
    } else if (feature === 'table_booking' && onOpenTableBooking) {
      onOpenTableBooking();
    } else if (feature === 'lunch_sub' && onOpenLunchSub) {
      onOpenLunchSub();
    } else if (feature === 'cooking_chef' && onOpenCookingChef) {
      onOpenCookingChef();
    }
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON (Visible permanently on bottom corner) */}
      <div
        className={`fixed z-40 ${
          isRtl ? 'left-4' : 'right-4'
        } bottom-24 flex items-center gap-2 pointer-events-auto`}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-emerald-400/40 cursor-pointer"
          title={isRtl ? 'المساعد الذكي' : 'AI Assistant'}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>
          </div>

          <div className="text-start pr-1 hidden sm:block">
            <span className="text-[10px] text-emerald-200 font-bold block leading-none">
              GO BAZAR AI
            </span>
            <span className="text-xs font-black text-white leading-tight">
              {isRtl ? 'المساعد الذكي' : 'AI Assistant'}
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black text-white sm:hidden">
            AI ✨
          </span>
        </button>
      </div>

      {/* FULL SCREEN / SLIDE-OVER ASSISTANT MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-lg h-[92vh] max-h-[750px] rounded-3xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-3.5 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-900"></span>
                </div>
                <div>
                  <h3 className="text-sm font-black leading-tight flex items-center gap-1.5">
                    <span>{isRtl ? 'مساعد GO BAZAR الذكي' : 'GO BAZAR AI Assistant'}</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-emerald-950/60 text-emerald-300 text-[9px] font-bold">
                      {isRtl ? 'متصل بالمتاجر' : 'Catalog Live'}
                    </span>
                  </h3>
                  <p className="text-[10px] text-emerald-200 font-medium">
                    {isRtl
                      ? 'مساعد شخصي كامل لخدمتك في صوفيا، مطاعم، وجبات، وطلب جماعي'
                      : 'Dedicated smart concierge for meals & features in Sofia'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setMessages([
                      {
                        id: `reset-${Date.now()}`,
                        role: 'assistant',
                        content:
                          lang === 'ar'
                            ? 'تم بدء محادثة جديدة. كيف يمكنني مساعدتك الآن باختيار وجبتك أو خدمات التطبيق؟'
                            : 'New chat started. How can I assist you with your meal or app features?',
                        quickReplies: [
                          lang === 'ar' ? 'أريد وجبة غداء سريعة' : 'Quick lunch',
                          lang === 'ar' ? 'الطلب الجماعي بنطاق 1 كم' : 'Order Together 1km',
                          lang === 'ar' ? 'طاولات VIP' : 'VIP Tables',
                        ],
                        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
                      },
                    ])
                  }
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-emerald-100 transition-all cursor-pointer"
                  title={isRtl ? 'بدء محادثة جديدة' : 'Reset chat'}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Notification Banner with Quick Cooking Chef Access */}
            <div className="bg-emerald-50 px-3 py-1.5 border-b border-emerald-100 flex items-center justify-between text-[10px] text-emerald-800 font-bold shrink-0 gap-2">
              <span className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span className="truncate">{isRtl ? 'المساعد متصل حصرياً بمطاعم ومتاجر GO BAZAR في صوفيا' : 'Strictly grounded in Sofia store menus'}</span>
              </span>
              <button
                onClick={() => handleFeatureClick('cooking_chef')}
                className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-2xs shrink-0"
                title={isRtl ? 'فتح شيف الطبخ ومقادير الأكلات' : 'Open Cooking Chef'}
              >
                <ChefHat className="w-3 h-3 text-stone-950" />
                <span>{isRtl ? 'شيف الطبخ 👨‍🍳' : 'Recipe Chef 👨‍🍳'}</span>
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-stone-50/60">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                  >
                    <div
                      className={`flex gap-2 max-w-[88%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                          isUser
                            ? 'bg-stone-800 text-white'
                            : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xs'
                        }`}
                      >
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed font-medium shadow-2xs ${
                          isUser
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-white text-stone-900 border border-stone-200/90 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>

                        {/* If Assistant Recommended Products */}
                        {!isUser && msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                          <div className="mt-3 space-y-2 pt-2.5 border-t border-stone-100">
                            <span className="text-[10px] font-black text-emerald-800 block">
                              {isRtl ? 'الوجبات المقترحة من قائمة المطاعم:' : 'Recommended Meals:'}
                            </span>
                            <div className="space-y-1.5">
                              {msg.recommendedProducts.map((prod) => {
                                const prodStore = stores.find((s) => s.id === prod.storeId);
                                const isAdded = addedProductId === prod.id;
                                return (
                                  <div
                                    key={prod.id}
                                    className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-2 hover:border-emerald-400 transition-all"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <img
                                        src={prod.image}
                                        alt={prod.nameAr}
                                        className="w-10 h-10 rounded-lg object-cover shrink-0 border border-stone-200"
                                      />
                                      <div className="min-w-0">
                                        <h5 className="font-bold text-stone-900 truncate text-[11px]">
                                          {lang === 'ar' ? prod.nameAr : prod.nameEn}
                                        </h5>
                                        <div className="flex items-center gap-1.5 text-[10px] text-stone-500">
                                          <span className="text-emerald-700 font-bold">
                                            {prod.price.toFixed(2)} €
                                          </span>
                                          {prodStore && (
                                            <>
                                              <span>•</span>
                                              <span className="truncate">
                                                {lang === 'ar' ? prodStore.nameAr : prodStore.nameEn}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => handleAddToCart(prod)}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                                          isAdded
                                            ? 'bg-emerald-700 text-white'
                                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                        }`}
                                      >
                                        {isAdded ? (
                                          <>
                                            <Check className="w-3 h-3" />
                                            <span>{isRtl ? 'أُضيفت' : 'Added'}</span>
                                          </>
                                        ) : (
                                          <>
                                            <ShoppingBag className="w-3 h-3" />
                                            <span>{isRtl ? 'إضافة للسلة' : 'Add'}</span>
                                          </>
                                        )}
                                      </button>

                                      {prodStore && (
                                        <button
                                          onClick={() => handleViewStore(prodStore.id)}
                                          className="p-1.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-stone-700 text-[10px] transition-all cursor-pointer"
                                          title={isRtl ? 'عرض المطعم' : 'View Store'}
                                        >
                                          <ArrowUpRight className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* If Assistant Suggested Feature */}
                        {!isUser && msg.suggestedFeature && (
                          <div className="mt-2.5 pt-2 border-t border-stone-100">
                            {msg.suggestedFeature === 'order_together' && (
                              <button
                                onClick={() => handleFeatureClick('order_together')}
                                className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-[11px] font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>{isRtl ? 'فتح نافذة Order Together (نطاق 1 كم)' : 'Open Order Together'}</span>
                              </button>
                            )}
                            {msg.suggestedFeature === 'table_booking' && (
                              <button
                                onClick={() => handleFeatureClick('table_booking')}
                                className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Crown className="w-3.5 h-3.5 text-amber-200" />
                                <span>{isRtl ? 'حجز طاولة VIP وتراس الآن' : 'Reserve VIP Table'}</span>
                              </button>
                            )}
                            {msg.suggestedFeature === 'lunch_sub' && (
                              <button
                                onClick={() => handleFeatureClick('lunch_sub')}
                                className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{isRtl ? 'استعراض خطة الغداء (20 وجبة)' : 'View Lunch Plan'}</span>
                              </button>
                            )}
                            {msg.suggestedFeature === 'cooking_chef' && (
                              <button
                                onClick={() => handleFeatureClick('cooking_chef')}
                                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-600 hover:to-teal-700 text-white text-[11px] font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                              >
                                <ChefHat className="w-4 h-4 text-amber-300" />
                                <span>{isRtl ? 'فتح شيف ومساعد الطبخ الذكي (شراء النواقص والطبخ)' : 'Open AI Cooking Chef & Missing Items'}</span>
                              </button>
                            )}
                          </div>
                        )}

                        <span
                          className={`text-[9px] block mt-1 ${
                            isUser ? 'text-emerald-200' : 'text-stone-400'
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Quick Reply Chips below assistant message */}
                    {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                        {msg.quickReplies.map((reply, index) => (
                          <button
                            key={index}
                            onClick={() => handleSendMessage(reply)}
                            disabled={loading}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 text-[10px] font-bold border border-stone-200 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading Typing Indicator */}
              {loading && (
                <div className="flex items-center gap-2 text-stone-500 text-xs font-medium animate-pulse">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                    <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-stone-600 text-xs flex items-center gap-1.5">
                    <span>{isRtl ? 'المساعد يحلل طلبك ويبحث في المطاعم...' : 'AI is analyzing menus...'}</span>
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-2.5 bg-white border-t border-stone-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    isRtl
                      ? 'اسأل المساعد عن أي وجبة، ميزانية، أو ميزة بالتطبيق...'
                      : 'Ask about meals, budget, or any app feature...'
                  }
                  className="flex-1 px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden font-medium text-stone-900"
                  disabled={loading}
                />

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-sm shrink-0"
                >
                  <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
