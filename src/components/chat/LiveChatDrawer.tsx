import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import {
  X,
  Send,
  Phone,
  Mic,
  Smile,
  ShieldCheck,
  Bike,
  User,
  CheckCheck
} from 'lucide-react';

interface LiveChatDrawerProps {
  orderId: string;
  onClose: () => void;
}

export const LiveChatDrawer: React.FC<LiveChatDrawerProps> = ({ orderId, onClose }) => {
  const { orders, sendChatMessage, lang, isRtl, role } = useApp();
  const t = translations[lang];
  const order = orders.find(o => o.id === orderId) || orders[0];

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [order?.chatMessages]);

  if (!order) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;
    const senderRole = role === 'driver' ? 'driver' : 'customer';
    sendChatMessage(order.id, inputMessage.trim(), senderRole);
    setInputMessage('');
  };

  const handleQuickPrompt = (promptText: string) => {
    const senderRole = role === 'driver' ? 'driver' : 'customer';
    sendChatMessage(order.id, promptText, senderRole);
  };

  const quickPrompts = role === 'driver' ? t.chat.driverQuickPrompts : t.chat.quickPrompts;
  const partnerName = role === 'driver' ? order.customerName : (order.driver?.name || 'كابتن جو بازار');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs flex justify-end">
      <div
        className={`w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-all duration-300 ${
          isRtl ? 'animate-slide-left' : 'animate-slide-right'
        }`}
      >
        {/* Chat Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-emerald-700 to-green-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center overflow-hidden">
                {role === 'driver' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <img
                    src={order.driver?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt="Driver Avatar"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-800" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm">{partnerName}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/40 text-[10px] font-semibold">
                  {role === 'driver' ? (isRtl ? 'العميل' : 'Customer') : (isRtl ? 'كابتن جو بازار 🛵' : 'Courier 🛵')}
                </span>
              </div>
              <span className="text-[11px] text-emerald-100 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-300" />
                {isRtl ? `طلب #${order.trackingNumber}` : `Order #${order.trackingNumber}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${order.driver?.phone || '+966501234567'}`}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
              title="Call"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Helper Prompts */}
        <div className="bg-stone-50 border-b border-stone-200 px-3 py-2 overflow-x-auto flex gap-1.5 no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPrompt(prompt)}
              className="whitespace-nowrap px-3 py-1 rounded-full bg-white border border-stone-300/80 hover:border-emerald-500 hover:text-emerald-700 text-stone-700 text-xs font-medium transition-colors shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/50">
          <div className="text-center my-2">
            <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
              {isRtl ? 'محادثة مشفرة ومؤمنة بالكامل للطلب' : 'End-to-end encrypted order communication'}
            </span>
          </div>

          {order.chatMessages.map((msg) => {
            const isMe =
              (role === 'driver' && msg.senderRole === 'driver') ||
              (role !== 'driver' && msg.senderRole === 'customer');
            const isSystem = msg.senderRole === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium shadow-2xs">
                    <Bike className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-xs text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-bl-xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[10px] text-stone-400">{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-emerald-600" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-stone-200 flex items-center gap-2"
        >
          <button
            type="button"
            onClick={() => handleQuickPrompt('🎤 [تسجيل صوتي: أنا بانتظارك]')}
            className="p-2 rounded-xl text-stone-500 hover:text-emerald-600 hover:bg-stone-100 transition-colors"
            title="Voice Note"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t.chat.placeholder}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-stone-100 focus:bg-white rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden transition-all text-stone-900"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white shadow-md transition-all active:scale-95 flex items-center justify-center"
          >
            <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
          </button>
        </form>
      </div>
    </div>
  );
};
