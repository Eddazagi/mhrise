import React, { useState } from 'react';
import { Bookmark, Menu, X } from 'lucide-react';
import { MonsterData, MonsterSizeCategory } from '../types/monster';
import { ThreatLevelStars, TransparentMonsterIcon } from './MonsterIcons';
import MagnifierIcon from './MagnifierIcon';
import { DetailTabId } from './MonsterDetail';
import { SearchResultsList } from './SearchResultsList';
import {
  BrushUnderline,
  HankoSeal,
  OrnateIconFrame,
} from './JapaneseBrushElements';

interface MonsterListProps {
  monsters: MonsterData[];
  selectedMonsterId: string;
  onSelectMonster: (id: string, targetTab?: DetailTabId) => void;
  bookmarkedIds: string[];
  onToggleFilterBookmarks: () => void;
  onlyBookmarks: boolean;
  onOpenDrawer: () => void;
}

export const MonsterList: React.FC<MonsterListProps> = ({
  monsters,
  selectedMonsterId,
  onSelectMonster,
  bookmarkedIds,
  onToggleFilterBookmarks,
  onlyBookmarks,
  onOpenDrawer,
}) => {
  const [activeSizeTab, setActiveSizeTab] =
    useState<MonsterSizeCategory>('GRANDE');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMonsters = monsters.filter((monster) => {
    const matchesSize = monster.sizeCategory === activeSizeTab;
    const matchesBookmark = !onlyBookmarks || bookmarkedIds.includes(monster.id);
    return matchesSize && matchesBookmark;
  });

  const handleSelectFromSearch = (monsterId: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    onSelectMonster(monsterId, 'resumen');
  };

  return (
    <aside className="flex flex-col h-full bg-sumi-texture select-none">
      {/* Top App Bar - Kamura Urushi Lacquer & Gold */}
      <div className="sticky top-0 z-20 bg-kamura-header shadow-[0_6px_20px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between h-14 px-3 gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={onOpenDrawer}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#F5EFE6] hover:text-[#F2C96D] hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Abrir menú de información"
            >
              <Menu className="w-6 h-6" />
            </button>

            {searchOpen ? (
              <div className="flex items-center flex-1 bg-[#110C0E] rounded-lg px-3 py-1.5 border border-[#6E533B] shadow-inner">
                <MagnifierIcon
                  size={20}
                  className="text-[#D9A74A] mr-2 shrink-0"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar monstruo o material..."
                  autoFocus
                  className="w-full bg-transparent text-sm text-[#F5EFE6] placeholder-[#8E7F74] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-[#B5A89A] hover:text-[#F5EFE6] p-1"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5 min-w-0">
                <HankoSeal kanji="狩" />
                <h1 className="font-display text-xl font-bold tracking-wider text-[#F5EFE6] truncate">
                  Monstruos
                </h1>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onToggleFilterBookmarks}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                onlyBookmarks
                  ? 'text-[#E03131] bg-[#C92A2A]/20 border border-[#C92A2A]/40'
                  : 'text-[#D6C9B8] hover:text-[#F2C96D] hover:bg-white/5'
              }`}
              title={onlyBookmarks ? 'Mostrar todos' : 'Filtrar guardados'}
              aria-label="Filtrar monstruos guardados"
            >
              <Bookmark
                className="w-5 h-5"
                fill={onlyBookmarks ? 'currentColor' : 'none'}
              />
            </button>

            <button
              type="button"
              onClick={() => {
                setSearchOpen((prev) => !prev);
                if (searchOpen) setSearchQuery('');
              }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#F5EFE6] hover:text-[#F2C96D] hover:bg-white/5 transition-colors cursor-pointer"
              aria-label={
                searchOpen ? 'Cerrar búsqueda' : 'Buscar monstruo o material'
              }
            >
              {searchOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <MagnifierIcon size={22} />
              )}
            </button>
          </div>
        </div>

        {/* Category Tabs: GRANDE | PEQUEÑO with Japanese Brush Stroke Underline */}
        {!searchOpen && (
          <div className="grid grid-cols-2 border-t border-[#3B2825] bg-[#161013]/80">
            {(['GRANDE', 'PEQUEÑO'] as MonsterSizeCategory[]).map((tab) => {
              const isActive = activeSizeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveSizeTab(tab)}
                  className={`relative h-12 flex items-center justify-center font-display text-sm font-bold tracking-widest transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-[#F2C96D]'
                      : 'text-[#A8998A] hover:text-[#F5EFE6]'
                  }`}
                >
                  <span className="relative inline-flex items-center h-full">
                    {tab}
                    {isActive && (
                      <BrushUnderline className="absolute bottom-1 left-0 w-full h-2" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* When searchOpen is true, hide regular monster list and show prioritized search results */}
      {searchOpen ? (
        <SearchResultsList
          monsters={monsters}
          searchQuery={searchQuery}
          bookmarkedIds={bookmarkedIds}
          onSelectMonsterSummary={handleSelectFromSearch}
        />
      ) : (
        <div className="flex-1 overflow-y-auto overscroll-y-none touch-pan-y divide-y divide-dashed divide-[#382927]">
          {filteredMonsters.length > 0 ? (
            filteredMonsters.map((monster) => {
              const isBookmarked = bookmarkedIds.includes(monster.id);

              return (
                <button
                  key={monster.id}
                  type="button"
                  onClick={() => onSelectMonster(monster.id, 'resumen')}
                  className="group relative w-full flex items-center gap-4 px-4 sm:px-5 py-4 text-left transition-colors cursor-pointer overflow-hidden hover:bg-[#1E1518] active:bg-[#26181C]"
                >
                  {/* Left Crimson Brush Accent only on Hover / Active */}
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-[#E03131] to-[#D9A74A] opacity-0 group-hover:opacity-85 group-active:opacity-100 transition-opacity" />

                  {/* Ornate Japanese Lacquer & Gold Monster Icon Frame */}
                  <OrnateIconFrame sizeClass="w-16 h-16">
                    <TransparentMonsterIcon
                      src={monster.iconUrl}
                      alt={monster.name}
                      className="w-full h-full object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform duration-200"
                    />
                  </OrnateIconFrame>

                  {/* Monster Name + 10-Star Brush Bar & Type */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-display text-xl font-bold text-[#F5EFE6] group-hover:text-[#F2C96D] transition-colors truncate">
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

                  {/* Subtle Japanese Arrow Indicator */}
                  <span className="font-display text-sm text-[#D9A74A]/60 group-hover:text-[#F2C96D] group-hover:translate-x-0.5 transition-all shrink-0">
                    ❯
                  </span>
                </button>
              );
            })
          ) : (
            <div className="px-6 py-14 text-center">
              <p className="font-display text-lg font-bold text-[#F5EFE6]">
                {activeSizeTab === 'PEQUEÑO'
                  ? 'Aún no se han agregado monstruos pequeños'
                  : 'No tienes monstruos guardados en favoritos'}
              </p>
              <p className="text-xs text-[#A8998A] mt-2 leading-relaxed max-w-md mx-auto">
                {activeSizeTab === 'PEQUEÑO'
                  ? 'Actualmente estamos trabajando paso a paso comenzando con el catálogo de monstruos grandes.'
                  : 'Puedes marcar cualquier monstruo con el sello de favoritos en la esquina superior derecha de su pergamino.'}
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
