/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { Hammer, Construction, Gem, Trophy, User } from 'lucide-react';
import { HammerType } from '../types';

interface HammerSelectorProps {
  hammers: HammerType[];
  currentHammer: HammerType;
  level: number;
  onSelect: (hammer: HammerType) => void;
}

export default function HammerSelector({ hammers, currentHammer, level, onSelect }: HammerSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      {hammers.map((hammer) => {
        const isLocked = level < hammer.unlockedAt;
        const isSelected = currentHammer.id === hammer.id;
        
        let Icon;
        switch (hammer.icon) {
          case 'Construction': Icon = Construction; break;
          case 'Gem': Icon = Gem; break;
          default: Icon = Hammer; break;
        }

        return (
          <motion.button
            key={hammer.id}
            disabled={isLocked}
            onClick={() => onSelect(hammer)}
            whileHover={!isLocked ? { scale: 1.05 } : {}}
            whileTap={!isLocked ? { scale: 0.95 } : {}}
            className={`group flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer backdrop-blur-md
              ${isLocked ? 'opacity-40 grayscale border-zinc-800 bg-zinc-900/40' : 
                isSelected ? 'bg-zinc-900 border-orange-600 shadow-[inset_0_0_15px_rgba(234,88,12,0.2)]' : 'bg-zinc-900/80 border-zinc-800 hover:border-orange-500/50'}
            `}
          >
            <div className={`w-12 h-12 rounded flex items-center justify-center transition-colors
              ${isSelected ? 'bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.3)]' : 'bg-zinc-800'}
            `}>
              <Icon size={24} className={isSelected ? 'text-white' : isLocked ? 'text-zinc-600' : 'text-orange-500'} />
            </div>
            
            <div className="flex flex-col text-left">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-orange-500' : 'text-zinc-300'}`}>
                {hammer.name}
              </span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
                {isLocked ? `Unlock at Lvl ${hammer.unlockedAt}` : `Damage: ${hammer.damage}`}
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
