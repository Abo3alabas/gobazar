import React from 'react';
import { useApp } from '../../context/AppContext';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface MobileShellProps {
  children: React.ReactNode;
  activeRole: string;
}

export const MobileShell: React.FC<MobileShellProps> = ({ children, activeRole }) => {
  const { isRtl } = useApp();

  // Simulated Sofia local time
  const currentTime = '14:20';

  return (
    <div className="w-full flex justify-center items-start py-1 sm:py-4 px-0 sm:px-2">
      {/* Mobile Device Mockup Frame (Standard 390px-420px modern smartphone viewport) */}
      <div className="w-full max-w-[420px] bg-stone-100 sm:rounded-[44px] sm:shadow-2xl sm:border-[8px] sm:border-stone-800/90 overflow-hidden flex flex-col h-[100dvh] sm:h-[844px] max-h-[100dvh] sm:max-h-[860px] relative transition-all duration-300 ring-1 ring-stone-900/10">
        
        {/* Mobile Status Bar (Simulated iPhone / Android modern status bar) */}
        <div className="bg-stone-950 text-stone-200 text-xs px-5 py-2.5 flex items-center justify-between select-none z-30 shrink-0 border-b border-stone-800/40">
          {/* Time & Location */}
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-[11px]">
            <span>{currentTime}</span>
            <span className="text-stone-500">•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span>🇧🇬</span>
              <span>صوفيا (Sofia)</span>
            </span>
          </div>

          {/* Dynamic Island Pill */}
          <div className="hidden sm:block w-20 h-3.5 bg-stone-900 rounded-full border border-stone-800 mx-auto shadow-inner" />

          {/* Network & Battery Status Icons */}
          <div className="flex items-center gap-1.5 text-stone-300">
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              5G
            </span>
            <Signal className="w-3 h-3 text-stone-300" />
            <Wifi className="w-3 h-3 text-stone-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] font-mono">98%</span>
              <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Scrollable Mobile Content Canvas */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col pb-20 no-scrollbar">
          {children}
        </div>

        {/* Home Indicator Bar at Bottom */}
        <div className="hidden sm:flex justify-center pb-1.5 pt-0.5 bg-white/80 backdrop-blur-xs border-t border-stone-100 shrink-0 z-30 pointer-events-none">
          <div className="w-32 h-1 bg-stone-400 rounded-full" />
        </div>
      </div>
    </div>
  );
};

