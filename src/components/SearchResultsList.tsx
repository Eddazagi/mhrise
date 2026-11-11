import React from 'react';
import { Bookmark } from 'lucide-react';
import { MaterialDropRow, MonsterData } from '../types/monster';
import {
  MaterialIcon,
  ThreatLevelStars,
  TransparentMonsterIcon,
} from './MonsterIcons';
import { BrushSectionBanner, OrnateIconFrame } from './JapaneseBrushElements';

interface MatchedMaterialEntry {
  monster: MonsterData;
  rankLabel: string;
  rankColor: string;
  material: MaterialDropRow;
}

interface SearchResultsListProps {
  monsters: MonsterData[];
  searchQuery: string;
  bookmarkedIds: string[];
  onSelectMonsterSummary: (monsterId: string) => void;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  monsters,
  searchQuery,
  bookmarkedIds,
  onSelectMonsterSummary,
}) => {
  const q = searchQuery.trim().toLowerCase();

  // When search is opened and input is empty, show clean Sumi-e canvas
  if (!q) {
    return <div className="flex-1 bg-sumi-texture" />;
  }

  // Priority 1: Monsters matching name or type
  const matchedMonsters = monsters.filter(
    (m) => m.name.toLowerCase().includes(q) || m.type.toLowerCase().includes(q)
  );

  // Priority 2: Materials matching across all monsters and ranks
  const matchedMaterials: MatchedMaterialEntry[] = [];
  monsters.forEach((monster) => {
    monster.drops.lowRank.forEach((m) => {
      if (m.name.toLowerCase().includes(q)) {
        matchedMaterials.push({
          monster,
          rankLabel: 'Rango Bajo',
          rankColor: 'text-[#8ECAE6]',
          material: m,
        });
      }
    });

    monster.drops.highRank.forEach((m) => {
      if (m.name.toLowerCase().includes(q)) {
        matchedMaterials.push({
          monster,
          rankLabel: 'Rango Alto',
          rankColor: 'text-[#F48C06]',
          material: m,
        });
      }
    });

    monster.drops.masterRank.forEach((m) => {
      if (m.name.toLowerCase().includes(q)) {
        matchedMaterials.push({
          monster,
          rankLabel: 'Rango Maestro',
          rankColor: 'text-[#F2C96D]',
          material: m,
        });
      }
    });
  });

  const hasResults = matchedMonsters.length > 0 || matchedMaterials.length > 0;

  if (!hasResults) {
    return (
      <div className="flex-1 bg-sumi-texture px-6 py-14 text-center">
        <p className="font-display text-lg font-bold text-[#F5EFE6]">
          No se encontraron resultados para «{searchQuery}»
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-y-none touch-pan-y bg-sumi-texture pb-10">
      {/* Priority 1: Monstruos */}
      {matchedMonsters.length > 0 && (
        <section>
          <BrushSectionBanner
            title={`Monstruos (${matchedMonsters.length})`}
            kanjiWatermark="竜"
          />
          <div className="divide-y divide-dashed divide-[#382927]">
            {matchedMonsters.map((monster) => {
              const isBookmarked = bookmarkedIds.includes(monster.id);
              return (
                <button
                  key={monster.id}
                  type="button"
                  onClick={() => onSelectMonsterSummary(monster.id)}
                  className="w-full flex items-center gap-4 px-4 sm:px-5 py-3.5 text-left hover:bg-[#22171A] transition-colors cursor-pointer group"
                >
                  <OrnateIconFrame sizeClass="w-14 h-14">
                    <TransparentMonsterIcon
                      src={monster.iconUrl}
                      alt={monster.name}
                      className="w-full h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform"
                    />
                  </OrnateIconFrame>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-display text-lg font-bold text-[#F5EFE6] group-hover:text-[#F2C96D] transition-colors truncate">
                          {monster.name}
                        </span>
                        {isBookmarked && (
                          <Bookmark
                            className="w-4 h-4 text-[#E03131] shrink-0"
                            fill="currentColor"
                          />
                        )}
                      </div>
                      <ThreatLevelStars level={monster.threatLevel} size="sm" />
                    </div>
                    <p className="text-sm text-[#B5A89A] mt-1 truncate">
                      {monster.type}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Priority 2: Materiales */}
      {matchedMaterials.length > 0 && (
        <section className={matchedMonsters.length > 0 ? 'mt-2' : ''}>
          <BrushSectionBanner
            title={`Materiales (${matchedMaterials.length})`}
            kanjiWatermark="素材"
          />
          <div className="divide-y divide-dashed divide-[#382927]">
            {matchedMaterials.map((item) => {
              const hasIcon =
                item.material.icon && item.material.icon !== 'none';
              return (
                <button
                  key={`${item.monster.id}-${item.rankLabel}-${item.material.id}`}
                  type="button"
                  onClick={() => onSelectMonsterSummary(item.monster.id)}
                  className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-[#22171A] transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {hasIcon && (
                      <OrnateIconFrame sizeClass="w-11 h-11">
                        <MaterialIcon
                          icon={item.material.icon}
                          alt={item.material.name}
                          className="w-7 h-7"
                        />
                      </OrnateIconFrame>
                    )}

                    <div className="min-w-0 flex-1">
                      <span className="text-sm sm:text-base font-medium text-[#F5EFE6] group-hover:text-[#F2C96D] transition-colors block truncate">
                        {item.material.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className="text-[#B5A89A] font-medium">
                          {item.monster.name}
                        </span>
                        <span className="text-[#6E533B]">•</span>
                        <span className={`font-medium ${item.rankColor}`}>
                          {item.rankLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-medium text-[#D9A74A] shrink-0">
                    Resumen →
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
