import React from 'react';

/**
 * Japanese Fude (Calligraphy Brush) Stroke Underline for active tabs
 */
export const BrushUnderline: React.FC<{
  className?: string;
  color?: string;
}> = ({ className = '', color = '#E03131' }) => (
  <svg
    viewBox="0 0 220 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
    className={`w-full block pointer-events-none select-none ${className}`}
    aria-hidden="true"
  >
    {/* Outer crimson brush sweep */}
    <path
      d="M0 8.5C25 3.2 76 2.1 132 3.4C170 4.2 200 5.8 220 8.2C208 10.6 171 11.8 124 11.5C71 11.1 21 11.2 0 8.5Z"
      fill={color}
    />
    {/* Inner gold leaf brush filament */}
    <path
      d="M10 7.5C48 5.3 114 4.8 205 6.8C162 8.4 82 8.7 10 7.5Z"
      fill="#F2C96D"
      fillOpacity="0.85"
    />
  </svg>
);

/**
 * Traditional Japanese Hanko (Vermilion Stamp) Seal
 */
export const HankoSeal: React.FC<{
  kanji?: string;
  className?: string;
}> = ({ kanji = '狩', className = '' }) => (
  <span
    className={`inline-flex items-center justify-center w-6 h-6 rounded-[3px] border border-[#E03131]/80 bg-[#C92A2A]/20 text-[#FF6B6B] font-display text-xs font-bold leading-none select-none shadow-[inset_0_0_4px_rgba(201,42,42,0.5)] ${className}`}
    aria-hidden="true"
  >
    {kanji}
  </span>
);

/**
 * Japanese Sumi-e Ink Brush Section Header Banner
 */
export const BrushSectionBanner: React.FC<{
  title: string;
  centered?: boolean;
  kanjiWatermark?: string;
  rightSlot?: React.ReactNode;
}> = ({ title, centered = false, kanjiWatermark = '百竜', rightSlot }) => (
  <div className="relative overflow-hidden bg-gradient-to-r from-[#26181B] via-[#1E1417] to-[#161013] border-y border-[#4A332D] px-4 sm:px-5 py-2.5">
    {/* Left Crimson & Gold Brush Bar */}
    <span
      className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#E03131] via-[#D9A74A] to-[#C92A2A]"
      aria-hidden="true"
    />

    {/* Subtle Sumi-e ink brush stroke silhouette in background */}
    <svg
      viewBox="0 0 400 40"
      fill="none"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full opacity-20 pointer-events-none select-none"
      aria-hidden="true"
    >
      <path
        d="M0 4C95 0 210 6 340 2C370 12 390 22 400 36C275 40 130 34 0 38V4Z"
        fill="url(#sumiGrad)"
      />
      <defs>
        <linearGradient
          id="sumiGrad"
          x1="0"
          y1="0"
          x2="400"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#C92A2A" />
          <stop offset="55%" stopColor="#D9A74A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#110E10" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>

    {/* Subtle Kanji watermark */}
    <span
      className="absolute right-3 top-1/2 -translate-y-1/2 font-display text-2xl font-bold text-[#F5EFE6]/[0.04] pointer-events-none select-none tracking-widest"
      aria-hidden="true"
    >
      {kanjiWatermark}
    </span>

    <div
      className={`relative z-10 flex items-center ${
        centered
          ? 'justify-center text-center'
          : rightSlot
            ? 'justify-between gap-2'
            : 'justify-start'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {centered && (
          <span className="w-5 h-[1px] bg-gradient-to-r from-transparent to-[#D9A74A]/80" />
        )}
        <h3 className="font-display text-base sm:text-lg font-bold text-[#F5EFE6] tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          {title}
        </h3>
        {centered && (
          <span className="w-5 h-[1px] bg-gradient-to-l from-transparent to-[#D9A74A]/80" />
        )}
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  </div>
);

/**
 * Ornate Japanese Urushi Lacquer & Gold Leaf Icon Frame
 */
export const OrnateIconFrame: React.FC<{
  sizeClass?: string;
  children: React.ReactNode;
}> = ({ sizeClass = 'w-16 h-16', children }) => (
  <div
    className={`relative ${sizeClass} shrink-0 rounded-md bg-[#0B0809] p-1 border border-[#6E533B] shadow-[0_4px_12px_rgba(0,0,0,0.75),inset_0_0_10px_rgba(0,0,0,0.95)] flex items-center justify-center`}
  >
    {/* Subtle Gold Corner Accents */}
    <span className="absolute top-0.5 left-0.5 w-1.5 h-1.5 border-t border-l border-[#D9A74A]/80 pointer-events-none" />
    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 border-t border-r border-[#D9A74A]/80 pointer-events-none" />
    <span className="absolute bottom-0.5 left-0.5 w-1.5 h-1.5 border-b border-l border-[#D9A74A]/80 pointer-events-none" />
    <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 border-b border-r border-[#D9A74A]/80 pointer-events-none" />

    <div className="w-full h-full rounded-[3px] border border-[#352623] bg-[radial-gradient(circle_at_center,rgba(217,167,74,0.12)_0%,rgba(11,8,9,0.95)_80%)] flex items-center justify-center overflow-hidden p-0.5">
      {children}
    </div>
  </div>
);
