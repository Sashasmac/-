/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hammer as HammerIcon, 
  LogIn, 
  LogOut, 
  ShieldAlert, 
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward
} from 'lucide-react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  setDoc, 
  doc, 
  getDoc, 
  serverTimestamp,
  increment 
} from 'firebase/firestore';

import { auth, db } from './firebase';
import { DEVICES, HAMMERS, DeviceType, HammerType, Crack, DeviceId } from './types';

import Device from './components/Device';
import HammerSelector from './components/HammerSelector';
import Leaderboard from './components/Leaderboard';
import DamageEffect from './components/DamageEffect';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  
  // Game State
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentHp, setCurrentHp] = useState(DEVICES[0].maxHp);
  const [cracks, setCracks] = useState<Crack[]>([]);
  const [currentHammer, setCurrentHammer] = useState(HAMMERS[0]);
  const [score, setScore] = useState(0);
  const [totalSmashed, setTotalSmashed] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<{ id: string; x: number; y: number; damage: number }[]>([]);
  
  const [isMuted, setIsMuted] = useState(false);
  const [shake, setShake] = useState(false);

  const currentDevice = DEVICES[currentLevelIndex] || DEVICES[DEVICES.length - 1];
  const playerLevel = useMemo(() => Math.floor(score / 500) + 1, [score]);

  // Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        setUsername(u.displayName || 'Player');
        loadUserData(u.uid);
      }
    });
    return unsub;
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setScore(data.totalScore || 0);
        setTotalSmashed(data.devicesSmashed || 0);
        // Maybe resume from last level? Or just start fresh for session
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    }
  };

  const syncLeaderboard = useCallback(async (uid: string, name: string, currentScore: number, smashed: number) => {
    try {
      await setDoc(doc(db, 'leaderboard', uid), {
        userId: uid,
        username: name,
        score: currentScore,
        devicesSmashed: smashed,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Error syncing leaderboard:", err);
    }
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const logout = () => auth.signOut();

  // Audio effects
  const playSound = (freq: number, type: OscillatorType = 'square', dur = 0.1) => {
    if (isMuted) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + dur);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + dur);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + dur);
  };

  const handleHit = (x: number, y: number) => {
    if (isExploding || currentHp <= 0) return;

    const damage = currentHammer.damage;
    const newHp = Math.max(0, currentHp - damage);
    setCurrentHp(newHp);
    setScore(s => s + damage);

    // Shake
    setShake(true);
    setTimeout(() => setShake(false), 50);

    // Audio
    playSound(150 + Math.random() * 100, 'square', 0.15);

    // Damage Number
    const dnId = Math.random().toString(36).substr(2, 9);
    setDamageNumbers(prev => [...prev, { id: dnId, x, y, damage }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(dn => dn.id !== dnId));
    }, 800);

    // Cracks
    if (Math.random() > 0.3) {
      const crack: Crack = {
        id: Math.random().toString(),
        x,
        y,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.8,
        type: Math.floor(Math.random() * 2)
      };
      setCracks(prev => [...prev, crack]);
    }

    if (newHp === 0) {
      handleExplosion();
    }
  };

  const handleExplosion = () => {
    setIsExploding(true);
    setShake(true);
    playSound(50, 'sawtooth', 1);
    
    setTimeout(() => {
      setShake(false);
      const nextIndex = currentLevelIndex + 1;
      setTotalSmashed(t => t + 1);
      
      if (user) {
        syncLeaderboard(user.uid, username, score + currentHammer.damage, totalSmashed + 1);
        setDoc(doc(db, 'users', user.uid), {
          userId: user.uid,
          username,
          totalScore: score + currentHammer.damage,
          devicesSmashed: totalSmashed + 1,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      if (nextIndex < DEVICES.length) {
        setCurrentLevelIndex(nextIndex);
        setCurrentHp(DEVICES[nextIndex].maxHp);
        setCracks([]);
        setIsExploding(false);
      } else {
        // Loop back or show victory?
        // Let's loop but increase difficulty or just restart
        setCurrentLevelIndex(0);
        setCurrentHp(DEVICES[0].maxHp);
        setCracks([]);
        setIsExploding(false);
      }
    }, 1500);
  };

  const resetGame = () => {
    setCurrentLevelIndex(0);
    setCurrentHp(DEVICES[0].maxHp);
    setCracks([]);
    setIsExploding(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 font-sans flex flex-col relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-tech-gradient"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-orange-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-20 p-6 flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black tracking-tighter italic text-white uppercase leading-none">
            Smash-Tech <span className="text-orange-500 underline decoration-2 underline-offset-4">Ultra</span>
          </h1>
          <p className="text-zinc-500 font-mono text-[10px] mt-2 uppercase tracking-widest whitespace-nowrap">
            STAGE {currentLevelIndex + 1}/{DEVICES.length}: {currentDevice.name}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg backdrop-blur-md">
            <div className="text-right">
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Session Score</p>
              <motion.p 
                key={score}
                className="text-2xl font-mono text-orange-400 leading-none"
              >
                {score.toLocaleString()}
              </motion.p>
            </div>
            <div className="w-px h-10 bg-zinc-800"></div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Level</p>
              <p className="text-2xl font-mono text-white leading-none">{playerLevel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-lg hover:border-orange-500 transition-colors backdrop-blur-md"
            >
              {isMuted ? <VolumeX size={18} className="text-zinc-400" /> : <Volume2 size={18} className="text-orange-500" />}
            </button>
            
            {user ? (
              <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 p-2 pr-4 rounded-lg backdrop-blur-md">
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded border border-orange-500/50" />
                <button onClick={logout} className="hover:text-red-500 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={login}
                className="bg-orange-600 hover:bg-orange-500 text-white px-4 py-3 rounded-lg font-bold uppercase tracking-tight transition-all shadow-xl text-xs"
              >
                <LogIn size={18} className="inline mr-2" />
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className={`relative z-10 flex-1 flex flex-col items-center justify-center transition-transform duration-75 ${shake ? 'translate-x-1 translate-y-1 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 'translate-x-0 translate-y-0'}`}>
        {/* Inventory Sidebar (Left) */}
        <aside className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20 hidden lg:flex">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Arsenal</p>
          <HammerSelector 
            hammers={HAMMERS} 
            currentHammer={currentHammer} 
            level={playerLevel}
            onSelect={setCurrentHammer}
          />
        </aside>

        {/* Global Leaderboard (Right) */}
        <aside className="absolute right-6 top-1/2 -translate-y-1/2 w-64 z-20 hidden lg:block">
          <Leaderboard />
        </aside>

        {/* Play Area */}
        <div className="relative flex flex-col items-center justify-center p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentDevice.id}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative"
            >
              <Device 
                device={currentDevice} 
                hp={currentHp} 
                cracks={cracks} 
                onHit={handleHit}
                isExploding={isExploding}
              />
              <DamageEffect damageNumbers={damageNumbers} />
              
              {/* Floating SMASH Label if high hp */}
              {currentHp > currentDevice.maxHp * 0.9 && !isExploding && (
                <div className="absolute -top-10 -right-10 bg-red-600 text-white font-black px-4 py-2 rounded-sm rotate-12 shadow-xl animate-bounce pointer-events-none text-sm z-30">
                  SMASH IT!
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Stats overlay for small screens */}
        <div className="lg:hidden flex gap-4 mb-4">
           <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-lg text-xs font-bold font-mono">
             DESTROYED: {totalSmashed}
           </div>
           <button onClick={resetGame} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-xs font-bold uppercase hover:bg-zinc-800">
             RESET
           </button>
        </div>
      </main>

      {/* Footer / Progress Nav */}
      <footer className="relative z-10 p-6 mt-auto">
        <div className="flex justify-center gap-2">
          {DEVICES.map((dev, idx) => (
            <div 
              key={dev.id}
              className={`h-1.5 transition-all duration-500 rounded-full ${idx === currentLevelIndex ? 'w-16 bg-orange-600 shadow-[0_0_10px_rgba(234,88,12,0.8)]' : idx < currentLevelIndex ? 'w-8 bg-orange-600/50' : 'w-8 bg-zinc-800'}`}
            />
          ))}
        </div>
        <p className="text-center text-[10px] uppercase font-bold text-zinc-500 mt-4 tracking-[0.3em]">
          {currentLevelIndex < DEVICES.length - 1 ? `Next Up: ${DEVICES[currentLevelIndex + 1].name}` : 'Final Boss: Giant 4K TV'}
        </p>
      </footer>
    </div>
  );
}

