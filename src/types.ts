/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DeviceType {
  id: string;
  name: string;
  maxHp: number;
  icon: string;
  color: string;
  width: number;
  height: number;
}

export interface HammerType {
  id: string;
  name: string;
  damage: number;
  unlockedAt: number; // level
  icon: string;
  color: string;
}

export interface Crack {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  type: number;
}

export enum DeviceId {
  FEATURE_PHONE = 'feature_phone',
  SMARTPHONE = 'smartphone',
  TABLET = 'tablet',
  LAPTOP = 'laptop',
  TV = 'tv'
}

export const DEVICES: DeviceType[] = [
  {
    id: DeviceId.FEATURE_PHONE,
    name: 'Retro Phone',
    maxHp: 100,
    icon: 'Smartphone',
    color: 'bg-slate-700',
    width: 120,
    height: 200
  },
  {
    id: DeviceId.SMARTPHONE,
    name: 'Modern Smartphone',
    maxHp: 250,
    icon: 'Smartphone',
    color: 'bg-zinc-800',
    width: 140,
    height: 280
  },
  {
    id: DeviceId.TABLET,
    name: 'Slim Tablet',
    maxHp: 600,
    icon: 'Tablet',
    color: 'bg-zinc-900',
    width: 300,
    height: 400
  },
  {
    id: DeviceId.LAPTOP,
    name: 'Work Laptop',
    maxHp: 1500,
    icon: 'Laptop',
    color: 'bg-gray-300',
    width: 500,
    height: 350
  },
  {
    id: DeviceId.TV,
    name: 'Giant 4K TV',
    maxHp: 4000,
    icon: 'Tv',
    color: 'bg-black',
    width: 600,
    height: 380
  }
];

export const HAMMERS: HammerType[] = [
  { id: 'wooden', name: 'Wooden Hammer', damage: 10, unlockedAt: 0, icon: 'Hammer', color: 'text-amber-700' },
  { id: 'iron', name: 'Iron Hammer', damage: 30, unlockedAt: 2, icon: 'Hammer', color: 'text-slate-500' },
  { id: 'sledge', name: 'Sledgehammer', damage: 80, unlockedAt: 3, icon: 'Construction', color: 'text-zinc-600' },
  { id: 'golden', name: 'Golden Sledge', damage: 250, unlockedAt: 5, icon: 'Gem', color: 'text-yellow-400' }
];
