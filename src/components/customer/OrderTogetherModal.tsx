import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../services/api';
import { GroupOrderSession, Store, Product } from '../../types';
import {
  Users,
  Share2,
  Copy,
  Check,
  MapPin,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Send,
  MessageCircle,
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface OrderTogetherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStore?: (store: Store) => void;
}

export const OrderTogetherModal: React.FC<OrderTogetherModalProps> = ({ isOpen, onClose, onSelectStore }) => {
  const { stores, products, addToCart, setIsCartOpen, lang, isRtl } = useApp();
  const t = translations[lang];

  const [activeSession, setActiveSession] = useState<GroupOrderSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hostName, setHostName] = useState('سارة المنصور');
  const [selectedStoreId, setSelectedStoreId] = useState('st-1');
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [activeTab, setActiveTab] = useState<'view' | 'create'>('view');

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const list = await apiService.getGroupOrders();
      if (list && list.length > 0) {
        setActiveSession(list[0]);
      } else {
        setActiveTab('create');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentStore = stores.find((s) => s.id === (activeSession?.storeId || selectedStoreId)) || stores[0];
  const storeProducts = products.filter((p) => p.storeId === currentStore.id);

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const created = await apiService.createGroupOrder({
        hostName,
        hostPhone: '+359 88 123 4567',
        hostAddress: 'شارع فيتوشا 15، صوفيا (نطاق 1 كم)',
        storeId: selectedStoreId,
        radiusKm: 1.0,
      });
      if (created) {
        setActiveSession(created);
        setActiveTab('view');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriendItem = async () => {
    if (!activeSession || !selectedProductId) return;
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    setLoading(true);
    try {
      const updated = await apiService.joinGroupOrder(activeSession.code, {
        memberName: newMemberName.trim() || 'صديق جديد',
        items: [
          {
            id: `git-${Date.now()}`,
            product: prod,
            quantity: 1,
            selectedOptions: [],
            totalPrice: prod.price,
          },
        ],
      });
      if (updated) {
        setActiveSession(updated);
        setNewMemberName('');
        setSelectedProductId('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutGroup = async () => {
    if (!activeSession) return;
    setLoading(true);
    try {
      const res = await apiService.checkoutGroupOrder(activeSession.code);
      if (res) {
        alert(isRtl ? 'تم تأكيد الطلب المشترك بنجاح وتوجيهه إلى المطبخ!' : 'Group order confirmed and sent to kitchen!');
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const shareText = `انضم إلى طلبي في جو بازار لنطلب سوياً من مطعم ${currentStore.nameAr} بنطاق 1 كم ونتقاسم رسوم التوصيل! كود الغرفة: ${activeSession?.code || 'TOGETHER-9014'}`;
  const shareUrl = `https://gobazar.app/together?code=${activeSession?.code || 'TOGETHER-9014'}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareViaWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareViaViber = () => {
    window.open(`viber://forward?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-700 text-white p-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-xl">
                👥
              </div>
              <div>
                <h3 className="text-base font-black leading-tight">
                  {isRtl ? 'الطلب الجماعي (Order Together)' : 'Order Together'}
                </h3>
                <p className="text-[11px] text-emerald-100 font-medium">
                  {isRtl ? 'اطلب مع أصدقائك بنطاق 1 كم وشارك رسوم التوصيل' : 'Order together within 1 km & split delivery fees'}
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

          {/* 1 KM Radius Badge */}
          <div className="mt-3 flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-400/30 rounded-xl px-3 py-1.5 text-[11px] font-bold">
            <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
            <span className="text-emerald-50">
              {isRtl ? 'نطاق 1 كم نشط: نفس المبنى أو الجيران على مسار السائق' : '1 km radius active: Same building or route'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Active / Create Tabs */}
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                activeTab === 'view' ? 'bg-white text-emerald-700 shadow-xs' : 'text-stone-500'
              }`}
            >
              {isRtl ? 'الغرفة النشطة الحالية' : 'Active Room'}
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${
                activeTab === 'create' ? 'bg-white text-emerald-700 shadow-xs' : 'text-stone-500'
              }`}
            >
              {isRtl ? '+ إنشاء غرفة جديدة' : '+ Create New Room'}
            </button>
          </div>

          {activeTab === 'create' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isRtl ? 'اسم المضيف (صاحب الطلب)' : 'Host Name'}
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-emerald-600 font-bold"
                  placeholder="مثال: سارة المنصور"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isRtl ? 'اختر المطعم للطلب المشترك (نطاق 1 كم)' : 'Select Restaurant (1 km radius)'}
                </label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-emerald-600 font-bold bg-white"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {lang === 'ar' ? s.nameAr : s.nameEn} ({s.cuisineOrCategoryAr} • توصيل: {s.deliveryFee.toFixed(2)}€)
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium">
                🎯 {isRtl ? 'ملاحظة النطاق: يتم احتساب التوصيل الموحد تلقائياً لكل الأصدقاء في نفس البناية أو ضمن 1 كم، ويستلم الجميع طلباتهم من نفس السائق في نفس الوقت.' : 'Note: Unified delivery is automatically split for friends within 1 km.'}
              </div>

              <button
                onClick={handleCreateSession}
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>{loading ? 'جارٍ الإنشاء...' : isRtl ? 'بدء جلسة الطلب الجماعي الآن' : 'Start Group Order'}</span>
              </button>
            </div>
          ) : activeSession ? (
            <div className="space-y-4">
              {/* Room Code & Share Bar */}
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                      {isRtl ? 'كود الغرفة المشتركة' : 'Group Code'}
                    </span>
                    <span className="text-lg font-black text-emerald-900 tracking-wider">
                      {activeSession.code}
                    </span>
                  </div>
                  <div className="text-end">
                    <span className="text-[10px] font-bold text-stone-500 block">
                      {isRtl ? 'المطعم المختار' : 'Store'}
                    </span>
                    <span className="text-xs font-black text-stone-800">
                      {activeSession.storeNameAr}
                    </span>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="pt-2 border-t border-emerald-200/60">
                  <span className="text-[10px] font-bold text-emerald-900 block mb-1.5">
                    {isRtl ? 'مشاركة الرابط مع الأصدقاء (وتساب، انستا، فيس، فايبر):' : 'Share link with friends:'}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={shareViaWhatsApp}
                      className="px-2.5 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <span>💬 WhatsApp</span>
                    </button>
                    <button
                      onClick={shareViaViber}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <span>🟣 Viber</span>
                    </button>
                    <button
                      onClick={shareViaFacebook}
                      className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <span>🔵 Facebook</span>
                    </button>
                    <button
                      onClick={copyShareLink}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? (isRtl ? 'تم النسخ!' : 'Copied!') : (isRtl ? 'نسخ لإنستغرام' : 'Copy')}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Members & Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>{isRtl ? 'المشاركون وطلباتهم:' : 'Participants & Orders:'}</span>
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                    {activeSession.members.length} {isRtl ? 'أشخاص' : 'members'}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activeSession.members.map((member) => (
                    <div
                      key={member.id}
                      className="p-2.5 rounded-xl border border-stone-200 bg-stone-50/60 flex items-start justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-stone-900">{member.name}</span>
                          {member.isHost && (
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-bold">
                              {isRtl ? 'المضيف' : 'Host'}
                            </span>
                          )}
                        </div>
                        {member.items.length === 0 ? (
                          <p className="text-[10px] text-stone-400 italic mt-0.5">
                            {isRtl ? 'لم يختر وجبته بعد...' : 'Selecting meal...'}
                          </p>
                        ) : (
                          <div className="mt-1 space-y-0.5">
                            {member.items.map((it: any, idx: number) => (
                              <div key={idx} className="text-[11px] text-stone-600 flex justify-between">
                                <span className="truncate">• {it.product?.nameAr || it.product?.nameEn || 'وجبة'}</span>
                                <span className="font-bold shrink-0">{(it.totalPrice || it.price).toFixed(2)}€</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-end shrink-0">
                        <span className="font-black text-emerald-700 block">{member.subtotal.toFixed(2)}€</span>
                        <span className="text-[9px] text-stone-400 block">
                          +{member.deliveryShare.toFixed(2)}€ {isRtl ? 'توصيل' : 'deliv'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add item to group order for friend */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="text-xs font-black text-stone-800 block">
                  {isRtl ? '+ إضافة وجبة شخص آخر إلى نفس الطلب:' : '+ Add another meal to group order:'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder={isRtl ? 'اسم الصديق (مثال: أحمد)' : 'Friend name'}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 bg-white font-bold"
                  />
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="px-2 py-1.5 text-xs rounded-xl border border-stone-200 bg-white font-bold"
                  >
                    <option value="">{isRtl ? 'اختر الوجبة...' : 'Select dish...'}</option>
                    {storeProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {lang === 'ar' ? p.nameAr : p.nameEn} ({p.price.toFixed(2)}€)
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleAddFriendItem}
                  disabled={!selectedProductId || loading}
                  className="w-full py-1.5 rounded-xl bg-stone-800 hover:bg-stone-900 disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  {isRtl ? 'إضافة للطلب المشترك' : 'Add to Shared Order'}
                </button>
              </div>

              {/* Total & Split Summary */}
              <div className="bg-emerald-900 text-white p-3.5 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-200">{isRtl ? 'مجموع الوجبات:' : 'Items Subtotal:'}</span>
                  <span className="font-bold">
                    {activeSession.members.reduce((sum, m) => sum + m.subtotal, 0).toFixed(2)}€
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-200">
                    {isRtl ? 'رسوم التوصيل الموحدة (مقسومة):' : 'Split Delivery Fee:'}
                  </span>
                  <span className="font-bold text-amber-300">
                    {activeSession.deliveryFee.toFixed(2)}€ (
                    {(activeSession.deliveryFee / (activeSession.members.length || 1)).toFixed(2)}€ {isRtl ? 'للشخص' : '/person'})
                  </span>
                </div>
                <div className="border-t border-emerald-700/80 pt-2 flex justify-between text-sm font-black">
                  <span>{isRtl ? 'الإجمالي النهائي:' : 'Final Total:'}</span>
                  <span className="text-emerald-300">
                    {(
                      activeSession.members.reduce((sum, m) => sum + m.subtotal, 0) + activeSession.deliveryFee
                    ).toFixed(2)}€
                  </span>
                </div>

                <button
                  onClick={handleCheckoutGroup}
                  disabled={loading}
                  className="w-full mt-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {loading
                      ? 'جارٍ التأكيد...'
                      : isRtl
                      ? 'تأكيد وإرسال الطلب الموحد للمطعم والسائق'
                      : 'Confirm & Send Unified Order'}
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-stone-400 text-xs">
              {isRtl ? 'لا توجد غرفة نشطة حالياً. أنشئ غرفة جديدة وشارك الرابط!' : 'No active group room. Create one!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
