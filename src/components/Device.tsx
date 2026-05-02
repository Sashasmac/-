/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Tablet, Laptop, Tv, Search as Construction, Hammer, Flame, Bomb } from 'lucide-react';
import { DeviceType, Crack } from '../types';
import { useMemo } from 'react';

interface DeviceProps {
  device: DeviceType;
  hp: number;
  cracks: Crack[];
  onHit: (x: number, y: number) => void;
  isExploding: boolean;
}

export default function Device({ device, hp, cracks, onHit, isExploding }: DeviceProps) {
  const hpPercentage = (hp / device.maxHp) * 100;
  const isCritical = hpPercentage < 25;

  const Icon = useMemo(() => {
    switch (device.icon) {
      case 'Smartphone': return Smartphone;
      case 'Tablet': return Tablet;
      case 'Laptop': return Laptop;
      case 'Tv': return Tv;
      default: return Smartphone;
    }
  }, [device.icon]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* HP Bar Container */}
      <div className="absolute -top-16 w-[200%] max-w-lg h-10 bg-zinc-900/50 border border-zinc-700/50 rounded-full p-1 backdrop-blur-sm z-20">
        <motion.div
           initial={{ width: '100%' }}
           animate={{ width: `${hpPercentage}%` }}
           className={`h-full rounded-full flex items-center justify-end px-4 shadow-[0_0_20px_rgba(239,68,68,0.5)] bg-gradient-to-r from-red-600 via-orange-500 to-red-600`}
        >
          {isCritical && hp > 0 && (
            <span className="text-[8px] md:text-[10px] font-black text-white whitespace-nowrap uppercase tracking-tighter animate-pulse flex items-center gap-1">
              <Bomb size={12} /> Critical Damage
            </span>
          )}
        </motion.div>
      </div>

      <div className="relative group perspective-1000">
        <motion.div
          id={`device-${device.id}`}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            onHit(e.clientX - rect.left, e.clientY - rect.top);
          }}
          whileTap={{ scale: 0.98 }}
          className={`relative cursor-crosshair overflow-hidden rounded-2xl border-4 border-zinc-700 shadow-2xl transition-colors duration-500 bg-zinc-800 flex items-center justify-center`}
          style={{ width: device.width, height: device.height }}
          animate={isExploding ? { scale: [1, 1.1, 0], opacity: [1, 1, 0], rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 1.5 }}
        >
          {/* Screen Content */}
          <div className="absolute inset-2 bg-slate-950 rounded-lg flex items-center justify-center overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-zinc-900"></div>
             
             {hpPercentage > 0 && (
               <div className="flex flex-col items-center opacity-40">
                 <Icon size={device.width * 0.3} className="text-blue-500" />
                 <p className="text-[10px] font-mono text-blue-400 mt-2 tracking-tighter">OS_READY_v0.1</p>
               </div>
             )}
             
             {/* Damage Cracks Overlay */}
             <div className="absolute inset-0 pointer-events-none z-10">
                <svg width="100%" height="100%" className="absolute inset-0 stroke-zinc-100 opacity-60">
                  {cracks.map((crack) => (
                    <g key={crack.id} transform={`translate(${crack.x}, ${crack.y}) rotate(${crack.rotation}) scale(${crack.scale})`}>
                       <path 
                        d="M -15,0 L 15,0 M 0,-15 L 0,15 M -10,-10 L 10,10" 
                        fill="none" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                       />
                       <circle cx="0" cy="0" r="1.5" fill="white" />
                    </g>
                  ))}
                </svg>
             </div>

             {/* Critical Effects: Fire & Pulsing */}
             <AnimatePresence>
               {isCritical && hp > 0 && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 pointer-events-none z-20"
                 >
                   <div className="w-full h-full bg-[radial-gradient(ellipse_at_bottom,rgba(255,100,0,0.4)_0%,transparent_70%)] animate-pulse"></div>
                   <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-white rounded-full shadow-[0_0_15px_4px_rgba(255,255,255,1)]"></div>
                   <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-orange-400 rounded-full shadow-[0_0_15px_6px_rgba(251,146,60,1)]"></div>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
          
          {/* Industrial Details */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-900 rounded-full border border-zinc-700/50" />
          <div className="absolute bottom-2 left-6 w-2 h-2 rounded-full bg-zinc-900 border border-zinc-700/50" />
          <div className="absolute bottom-2 right-6 w-2 h-2 rounded-full bg-zinc-900 border border-zinc-700/50" />
        </motion.div>

        {/* Action Reflection Glow */}
        <div className="absolute -inset-10 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Device Label */}
      <div className="mt-12 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">{device.name}</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
           <div className="h-0.5 w-8 bg-orange-500 rounded-full" />
           <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">{Math.ceil(hp)} / {device.maxHp} HP SECURITY_LEVEL_01</p>
           <div className="h-0.5 w-8 bg-orange-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}
