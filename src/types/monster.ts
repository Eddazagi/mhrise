export type MonsterSizeCategory = 'GRANDE' | 'PEQUEÑO';

export type ElementType = 'fire' | 'water' | 'thunder' | 'ice' | 'dragon';
export type AilmentType = 'poison' | 'sleep' | 'paralysis' | 'blast' | 'stun';

export type MaterialIconName =
  | 'Escama-blanca'
  | 'Ala-blanca'
  | 'Saco-rojo'
  | 'Cabeza-naranja'
  | 'Piel-naranja'
  | 'Hueso-amarillo'
  | 'Hueso-rosa'
  | 'Hueso-naranja'
  | 'Caparazon-azul'
  | 'Gema-azul'
  | 'none';

export type MaterialIconType =
  | 'scale'
  | 'feather'
  | 'beak'
  | 'sac'
  | 'bone'
  | 'crest'
  | 'gem'
  | 'tear';

export type MaterialIconColor =
  | 'tan'
  | 'white'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'pink'
  | 'purple'
  | 'cyan'
  | 'blue';

export interface PhysiologyPart {
  id: string;
  part: string;
  sever: number;
  blunt: number;
  shot: number;
  fire: number;
  water: number;
  thunder: number;
  ice: number;
  dragon: number;
  /** Optional relative coordinates on the render for interactive markers (0-100%) */
  markerX?: number;
  markerY?: number;
}

export interface MaterialDropCell {
  value: string; // e.g., "24 %" or "100% / 30%" or "-- %"
  hasNotes?: boolean;
  notes?: string;
}

export interface MaterialDropRow {
  id: string;
  name: string;
  icon: MaterialIconName;
  iconType?: MaterialIconType;
  iconColor?: MaterialIconColor;
  target: MaterialDropCell;
  capture: MaterialDropCell;
  brokenPart: MaterialDropCell;
  carves: MaterialDropCell;
  dropped: MaterialDropCell;
}

export interface MonsterPlayerHP {
  p1: string;
  p2: string;
  p3: string;
  p4: string;
}

export interface MonsterData {
  id: string;
  name: string;
  sizeCategory: MonsterSizeCategory;
  type: string;
  threatLevel: number;
  expansion: 'Rise' | 'Sunbreak';
  iconUrl: string;
  renderUrl: string;
  size: {
    min: string;
    max: string;
  };
  hpByRank: {
    low: MonsterPlayerHP;
    high: MonsterPlayerHP;
    master: MonsterPlayerHP;
  };
  weaknesses: {
    elements: Record<ElementType, 0 | 1 | 2 | 3>;
    ailments: Record<AilmentType, 0 | 1 | 2 | 3>;
  };
  states: string[];
  physiologyStateLabel: string;
  physiologyParts: PhysiologyPart[];
  huntingTip: string;
  drops: {
    lowRank: MaterialDropRow[];
    highRank: MaterialDropRow[];
    masterRank: MaterialDropRow[];
  };
}
