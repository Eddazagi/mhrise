/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { Bookmark, Download, Swords, X } from 'lucide-react';
import { MONSTERS } from './data/monsters';
import { MonsterList } from './components/MonsterList';
import { DetailTabId, MonsterDetail } from './components/MonsterDetail';
import { useOnlineStatus, usePWAInstall } from './hooks/usePWAInstall';
import { HankoSeal } from './components/JapaneseBrushElements';
import { ALL_STATIC_ICON_URLS } from './components/MonsterIcons';

const BOOKMARKS_STORAGE_KEY = 'mhrise_db_bookmarked_monsters_v1';

export default function App() {
  const [selectedMonsterId, setSelectedMonsterId] = useState<string>(
    MONSTERS[0].id
  );
  // Unified single-view navigation across mobile, tablet, and PC
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [requestedNavigation, setRequestedNavigation] = useState<{
    tab: DetailTabId;
    timestamp: number;
  } | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [onlyBookmarks, setOnlyBookmarks] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [showPWAGuide, setShowPWAGuide] = useState<boolean>(false);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  // Deduplicated list of every image/icon URL in the app for persistent GPU memory pre-decoding
  const allPreloadUrls = useMemo(() => {
    const urls = new Set<string>(ALL_STATIC_ICON_URLS);
    for (const m of MONSTERS) {
      if (m.iconUrl) urls.add(m.iconUrl);
      if (m.renderUrl) urls.add(m.renderUrl);
    }
    return Array.from(urls);
  }, []);

  useEffect(() => {
    allPreloadUrls.forEach((url) => {
      const img = new Image();
      img.decoding = 'sync';
      img.src = url;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {
          // Ignore decode errors for already cached assets
        });
      }
    });
  }, [allPreloadUrls]);

  useEffect(() => {
    try {
      localStorage.setItem(
        BOOKMARKS_STORAGE_KEY,
        JSON.stringify(bookmarkedIds)
      );
    } catch {
      // Ignore storage errors
    }
  }, [bookmarkedIds]);

  // Prevent 2-finger pinch-zoom globally on the app, except inside the Render Inspector modal
  useEffect(() => {
    const isInsideZoomable = (target: EventTarget | null) => {
      return (
        target instanceof Element &&
        Boolean(target.closest('[data-allow-pinch-zoom="true"]'))
      );
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1 && !isInsideZoomable(e.target)) {
        e.preventDefault();
      }
    };

    const handleGesture = (e: Event) => {
      if (!isInsideZoomable(e.target)) {
        e.preventDefault();
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
      ) {
        return;
      }
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('gesturestart', handleGesture, {
      passive: false,
    });
    document.addEventListener('gesturechange', handleGesture, {
      passive: false,
    });
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('gesturestart', handleGesture);
      document.removeEventListener('gesturechange', handleGesture);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  // Sync navigation with browser History API so mobile back gesture / hardware back button returns to Monster List instead of exiting the app
  useEffect(() => {
    window.history.replaceState({ view: 'list' }, '');

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && state.view === 'detail') {
        if (state.monsterId) {
          setSelectedMonsterId(state.monsterId);
        }
        setCurrentView('detail');
      } else {
        setCurrentView('list');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const selectedMonster =
    MONSTERS.find((m) => m.id === selectedMonsterId) || MONSTERS[0];

  const handleSelectMonster = (id: string, targetTab: DetailTabId = 'resumen') => {
    setSelectedMonsterId(id);
    setRequestedNavigation({
      tab: targetTab,
      timestamp: Date.now(),
    });
    if (currentView !== 'detail') {
      window.history.pushState({ view: 'detail', monsterId: id }, '');
    } else {
      window.history.replaceState({ view: 'detail', monsterId: id }, '');
    }
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    if (window.history.state?.view === 'detail') {
      window.history.back();
    } else {
      setCurrentView('list');
    }
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
      setDrawerOpen(false);
    } else {
      setDrawerOpen(false);
      setShowPWAGuide(true);
    }
  };

  return (
    <div className="h-dvh w-full bg-sumi-texture text-[#F5EFE6] flex flex-col overflow-hidden">
      {/* Persistent Offscreen GPU Texture Cache: keeps all renders & icons decoded in memory so opening any monster or tab takes 0ms */}
      <div
        aria-hidden="true"
        className="fixed -left-[9999px] -top-[9999px] w-px h-px overflow-hidden opacity-[0.01] pointer-events-none select-none"
      >
        {allPreloadUrls.map((url) => (
          <img
            key={url}
            src={url}
            alt=""
            loading="eager"
            decoding="sync"
            draggable={false}
          />
        ))}
      </div>

      {/* Main Unified Single-View Container (Mobile & PC) - Both views stay mounted for 0ms switching */}
      <div className="flex-1 flex min-h-0 w-full max-w-[1400px] mx-auto border-x border-[#2B1D1B]/60">
        <div
          className={
            currentView === 'list' ? 'w-full h-full' : 'hidden'
          }
        >
          <MonsterList
            monsters={MONSTERS}
            selectedMonsterId={selectedMonster.id}
            onSelectMonster={handleSelectMonster}
            bookmarkedIds={bookmarkedIds}
            onlyBookmarks={onlyBookmarks}
            onToggleFilterBookmarks={() => setOnlyBookmarks((prev) => !prev)}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
        </div>

        <div
          className={
            currentView === 'detail' ? 'flex-1 min-w-0 h-full' : 'hidden'
          }
        >
          <MonsterDetail
            monster={selectedMonster}
            monsters={MONSTERS}
            bookmarkedIds={bookmarkedIds}
            onSelectMonster={handleSelectMonster}
            onBackToList={handleBackToList}
            isBookmarked={bookmarkedIds.includes(selectedMonster.id)}
            onToggleBookmark={handleToggleBookmark}
            requestedNavigation={requestedNavigation}
          />
        </div>
      </div>

      {/* Navigation Drawer - Japanese Kamura Guild Scroll Style */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-80 max-w-[85vw] h-full bg-[#171114] border-r border-[#5C4338] flex flex-col justify-between p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#3E2B28]">
                <div className="flex items-center gap-2.5">
                  <HankoSeal kanji="百" />
                  <div>
                    <span className="font-display text-lg font-bold text-[#F5EFE6] tracking-wide block">
                      MHRise & Sunbreak
                    </span>
                    <span className="text-xs text-[#D9A74A]">
                      Pergaminos de Kamura
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#B5A89A] hover:text-[#F5EFE6] hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setOnlyBookmarks(false);
                    handleBackToList();
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    !onlyBookmarks
                      ? 'bg-gradient-to-r from-[#C92A2A]/30 to-[#26181B] text-[#F2C96D] border border-[#D9A74A]/50'
                      : 'text-[#D6C9B8] hover:bg-white/5'
                  }`}
                >
                  <Swords className="w-4 h-4 shrink-0" />
                  <span>Todos los Monstruos</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOnlyBookmarks(true);
                    handleBackToList();
                    setDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    onlyBookmarks
                      ? 'bg-gradient-to-r from-[#C92A2A]/30 to-[#26181B] text-[#F2C96D] border border-[#D9A74A]/50'
                      : 'text-[#D6C9B8] hover:bg-white/5'
                  }`}
                >
                  <Bookmark className="w-4 h-4 shrink-0" />
                  <span>Monstruos Favoritos ({bookmarkedIds.length})</span>
                </button>

                {!isInstalled && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium text-[#F2C96D] bg-[#D9A74A]/15 hover:bg-[#D9A74A]/25 border border-[#D9A74A]/45 transition-colors cursor-pointer mt-2"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Instalar como App Web (PWA)</span>
                  </button>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#3E2B28] text-xs text-[#9C8E80]">
              Monster Hunter Rise · Sunbreak Companion
            </div>
          </div>
        </div>
      )}

      {/* PWA Installation Guide Modal */}
      {showPWAGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4"
          onClick={() => setShowPWAGuide(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-[#171114] border border-[#6E533B] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#3E2B28]">
              <h3 className="font-display text-lg font-bold text-[#F5EFE6]">
                Instalar como App Web (PWA)
              </h3>
              <button
                type="button"
                onClick={() => setShowPWAGuide(false)}
                className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#B5A89A] hover:text-[#F5EFE6] hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="mt-4 space-y-2.5 text-sm text-[#D6C9B8] leading-relaxed">
                <p>Para instalar la aplicación en tu iPhone o iPad:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-[#F5EFE6]">
                  <li>
                    Toca el botón <strong>Compartir</strong> en la barra de
                    Safari.
                  </li>
                  <li>
                    Desliza hacia abajo y selecciona{' '}
                    <strong>Agregar a inicio</strong>.
                  </li>
                </ol>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5 text-sm text-[#D6C9B8] leading-relaxed">
                <p>
                  Para instalar la aplicación directamente en tu dispositivo:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-[#F5EFE6]">
                  <li>
                    Abre la aplicación en una pestaña directa del navegador
                    (Chrome, Edge o navegador móvil).
                  </li>
                  <li>
                    Toca el icono <strong>Instalar aplicación</strong> en la
                    barra de direcciones o selecciona{' '}
                    <strong>Añadir a pantalla de inicio</strong> en el menú del
                    navegador.
                  </li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowPWAGuide(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#C92A2A] to-[#A61E1E] border border-[#D9A74A]/60 py-2.5 text-sm font-semibold text-[#F5EFE6] hover:brightness-110 transition-all cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-[#C92A2A] border border-[#F2C96D] px-3.5 py-2 text-xs font-semibold text-[#F5EFE6] shadow-lg">
          Modo sin conexión — Usando datos guardados en caché.
        </div>
      )}
    </div>
  );
}
