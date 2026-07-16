/**
 * KissCourier.tsx
 * At Long Last - Three.js-inspired kiss particle effect (canvas 2D fallback, no Three deps)
 * Drop into src/components/KissCourier.tsx
 * 
 * Sends a particle kiss across board, partner catches it
 */

import { useRef, useEffect, useState } from 'react';

type Props = {
  onCaught?: () => void;
  autoPlay?: boolean;
};

export function KissCourier({ onCaught, autoPlay = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [sent, setSent] = useState(false);
  const [caught, setCaught] = useState(false);
  const particles = useRef<{x:number,y:number,vx:number,vy:number,life:number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0,0,rect.width,rect.height);
      
      // draw board path
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6,6]);
      ctx.beginPath();
      ctx.moveTo(30, rect.height/2);
      ctx.lineTo(rect.width-30, rect.height/2);
      ctx.stroke();
      ctx.setLineDash([]);

      // update particles
      particles.current = particles.current.filter(p => p.life > 0);
      for (const p of particles.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.life -= 0.015;
        
        ctx.globalAlpha = p.life;
        ctx.fillStyle = '#FF8A8A';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 + Math.random()*2, 0, Math.PI*2);
        ctx.fill();
        
        // heart shape core
        if (Math.random() > 0.7) {
          ctx.fillText('♥', p.x, p.y);
        }
      }
      ctx.globalAlpha = 1;

      // catch zone on right
      if (sent) {
        ctx.fillStyle = caught ? '#A8E6CF' : 'rgba(0,0,0,0.04)';
        ctx.beginPath();
        ctx.arc(rect.width-30, rect.height/2, 28, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = caught ? '#A8E6CF' : 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // check catch
        if (particles.current.some(p => Math.hypot(p.x - (rect.width-30), p.y - rect.height/2) < 30)) {
          if (!caught) {
            setCaught(true);
            onCaught?.();
            // burst
            for (let i=0;i<20;i++) {
              particles.current.push({
                x: rect.width-30,
                y: rect.height/2,
                vx: (Math.random()-0.5)*6,
                vy: (Math.random()-0.5)*6,
                life: 1
              });
            }
          }
        }
      }

      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, [sent, caught, onCaught]);

  const sendKiss = () => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    setSent(true);
    setCaught(false);
    particles.current = [];
    
    // launch from left
    for (let i=0;i<12;i++) {
      particles.current.push({
        x: 30 + Math.random()*10,
        y: rect.height/2 + (Math.random()-0.5)*20,
        vx: 4 + Math.random()*4,
        vy: (Math.random()-0.5)*3 - 1,
        life: 1
      });
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4 p-4 bg-[#FFFBF6] rounded-[24px] border border-black/5">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[11px] tracking-widest opacity-50 uppercase">Kiss Courier • Spicy 1</p>
          <h3 className="font-medium leading-tight mt-1">{caught ? 'Caught! Home tile glows now.' : sent ? 'Catch it on the right...' : 'Blow a kiss across the board'}</h3>
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${caught ? 'bg-green-200' : 'bg-black/5'}`}>
          {caught ? '♥' : '→'}
        </div>
      </div>

      <div className="relative w-full aspect-[2/1] bg-white rounded-[16px] border border-black/10 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" width={320} height={160} />
        {/* start/target labels */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] opacity-40">YOU</div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] opacity-40">THEM</div>
      </div>

      <button
        onClick={sendKiss}
        className="w-full py-3 rounded-full bg-black text-white text-sm font-medium active:scale-[0.98] transition-transform"
      >
        {sent ? 'Send Another Kiss' : 'Blow Kiss →'}
      </button>

      <p className="text-[11px] opacity-40 text-center">
        Firebase: emit duel:kissSent with x,y,vx. Other client spawns particles. On catch, duel:kissCaught.
      </p>
    </div>
  );
}
