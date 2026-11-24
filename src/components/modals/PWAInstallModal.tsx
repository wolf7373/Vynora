import React from 'react'
import { Download, X, Smartphone, CheckCircle, Share, PlusSquare, Sparkles } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

interface PWAInstallModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall()

  if (!isOpen) return null

  const handleInstallClick = async () => {
    const success = await promptInstall()
    if (success) {
      onClose()
    }
  }

  return (
    <div
      role="dialog"
      aria-label="Install Vynora App"
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md liquid-glass-card rounded-[2.5rem] border border-white/20 shadow-2xl p-6 text-white overflow-hidden"
      >
        <div className="liquid-specular-edge pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Install Vynora App</h2>
              <span className="text-[11px] text-white/60 block">Add to your phone or desktop for the best experience</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full liquid-glass-pill text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="py-4 space-y-4 relative z-10">
          {/* App Icon & Name Preview */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-2xl liquid-glass-pane border border-white/15">
            <img
              src="/icon-192.png"
              alt="Vynora Icon"
              className="w-14 h-14 rounded-2xl border border-white/20 shadow-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-bold text-white block truncate">Vynora</span>
              <span className="text-xs text-white/60 block truncate">Liquid Music Player</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Ready
                </span>
                <span className="text-[9px] font-mono text-white/50">Free • No App Store Needed</span>
              </div>
            </div>
          </div>

          {/* Key Advantages */}
          <div className="space-y-2 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>Full screen app with zero browser address bars</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>Continuous background playback when mobile screen is locked</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-300 flex-shrink-0" />
              <span>Instant 0-second launch directly from your home screen</span>
            </div>
          </div>

          {/* iOS Specific Instructions */}
          {isIOS && (
            <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-xs text-amber-200 space-y-2">
              <div className="font-semibold flex items-center gap-1.5 text-amber-300">
                <Share className="w-4 h-4" />
                <span>How to Install on iPhone / iPad:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-200/90 pl-1">
                <li>
                  Tap the Safari <strong>Share button</strong> (<Share className="w-3 h-3 inline mx-0.5" />) in the bottom bar.
                </li>
                <li>
                  Scroll down and select <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3 h-3 inline mx-0.5" />).
                </li>
                <li>Tap <strong>"Add"</strong> in top right corner. Done!</li>
              </ol>
            </div>
          )}

          {/* Already installed notice */}
          {isInstalled && (
            <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Vynora is already installed as a standalone app!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-3 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-xl text-xs font-semibold text-white/60 hover:text-white liquid-glass-pill transition-all"
          >
            Cancel
          </button>

          {!isInstalled && !isIOS && (
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={!isInstallable}
              className={`min-h-[44px] px-6 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
                isInstallable
                  ? 'bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 active:scale-95 cursor-pointer'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>{isInstallable ? 'Download & Install App' : 'Checking Installability...'}</span>
            </button>
          )}

          {isIOS && (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 font-bold text-xs active:scale-95 transition-all"
            >
              Got It
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

