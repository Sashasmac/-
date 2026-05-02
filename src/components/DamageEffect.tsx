/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';

interface DamageNumber {
  id: string;
  x: number;
  y: number;
  damage: number;
}

interface SmashedOverlayProps {
  damageNumbers: DamageNumber[];
}

export default function DamageEffect({ damageNumbers }: SmashedOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-difference">
      <AnimatePresence>
        {damageNumbers.map((dn) => (
          <motion.div
            key={dn.id}
            initial={{ opacity: 1, y: dn.y, x: dn.x, scale: 1 }}
            animate={{ opacity: 0, y: dn.y - 100, x: dn.x + (Math.random() * 40 - 20), scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute z-50 text-white font-black text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
          >
            -{dn.damage}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
