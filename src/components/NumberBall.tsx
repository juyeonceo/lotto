import React from 'react';
import { getBallColorInfo, getVipGoldBallStyle } from '../services/lottoStats';

interface NumberBallProps {
  num: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isBonus?: boolean;
  highlight?: boolean;
  vipGold?: boolean;
  className?: string;
  showCategoryTooltip?: boolean;
}

export const NumberBall: React.FC<NumberBallProps> = ({
  num,
  size = 'md',
  isBonus = false,
  highlight = false,
  vipGold = false,
  className = '',
}) => {
  const colorInfo = vipGold ? getVipGoldBallStyle() : getBallColorInfo(num);

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs font-bold',
    sm: 'w-8 h-8 text-xs font-black',
    md: 'w-10 h-10 text-sm font-black',
    lg: 'w-12 h-12 text-base font-black',
    xl: 'w-16 h-16 text-xl font-black',
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* Outer Glow on Highlight or VIP Gold */}
      <div
        className="absolute inset-0 rounded-full blur-sm transition-all duration-300 pointer-events-none"
        style={{
          backgroundColor: highlight || vipGold ? colorInfo.glow : 'transparent',
          transform: highlight ? 'scale(1.25)' : 'scale(1)',
        }}
      />

      {/* 3D Sphere Ball Container */}
      <div
        className={`relative rounded-full flex items-center justify-center transition-transform duration-200 transform hover:scale-110 active:scale-95 shadow-md ${sizeClasses[size]}`}
        style={{
          background: colorInfo.bg,
          color: colorInfo.text,
          border: `1.5px solid ${colorInfo.border}`,
          boxShadow: `inset -2px -3px 5px rgba(0, 0, 0, 0.45), inset 2px 2px 4px rgba(255, 255, 255, 0.6), 0 4px 8px rgba(0,0,0,0.4)`,
        }}
      >
        {/* Specular White Highlight Dot */}
        <span
          className="absolute top-1 left-1.5 w-2 h-1.5 rounded-full pointer-events-none opacity-80"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 80%)',
          }}
        />

        {/* Number Text */}
        <span className="relative z-10 tracking-tight leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
          {num}
        </span>

        {/* Bonus Indicator Badge */}
        {isBonus && (
          <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 text-[9px] font-bold bg-amber-400 text-black rounded-full border border-black shadow">
            +B
          </span>
        )}
      </div>
    </div>
  );
};
