export type Gender = 'girl' | 'boy';

export interface PlayerData {
  id: string;
  playerName: string;
  parentName: string;
  gender: Gender;
  createdAt: string;
  completedAt?: string;
  unlockedStores: string[]; // Store IDs that are completed (3 stars)
  storeStars: Record<string, number>; // Store ID -> star count (0 to 3)
  scanHistory: {
    storeId: string;
    storeName: string;
    timestamp: string;
    code: string;
  }[];
}

export interface StoreInfo {
  id: string;
  code: string;
  name: string;
  brand: string;
  category: string;
  location: string;
  description: string;
  color: string;
  accentColor: string;
  x: number; // percentage on map (0 - 100)
  y: number; // percentage on map (0 - 100)
  houseType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  imagePath: string;
}

export type GameScreen = 
  | 'INTRO'
  | 'REGISTRATION'
  | 'MAP'
  | 'VICTORY';
