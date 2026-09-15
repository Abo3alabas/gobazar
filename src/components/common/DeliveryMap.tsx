import React, { useState, useEffect } from 'react';
import { LocationCoordinates } from '../../types';
import { Navigation, MapPin, Compass, Store as StoreIcon, ShieldCheck, Zap, Bike } from 'lucide-react';

interface DeliveryMapProps {
  storeCoords?: LocationCoordinates;
  customerCoords?: LocationCoordinates;
  driverCoords?: LocationCoordinates;
  progressPercent: number; // 0 to 100
  storeName?: string;
  driverName?: string;
  estimatedMinutes?: number;
  interactive?: boolean;
  heightClass?: string;
  isRtl?: boolean;
}

export const DeliveryMap: React.FC<DeliveryMapProps> = ({
  progressPercent = 50,
  storeName = 'شاورما الريان',
  driverName = 'عبدالله السبيعي (جو بازار)',
  estimatedMinutes = 7,
  heightClass = 'h-[320px] md:h-[380px]',
  isRtl = true,
}) => {
  const [zoom, setZoom] = useState(1);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [simulatedProgress, setSimulatedProgress] = useState(progressPercent);

  // Smooth micro-animation for the courier icon along the curved road path
  useEffect(() => {
    setSimulatedProgress(progressPercent);
  }, [progressPercent]);

  // Path coordinates on 600x400 SVG canvas:
  // Store at (100, 310)
  // Waypoint 1 at (180, 240)
  // Waypoint 2 at (300, 180)
  // Waypoint 3 at (420, 210)
  // Customer at (510, 110)
  const pathD = "M 100 310 C 140 260, 220 250, 290 190 C 350 140, 440 220, 510 110";

  // Calculate approximate courier marker position (x, y) along bezier curve
  const t = Math.min(Math.max(simulatedProgress / 100, 0), 1);
  
  // Cubic Bezier interpolation:
  // P0=(100,310), P1=(200,240), P2=(380,180), P3=(510,110)
  const p0 = { x: 100, y: 310 };
  const p1 = { x: 220, y: 220 };
  const p2 = { x: 380, y: 200 };
  const p3 = { x: 510, y: 110 };

  const cx = 3 * (p1.x - p0.x);
  const bx = 3 * (p2.x - p1.x) - cx;
  const ax = p3.x - p0.x - cx - bx;

  const cy = 3 * (p1.y - p0.y);
  const by = 3 * (p2.y - p1.y) - cy;
  const ay = p3.y - p0.y - cy - by;

  const courierX = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x;
  const courierY = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;

  // Tangent angle for bike heading
  const dx = 3 * ax * Math.pow(t, 2) + 2 * bx * t + cx;
  const dy = 3 * ay * Math.pow(t, 2) + 2 * by * t + cy;
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  const remainingDistanceKm = Math.max(0.1, ((100 - simulatedProgress) * 0.035)).toFixed(1);
  const liveSpeedKmh = simulatedProgress >= 100 ? 0 : 38;

  return (
    <div className={`relative w-full ${heightClass} bg-stone-900 rounded-2xl overflow-hidden shadow-inner border border-stone-800 select-none group`}>
      {/* Dynamic Visual Map Canvas */}
      <div
        className="w-full h-full relative transition-transform duration-300"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Vector City Base Map */}
        <svg
          viewBox="0 0 600 400"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Background Grid Pattern */}
            <pattern id="city-blocks" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect width="56" height="56" fill="#1c1917" rx="6" />
              <rect width="60" height="60" fill="none" stroke="#292524" strokeWidth="1.5" />
            </pattern>
            {/* Soft glow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Map Base Canvas */}
          <rect width="600" height="400" fill="#18181b" />
          <rect width="600" height="400" fill="url(#city-blocks)" opacity="0.6" />

          {/* Green Parks & Waterways */}
          <path
            d="M 20 50 Q 80 20 140 70 T 200 130 Q 140 180 60 140 Z"
            fill="#064e3b"
            opacity="0.35"
          />
          <path
            d="M 400 280 Q 480 250 560 310 T 580 390 Q 490 400 420 350 Z"
            fill="#064e3b"
            opacity="0.3"
          />

          {/* Major Roads / Highway Grid */}
          <path d="M 0 160 L 600 160" stroke="#27272a" strokeWidth="18" fill="none" />
          <path d="M 0 160 L 600 160" stroke="#3f3f46" strokeWidth="2" strokeDasharray="12 8" fill="none" />

          <path d="M 0 280 L 600 280" stroke="#27272a" strokeWidth="14" fill="none" />
          <path d="M 250 0 L 250 400" stroke="#27272a" strokeWidth="16" fill="none" />
          <path d="M 460 0 L 460 400" stroke="#27272a" strokeWidth="12" fill="none" />

          {/* Road labels */}
          <text x="70" y="154" fill="#71717a" fontSize="9" fontWeight="600" letterSpacing="0.5">طريق الملك فهد</text>
          <text x="320" y="274" fill="#71717a" fontSize="9" fontWeight="600">شارع التحلية الرئيسي</text>
          <text x="255" y="45" fill="#71717a" fontSize="9" fontWeight="600" transform="rotate(90, 255, 45)">طريق العليا العام</text>

          {/* Background Route Path (Gray Guide) */}
          <path
            d={pathD}
            fill="none"
            stroke="#3f3f46"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Animated Active Delivery Trajectory */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            className="animate-route-dash"
            filter="url(#glow)"
          />

          {/* Store Pin (Origin) */}
          <g transform={`translate(${p0.x}, ${p0.y})`}>
            <circle cx="0" cy="0" r="16" fill="#10b981" opacity="0.25" className="animate-ping" />
            <circle cx="0" cy="0" r="14" fill="#047857" stroke="#ffffff" strokeWidth="2.5" />
            <foreignObject x="-10" y="-10" width="20" height="20">
              <div className="flex items-center justify-center text-white">
                <StoreIcon className="w-4 h-4" />
              </div>
            </foreignObject>
            {/* Store Label */}
            <g transform="translate(0, 24)">
              <rect x="-45" y="-10" width="90" height="20" rx="10" fill="#18181b" stroke="#047857" strokeWidth="1" />
              <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">{storeName}</text>
            </g>
          </g>

          {/* Customer House Pin (Destination) */}
          <g transform={`translate(${p3.x}, ${p3.y})`}>
            <circle cx="0" cy="0" r="18" fill="#f59e0b" opacity="0.3" className="animate-ping" />
            <circle cx="0" cy="0" r="14" fill="#d97706" stroke="#ffffff" strokeWidth="2.5" />
            <foreignObject x="-10" y="-10" width="20" height="20">
              <div className="flex items-center justify-center text-white">
                <MapPin className="w-4 h-4 fill-white" />
              </div>
            </foreignObject>
            {/* Customer Label */}
            <g transform="translate(0, -22)">
              <rect x="-40" y="-10" width="80" height="20" rx="10" fill="#18181b" stroke="#d97706" strokeWidth="1" />
              <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">موقع التسليم 📍</text>
            </g>
          </g>

          {/* Live Animated Driver Courier Marker */}
          <g
            transform={`translate(${courierX}, ${courierY})`}
            className="transition-all duration-700 ease-out"
          >
            {/* Pulse Radar Rings */}
            <circle cx="0" cy="0" r="28" fill="#10b981" opacity="0.2" className="animate-pulse-ring" />
            <circle cx="0" cy="0" r="18" fill="#15803d" stroke="#ffffff" strokeWidth="3" className="shadow-lg" />
            
            {/* Rotating heading pointer */}
            <g transform={`rotate(${angleDeg})`}>
              <polygon points="0,-22 -6,-14 6,-14" fill="#22c55e" />
            </g>

            {/* Scooter Courier Icon */}
            <foreignObject x="-10" y="-10" width="20" height="20">
              <div className="flex items-center justify-center text-white">
                <Bike className="w-4 h-4 stroke-[2.5]" />
              </div>
            </foreignObject>

            {/* Live Driver Badge Box */}
            <g transform="translate(0, -32)">
              <rect x="-55" y="-10" width="110" height="22" rx="11" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5" />
              <text x="0" y="5" fill="#4ade80" fontSize="9" fontWeight="bold" textAnchor="middle">
                {driverName.split(' ')[0]} 🛵 ({remainingDistanceKm} {isRtl ? 'كم' : 'km'})
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Floating GPS Telemetry Overlay HUD */}
      <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} flex flex-col gap-2 z-10`}>
        {/* Live Status Pill */}
        <div className="bg-stone-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-stone-700/60 shadow-lg flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-400">
            {isRtl ? 'تتبع GPS لحظي مباشر' : 'Live GPS Telemetry'}
          </span>
        </div>

        {/* Speed & Distance Metric Box */}
        <div className="bg-stone-900/90 backdrop-blur-md p-2.5 rounded-xl border border-stone-700/60 shadow-lg flex items-center gap-3">
          <div className="flex items-center gap-1 text-amber-400">
            <Zap className="w-3.5 h-3.5" />
            <span className="text-xs font-black">{liveSpeedKmh}</span>
            <span className="text-[10px] text-stone-400">{isRtl ? 'كم/س' : 'km/h'}</span>
          </div>
          <div className="w-px h-4 bg-stone-700" />
          <div className="flex items-center gap-1 text-emerald-400">
            <Navigation className="w-3.5 h-3.5" />
            <span className="text-xs font-black">{remainingDistanceKm}</span>
            <span className="text-[10px] text-stone-400">{isRtl ? 'كم باقي' : 'km left'}</span>
          </div>
        </div>
      </div>

      {/* Map Control Tools (Zoom & Center) */}
      <div className={`absolute bottom-3 ${isRtl ? 'left-3' : 'right-3'} flex items-center gap-1.5 z-10`}>
        <button
          onClick={() => setZoom(z => Math.min(z + 0.2, 1.6))}
          className="w-8 h-8 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-200 backdrop-blur-md border border-stone-700 flex items-center justify-center text-base font-bold shadow-md transition-colors"
          title="Zoom in"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.2, 0.8))}
          className="w-8 h-8 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-200 backdrop-blur-md border border-stone-700 flex items-center justify-center text-base font-bold shadow-md transition-colors"
          title="Zoom out"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => setZoom(1)}
          className="h-8 px-2.5 rounded-lg bg-stone-900/80 hover:bg-stone-800 text-stone-200 backdrop-blur-md border border-stone-700 flex items-center gap-1 text-xs font-semibold shadow-md transition-colors"
          title="Reset View"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isRtl ? 'إعادة ضبط' : 'Reset'}</span>
        </button>
      </div>

      {/* ETA Ribbon at Bottom */}
      <div className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} z-10`}>
        <div className="bg-emerald-600/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl shadow-lg border border-emerald-400/40 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-100" />
          <div className="text-xs">
            <span className="opacity-90">{isRtl ? 'الوصول المتوقع: ' : 'ETA: '}</span>
            <span className="font-black text-amber-300 text-sm">~{estimatedMinutes} {isRtl ? 'دقائق' : 'mins'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
