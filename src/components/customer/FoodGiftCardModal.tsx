import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../services/api';
import {
  Gift,
  Heart,
  Share2,
  Copy,
  Check,
  Send,
  Sparkles,
  CreditCard,
  MessageSquare
} from 'lucide-react';

interface FoodGiftCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FoodGiftCardModal: React.FC<FoodGiftCardModalProps> = ({ isOpen, onClose }) => {
  const { lang, isRtl } = useApp();
  const t = translations[lang];

  const [amount, setAmount] = useState(25);
  const [senderName, setSenderName] = useState('سارة المنصور');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [message, setMessage] = useState('صحتين وعافية مقدماً! غداء اليوم على حسابي في جو بازار 🎁✨');
  const [theme, setTheme] = useState<'friendship' | 'birthday' | 'thank_you' | 'love'>('friendship');
  const [generatedGift, setGeneratedGift] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const presetAmounts = [10, 15, 25, 50];

  const handleCreateCard = async () => {
    if (!recipientName.trim()) {
      alert(isRtl ? 'يرجى كتابة اسم المستلم' : 'Please enter recipient name');
      return;
    }

    setLoading(true);
    try {
      const created = await apiService.createGiftCard({
        senderName,
        recipientName,
        recipientPhone: recipientPhone || '+359 88 000 0000',
        amount,
        message,
        theme,
      });
      if (created) {
        setGeneratedGift(created);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const shareText = `مرحباً ${recipientName}! أرسل لك ${senderName} بطاقة هدية وجبة طعام بقيمة ${amount}€ عبر تطبيق جو بازار! 🎁🍔 كود القسيمة: ${generatedGift?.voucherCode || 'GIFT-SOF-25'} - رسالة: "${message}"`;

  const handleWhatsAppShare = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedGift?.voucherCode || 'GIFT-SOF-25');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
                🎁
              </div>
              <div>
                <h3 className="text-base font-black leading-tight">
                  {isRtl ? 'بطاقة هدية الطعام (Food Gift Card)' : 'Food Gift Card'}
                </h3>
                <p className="text-[11px] text-pink-100 font-medium">
                  {isRtl ? 'أهدِ وجبة شهية لصديق أو زميل مع رسالة خاصة' : 'Gift a meal to a friend with a lovely note'}
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
          {generatedGift ? (
            <div className="space-y-4 animate-fade-in">
              {/* Visual Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-stone-900 via-rose-950 to-stone-950 text-white shadow-xl border border-rose-500/40 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <span className="text-[10px] font-bold text-rose-300 uppercase block">GO BAZAR GIFT</span>
                      <span className="text-xs font-black text-white">بطاقة إهداء طعام</span>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-amber-300">{generatedGift.amount.toFixed(2)}€</span>
                </div>

                <div className="my-4 p-3 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/10 text-xs text-stone-200 italic">
                  "{generatedGift.message}"
                </div>

                <div className="flex justify-between items-end text-xs">
                  <div>
                    <span className="text-[9px] text-stone-400 block">{isRtl ? 'إلى:' : 'To:'}</span>
                    <span className="font-bold text-white">{generatedGift.recipientName}</span>
                  </div>
                  <div className="text-end">
                    <span className="text-[9px] text-stone-400 block">{isRtl ? 'كود القسيمة:' : 'Voucher Code:'}</span>
                    <span className="font-mono font-black text-sm text-emerald-300 tracking-wider">
                      {generatedGift.voucherCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={handleWhatsAppShare}
                  className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{isRtl ? 'إرسال الهدية عبر وتساب مباشرة' : 'Send via WhatsApp'}</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className="w-full py-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? (isRtl ? 'تم نسخ الكود بنجاح!' : 'Copied!') : (isRtl ? 'نسخ كود الهدية' : 'Copy Voucher Code')}</span>
                </button>

                <button
                  onClick={() => setGeneratedGift(null)}
                  className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs font-bold cursor-pointer"
                >
                  {isRtl ? 'إنشاء بطاقة أخرى' : 'Create another card'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Amount Picker */}
              <div>
                <label className="block text-xs font-black text-stone-800 mb-1.5">
                  {isRtl ? 'اختر قيمة الهدية:' : 'Gift Amount:'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        amount === amt
                          ? 'bg-rose-600 text-white shadow-sm'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {amt}€
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {isRtl ? 'اسم المستلم (الصديق)' : 'Recipient Name'}
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="مثال: كريم الأحمد"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">
                    {isRtl ? 'رقم الهاتف (وتساب)' : 'WhatsApp Phone'}
                  </label>
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    placeholder="+359 88 123 4567"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-bold"
                  />
                </div>
              </div>

              {/* Sender Name */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {isRtl ? 'اسمك (المرسل)' : 'Sender Name'}
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-bold"
                />
              </div>

              {/* Custom Message */}
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  {isRtl ? 'رسالة الإهداء اللطيفة:' : 'Gift Message:'}
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 font-medium"
                />
              </div>

              <button
                onClick={handleCreateCard}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Gift className="w-4 h-4" />
                <span>{loading ? 'جارٍ إصدار البطاقة...' : isRtl ? `إصدار بطاقة الهدية الآن (${amount}€)` : `Issue Gift Card (${amount}€)`}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
