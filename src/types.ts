// Represents a decklist for a specific card and duelist
export interface Decklist {
  id: number;
  cardName: string; // Name of the deck (should match Card.name)
  duelist: string;  // Name of the duelist
  title: string;    // Decklist title or variant name
  image: string;    // Path to decklist image (e.g., /decklist/archfiend.PNG)
}
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Card {
  id: number;
  name: string;
  level: number;
  rarity: CardRarity;
  locked: boolean;
  image: string;
  duelist: string;
}

export interface AppState {
  cards: Card[];
  currentPage: number;
  cardsPerPage: number;
  goldAmount: number;
  gemAmount: number;
}

export interface RarityColors {
  border: string;
  glowClass: string;
}
