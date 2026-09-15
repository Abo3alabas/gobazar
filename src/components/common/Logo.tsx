import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'green';
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'green',
  showSubtitle = false,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Accurate vector emblem recreating the uploaded GO BAZAR thermal delivery bag */}
      <div
        className={`${iconDimensions[size]} relative rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-1.5 shadow-md shadow-emerald-500/20 flex items-center justify-center overflow-hidden border border-emerald-400/40`}
      >
        {/* Subtle reflective top strip accent like the real bag */}
        <div className="absolute top-0 inset-x-0 h-1 bg-white/30" />

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Circular swoosh frame */}
          <path
            d="M 20,40 A 35,35 0 1 1 50,88"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeDasharray="95 10"
            fill="none"
            opacity="0.85"
          />

          {/* Smartphone device silhouette */}
          <rect
            x="32"
            y="18"
            width="36"
            height="58"
            rx="6"
            stroke="currentColor"
            strokeWidth="3"
            fill="rgba(255,255,255,0.12)"
          />
          <circle cx="50" cy="70" r="2" fill="currentColor" />

          {/* Delivery Scooter Rider Icon */}
          <g transform="translate(38, 28) scale(0.48)">
            {/* Courier Helmet / Head */}
            <circle cx="50" cy="22" r="10" fill="currentColor" />
            <path d="M 52,18 L 64,18" stroke="currentColor" strokeWidth="5" />

            {/* Rider Body */}
            <path
              d="M 44,32 C 40,42 45,55 58,58 L 70,58"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
            />

            {/* Scooter Body & Wheel Base */}
            <circle cx="28" cy="80" r="12" stroke="currentColor" strokeWidth="7" fill="none" />
            <circle cx="82" cy="80" r="12" stroke="currentColor" strokeWidth="7" fill="none" />
            <path
              d="M 28,80 L 52,80 L 62,60 L 82,80"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
            />
            {/* Speed motion lines */}
            <line x1="8" y1="45" x2="22" y2="45" stroke="currentColor" strokeWidth="4" />
            <line x1="14" y1="55" x2="26" y2="55" stroke="currentColor" strokeWidth="4" />
            <line x1="6" y1="65" x2="18" y2="65" stroke="currentColor" strokeWidth="4" />
          </g>

          {/* Mini Grocery Basket at bottom left */}
          <g transform="translate(14, 58) scale(0.35)">
            <path
              d="M 12,25 L 48,25 L 42,55 L 18,55 Z"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
            />
            <path
              d="M 18,25 C 18,12 42,12 42,25"
              stroke="currentColor"
              strokeWidth="4.5"
              fill="none"
            />
            <line x1="24" y1="32" x2="24" y2="48" stroke="currentColor" strokeWidth="4" />
            <line x1="36" y1="32" x2="36" y2="48" stroke="currentColor" strokeWidth="4" />
          </g>
        </svg>
      </div>

      {/* Brand Title: GO (Dark/White) + BAZAR (Vibrant Orange) */}
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight font-black leading-none">
          <span
            className={`${textSizes[size]} font-black ${
              variant === 'light' ? 'text-white' : 'text-stone-900'
            }`}
          >
            GO
          </span>
          <span
            className={`${textSizes[size]} font-black text-amber-500 ml-1.5 drop-shadow-xs`}
          >
            BAZAR
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] font-bold text-emerald-600 tracking-wider">
            DELIVERY & SUPERMARKET
          </span>
        )}
      </div>
    </div>
  );
};
