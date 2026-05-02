/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Trophy, Medal, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  devicesSmashed: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as LeaderboardEntry);
      setEntries(data);
      setLoading(false);
    }, (error) => {
      console.error("Leaderboard error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl backdrop-blur-md p-5 shadow-2xl">
      <h3 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-zinc-400">Global Leaderboard</h3>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-orange-500" size={24} />
        </div>
      ) : (
        <div className="space-y-3">
          {entries.length === 0 ? (
            <p className="text-zinc-600 text-center py-4 text-[10px] uppercase font-bold italic">Scanning frequencies...</p>
          ) : (
            entries.map((entry, index) => (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                key={entry.userId}
                className="flex items-center justify-between text-sm group"
              >
                <div className="flex items-center flex-1 min-w-0">
                  <span className={`font-mono text-xs w-6 ${index === 0 ? 'text-orange-500' : 'text-zinc-500'}`}>
                    {String(index + 1).padStart(2, '0')}.
                  </span>
                  <span className={`font-semibold truncate ml-2 ${index === 0 ? 'text-orange-100' : 'text-zinc-300 group-hover:text-white transition-colors'}`}>
                    {entry.username}
                  </span>
                </div>
                <span className={`font-mono text-xs ml-4 ${index === 0 ? 'text-orange-400' : 'text-zinc-500'}`}>
                  {(entry.score / 1000).toFixed(1)}k
                </span>
              </motion.div>
            ))
          )}
        </div>
      )}

      <div className="w-full h-px bg-zinc-800 my-4"></div>
      <div className="flex items-center justify-center gap-2 text-[8px] font-black text-zinc-600 uppercase tracking-widest">
        <Trophy size={10} className="text-zinc-600" />
        Verified destruction data
      </div>
    </div>
  );
}
