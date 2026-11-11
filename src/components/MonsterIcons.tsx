import React from 'react';
import {
  AilmentType,
  ElementType,
  MaterialIconColor,
  MaterialIconName,
  MaterialIconType,
} from '../types/monster';

export const TransparentMonsterIcon: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = 'w-full h-full object-contain' }) => {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      referrerPolicy="no-referrer"
      className={`${className} pointer-events-none select-none`}
    />
  );
};

const ELEMENT_ICON_PATHS: Record<ElementType, { src: string; label: string }> = {
  fire: { src: '/assets/aistudio/Fuego_76a64850.svg', label: 'Fuego' },
  water: { src: '/assets/aistudio/Agua_d148dd92.svg', label: 'Agua' },
  thunder: { src: '/assets/aistudio/Rayo_d9071550.svg', label: 'Rayo' },
  ice: { src: '/assets/aistudio/Hielo_8630920d.svg', label: 'Hielo' },
  dragon: { src: '/assets/aistudio/Draco_69971b61.svg', label: 'Draco' },
};

const AILMENT_ICON_PATHS: Record<AilmentType, { src: string; label: string }> = {
  poison: {
    src: '/assets/aistudio/Veneno_3a4ebfbf.svg',
    label: 'Veneno',
  },
  sleep: {
    src: '/assets/aistudio/Sue_o_d6e9fa36.svg',
    label: 'Sueño',
  },
  paralysis: {
    src: '/assets/aistudio/Paralisis_37f0bf1f.svg',
    label: 'Parálisis',
  },
  blast: {
    src: '/assets/aistudio/Nitro_2fbf33c1.svg',
    label: 'Nitro',
  },
  stun: {
    src: '/assets/aistudio/Aturdimiento_f9a9a4ed.svg',
    label: 'Aturdimiento',
  },
};

export const ElementIcon: React.FC<{
  type: ElementType;
  className?: string;
}> = ({ type, className = 'w-6 h-6' }) => {
  const item = ELEMENT_ICON_PATHS[type];
  return (
    <img
      src={item.src}
      alt={item.label}
      title={item.label}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      referrerPolicy="no-referrer"
      className={`${className} object-contain pointer-events-none select-none`}
    />
  );
};

export const AilmentIcon: React.FC<{
  type: AilmentType;
  className?: string;
}> = ({ type, className = 'w-6 h-6' }) => {
  const item = AILMENT_ICON_PATHS[type];
  return (
    <img
      src={item.src}
      alt={item.label}
      title={item.label}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      referrerPolicy="no-referrer"
      className={`${className} object-contain pointer-events-none select-none`}
    />
  );
};

const DAMAGE_ICON_PATHS: Record<
  'sever' | 'blunt' | 'shot',
  { src: string; label: string }
> = {
  sever: { src: '/assets/aistudio/Corte_08e27308.svg', label: 'Corte' },
  blunt: { src: '/assets/aistudio/Impacto_4ce079fe.svg', label: 'Impacto' },
  shot: { src: '/assets/aistudio/Disparo_fb7b0c3b.svg', label: 'Disparo' },
};

export const DamageTypeIcon: React.FC<{
  type: 'sever' | 'blunt' | 'shot';
  className?: string;
}> = ({ type, className = 'w-6 h-6' }) => {
  const item = DAMAGE_ICON_PATHS[type];
  return (
    <img
      src={item.src}
      alt={item.label}
      title={item.label}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      referrerPolicy="no-referrer"
      className={`${className} object-contain pointer-events-none select-none`}
    />
  );
};

/**
 * Reusable Material Icon Catalog mapped by easy Spanish names
 * Any monster can reference these icon names (e.g., 'Gema-azul', 'Escama-blanca').
 * If a material uses 'none', no icon is rendered until uploaded later.
 */
export const MATERIAL_ICON_PATHS: Record<
  Exclude<MaterialIconName, 'none'>,
  string
> = {
  'Escama-blanca': '/assets/aistudio/Escama-blanca.png',
  'Ala-blanca': '/assets/aistudio/Ala-blanca.png',
  'Saco-rojo': '/assets/aistudio/Saco-rojo.png',
  'Cabeza-naranja': '/assets/aistudio/Cabeza-naranja.png',
  'Piel-naranja': '/assets/aistudio/Piel-naranja.png',
  'Hueso-amarillo': '/assets/aistudio/Hueso-amarillo.png',
  'Hueso-rosa': '/assets/aistudio/Hueso-rosa.png',
  'Hueso-naranja': '/assets/aistudio/Hueso-naranja.png',
  'Caparazon-azul': '/assets/aistudio/Caparazon-azul.png',
  'Gema-azul': '/assets/aistudio/Gema-azul.png',
};

export const MaterialIcon: React.FC<{
  icon?: MaterialIconName;
  type?: MaterialIconType;
  color?: MaterialIconColor;
  alt?: string;
  className?: string;
}> = ({ icon, alt = 'Icono de material', className = 'w-7 h-7' }) => {
  if (!icon || icon === 'none') {
    return null;
  }

  const src = MATERIAL_ICON_PATHS[icon];
  if (!src) {
    return null;
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      referrerPolicy="no-referrer"
      className={`${className} object-contain pointer-events-none select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]`}
    />
  );
};

export const WeaknessStars: React.FC<{ count: 0 | 1 | 2 | 3 }> = ({ count }) => {
  return (
    <div
      className="flex items-center gap-1.5 select-none pointer-events-none"
      aria-label={`${count} de 3 estrellas`}
    >
      {[1, 2, 3].map((index) => {
        const active = index <= count;
        return (
          <span
            key={index}
            className={`text-base leading-none transition-transform ${
              active
                ? 'opacity-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
                : 'opacity-20 grayscale'
            }`}
          >
            ⭐
          </span>
        );
      })}
    </div>
  );
};

/**
 * Official MHRise & Sunbreak 10-Star Threat Level Brush Bar
 * Renders a Japanese Sumi-e ink brush bar with 10 custom stars:
 * `level` illuminated Imperial Gold stars (2 for Aknosom) and `max - level` (8) Sumi gray stars.
 */
export const ThreatLevelStars: React.FC<{
  level: number;
  max?: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}> = ({ level, max = 10, size = 'sm', showLabel = false }) => {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  const starDim =
    size === 'md'
      ? 'w-3.5 h-3.5 sm:w-4 sm:h-4'
      : 'w-3 h-3 sm:w-3.5 sm:h-3.5';

  return (
    <div
      className="relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#140E11]/90 border border-[#4A332D]/80 shadow-[inset_0_1px_4px_rgba(0,0,0,0.85)] select-none pointer-events-none overflow-hidden"
      aria-label={`Nivel de peligro: ${level} de ${max} estrellas`}
      title={`Nivel de peligro: ${level} / ${max}`}
    >
      {/* Subtle Sumi-e brush stroke texture behind the 10-star bar */}
      <svg
        viewBox="0 0 220 24"
        fill="none"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
        aria-hidden="true"
      >
        <path
          d="M0 4C48 1 135 2 212 5C218 9 220 15 215 20C148 23 62 22 0 19V4Z"
          fill="url(#threatBrushGrad)"
        />
        <defs>
          <linearGradient
            id="threatBrushGrad"
            x1="0"
            y1="0"
            x2="220"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#C92A2A" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#D9A74A" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#1B1417" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>

      {/* Left Crimson Brush Accent Mark */}
      <span
        className="w-1 h-3.5 rounded-full bg-gradient-to-b from-[#E03131] to-[#D9A74A] shrink-0 relative z-10"
        aria-hidden="true"
      />

      {showLabel && (
        <span className="font-display text-[10px] sm:text-xs font-bold tracking-wider uppercase text-[#D9A74A] mr-0.5 whitespace-nowrap relative z-10">
          Peligro
        </span>
      )}

      <div className="inline-flex items-center gap-0.5 sm:gap-1 whitespace-nowrap relative z-10">
        {stars.map((idx) => {
          const isActive = idx <= level;
          return (
            <svg
              key={idx}
              viewBox="0 0 24 24"
              className={`${starDim} shrink-0 transition-transform ${
                isActive
                  ? 'drop-shadow-[0_0_4px_rgba(242,201,109,0.75)] scale-105'
                  : 'opacity-45'
              }`}
              aria-hidden="true"
            >
              <polygon
                points="12,2 15.1,8.3 22,9.3 17,14.1 18.2,21 12,17.7 5.8,21 7,14.1 2,9.3 8.9,8.3"
                fill={isActive ? '#F2C96D' : '#3E3538'}
                stroke={isActive ? '#C92A2A' : '#63565A'}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {isActive && (
                <polygon
                  points="12,4.8 14.1,9.1 18.8,9.8 15.4,13.1 16.2,17.8 12,15.5 7.8,17.8 8.6,13.1 5.2,9.8 9.9,9.1"
                  fill="#FFF3C4"
                  fillOpacity="0.55"
                />
              )}
            </svg>
          );
        })}
      </div>
    </div>
  );
};
