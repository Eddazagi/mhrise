import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import {
  AilmentType,
  ElementType,
  MaterialDropCell,
  MaterialDropRow,
  MonsterData,
} from '../types/monster';
import {
  AilmentIcon,
  DamageTypeIcon,
  ElementIcon,
  MaterialIcon,
  ThreatLevelStars,
  TransparentMonsterIcon,
  WeaknessStars,
} from './MonsterIcons';
import MagnifierIcon from './MagnifierIcon';
import { SearchResultsList } from './SearchResultsList';
import {
  BrushSectionBanner,
  BrushUnderline,
  HankoSeal,
  OrnateIconFrame,
} from './JapaneseBrushElements';

export type DetailTabId =
  | 'resumen'
  | 'fisiologia'
  | 'rango_bajo'
  | 'rango_alto'
  | 'rango_maestro';

interface MonsterDetailProps {
  monster: MonsterData;
  monsters: MonsterData[];
  bookmarkedIds: string[];
  onSelectMonster: (id: string, targetTab?: DetailTabId) => void;
  onBackToList: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  requestedNavigation?: {
    tab: DetailTabId;
    timestamp: number;
  } | null;
}

const TABS: { id: DetailTabId; label: string }[] = [
  { id: 'resumen', label: 'RESUMEN' },
  { id: 'fisiologia', label: 'FISIOLOGÍA' },
  { id: 'rango_bajo', label: 'RANGO BAJO' },
  { id: 'rango_alto', label: 'RANGO ALTO' },
  { id: 'rango_maestro', label: 'RANGO MAESTRO' },
];

const ELEMENT_ORDER: { key: ElementType; label: string }[] = [
  { key: 'fire', label: 'Fuego' },
  { key: 'water', label: 'Agua' },
  { key: 'thunder', label: 'Rayo' },
  { key: 'ice', label: 'Hielo' },
  { key: 'dragon', label: 'Draco' },
];

const AILMENT_ORDER: { key: AilmentType; label: string }[] = [
  { key: 'poison', label: 'Veneno' },
  { key: 'sleep', label: 'Sueño' },
  { key: 'paralysis', label: 'Parálisis' },
  { key: 'blast', label: 'Nitro' },
  { key: 'stun', label: 'Aturdimiento' },
];

const DROP_CATEGORIES: {
  key: keyof Pick<
    MaterialDropRow,
    'target' | 'capture' | 'brokenPart' | 'carves' | 'dropped'
  >;
  title: string;
  kanji: string;
}[] = [
  { key: 'target', title: 'Recompensa de caza', kanji: '狩猟' },
  { key: 'capture', title: 'Recompensa de captura', kanji: '捕獲' },
  { key: 'brokenPart', title: 'Recompensa por parte rota', kanji: '部位' },
  { key: 'carves', title: 'Despiece', kanji: '剥ぎ' },
  { key: 'dropped', title: 'Materiales caídos y montura', kanji: '落し' },
];

function parsePercentage(val: string): number {
  const match = val.match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

export const MonsterDetail: React.FC<MonsterDetailProps> = ({
  monster,
  monsters,
  bookmarkedIds,
  onSelectMonster,
  onBackToList,
  isBookmarked,
  onToggleBookmark,
  requestedNavigation,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTabId>('resumen');
  const [hpRank, setHpRank] = useState<'low' | 'high' | 'master'>('low');
  const [selectedPartId, setSelectedPartId] = useState<string>('cabeza');
  const [highlightWeakPoints, setHighlightWeakPoints] = useState<boolean>(true);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (requestedNavigation) {
      setActiveTab(requestedNavigation.tab);
      setSearchOpen(false);
      setSearchQuery('');
    }
  }, [requestedNavigation]);

  // Interactive Zoom & Pan state for the fullscreen Render Modal
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [zoomTranslate, setZoomTranslate] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const touchStateRef = useRef<{
    mode: 'none' | 'pan' | 'pinch';
    startDist: number;
    startScale: number;
    startX: number;
    startY: number;
    lastTapTime: number;
  }>({
    mode: 'none',
    startDist: 0,
    startScale: 1,
    startX: 0,
    startY: 0,
    lastTapTime: 0,
  });

  const resetRenderZoom = () => {
    setZoomScale(1);
    setZoomTranslate({ x: 0, y: 0 });
  };

  const openRenderModal = () => {
    resetRenderZoom();
    setIsRenderModalOpen(true);
  };

  const selectedPart =
    monster.physiologyParts.find((p) => p.id === selectedPartId) ||
    monster.physiologyParts[0];

  const renderDropsVerticalList = (rows: MaterialDropRow[]) => {
    return (
      <div className="pb-12">
        <div className="divide-y divide-[#332321]">
          {DROP_CATEGORIES.map((category) => {
            // Filter materials that actually drop in this category (not "-- %") and sort highest % first
            const itemsInCategory = rows
              .map((row) => ({
                row,
                cell: row[category.key] as MaterialDropCell,
              }))
              .filter(({ cell }) => !cell.value.trim().startsWith('--'))
              .sort(
                (a, b) =>
                  parsePercentage(b.cell.value) - parsePercentage(a.cell.value)
              );

            if (itemsInCategory.length === 0) return null;

            return (
              <section key={category.key} className="pb-2">
                {/* Category Header - Japanese Sumi-e Brush Banner */}
                <BrushSectionBanner
                  title={category.title}
                  kanjiWatermark={category.kanji}
                />

                {/* Vertical Material Rows: Clean Name + x1 on left, Percentage/Part on right */}
                <div className="divide-y divide-dashed divide-[#382927]">
                  {itemsInCategory.map(({ row, cell }) => {
                    const cleanPercent = cell.value.trim();
                    const quantityLabel = cell.notes ? cell.notes.trim() : 'x1';
                    const hasIcon = row.icon && row.icon !== 'none';

                    return (
                      <div
                        key={`${category.key}-${row.id}`}
                        className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 hover:bg-[#1E1518] transition-colors"
                      >
                        {/* Left: Ornate Japanese Material Icon (if available) + Clean Name & x1 */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          {hasIcon && (
                            <OrnateIconFrame sizeClass="w-11 h-11">
                              <MaterialIcon
                                icon={row.icon}
                                alt={row.name}
                                className="w-7 h-7"
                              />
                            </OrnateIconFrame>
                          )}

                          <div className="min-w-0 flex-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-sm sm:text-base font-medium text-[#F5EFE6] leading-snug">
                              {row.name}
                            </span>
                            <span className="font-mono-num text-xs sm:text-sm text-[#B5A89A]">
                              {quantityLabel}
                            </span>
                          </div>
                        </div>

                        {/* Right: Percentage (with part/source when applicable) */}
                        <div className="flex items-center shrink-0">
                          <span className="font-mono-num text-xs sm:text-sm font-semibold text-[#F2C96D] text-right">
                            {cleanPercent}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    );
  };

  const handleSelectFromSearch = (monsterId: string) => {
    setSearchOpen(false);
    setSearchQuery('');
    setActiveTab('resumen');
    onSelectMonster(monsterId, 'resumen');
  };

  return (
    <main className="flex flex-col h-full bg-sumi-texture overflow-y-auto overscroll-y-none touch-pan-y">
      {/* Top Bar - Kamura Urushi Lacquer & Gold */}
      <header className="sticky top-0 z-30 bg-kamura-header shadow-[0_6px_20px_rgba(0,0,0,0.65)]">
        <div className="flex items-center justify-between h-14 px-3 gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Back button visible on all screens (Mobile & PC single-view) */}
            <button
              type="button"
              onClick={onBackToList}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#F5EFE6] hover:text-[#F2C96D] hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Volver a la lista de monstruos"
            >
              <ArrowLeft className="w-6 h-6" />
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
              <div className="flex items-center gap-2.5 min-w-0 px-1">
                <HankoSeal kanji="竜" />
                <h2 className="font-display text-xl font-bold text-[#F5EFE6] truncate">
                  {monster.name}
                </h2>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((prev) => !prev);
                if (searchOpen) setSearchQuery('');
              }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#F5EFE6] hover:text-[#F2C96D] hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Buscar monstruo o material"
              title="Buscar monstruo o material"
            >
              {searchOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <MagnifierIcon size={22} />
              )}
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(monster.id)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                isBookmarked
                  ? 'text-[#E03131] bg-[#C92A2A]/20 border border-[#C92A2A]/40'
                  : 'text-[#F5EFE6] hover:text-[#F2C96D] hover:bg-white/5'
              }`}
              aria-label={
                isBookmarked ? 'Quitar de favoritos' : 'Guardar en favoritos'
              }
              title={isBookmarked ? 'Guardado en favoritos' : 'Guardar monstruo'}
            >
              <Bookmark
                className="w-5 h-5"
                fill={isBookmarked ? 'currentColor' : 'none'}
              />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Tabs with Japanese Brush Stroke Underline */}
        {!searchOpen && (
          <nav
            className="flex items-center overflow-x-auto no-scrollbar border-t border-[#3B2825] bg-[#161013]/85"
            aria-label="Secciones del monstruo"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative h-12 px-4 flex items-center justify-center font-display text-xs sm:text-sm font-bold tracking-wider transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-[#F2C96D]'
                      : 'text-[#A8998A] hover:text-[#F5EFE6]'
                  }`}
                >
                  <span className="relative inline-flex items-center h-full">
                    {tab.label}
                    {isActive && (
                      <BrushUnderline className="absolute bottom-1 left-0 w-full h-2" />
                    )}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </header>

      {/* If searchOpen is true, hide all monster tabs/content and show prioritized SearchResultsList */}
      {searchOpen ? (
        <SearchResultsList
          monsters={monsters}
          searchQuery={searchQuery}
          bookmarkedIds={bookmarkedIds}
          onSelectMonsterSummary={handleSelectFromSearch}
        />
      ) : (
        <>
          {/* TAB 1: RESUMEN */}
          {activeTab === 'resumen' && (
            <div className="pb-10">
              {/* Monster Header Identity (Kamura Guild Scroll Header, NO description) */}
              <section className="relative overflow-hidden px-5 py-5 flex items-center gap-5 bg-gradient-to-r from-[#221518] via-[#1A1215] to-[#130E10] border-b border-[#4A332D]">
                {/* Decorative Kanji Watermark */}
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 font-display text-6xl font-extrabold text-[#F5EFE6]/[0.03] pointer-events-none select-none"
                  aria-hidden="true"
                >
                  傘鳥
                </span>

                <OrnateIconFrame sizeClass="w-20 h-20 sm:w-24 sm:h-24">
                  <TransparentMonsterIcon
                    src={monster.iconUrl}
                    alt={`Icono de ${monster.name}`}
                    className="w-full h-full object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)]"
                  />
                </OrnateIconFrame>

                <div className="min-w-0 flex-1 relative z-10">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F5EFE6] tracking-wide">
                      {monster.name}
                    </h1>
                    <ThreatLevelStars
                      level={monster.threatLevel}
                      size="md"
                    />
                  </div>
                  <p className="text-base text-[#D9A74A] font-medium mt-1">
                    {monster.type}
                  </p>
                </div>
              </section>

              {/* Two-column layout on large desktop so Weaknesses/States and Render look balanced */}
              <div className="grid grid-cols-1 xl:grid-cols-12">
                <div className="xl:col-span-7 xl:border-r xl:border-[#3A2825]">
                  {/* Debilidad Section */}
                  <section>
                    <BrushSectionBanner
                      title="Debilidad"
                      kanjiWatermark="弱点"
                    />

                    <div className="divide-y divide-dashed divide-[#382927] px-4 sm:px-6">
                      {ELEMENT_ORDER.map((elem, idx) => {
                        const ailment = AILMENT_ORDER[idx];
                        const elemStars = monster.weaknesses.elements[elem.key];
                        const ailmentStars =
                          monster.weaknesses.ailments[ailment.key];

                        return (
                          <div
                            key={elem.key}
                            className="grid grid-cols-2 py-3.5 items-center gap-4"
                          >
                            {/* Left Column: Element */}
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="flex items-center gap-2 min-w-[32px]">
                                <ElementIcon
                                  type={elem.key}
                                  className="w-7 h-7 shrink-0"
                                />
                                <span className="hidden sm:inline text-xs text-[#B5A89A] w-14">
                                  {elem.label}
                                </span>
                              </div>
                              <WeaknessStars count={elemStars} />
                            </div>

                            {/* Right Column: Ailment */}
                            <div className="flex items-center gap-3 sm:gap-4 pl-2">
                              <div className="flex items-center gap-2 min-w-[32px]">
                                <AilmentIcon
                                  type={ailment.key}
                                  className="w-7 h-7 shrink-0"
                                />
                                <span className="hidden sm:inline text-xs text-[#B5A89A] w-20">
                                  {ailment.label}
                                </span>
                              </div>
                              <WeaknessStars count={ailmentStars} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Estados Section */}
                  <section className="mt-2">
                    <BrushSectionBanner
                      title="Estados"
                      kanjiWatermark="状態"
                    />

                    <div className="divide-y divide-dashed divide-[#382927]">
                      {monster.states.map((stateItem) => (
                        <div
                          key={stateItem}
                          className="px-5 py-3.5 text-base text-[#D6C9B8] flex items-center gap-2.5"
                        >
                          <span className="w-1.5 h-1.5 rotate-45 bg-[#C92A2A] shrink-0" />
                          <span>{stateItem}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Tamaño, Render Oficial & HP Section */}
                <div className="xl:col-span-5 flex flex-col">
                  <BrushSectionBanner
                    title="Tamaño y Render Oficial"
                    centered
                    kanjiWatermark="姿図"
                  />

                  <div className="p-4 sm:p-5 flex-1 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,rgba(201,42,42,0.10)_0%,rgba(17,14,16,0)_72%)]">
                    {/* Minimum and Maximum Size above the Render (Guaranteed single-line on all phone resolutions) */}
                    <div className="w-full max-w-md grid grid-cols-2 gap-2.5 sm:gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-lg bg-[#171114] border border-[#4E3831] shadow-md min-w-0">
                        <img
                          src="/assets/aistudio/Tama_o-Minimo_4a3c13cf.png"
                          alt="Tamaño Mínimo"
                          draggable={false}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 pointer-events-none select-none"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] sm:text-xs text-[#B5A89A] block leading-tight">
                            Mínimo
                          </span>
                          <span className="font-mono-num text-[13px] min-[390px]:text-sm sm:text-base font-semibold text-[#F5EFE6] whitespace-nowrap block tracking-tight mt-0.5">
                            {monster.size.min}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-2.5 rounded-lg bg-[#171114] border border-[#4E3831] shadow-md min-w-0">
                        <img
                          src="/assets/aistudio/Tama_o-Maximo_99025648.png"
                          alt="Tamaño Máximo"
                          draggable={false}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 pointer-events-none select-none"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] sm:text-xs text-[#B5A89A] block leading-tight">
                            Máximo
                          </span>
                          <span className="font-mono-num text-[13px] min-[390px]:text-sm sm:text-base font-semibold text-[#F5EFE6] whitespace-nowrap block tracking-tight mt-0.5">
                            {monster.size.max}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Sumi-e Framed Official Render Card */}
                    <button
                      type="button"
                      onClick={openRenderModal}
                      className="group relative w-full max-w-md aspect-square flex items-center justify-center rounded-xl bg-[radial-gradient(circle_at_center,rgba(201,42,42,0.16)_0%,rgba(23,17,20,0.96)_68%)] border border-[#5C4338] p-4 hover:border-[#D9A74A] transition-colors cursor-pointer touch-pan-y shadow-[0_8px_28px_rgba(0,0,0,0.75)]"
                      aria-label={`Ampliar render de ${monster.name}`}
                    >
                      {/* Corner Gold Ornaments */}
                      <span className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#D9A74A]/70 pointer-events-none" />
                      <span className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#D9A74A]/70 pointer-events-none" />
                      <span className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#D9A74A]/70 pointer-events-none" />
                      <span className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#D9A74A]/70 pointer-events-none" />

                      <img
                        src={monster.renderUrl}
                        alt={`Render oficial de ${monster.name}`}
                        referrerPolicy="no-referrer"
                        draggable={false}
                        className="w-full h-full object-contain drop-shadow-[0_14px_26px_rgba(0,0,0,0.9)] group-hover:scale-[1.03] transition-transform duration-200 pointer-events-none select-none"
                      />
                    </button>

                    {/* HP by Number of Players (1, 2, 3, and 4 Players) below the Render */}
                    <div className="w-full max-w-md rounded-xl bg-[#171114] border border-[#4E3831] p-3.5 space-y-3 shadow-md">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-display text-xs sm:text-sm font-bold text-[#F5EFE6]">
                          Puntos de Vida (HP)
                        </span>
                        <div className="flex items-center gap-1 bg-[#110C0E] p-1 rounded-lg border border-[#43302B]">
                          {(
                            [
                              { id: 'low', label: 'Bajo' },
                              { id: 'high', label: 'Alto' },
                              { id: 'master', label: 'Maestro' },
                            ] as const
                          ).map((r) => {
                            const active = hpRank === r.id;
                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => setHpRank(r.id)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                  active
                                    ? 'bg-gradient-to-r from-[#C92A2A] to-[#A61E1E] text-[#F5EFE6] font-semibold border border-[#D9A74A]/60 shadow-xs'
                                    : 'text-[#B5A89A] hover:text-[#F5EFE6]'
                                }`}
                              >
                                {r.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        {[
                          {
                            label: '1 Jugador',
                            value: monster.hpByRank[hpRank].p1,
                          },
                          {
                            label: '2 Jugadores',
                            value: monster.hpByRank[hpRank].p2,
                          },
                          {
                            label: '3 Jugadores',
                            value: monster.hpByRank[hpRank].p3,
                          },
                          {
                            label: '4 Jugadores',
                            value: monster.hpByRank[hpRank].p4,
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-lg bg-[#21171B] border border-[#3E2B28] py-2 px-2"
                          >
                            <span className="text-[11px] text-[#B5A89A] block truncate">
                              {item.label}
                            </span>
                            <span className="font-mono-num text-sm font-semibold text-[#F2C96D] mt-0.5 block whitespace-nowrap">
                              {item.value} HP
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FISIOLOGÍA COMBINADO CON EL RENDER (100% Mobile Fit - Zero Horizontal Scroll) */}
          {activeTab === 'fisiologia' && (
            <div className="pb-10">
              {/* Top Subheader */}
              <BrushSectionBanner
                title={`Fisiología · ${monster.physiologyStateLabel}`}
                kanjiWatermark="肉質"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setHighlightWeakPoints((prev) => !prev)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      highlightWeakPoints
                        ? 'bg-[#C92A2A]/30 text-[#F2C96D] border border-[#D9A74A]/70'
                        : 'bg-[#171114] text-[#B5A89A] border border-[#43302B]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>Puntos débiles (≥45)</span>
                  </button>
                }
              />

              {/* Combined Render + Physiology Table Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 border-b border-[#3A2825]">
                {/* Left / Top: Interactive Render with Body Part Pins */}
                <div className="xl:col-span-5 p-3.5 sm:p-5 bg-[#140F12] xl:border-r xl:border-[#3A2825] flex flex-col justify-between">
                  <div className="relative w-full max-w-md mx-auto aspect-square rounded-xl bg-[radial-gradient(circle_at_center,rgba(201,42,42,0.14)_0%,rgba(17,12,14,0.96)_75%)] border border-[#5C4338] p-3 flex items-center justify-center touch-pan-y">
                    <img
                      src={monster.renderUrl}
                      alt={`Anatomía de ${monster.name}`}
                      referrerPolicy="no-referrer"
                      draggable={false}
                      className="w-full h-full object-contain pointer-events-none select-none"
                    />

                    {/* Interactive Part Pins overlaid on the Render */}
                    {monster.physiologyParts.map((part) => {
                      if (
                        part.markerX === undefined ||
                        part.markerY === undefined
                      )
                        return null;
                      const isSelected = part.id === selectedPart.id;
                      return (
                        <button
                          key={part.id}
                          type="button"
                          onClick={() => setSelectedPartId(part.id)}
                          style={{
                            left: `${part.markerX}%`,
                            top: `${part.markerY}%`,
                          }}
                          className={`-translate-x-1/2 -translate-y-1/2 absolute z-10 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer shadow-md ${
                            isSelected
                              ? 'bg-[#C92A2A] text-[#F5EFE6] border border-[#F2C96D] scale-110 ring-2 ring-black'
                              : 'bg-[#171114]/95 text-[#F5EFE6] border border-[#6E533B] hover:border-[#F2C96D]'
                          }`}
                        >
                          {part.part}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Part Quick Summary Strip */}
                  <div className="mt-3.5 p-3 rounded-lg bg-[#1D1417] border border-[#4E3831]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-[#B5A89A]">
                        Parte seleccionada
                      </span>
                      <span className="font-display text-sm font-bold text-[#F2C96D]">
                        {selectedPart.part}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-[#120D0F] border border-[#352623] rounded-md py-1.5 px-2">
                        <span className="text-[11px] text-[#B5A89A] block">
                          Corte
                        </span>
                        <span className="font-mono-num text-sm font-semibold text-[#F5EFE6]">
                          {selectedPart.sever}
                        </span>
                      </div>
                      <div className="bg-[#120D0F] border border-[#352623] rounded-md py-1.5 px-2">
                        <span className="text-[11px] text-[#B5A89A] block">
                          Impacto
                        </span>
                        <span className="font-mono-num text-sm font-semibold text-[#F5EFE6]">
                          {selectedPart.blunt}
                        </span>
                      </div>
                      <div className="bg-[#120D0F] border border-[#352623] rounded-md py-1.5 px-2">
                        <span className="text-[11px] text-[#B5A89A] block">
                          Disparo
                        </span>
                        <span className="font-mono-num text-sm font-semibold text-[#F5EFE6]">
                          {selectedPart.shot}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right / Bottom: Full-Width No-Scroll Physiology Table */}
                <div className="xl:col-span-7 w-full">
                  <table className="w-full table-fixed border-collapse text-left">
                    <thead>
                      <tr className="bg-[#1F1518] border-b border-[#4A332D] text-[10px] sm:text-xs font-semibold text-[#D6C9B8]">
                        <th className="w-[20%] sm:w-[22%] py-2.5 px-2 sm:px-4 font-display">
                          Partes
                        </th>
                        <th
                          className="w-[10%] py-2 px-0.5 text-center border-l border-[#352523]"
                          title="Corte"
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <DamageTypeIcon
                              type="sever"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <span className="text-[8px] sm:text-[10px] truncate max-w-full">
                              Corte
                            </span>
                          </div>
                        </th>
                        <th
                          className="w-[10%] py-2 px-0.5 text-center border-l border-[#352523]"
                          title="Impacto"
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <DamageTypeIcon
                              type="blunt"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <span className="text-[8px] sm:text-[10px] truncate max-w-full">
                              Imp.
                            </span>
                          </div>
                        </th>
                        <th
                          className="w-[10%] py-2 px-0.5 text-center border-l border-[#352523]"
                          title="Disparo"
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <DamageTypeIcon
                              type="shot"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <span className="text-[8px] sm:text-[10px] truncate max-w-full">
                              Disp.
                            </span>
                          </div>
                        </th>
                        <th
                          className="w-[10%] py-2 px-0.5 text-center border-l border-[#4E3831]"
                          title="Fuego"
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <ElementIcon
                              type="fire"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <span className="text-[8px] sm:text-[10px] truncate max-w-full">
                              Fuego
                            </span>
                          </div>
                        </th>
                        <th
                          className="w-[10%] py-2 px-0.5 text-center border-l border-[#352523]"
                          title="Agua"
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <ElementIcon
                              type="water"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <span className="text-[8px] sm:text-[10px] truncate max-w-full">
                              Agua
                            </span>
                          </div>
                        </th>
                        <th
                          className="w-[10%] py-2 px-0.5 text-center border-l border-[#352523]"
                          title="Rayo"
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <ElementIcon
                              type="thunder"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <span className="text-[8px] sm:text-[10px] truncate max-w-full">
                              Rayo
                            </span>
                          </div>
                        </th>
                        <th
                          className="w-[10%] py-2 px-0.5 text-center border-l border-[#352523]"
                          title="Hielo"
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <ElementIcon
                              type="ice"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <span className="text-[8px] sm:text-[10px] truncate max-w-full">
                              Hielo
                            </span>
                          </div>
                        </th>
                        <th
                          className="w-[10%] py-2 px-0.5 text-center border-l border-[#352523]"
                          title="Draco"
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <ElementIcon
                              type="dragon"
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <span className="text-[8px] sm:text-[10px] truncate max-w-full">
                              Draco
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#332321]">
                      {monster.physiologyParts.map((row) => {
                        const isSelected = row.id === selectedPart.id;
                        const physCellClass = (val: number) =>
                          highlightWeakPoints && val >= 45
                            ? 'text-[#F2C96D] font-bold bg-[#C92A2A]/20'
                            : 'text-[#F5EFE6]';
                        const elemCellClass = (val: number, colorClass: string) =>
                          highlightWeakPoints && val >= 20
                            ? `${colorClass} font-bold bg-white/[0.04]`
                            : val === 0
                              ? 'text-[#63554D]'
                              : 'text-[#D6C9B8]';

                        return (
                          <tr
                            key={row.id}
                            onClick={() => setSelectedPartId(row.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#2B1B1F]'
                                : 'hover:bg-[#1E1518]'
                            }`}
                          >
                            <td
                              className={`py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium truncate ${
                                isSelected ? 'text-[#F2C96D]' : 'text-[#F5EFE6]'
                              }`}
                            >
                              {row.part}
                            </td>
                            <td
                              className={`py-3 px-0.5 text-center font-mono-num text-xs sm:text-sm border-l border-[#352523] ${physCellClass(
                                row.sever
                              )}`}
                            >
                              {row.sever}
                            </td>
                            <td
                              className={`py-3 px-0.5 text-center font-mono-num text-xs sm:text-sm border-l border-[#352523] ${physCellClass(
                                row.blunt
                              )}`}
                            >
                              {row.blunt}
                            </td>
                            <td
                              className={`py-3 px-0.5 text-center font-mono-num text-xs sm:text-sm border-l border-[#352523] ${physCellClass(
                                row.shot
                              )}`}
                            >
                              {row.shot}
                            </td>
                            <td
                              className={`py-3 px-0.5 text-center font-mono-num text-xs sm:text-sm border-l border-[#4E3831] ${elemCellClass(
                                row.fire,
                                'text-[#F87171]'
                              )}`}
                            >
                              {row.fire}
                            </td>
                            <td
                              className={`py-3 px-0.5 text-center font-mono-num text-xs sm:text-sm border-l border-[#352523] ${elemCellClass(
                                row.water,
                                'text-[#38BDF8]'
                              )}`}
                            >
                              {row.water}
                            </td>
                            <td
                              className={`py-3 px-0.5 text-center font-mono-num text-xs sm:text-sm border-l border-[#352523] ${elemCellClass(
                                row.thunder,
                                'text-[#FACC15]'
                              )}`}
                            >
                              {row.thunder}
                            </td>
                            <td
                              className={`py-3 px-0.5 text-center font-mono-num text-xs sm:text-sm border-l border-[#352523] ${elemCellClass(
                                row.ice,
                                'text-[#7DD3FC]'
                              )}`}
                            >
                              {row.ice}
                            </td>
                            <td
                              className={`py-3 px-0.5 text-center font-mono-num text-xs sm:text-sm border-l border-[#352523] ${elemCellClass(
                                row.dragon,
                                'text-[#C084FC]'
                              )}`}
                            >
                              {row.dragon}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RANGO BAJO (Vertical Capture 3 Style with Japanese Sumi-e Headers) */}
          {activeTab === 'rango_bajo' &&
            renderDropsVerticalList(monster.drops.lowRank)}

          {/* TAB 4: RANGO ALTO (Vertical Capture 3 Style with Japanese Sumi-e Headers) */}
          {activeTab === 'rango_alto' &&
            renderDropsVerticalList(monster.drops.highRank)}

          {/* TAB 5: RANGO MAESTRO (Vertical Capture 3 Style with Japanese Sumi-e Headers) */}
          {activeTab === 'rango_maestro' &&
            renderDropsVerticalList(monster.drops.masterRank)}
        </>
      )}

      {/* Fullscreen Render Modal with Interactive 2-Finger Pinch-to-Zoom & Pan */}
      {isRenderModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={() => setIsRenderModalOpen(false)}
          data-allow-pinch-zoom="true"
        >
          <div
            className="relative max-w-3xl w-full bg-[#161013] border border-[#6E533B] rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[90dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#3E2B28] shrink-0">
              <div>
                <h3 className="font-display text-lg font-bold text-[#F5EFE6]">
                  {monster.name} — Render Oficial
                </h3>
                <p className="text-xs text-[#B5A89A]">
                  Usa 2 dedos o doble toque para hacer zoom (
                  {Math.round(zoomScale * 100)}%)
                </p>
              </div>
              <div className="flex items-center gap-1">
                {zoomScale > 1 && (
                  <button
                    type="button"
                    onClick={resetRenderZoom}
                    className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#F2C96D] hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Restablecer zoom"
                    title="Restablecer zoom"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsRenderModalOpen(false)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#B5A89A] hover:text-[#F5EFE6] hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Cerrar vista ampliada"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div
              data-allow-pinch-zoom="true"
              className="relative flex-1 min-h-[55dvh] max-h-[75dvh] flex items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_center,rgba(201,42,42,0.14)_0%,rgba(12,9,11,0.98)_75%)] border border-[#3E2B28] touch-none select-none cursor-grab active:cursor-grabbing"
              onDoubleClick={() => {
                if (zoomScale > 1) {
                  resetRenderZoom();
                } else {
                  setZoomScale(2.5);
                  setZoomTranslate({ x: 0, y: 0 });
                }
              }}
              onWheel={(e) => {
                e.preventDefault();
                const delta = -e.deltaY * 0.002;
                setZoomScale((prev) => {
                  const next = Math.min(4, Math.max(1, prev + delta));
                  if (next === 1) setZoomTranslate({ x: 0, y: 0 });
                  return next;
                });
              }}
              onTouchStart={(e) => {
                if (e.touches.length === 2) {
                  const dx = e.touches[0].clientX - e.touches[1].clientX;
                  const dy = e.touches[0].clientY - e.touches[1].clientY;
                  touchStateRef.current.mode = 'pinch';
                  touchStateRef.current.startDist = Math.hypot(dx, dy);
                  touchStateRef.current.startScale = zoomScale;
                } else if (e.touches.length === 1) {
                  const now = Date.now();
                  if (now - touchStateRef.current.lastTapTime < 280) {
                    if (zoomScale > 1) {
                      resetRenderZoom();
                    } else {
                      setZoomScale(2.5);
                      setZoomTranslate({ x: 0, y: 0 });
                    }
                    touchStateRef.current.lastTapTime = 0;
                    return;
                  }
                  touchStateRef.current.lastTapTime = now;
                  touchStateRef.current.mode = 'pan';
                  touchStateRef.current.startX =
                    e.touches[0].clientX - zoomTranslate.x;
                  touchStateRef.current.startY =
                    e.touches[0].clientY - zoomTranslate.y;
                }
              }}
              onTouchMove={(e) => {
                if (
                  e.touches.length === 2 &&
                  touchStateRef.current.mode === 'pinch'
                ) {
                  e.preventDefault();
                  const dx = e.touches[0].clientX - e.touches[1].clientX;
                  const dy = e.touches[0].clientY - e.touches[1].clientY;
                  const dist = Math.hypot(dx, dy);
                  if (touchStateRef.current.startDist > 0) {
                    const ratio = dist / touchStateRef.current.startDist;
                    const nextScale = Math.min(
                      4,
                      Math.max(1, touchStateRef.current.startScale * ratio)
                    );
                    setZoomScale(nextScale);
                    if (nextScale === 1) {
                      setZoomTranslate({ x: 0, y: 0 });
                    }
                  }
                } else if (
                  e.touches.length === 1 &&
                  touchStateRef.current.mode === 'pan' &&
                  zoomScale > 1
                ) {
                  e.preventDefault();
                  const nextX =
                    e.touches[0].clientX - touchStateRef.current.startX;
                  const nextY =
                    e.touches[0].clientY - touchStateRef.current.startY;
                  setZoomTranslate({ x: nextX, y: nextY });
                }
              }}
              onTouchEnd={() => {
                touchStateRef.current.mode = 'none';
              }}
            >
              <img
                src={monster.renderUrl}
                alt={`Render oficial ampliado de ${monster.name}`}
                referrerPolicy="no-referrer"
                draggable={false}
                style={{
                  transform: `translate3d(${zoomTranslate.x}px, ${zoomTranslate.y}px, 0) scale(${zoomScale})`,
                }}
                className="max-h-[68dvh] w-auto object-contain transition-transform duration-75 ease-out pointer-events-none"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
