import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import {
  User,
  Wallet,
  MapPin,
  CreditCard,
  Globe,
  Bell,
  Headphones,
  ShieldCheck,
  Plus,
  ChevronRight,
  Sparkles,
  Smartphone,
  Check
} from 'lucide-react';

export const CustomerProfileView: React.FC = () => {
  const { customerWallet, lang, setLang, isRtl } = useApp();
  const t = translations[lang];

  const [topupAmount, setTopupAmount] = useState<number | null>(null);
  const [showTopupModal, setShowTopupModal] = useState(false);

  const savedAddresses = [
    {
      id: 'addr-1',
      titleAr: 'المنزل - صوفيا سنتر',
      titleEn: 'Home - Sofia Center',
      detailsAr: 'شارع فيتوشا بوليفارد 45، شقة 12، الطابق 4، صوفيا',
      detailsEn: '45 Vitosha Blvd, Apt 12, Floor 4, Sofia, Bulgaria',
      isDefault: true
    },
    {
      id: 'addr-2',
      titleAr: 'العمل - مجمع بزنس بارك',
      titleEn: 'Work - Business Park Sofia',
      detailsAr: 'حي ملادوست 4، مبنى 3، صوفيا',
      detailsEn: 'Mladost 4, Building 3, Sofia, Bulgaria',
      isDefault: false
    }
  ];

  return (
    <div className="p-4 space-y-4 animate-fade-in pb-12">
      {/* Profile Header Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-emerald-950 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
              alt="Elena Kostova"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">
                {isRtl ? 'إيلينا كوستوفا' : 'Elena Kostova'}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                VIP 🌟
              </span>
            </div>
            <p className="text-xs text-stone-300 font-mono mt-0.5">+359 88 567 8901</p>
            <p className="text-[11px] text-emerald-400 mt-1">
              📍 {isRtl ? 'صوفيا، بلغاريا 🇧🇬' : 'Sofia, Bulgaria 🇧🇬'}
            </p>
          </div>
        </div>
      </div>

      {/* Euro Wallet Card */}
      <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-stone-500 font-bold block">{t.header.wallet}</span>
              <span className="text-xl font-black text-stone-900">{customerWallet.toFixed(2)} €</span>
            </div>
          </div>

          <button
            onClick={() => setShowTopupModal(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isRtl ? 'شحن المحفظة' : 'Top Up'}</span>
          </button>
        </div>

        <p className="text-[11px] text-stone-500">
          {isRtl
            ? 'يمكنك استخدام رصيد محفظة اليورو لدفع ثمن الطلبات فوراً مع خصم تلقائي 5% إضافي'
            : 'Use your EUR wallet balance for instant checkouts with an extra 5% loyalty cashback'}
        </p>
      </div>

      {/* Saved Bulgarian Addresses */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black text-stone-900">
              {isRtl ? 'عناوين التوصيل في صوفيا' : 'Saved Addresses in Sofia'}
            </h3>
          </div>
          <button className="text-xs font-bold text-emerald-700 hover:underline">
            + {isRtl ? 'إضافة عنوان' : 'Add New'}
          </button>
        </div>

        <div className="space-y-2">
          {savedAddresses.map(addr => (
            <div
              key={addr.id}
              className={`p-3 rounded-2xl border transition-all ${
                addr.isDefault ? 'bg-emerald-50/50 border-emerald-300' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-stone-900">
                  {lang === 'ar' ? addr.titleAr : addr.titleEn}
                </span>
                {addr.isDefault && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold">
                    {isRtl ? 'العنوان الرئيسي' : 'Default'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {lang === 'ar' ? addr.detailsAr : addr.detailsEn}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods & Loyalty */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-stone-700" />
          <h3 className="text-xs font-black text-stone-900">
            {isRtl ? 'طرق الدفع المفعلة (بلغاريا وأوروبا)' : 'Payment Methods (Bulgaria & EU)'}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-stone-700">
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
            <span>💳</span>
            <span>Visa / Mastercard</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
            <span>🍎</span>
            <span>Apple Pay</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
            <span>⚡</span>
            <span>Revolut & ePay.bg</span>
          </div>
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center gap-2">
            <span>💶</span>
            <span>{isRtl ? 'الدفع نقداً باليورو (€)' : 'Cash in EUR (€)'}</span>
          </div>
        </div>
      </div>

      {/* Language & Settings */}
      <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-stone-700" />
            <span className="text-xs font-black text-stone-900">{t.header.language}</span>
          </div>

          <div className="flex p-1 bg-stone-100 rounded-xl gap-1">
            <button
              onClick={() => setLang('ar')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'ar' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              العربية (AR)
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                lang === 'en' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
