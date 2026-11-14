import React, { useRef } from 'react'
import { Search, X, ChevronLeft, ChevronRight, Radio, Disc3 } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'

export const TopBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    navHistory,
    navHistoryIndex,
    goBack,
    goForward,
    setIsSyncModalOpen,
  } = useUIStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const canGoBack = navHistoryIndex > 0
  const canGoForward = navHistoryIndex < navHistory.length - 1

  const handleClear = () => {
    setSearchQuery('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear()
    } else if (e.key === 'Enter' && searchQuery.trim().length > 0) {
      if (activeTab !== 'search') {
        setActiveTab('search')
      }
    }
  }

  return (
    <header className="h-16 border-b border-white/10 liquid-glass-pane px-4 md:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 flex-shrink-0 select-none relative">
      <div className="liquid-specular-edge" />
      {/* Mobile-Only Brand Header when on Home/Library/Studio */}
      <div className={`md:hidden items-center gap-2.5 ${activeTab === 'search' ? 'hidden' : 'flex'}`}>
        <div className="w-8 h-8 rounded-xl liquid-glass-pill flex items-center justify-center shadow-glow-cyan flex-shrink-0 border-vyn-primary/30">
          <Disc3 className="w-4 h-4 text-vyn-primary" />
        </div>
        <div className="min-w-0">
          <span className="font-display font-black text-sm tracking-wider bg-gradient-to-r from-white via-vyn-high to-vyn-primary bg-clip-text text-transparent block">
            VYNORA 3.0
          </span>
          <span className="text-[10px] text-vyn-muted block capitalize font-mono -mt-0.5">
            {activeTab === 'home' ? 'Personal Studio' : activeTab}
          </span>
        </div>
      </div>

      {/* Desktop Navigation History Controls (Browser-like Back/Forward across ALL tabs) */}
      <div className="hidden md:flex items-center gap-2">
        <button
          onClick={goBack}
          disabled={!canGoBack}
          title={canGoBack ? 'Go back' : 'No previous history'}
          aria-label="Previous view"
          className={`min-h-[44px] min-w-[44px] w-11 h-11 rounded-full liquid-glass-pill flex items-center justify-center transition-all ${
            canGoBack
              ? 'text-vyn-high cursor-pointer active:scale-95 hover:border-vyn-primary/40'
              : 'text-vyn-muted/30 opacity-40 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={goForward}
          disabled={!canGoForward}
          title={canGoForward ? 'Go forward' : 'No forward history'}
          aria-label="Next view"
          className={`min-h-[44px] min-w-[44px] w-11 h-11 rounded-full liquid-glass-pill flex items-center justify-center transition-all ${
            canGoForward
              ? 'text-vyn-high cursor-pointer active:scale-95 hover:border-vyn-primary/40'
              : 'text-vyn-muted/30 opacity-40 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Global Search Bar (REG-05: Exactly one custom clear 'X' button) */}
      <div className={`flex-1 max-w-md relative ${activeTab !== 'search' ? 'hidden md:block' : 'block'}`}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-vyn-muted absolute left-3.5 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (e.target.value.trim().length > 0 && activeTab !== 'search') {
                setActiveTab('search')
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search songs, artists, or paste YouTube link..."
            aria-label="Search music"
            className="w-full h-11 pl-10 pr-10 rounded-full liquid-glass-input text-xs md:text-sm text-vyn-high placeholder:text-vyn-muted focus:outline-none transition-all"
          />
          {searchQuery.length > 0 && (
            <button
              onClick={handleClear}
              title="Clear search"
              aria-label="Clear search query"
              className="min-h-[44px] min-w-[44px] w-11 h-11 absolute right-0 flex items-center justify-center text-vyn-muted hover:text-vyn-high transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Quick Search on Mobile Home + Sync Indicator */}
      <div className="flex items-center gap-2">
        {/* Mobile Quick Search trigger when on Home/Library */}
        {activeTab !== 'search' && (
          <button
            onClick={() => setActiveTab('search')}
            aria-label="Open search view"
            className="md:hidden min-h-[44px] min-w-[44px] p-2.5 rounded-full liquid-glass-pill flex items-center justify-center text-vyn-muted hover:text-vyn-high active:scale-95 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => setIsSyncModalOpen(true)}
          title="Vynora Device Sync (VYN) - Click to connect or share sync code"
          aria-label="Open Device Sync Modal"
          className="min-h-[44px] px-3.5 py-1.5 rounded-full liquid-glass-pill hover:border-vyn-primary/60 hover:text-white flex items-center gap-1.5 text-[11px] font-mono text-vyn-primary active:scale-95 transition-all cursor-pointer shadow-md"
        >
          <Radio className="w-3.5 h-3.5 text-vyn-primary animate-pulse" />
          <span className="font-bold hidden xs:inline">VYN-3.0</span>
          <span className="font-bold xs:hidden">VYN</span>
        </button>
      </div>
    </header>
  )
}
