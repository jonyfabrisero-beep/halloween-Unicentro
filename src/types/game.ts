export type Gender = 'girl' | 'boy';

export interface PlayerData {
  id: string;
  playerName: string;
  parentName: string;
  gender: Gender;
  createdAt: string;
  completedAt?: string;
  prizeDelivered?: boolean;
  prizeDeliveredAt?: string;
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
  scaleFactor?: number;
  customWidthPercent?: string;
  zIndex?: number;
  slotNumber?: number; // 1 to 10 corresponding to physical house position on map
  logoPath?: string;
}

export interface HouseSlotConfig {
  slot: number; // 1 to 10
  x: number;
  y: number;
  zIndex: number;
  houseType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  imagePath: string;
  scaleFactor?: number;
  customWidthPercent?: string;
  label: string;
}

export interface StoreSlotAssignment {
  slot: number; // 1 to 10
  id: string;
  code: string;
  name: string;
  brand: string;
  category: string;
  location: string;
  description: string;
  color: string;
  accentColor: string;
  logoPath?: string;
}

export interface MapVariant {
  id: string;
  name: string;
  description?: string;
  stores: StoreInfo[];
}

export type GameScreen = 
  | 'ORIENTATION_SETUP'
  | 'INTRO'
  | 'REGISTRATION'
  | 'MAP'
  | 'VICTORY';
