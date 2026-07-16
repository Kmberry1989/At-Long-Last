/**
 * VibeDial.tsx
 * At Long Last - Vibe Mixer Component
 * Mobile-first, draggable triangle for tender/playful/spicy
 * 
 * Dependencies: framer-motion (npm install framer-motion)
 * Drop into src/components/VibeDial.tsx
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export type VibeWeights = {
  tender: number;
  playful: number;
  spicy: number;
};

type Props = {
  onConfirm: (weights: VibeWeights) => void;
  defaultWeights?: VibeWeights;
};

export function VibeDial({ onConfirm, defaultWeights = { tender: 0.5, playful: 0.3, spicy: 0.2 } }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 }); // 0-100
  const [weights, setWeights] = useState<VibeWeights>(defaultWeights);

  // Convert triangle position to barycentric weights
  const posToWeights = (x: number, y: number): VibeWeights => {
    // Simple triangle: top = tender, bottom-left = playful, bottom-right = spicy
    // Normalize y: 0 at top, 100 at bottom
    // x: 0 left, 100 right
    
    // Barycentric approximation for mobile feel
    const tender = Math.max(0, 1 - y / 100);
    const playfulFactor = y / 100;
    const playful = playfulFactor * (1 - x / 100);
    const spicy = playfulFactor * (x / 100);
    
    const sum = tender + playful + spicy || 1;
    return {
      tender: tender / sum,
      playful: playful / sum,
      spicy: spicy / sum
    };
  };

  const handleDrag = (_: any, info: any) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((info.point.x - rect.left) / rect.width) * 100;
    const y = ((info.point.y - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(5, Math.min(95, x));
    const clampedY = Math.max(5, Math.min(95, y));
    
    setPos({ x: clampedX, y: clampedY });
    setWeights(posToWeights(clampedX, clampedY));
  };

  const getDominantVibe = () => {
    if (weights.tender > weights.playful && weights.tender > weights.spicy) return 'tender';
    if (weights.playful > weights.spicy) return 'playful';
    return 'spicy';
  };

  const dominant = getDominantVibe();

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto">
      <div className="text-center">
        <h2 className="text-xl font-semibold tracking-tight">How do you want tonight to feel?</h2>
        <p className="text-sm opacity-60 mt-1">Drag together. Where you overlap sets the night.</p>
      </div>

      <div 
        ref={ref}
        className="relative w-[300px] h-[300px] bg-[#111] rounded-[24px] overflow-hidden border border-white/10"
      >
        {/* Triangle background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <polygon
            points="150,30 40,240 260,240"
            fill="none"
            stroke="white"
            strokeOpacity="0.15"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
        </svg>

        {/* Labels */}
        <div className="absolute top-[8px] left-1/2 -translate-x-1/2 text-xs tracking-widest opacity-80">
          TENDER • {Math.round(weights.tender * 100)}%
        </div>
        <div className="absolute bottom-[12px] left-[12px] text-xs tracking-widest opacity-80">
          PLAYFUL • {Math.round(weights.playful * 100)}%
        </div>
        <div className="absolute bottom-[12px] right-[12px] text-xs tracking-widest opacity-80">
          SPICY • {Math.round(weights.spicy * 100)}%
        </div>

        {/* Draggable dot */}
        <motion.div
          drag
          dragMomentum={false}
          dragElastic={0}
          onDrag={handleDrag}
          style={{ x: `${pos.x}%`, y: `${pos.y}%` }}
          className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full cursor-grab active:cursor-grabbing"
          dragConstraints={ref}
        >
          <div className={`w-full h-full rounded-full blur-[1px] transition-colors duration-300
            ${dominant === 'tender' ? 'bg-pink-300' : ''}
            ${dominant === 'playful' ? 'bg-yellow-300' : ''}
            ${dominant === 'spicy' ? 'bg-orange-400' : ''}
          `} />
          <div className="absolute inset-[3px] bg-white rounded-full" />
        </motion.div>

        {/* Center glow based on dominant */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500
          ${dominant === 'tender' ? 'bg-pink-400' : ''}
          ${dominant === 'playful' ? 'bg-yellow-300' : ''}
          ${dominant === 'spicy' ? 'bg-orange-500' : ''}
        `} />
      </div>

      <div className="w-full">
        <div className="flex gap-2 h-2 w-full rounded-full overflow-hidden bg-white/10">
          <div className="bg-pink-300 transition-all duration-300" style={{ width: `${weights.tender * 100}%` }} />
          <div className="bg-yellow-300 transition-all duration-300" style={{ width: `${weights.playful * 100}%` }} />
          <div className="bg-orange-400 transition-all duration-300" style={{ width: `${weights.spicy * 100}%` }} />
        </div>
        <div className="flex justify-between text-[10px] mt-2 opacity-50 tracking-widest">
          <span>SOFT</span>
          <span>MIXED</span>
          <span>HEATED</span>
        </div>
      </div>

      <button
        onClick={() => onConfirm(weights)}
        className="w-full py-4 rounded-full bg-white text-black font-medium tracking-wide active:scale-[0.98] transition-transform"
      >
        Set the vibe • {dominant.toUpperCase()}
      </button>

      <p className="text-[11px] opacity-40 text-center max-w-[260px]">
        Spicy content is always opt-in and skippable. You can change this mid-session anytime.
      </p>
    </div>
  );
}
