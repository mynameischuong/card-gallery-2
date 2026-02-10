import type { CardRarity, RarityColors } from './types';

export const getRarityColors = (rarity: CardRarity): RarityColors => {
  const rarityMap: Record<CardRarity, RarityColors> = {
    common: {
      border: 'border-gray-500',
      glowClass: 'card-glow-common'
    },
    rare: {
      border: 'border-blue-500',
      glowClass: 'card-glow-rare'
    },
    epic: {
      border: 'border-purple-500',
      glowClass: 'card-glow-epic'
    },
    legendary: {
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

export function getImageUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${cleanPath}`;
}