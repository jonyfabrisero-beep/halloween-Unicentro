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
    label: 'Casa 01 (Colina Oeste - Vía Principal)',
  },
  2: {
    slot: 2,
    x: 34.8,
    y: 29.5,
    zIndex: 12,
    houseType: 4,
    imagePath: '/houses/casa_04.png',
    label: 'Casa 02 (Colina Oeste - Curva)',
  },
  3: {
    slot: 3,
    x: 44.0,
    y: 21.5,
    zIndex: 14,
    houseType: 6,
    imagePath: '/houses/casa_06.png',
    label: 'Casa 03 (Noroeste - Entrada al Castillo)',
  },
  4: {
    slot: 4,
    x: 23.0,
    y: 61.2,
    zIndex: 19,
    houseType: 2,
    imagePath: '/houses/casa_02.png',
    label: 'Casa 04 (Acantilado Suroeste - Sobre Cementerio)',
  },
  5: {
    slot: 5,
    x: 66.2,
    y: 22.5,
    zIndex: 14,
    houseType: 7,
    imagePath: '/houses/casa_07.png',
    scaleFactor: 1.15,
    label: 'Casa 05 (Risco Noreste - Mirador Superior)',
  },
  6: {
    slot: 6,
    x: 74.5,
    y: 35.5,
    zIndex: 14,
    houseType: 9,
    imagePath: '/houses/casa_09.png',
    label: 'Casa 06 (Carretera Noreste)',
  },
  7: {
    slot: 7,
    x: 81.0,
    y: 44.5,
    zIndex: 14,
    houseType: 10,
    imagePath: '/houses/casa_10.png',
    label: 'Casa 07 (Acantilado Este)',
  },
  8: {
    slot: 8,
    x: 75.2,
    y: 66.5,
    zIndex: 16,
    houseType: 8,
    imagePath: '/houses/casa_08.png',
    scaleFactor: 1.28,
    label: 'Casa 08 (Ribera Sureste)',
  },
  9: {
    slot: 9,
    x: 46.0,
    y: 84.0,
    zIndex: 20,
    houseType: 1,
    imagePath: '/houses/casa_01.png',
    label: 'Casa 09 (Salida del Laberinto - Cascada)',
  },
  10: {
    slot: 10,
    x: 21.8,
    y: 43.5,
    zIndex: 18,
    houseType: 3,
    imagePath: '/houses/casa_03.png',
    label: 'Casa 10 (Suroeste - Cementerio / Laberinto)',
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
    id: 'store-olo-01',
    code: 'UNICENTRO-OLO-01',
    name: 'OLO',
    brand: 'OLO',
    category: 'Moda y Tendencias',
    location: 'Nivel 2 - Pasillo Oeste',
    description: 'Ropa juvenil con estilo urbano y accesorios de temporada.',
    color: '#6B21A8',
    accentColor: '#A855F7',
  },
  {
    slot: 2,
    id: 'store-opticolor-02',
    code: 'UNICENTRO-OPTICOLOR-02',
    name: 'Opticolor',
    brand: 'Opticolor',
    category: 'Óptica y Accesorios',
    location: 'Nivel 1 - Plaza Este',
    description: 'Lentes y accesorios terroríficamente geniales para tus disfraces.',
    color: '#EA580C',
    accentColor: '#F97316',
  },
  {
    slot: 3,
    id: 'store-cherry-03',
    code: 'UNICENTRO-CHERRY-03',
    name: 'Cherry',
    brand: 'Cherry Pastelería',
    category: 'Pastelería y Dulces',
    location: 'Nivel 2 - Terraza Alta',
    description: 'Cupcakes embrujados, tortas temáticas y golosinas artesanales.',
    color: '#0284C7',
    accentColor: '#38BDF8',
  },
  {
    slot: 4,
    id: 'store-ag-04',
    code: 'UNICENTRO-AG-04',
    name: 'AG AlbeGlass Decoraciones',
    brand: 'AG Decoraciones',
    category: 'Joyería y Detalles',
    location: 'Nivel 1 - Cima Norte',
    description: 'Los mejores accesorios y detalles mágicos para tu look espeluznante.',
    color: '#D97706',
    accentColor: '#F59E0B',
  },
  {
    slot: 5,
    id: 'store-clarks-05',
    code: 'UNICENTRO-CLARKS-05',
    name: 'Clarks',
    brand: 'Clarks',
    category: 'Calzado y Confort',
    location: 'Nivel 2 - Pasillo Norte',
    description: 'Zapatos cómodos para recorrer todo el centro comercial pidiendo dulces.',
    color: '#EA580C',
    accentColor: '#F97316',
  },
  {
    slot: 6,
    id: 'store-movilmat-06',
    code: 'UNICENTRO-MOVILMAT-06',
    name: 'Movilmat',
    brand: 'Movilmat',
    category: 'Tecnología y Móviles',
    location: 'Nivel 2 - Galería Central',
    description: 'Accesorios para teléfonos, gadgets inteligentes y novedades.',
    color: '#DB2777',
    accentColor: '#F472B6',
  },
  {
    slot: 7,
    id: 'store-galler-07',
    code: 'UNICENTRO-GALLER-07',
    name: 'Galler',
    brand: 'GALLER_',
    category: 'Juguetería y Regalos',
    location: 'Nivel 2 - Mirador',
    description: 'Juguetes, disfraces y dulces coleccionables de Halloween.',
    color: '#CA8A04',
    accentColor: '#EAB308',
  },
  {
    slot: 8,
    id: 'store-hubble-08',
    code: 'UNICENTRO-HUBBLE-08',
    name: 'Hubble',
    brand: 'hubble',
    category: 'Electrónica y Gadgets',
    location: 'Nivel 1 - Plaza Este',
    description: 'Los mejores gadgets electrónicos, audio y accesorios futuristas.',
    color: '#1E293B',
    accentColor: '#64748B',
  },
  {
    slot: 9,
    id: 'store-lilipink-09',
    code: 'UNICENTRO-LILIPINK-09',
    name: 'Lili Pink',
    brand: 'Lili Pink',
    category: 'Moda y Accesorios',
    location: 'Nivel 1 - Pasillo Central',
    description: 'Encuentra las prendas más divertidas y coloridas para Halloween.',
    color: '#EC4899',
    accentColor: '#F472B6',
  },
  {
    slot: 10,
    id: 'store-beato-10',
    code: 'UNICENTRO-BEATO-10',
    name: 'Beato Napolitano',
    brand: 'Beato',
    category: 'Restaurante y Pizzería',
    location: 'Nivel 1 - Plaza Oeste',
    description: 'Pizzas artesanales al horno de leña y delicias italianas.',
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
