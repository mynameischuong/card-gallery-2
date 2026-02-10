import type { CardRarity, RarityColors } from './types';

export const getRarityColors = (rarity: CardRarity): RarityColors => {
  const rarityMap: Record<CardRarity, RarityColors> = {
    casual: {
      border: 'border-gray-500',
      glowClass: 'card-glow-common'
    },
    'semi-competitive': {
      border: 'border-blue-500',
      glowClass: 'card-glow-rare'
    },
    rogue: {
      border: 'border-purple-500',
      glowClass: 'card-glow-epic'
    },
    meta: {
      border: 'border-yellow-500',
      glowClass: 'card-glow-legendary'
    }
  };
  
  return rarityMap[rarity];
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};