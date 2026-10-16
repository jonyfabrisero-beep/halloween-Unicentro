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
    imagePath: '/tiendas/embrujadas/bambu_tea_embrujada.webp',
    label: 'Tienda 01 (Colina Oeste - Vía Principal)',
  },
  2: {
    slot: 2,
    x: 34.8,
    y: 29.5,
    zIndex: 12,
    houseType: 4,
    imagePath: '/tiendas/embrujadas/biella_embrujada.webp',
    label: 'Tienda 02 (Colina Oeste - Curva)',
  },
  3: {
    slot: 3,
    x: 44.0,
    y: 21.5,
    zIndex: 14,
    houseType: 6,
    imagePath: '/tiendas/embrujadas/depekes_embrujada.webp',
    label: 'Tienda 03 (Noroeste - Entrada al Castillo)',
  },
  4: {
    slot: 4,
    x: 23.0,
    y: 61.2,
    zIndex: 19,
    houseType: 2,
    imagePath: '/tiendas/embrujadas/farmatodo_embrujada.webp',
    label: 'Tienda 04 (Acantilado Suroeste - Sobre Cementerio)',
  },
  5: {
    slot: 5,
    x: 66.2,
    y: 22.5,
    zIndex: 14,
    houseType: 7,
    imagePath: '/tiendas/embrujadas/jadu_embrujada.webp',
    scaleFactor: 1.15,
    label: 'Tienda 05 (Risco Noreste - Mirador Superior)',
  },
  6: {
    slot: 6,
    x: 74.5,
    y: 35.5,
    zIndex: 14,
    houseType: 9,
    imagePath: '/tiendas/embrujadas/jump_embrujada.webp',
    label: 'Tienda 06 (Carretera Noreste)',
  },
  7: {
    slot: 7,
    x: 81.0,
    y: 44.5,
    zIndex: 14,
    houseType: 10,
    imagePath: '/tiendas/embrujadas/mobalu_embrujada.webp',
    label: 'Tienda 07 (Acantilado Este)',
  },
  8: {
    slot: 8,
    x: 75.2,
    y: 66.5,
    zIndex: 16,
    houseType: 8,
    imagePath: '/tiendas/embrujadas/probiovida_embrujada.webp',
    scaleFactor: 1.28,
    label: 'Tienda 08 (Ribera Sureste)',
  },
  9: {
    slot: 9,
    x: 46.0,
    y: 84.0,
    zIndex: 20,
    houseType: 1,
    imagePath: '/tiendas/embrujadas/quiero_galleta_embrujada.webp',
    label: 'Tienda 09 (Salida del Laberinto - Cascada)',
  },
  10: {
    slot: 10,
    x: 21.8,
    y: 43.5,
    zIndex: 18,
    houseType: 3,
    imagePath: '/tiendas/embrujadas/siddhi_embrujada.webp',
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
    imagePath: assignment.imagePath || slotConfig.imagePath,
    savedImagePath: assignment.savedImagePath || slotConfig.savedImagePath,
    defaultImagePath: slotConfig.imagePath,
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
 * VARIANTE 1 "Ruta A" - Tiendas oficiales proporcionadas por el usuario
 */
export const RUTA_A_ASSIGNMENTS: StoreSlotAssignment[] = [
  {
    slot: 1,
    id: 'store-bambu-tea-01',
    code: 'LUNA-42',
    name: 'Bambu Tea',
    brand: 'Bambu Tea',
    category: 'Bebidas y Bubble Tea',
    location: 'Nivel 2 - Colina Oeste',
    description: 'Tés exóticos, bubble tea refrescante y pociones deliciosas de Halloween.',
    color: '#059669',
    accentColor: '#34D399',
    imagePath: '/tiendas/embrujadas/bambu_tea_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/bambu_tea_salvada.webp',
  },
  {
    slot: 2,
    id: 'store-biella-02',
    code: 'RAYO-18',
    name: 'Biella',
    brand: 'Biella',
    category: 'Calzado y Moda',
    location: 'Nivel 1 - Plaza Oeste',
    description: 'Calzado y accesorios con estilo único para recorrer Unicentro.',
    color: '#D97706',
    accentColor: '#F59E0B',
    imagePath: '/tiendas/embrujadas/biella_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/biella_salvada.webp',
  },
  {
    slot: 3,
    id: 'store-depekes-03',
    code: 'MAGIA-29',
    name: 'Depekes',
    brand: 'Depekes',
    category: 'Moda Infantil y Bebés',
    location: 'Nivel 2 - Entrada al Castillo',
    description: 'Ropa para niños, detalles encantadores y disfraces para los pequeños.',
    color: '#0284C7',
    accentColor: '#38BDF8',
    imagePath: '/tiendas/embrujadas/depekes_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/depekes_salvada.webp',
  },
  {
    slot: 4,
    id: 'store-farmatodo-04',
    code: 'POCION-92',
    name: 'Farmatodo',
    brand: 'Farmatodo',
    category: 'Farmacia, Golosinas y Cuidado',
    location: 'Nivel 1 - Entrada Principal',
    description: 'Golosinas, cuidado personal y todo para tu noche de Dulce o Truco.',
    color: '#1D4ED8',
    accentColor: '#60A5FA',
    imagePath: '/tiendas/embrujadas/farmatodo_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/farmatodo_salvada.webp',
  },
  {
    slot: 5,
    id: 'store-jadu-05',
    code: 'CHISPA-37',
    name: 'Jadu',
    brand: 'Jadu',
    category: 'Tendencia y Accesorios',
    location: 'Nivel 2 - Risco Noreste',
    description: 'Accesorios en tendencia y detalles mágicos para brillar.',
    color: '#7C3AED',
    accentColor: '#A78BFA',
    imagePath: '/tiendas/embrujadas/jadu_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/jadu_salvada.webp',
  },
  {
    slot: 6,
    id: 'store-jump-06',
    code: 'FUEGO-16',
    name: 'Jump',
    brand: 'Jump',
    category: 'Entretenimiento y Trampolines',
    location: 'Nivel 2 - Carretera Noreste',
    description: '¡Parque de trampolines, adrenalina y diversión al máximo!',
    color: '#EA580C',
    accentColor: '#FB923C',
    imagePath: '/tiendas/embrujadas/jump_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/jump_salvada.webp',
  },
  {
    slot: 7,
    id: 'store-mobalu-07',
    code: 'BRUJA-55',
    name: 'Mobalu Store',
    brand: 'Mobalu Store',
    category: 'Tecnología y Móviles',
    location: 'Nivel 1 - Acantilado Este',
    description: 'Gadgets electrónicos, accesorios para smartphones y novedades.',
    color: '#0F766E',
    accentColor: '#2DD4BF',
    imagePath: '/tiendas/embrujadas/mobalu_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/mobalu_salvada.webp',
  },
  {
    slot: 8,
    id: 'store-probiovida-08',
    code: 'DUENDE-83',
    name: 'Probiovida',
    brand: 'Probiovida',
    category: 'Salud y Nutrición Natural',
    location: 'Nivel 1 - Ribera Sureste',
    description: 'Bienestar, nutrición y estilo de vida saludable.',
    color: '#15803D',
    accentColor: '#4ADE80',
    imagePath: '/tiendas/embrujadas/probiovida_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/probiovida_salvada.webp',
  },
  {
    slot: 9,
    id: 'store-quiero-galletas-09',
    code: 'DULCE-64',
    name: 'Quiero Galletas',
    brand: 'Quiero Galletas',
    category: 'Pastelería y Galletas Artesanales',
    location: 'Nivel 2 - Salida Cascada',
    description: 'Galletas crujientes, postres espeluznantes y dulces horneados.',
    color: '#B45309',
    accentColor: '#FBBF24',
    imagePath: '/tiendas/embrujadas/quiero_galleta_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/quiero_galleta_salvada.webp',
  },
  {
    slot: 10,
    id: 'store-siddhi-10',
    code: 'TRUCO-75',
    name: 'Siddhi',
    brand: 'Siddhi',
    category: 'Boutique y Moda Femenina',
    location: 'Nivel 1 - Plaza Central',
    description: 'Diseños de moda exclusivos, elegancia y accesorios de temporada.',
    color: '#BE123C',
    accentColor: '#FB7185',
    imagePath: '/tiendas/embrujadas/siddhi_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/siddhi_salvada.webp',
  },
];

/**
 * VARIANTE 2 "Ruta B" - Con Sushi y Cebiches, Yalorde Tentaciones, Maison Rose, My Platinum...
 */
export const RUTA_B_ASSIGNMENTS: StoreSlotAssignment[] = [
  {
    slot: 1,
    id: 'store-sushi-cebiches-01',
    code: 'NEBULA-41',
    name: 'Sushi y Cebiches',
    brand: 'Sushi y Cebiches',
    category: 'Gastronomía Japonesa y Marina',
    location: 'Nivel 2 - Colina Oeste',
    description: 'Rolls frescos, cebiches artesanales y sabores del mar.',
    color: '#E11D48',
    accentColor: '#FB7185',
    imagePath: '/tiendas/embrujadas/sushi_&_cebiches_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/sushi_&_cebiches_salvada.webp',
  },
  {
    slot: 2,
    id: 'store-yalorde-02',
    code: 'MISTERIO-72',
    name: 'Yalorde Tentaciones',
    brand: 'Yalorde Tentaciones',
    category: 'Postres y Dulcería',
    location: 'Nivel 1 - Plaza Oeste',
    description: 'Tentaciones dulces, pastelería artesanal y postres temáticos.',
    color: '#D97706',
    accentColor: '#F59E0B',
    imagePath: '/tiendas/embrujadas/yalorde_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/yalorde_salvada.webp',
  },
  {
    slot: 3,
    id: 'store-maison-rose-03',
    code: 'CRISTAL-53',
    name: 'Maison Rose',
    brand: 'Maison Rose',
    category: 'Moda y Tendencias',
    location: 'Nivel 2 - Entrada al Castillo',
    description: 'Moda exclusiva y accesorios encantadores.',
    color: '#DB2777',
    accentColor: '#F472B6',
    imagePath: '/tiendas/embrujadas/maison_rose_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/maison_rose_salvada.webp',
  },
  {
    slot: 4,
    id: 'store-my-platinum-04',
    code: 'PERLA-84',
    name: 'My Platinum',
    brand: 'My Platinum',
    category: 'Joyería y Accesorios',
    location: 'Nivel 1 - Acantilado Suroeste',
    description: 'Joyería fina, accesorios y detalles radiantes.',
    color: '#64748B',
    accentColor: '#94A3B8',
    imagePath: '/tiendas/embrujadas/my_platinum_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/my_platinum_salvada.webp',
  },
  {
    slot: 5,
    id: 'store-planet-park-05',
    code: 'ASTRO-15',
    name: 'Planet Park',
    brand: 'Planet Park',
    category: 'Parque de Atracciones y Juegos',
    location: 'Nivel 2 - Risco Noreste',
    description: 'Diversión infinita, atracciones infantiles y juegos.',
    color: '#8B5CF6',
    accentColor: '#A78BFA',
    imagePath: '/tiendas/embrujadas/planet_park_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/planet_park_salvada.webp',
  },
  {
    slot: 6,
    id: 'store-coco-bongo-06',
    code: 'FESTA-66',
    name: 'Coco Bongo',
    brand: 'Coco Bongo',
    category: 'Bebidas y Entretenimiento',
    location: 'Nivel 2 - Carretera Noreste',
    description: 'Cócteles, smoothies refrescantes y ambiente festivo.',
    color: '#EA580C',
    accentColor: '#FB923C',
    imagePath: '/tiendas/embrujadas/coco_bongo_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/coco_bongo_salvada.webp',
  },
  {
    slot: 7,
    id: 'store-cherry-beauty-07',
    code: 'RUBI-27',
    name: 'Cherry Beauty',
    brand: 'Cherry Beauty',
    category: 'Belleza y Cuidado Facial',
    location: 'Nivel 1 - Acantilado Este',
    description: 'Cosméticos, cuidado de la piel y tendencias de belleza.',
    color: '#E11D48',
    accentColor: '#FDA4AF',
    imagePath: '/tiendas/embrujadas/cherry_beauty_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/cherry_beauty_salvada.webp',
  },
  {
    slot: 8,
    id: 'store-gatitas-fashion-08',
    code: 'FELINA-38',
    name: 'Gatitas Fashion',
    brand: 'Gatitas Fashion',
    category: 'Moda y Accesorios de Niñas',
    location: 'Nivel 1 - Ribera Sureste',
    description: 'Prendas con estilo, accesorios tiernos y moda.',
    color: '#EC4899',
    accentColor: '#F472B6',
    imagePath: '/tiendas/embrujadas/gatitas_fashion_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/gatitas_fashion_salvada.webp',
  },
  {
    slot: 9,
    id: 'store-baby-fun-09',
    code: 'ALEGRIA-89',
    name: 'Baby Fun',
    brand: 'Baby Fun',
    category: 'Juegos y Entretenimiento para Bebés',
    location: 'Nivel 2 - Salida Cascada',
    description: 'Espacio de juegos y estimulación para los más pequeños.',
    color: '#06B6D4',
    accentColor: '#67E8F9',
    imagePath: '/tiendas/embrujadas/baby_fun_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/baby_fun_salvada.webp',
  },
  {
    slot: 10,
    id: 'store-kailu-10',
    code: 'CORAL-50',
    name: 'Kailú',
    brand: 'Kailú',
    category: 'Moda Playera y Accesorios',
    location: 'Nivel 1 - Plaza Central',
    description: 'Moda tropical, trajes de baño y complementos de verano.',
    color: '#10B981',
    accentColor: '#34D399',
    imagePath: '/tiendas/embrujadas/kailú_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/kailú_salvada.webp',
  },
];

/**
 * VARIANTE 3 "Ruta C" - Maiso, Incanto Bloom, Remington Center, Doggie, Xtasis Store, Hallyu...
 */
export const RUTA_C_ASSIGNMENTS: StoreSlotAssignment[] = [
  {
    slot: 1,
    id: 'store-maiso-01',
    code: 'ZAFIRO-11',
    name: 'Maiso',
    brand: 'Maiso',
    category: 'Moda y Calzado',
    location: 'Nivel 2 - Colina Oeste',
    description: 'Calzado exclusivo, moda y estilo para toda la familia.',
    color: '#0284C7',
    accentColor: '#38BDF8',
    imagePath: '/tiendas/embrujadas/maiso_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/maiso_salvada.webp',
  },
  {
    slot: 2,
    id: 'store-incanto-bloom-02',
    code: 'FLORA-24',
    name: 'Incanto Bloom',
    brand: 'Incanto Bloom',
    category: 'Perfumes y Fragancias',
    location: 'Nivel 1 - Plaza Oeste',
    description: 'Aromas encantadores, lociones y esencias de ensueño.',
    color: '#DB2777',
    accentColor: '#F472B6',
    imagePath: '/tiendas/embrujadas/incanto_bloom_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/incanto_bloom_salvada.webp',
  },
  {
    slot: 3,
    id: 'store-remington-center-03',
    code: 'ESTRELLA-36',
    name: 'Remington Center',
    brand: 'Remington Center',
    category: 'Cuidado Personal y Estilo',
    location: 'Nivel 2 - Entrada al Castillo',
    description: 'Equipos de belleza, cuidado del cabello y estilo personal.',
    color: '#475569',
    accentColor: '#94A3B8',
    imagePath: '/tiendas/embrujadas/remington_center_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/remington_center_salvada.webp',
  },
  {
    slot: 4,
    id: 'store-doggie-04',
    code: 'HUESO-48',
    name: 'Doggie',
    brand: 'Doggie',
    category: 'Mascotas y Accesorios',
    location: 'Nivel 1 - Acantilado Suroeste',
    description: 'Consentimiento para mascotas, juguetes y accesorios divertidos.',
    color: '#CA8A04',
    accentColor: '#EAB308',
    imagePath: '/tiendas/embrujadas/doggie_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/doggie_salvada.webp',
  },
  {
    slot: 5,
    id: 'store-xtasis-store-05',
    code: 'TRUENO-59',
    name: 'Xtasis Store',
    brand: 'Xtasis Store',
    category: 'Moda y Tendencias Juveniles',
    location: 'Nivel 2 - Risco Noreste',
    description: 'Prendas urbanas, tendencias de temporada y accesorios.',
    color: '#7C3AED',
    accentColor: '#A78BFA',
    imagePath: '/tiendas/embrujadas/xtasis_store_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/xtasis_stores_salvada.webp',
  },
  {
    slot: 6,
    id: 'store-hallyu-06',
    code: 'KPOP-63',
    name: 'Hallyu',
    brand: 'Hallyu',
    category: 'Cultura Coreana y Coleccionables',
    location: 'Nivel 2 - Carretera Noreste',
    description: 'Artículos K-Pop, snacks asiáticos y coleccionables únicos.',
    color: '#DC2626',
    accentColor: '#F87171',
    imagePath: '/tiendas/embrujadas/hallyu_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/Hallyu_salvada.webp',
  },
  {
    slot: 7,
    id: 'store-c-07',
    code: 'FANTASMA-77',
    name: 'Tienda #7 (En preparación)',
    brand: 'Tienda #7',
    category: 'Pendiente Ruta C',
    location: 'Nivel 1 - Acantilado Este',
    description: 'Próxima tienda embrujada de la Ruta C.',
    color: '#0F766E',
    accentColor: '#2DD4BF',
    imagePath: '/tiendas/embrujadas/mobalu_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/mobalu_salvada.webp',
  },
  {
    slot: 8,
    id: 'store-c-08',
    code: 'CALABAZA-88',
    name: 'Tienda #8 (En preparación)',
    brand: 'Tienda #8',
    category: 'Pendiente Ruta C',
    location: 'Nivel 1 - Ribera Sureste',
    description: 'Próxima tienda embrujada de la Ruta C.',
    color: '#15803D',
    accentColor: '#4ADE80',
    imagePath: '/tiendas/embrujadas/probiovida_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/probiovida_salvada.webp',
  },
  {
    slot: 9,
    id: 'store-c-09',
    code: 'SOMBRA-91',
    name: 'Tienda #9 (En preparación)',
    brand: 'Tienda #9',
    category: 'Pendiente Ruta C',
    location: 'Nivel 2 - Salida Cascada',
    description: 'Próxima tienda embrujada de la Ruta C.',
    color: '#B45309',
    accentColor: '#FBBF24',
    imagePath: '/tiendas/embrujadas/quiero_galleta_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/quiero_galleta_salvada.webp',
  },
  {
    slot: 10,
    id: 'store-c-10',
    code: 'HECHIZO-99',
    name: 'Tienda #10 (En preparación)',
    brand: 'Tienda #10',
    category: 'Pendiente Ruta C',
    location: 'Nivel 1 - Plaza Central',
    description: 'Próxima tienda embrujada de la Ruta C.',
    color: '#BE123C',
    accentColor: '#FB7185',
    imagePath: '/tiendas/embrujadas/siddhi_embrujada.webp',
    savedImagePath: '/tiendas/salvadas/siddhi_salvada.webp',
  },
];

export const DEFAULT_SLOT_ASSIGNMENTS = RUTA_A_ASSIGNMENTS;

/**
 * Mapa de variantes disponibles en el juego.
 */
export const MAP_VARIANTS: MapVariant[] = [
  createMapVariant(
    'variante-1',
    'Variante 1 · Ruta A',
    'Distribución oficial Ruta A (Bambu Tea, Biella, Depekes, Farmatodo, Jadu, Jump, Mobalu...)',
    RUTA_A_ASSIGNMENTS
  ),
  createMapVariant(
    'variante-2',
    'Variante 2 · Ruta B',
    'Distribución oficial Ruta B (Sushi y Cebiches, Yalorde, Maison Rose, My Platinum, Planet Park, Coco Bongo...)',
    RUTA_B_ASSIGNMENTS
  ),
  createMapVariant(
    'variante-3',
    'Variante 3 · Ruta C',
    'Distribución oficial Ruta C (Maiso, Incanto Bloom, Remington Center, Doggie, Xtasis Store, Hallyu...)',
    RUTA_C_ASSIGNMENTS
  ),
];

/**
 * Helper para obtener una variante por ID.
 */
export function getVariantById(variantId?: string): MapVariant {
  if (!variantId) return MAP_VARIANTS[0];
  const found = MAP_VARIANTS.find((v) => v.id === variantId);
  return found || MAP_VARIANTS[0];
}

/**
 * Helper para obtener las 10 tiendas del jugador según su variante asignada.
 */
export function getStoresForPlayer(player?: { variantId?: string } | null): StoreInfo[] {
  if (!player || !player.variantId) {
    return MAP_VARIANTS[0].stores;
  }
  return getVariantById(player.variantId).stores;
}

/**
 * Helper para seleccionar aleatoriamente una variante para un nuevo jugador.
 * El niño no puede elegir: el sistema le asigna una de las 3 rutas al azar.
 */
export function getRandomVariantId(): string {
  const ids = ['variante-1', 'variante-2', 'variante-3'];
  const randomIndex = Math.floor(Math.random() * ids.length);
  return ids[randomIndex];
}

/**
 * STORES_DATA exportado por defecto (Variante 1 - Ruta A para retrocompatibilidad).
 */
export const STORES_DATA: StoreInfo[] = MAP_VARIANTS[0].stores;


