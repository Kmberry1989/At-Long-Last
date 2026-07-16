/**
 * DoodleDuel.tsx
 * At Long Last - 60 second doodle duel with timer
 * Drop into src/components/DoodleDuel.tsx
 * 
 * Features: 60s countdown, thick brush, no eraser, auto-reveal, vote
 */

import { useRef, useState, useEffect } from 'react';

type Props = {
  prompt?: string;
  durationSec?: number;
  onComplete: (dataUrl: string) => void;
};

export function DoodleDuel({ prompt = "draw our couch from memory", durationSec = 60, onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    ctx.fillStyle = '#FFFBF6';
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  // timer
  useEffect(() => {
    if (isDone) return;
    if (timeLeft <= 0) {
      handleDone();
      return;
    }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, isDone]);

  const getPos = (e: any) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const start = (e: any) => {
    setIsDrawing(true);
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const move = (e: any) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const end = () => setIsDrawing(false);

  const handleDone = () => {
    setIsDone(true);
    const dataUrl = canvasRef.current!.toDataURL('image/png');
    onComplete(dataUrl);
  };

  const pct = (timeLeft / durationSec) * 100;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4 p-4 bg-[#FFFBF6] rounded-[24px] border border-black/5">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[11px] tracking-widest opacity-50 uppercase">Doodle Duel - {durationSec}s</p>
          <h3 className="font-medium leading-tight mt-1">{prompt}</h3>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-mono text-sm border-2 transition-colors ${timeLeft < 10 ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'bg-white border-black/10'}`}>
          {timeLeft}
        </div>
      </div>

      <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden">
        <div className="h-full bg-black transition-all duration-1000 linear" style={{ width: `${pct}%` }} />
      </div>

      <div className="relative aspect-[4/3] w-full bg-white rounded-[16px] overflow-hidden border border-black/10 touch-none">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
        {!isDrawing && timeLeft === durationSec && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm opacity-30">Draw here - thick brush, no eraser, 60s</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            const ctx = canvasRef.current!.getContext('2d')!;
            const rect = canvasRef.current!.getBoundingClientRect();
            ctx.fillStyle = '#FFFBF6';
            ctx.fillRect(0, 0, rect.width, rect.height);
          }}
          className="flex-1 py-3 rounded-full bg-black/5 text-sm font-medium"
          disabled={isDone}
        >
          Clear
        </button>
        <button
          onClick={handleDone}
          className="flex-1 py-3 rounded-full bg-black text-white text-sm font-medium"
        >
          Done - Reveal
        </button>
      </div>

      <p className="text-[11px] opacity-40 text-center">More time = more cursed details. Lean into it.</p>
    </div>
  );
}
