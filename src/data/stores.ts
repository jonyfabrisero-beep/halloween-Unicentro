import { StoreInfo, HouseSlotConfig, StoreSlotAssignment, MapVariant } from '../types/game';

/**
 * FIXED ARCHITECTURAL HOUSE SLOTS (Posiciones 1 a 10)
 * Corresponden exactamente a los números 1 al 10 dibujados en la captura del mapa.
 * Estas coordenadas, escalas, tamaños, casas ilustradas y z-indexes son ESTRICTAMENTE
 * CONSERVADOS sin importar qué tienda se coloque en cada posición.
 */
export const HOUSE_SLOTS: Record<number, HouseSlotConfig> = {
  1: {
    slot: 1,
    x: 27.2,
    y: 31.2,
    zIndex: 8,
    houseType: 5,
    imagePath: '/houses/casa_05.png',
    label: 'Tienda 01 (Colina Oeste - Vía Principal)',
  },
  2: {
    slot: 2,
    x: 34.8,
    y: 29.5,
    zIndex: 12,
    houseType: 4,
    imagePath: '/houses/casa_04.png',
    label: 'Tienda 02 (Colina Oeste - Curva)',
  },
  3: {
    slot: 3,
    x: 44.0,
    y: 21.5,
    zIndex: 14,
    houseType: 6,
    imagePath: '/houses/casa_06.png',
    label: 'Tienda 03 (Noroeste - Entrada al Castillo)',
  },
  4: {
    slot: 4,
    x: 23.0,
    y: 61.2,
    zIndex: 19,
    houseType: 2,
    imagePath: '/houses/casa_02.png',
    label: 'Tienda 04 (Acantilado Suroeste - Sobre Cementerio)',
  },
  5: {
    slot: 5,
    x: 66.2,
    y: 22.5,
    zIndex: 14,
    houseType: 7,
    imagePath: '/houses/casa_07.png',
    scaleFactor: 1.15,
    label: 'Tienda 05 (Risco Noreste - Mirador Superior)',
  },
  6: {
    slot: 6,
    x: 74.5,
    y: 35.5,
    zIndex: 14,
    houseType: 9,
    imagePath: '/houses/casa_09.png',
    label: 'Tienda 06 (Carretera Noreste)',
  },
  7: {
    slot: 7,
    x: 81.0,
    y: 44.5,
    zIndex: 14,
    houseType: 10,
    imagePath: '/houses/casa_10.png',
    label: 'Tienda 07 (Acantilado Este)',
  },
  8: {
    slot: 8,
    x: 75.2,
    y: 66.5,
    zIndex: 16,
    houseType: 8,
    imagePath: '/houses/casa_08.png',
    scaleFactor: 1.28,
    label: 'Tienda 08 (Ribera Sureste)',
  },
  9: {
    slot: 9,
    x: 46.0,
    y: 84.0,
    zIndex: 20,
    houseType: 1,
    imagePath: '/houses/casa_01.png',
    label: 'Tienda 09 (Salida del Laberinto - Cascada)',
  },
  10: {
    slot: 10,
    x: 21.8,
    y: 43.5,
    zIndex: 18,
    houseType: 3,
    imagePath: '/houses/casa_03.png',
    label: 'Tienda 10 (Suroeste - Cementerio / Laberinto)',
  },
};

/**
 * Función constructora que combina la información de la tienda con la configuración
 * fija del slot (posición x, y, escala, zIndex, imagen de la casa).
 */
export function buildStoreFromSlot(assignment: StoreSlotAssignment): StoreInfo {
  const slotConfig = HOUSE_SLOTS[assignment.slot];
  if (!slotConfig) {
    throw new Error(`Slot ${assignment.slot} no existe. Debe ser un número del 1 al 10.`);
  }

  return {
    id: assignment.id,
    code: assignment.code,
    name: assignment.name,
    brand: assignment.brand,
    category: assignment.category,
    location: assignment.location,
    description: assignment.description,
    color: assignment.color,
    accentColor: assignment.accentColor,
    logoPath: assignment.logoPath,
    slotNumber: assignment.slot,
    x: slotConfig.x,
    y: slotConfig.y,
    zIndex: slotConfig.zIndex,
    houseType: slotConfig.houseType,
    imagePath: slotConfig.imagePath,
    scaleFactor: slotConfig.scaleFactor,
    customWidthPercent: slotConfig.customWidthPercent,
  };
}

/**
 * Helper para construir una variante completa del mapa con sus 10 tiendas.
 */
export function createMapVariant(
  id: string,
  name: string,
  description: string,
  assignments: StoreSlotAssignment[]
): MapVariant {
  const stores = assignments.map(buildStoreFromSlot);
  return { id, name, description, stores };
}

/**
 * VARIANTE 1 (Variante Actual de Referencia)
 * Cada tienda asignada exactamente al slot 1 al 10 que le corresponde en la captura.
 */
export const DEFAULT_SLOT_ASSIGNMENTS: StoreSlotAssignment[] = [
  {
    slot: 1,
    id: 'store-01',
    code: 'UNICENTRO-TIENDA-01',
    name: 'Tienda #1',
    brand: 'Tienda #1',
    category: 'Ubicación 1 · Colina Oeste',
    location: 'Colina Oeste - Vía Principal',
    description: 'Escanea el código QR de la Tienda #1 para desbloquearla.',
    color: '#6B21A8',
    accentColor: '#F59E0B',
  },
  {
    slot: 2,
    id: 'store-02',
    code: 'UNICENTRO-TIENDA-02',
    name: 'Tienda #2',
    brand: 'Tienda #2',
    category: 'Ubicación 2 · Colina Oeste (Curva)',
    location: 'Colina Oeste - Curva',
    description: 'Escanea el código QR de la Tienda #2 para desbloquearla.',
    color: '#EA580C',
    accentColor: '#F97316',
  },
  {
    slot: 3,
    id: 'store-03',
    code: 'UNICENTRO-TIENDA-03',
    name: 'Tienda #3',
    brand: 'Tienda #3',
    category: 'Ubicación 3 · Entrada al Castillo',
    location: 'Noroeste - Entrada al Castillo',
    description: 'Escanea el código QR de la Tienda #3 para desbloquearla.',
    color: '#0284C7',
    accentColor: '#38BDF8',
  },
  {
    slot: 4,
    id: 'store-04',
    code: 'UNICENTRO-TIENDA-04',
    name: 'Tienda #4',
    brand: 'Tienda #4',
    category: 'Ubicación 4 · Acantilado Suroeste',
    location: 'Acantilado Suroeste - Sobre Cementerio',
    description: 'Escanea el código QR de la Tienda #4 para desbloquearla.',
    color: '#D97706',
    accentColor: '#F59E0B',
  },
  {
    slot: 5,
    id: 'store-05',
    code: 'UNICENTRO-TIENDA-05',
    name: 'Tienda #5',
    brand: 'Tienda #5',
    category: 'Ubicación 5 · Risco Noreste',
    location: 'Risco Noreste - Mirador Superior',
    description: 'Escanea el código QR de la Tienda #5 para desbloquearla.',
    color: '#10B981',
    accentColor: '#34D399',
  },
  {
    slot: 6,
    id: 'store-06',
    code: 'UNICENTRO-TIENDA-06',
    name: 'Tienda #6',
    brand: 'Tienda #6',
    category: 'Ubicación 6 · Carretera Noreste',
    location: 'Carretera Noreste',
    description: 'Escanea el código QR de la Tienda #6 para desbloquearla.',
    color: '#DB2777',
    accentColor: '#F472B6',
  },
  {
    slot: 7,
    id: 'store-07',
    code: 'UNICENTRO-TIENDA-07',
    name: 'Tienda #7',
    brand: 'Tienda #7',
    category: 'Ubicación 7 · Acantilado Este',
    location: 'Acantilado Este',
    description: 'Escanea el código QR de la Tienda #7 para desbloquearla.',
    color: '#CA8A04',
    accentColor: '#EAB308',
  },
  {
    slot: 8,
    id: 'store-08',
    code: 'UNICENTRO-TIENDA-08',
    name: 'Tienda #8',
    brand: 'Tienda #8',
    category: 'Ubicación 8 · Ribera Sureste',
    location: 'Ribera Sureste',
    description: 'Escanea el código QR de la Tienda #8 para desbloquearla.',
    color: '#8B5CF6',
    accentColor: '#A78BFA',
  },
  {
    slot: 9,
    id: 'store-09',
    code: 'UNICENTRO-TIENDA-09',
    name: 'Tienda #9',
    brand: 'Tienda #9',
    category: 'Ubicación 9 · Salida Cascada',
    location: 'Salida del Laberinto - Cascada',
    description: 'Escanea el código QR de la Tienda #9 para desbloquearla.',
    color: '#EC4899',
    accentColor: '#F472B6',
  },
  {
    slot: 10,
    id: 'store-10',
    code: 'UNICENTRO-TIENDA-10',
    name: 'Tienda #10',
    brand: 'Tienda #10',
    category: 'Ubicación 10 · Cementerio / Laberinto',
    location: 'Suroeste - Cementerio / Laberinto',
    description: 'Escanea el código QR de la Tienda #10 para desbloquearla.',
    color: '#DC2626',
    accentColor: '#EF4444',
  },
];

/**
 * Mapa de variantes disponibles en el juego.
 * Cuando el usuario proporcione nuevas tiendas y variantes, simplemente se agregan aquí.
 */
export const MAP_VARIANTS: MapVariant[] = [
  createMapVariant(
    'variante-1',
    'Variante 1 (Principal)',
    'Distribución oficial de tiendas Unicentro Maracay',
    DEFAULT_SLOT_ASSIGNMENTS
  ),
];

/**
 * STORES_DATA exportado por defecto (Variante 1) para compatibilidad inmediata en toda la app.
 */
export const STORES_DATA: StoreInfo[] = MAP_VARIANTS[0].stores;
