import React, { useState, useEffect, useRef } from 'react'
import {
  X,
  Share2,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Radio,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import {
  generateSyncCode,
  normalizeSyncCode,
  validateSyncCode,
  formatSyncCodeDisplay,
  getRemainingTimeSeconds,
  isRateLimited,
  recordFailedAttempt,
  resetRateLimit,
  subscribeToSyncChannel,
  broadcastSyncPayload,
  getOrCreateDeviceId,
} from '../../services/sync/syncCodeService'
import { usePlaylistStore } from '../../stores/usePlaylistStore'
import { usePlayerStore } from '../../stores/usePlayerStore'
import type { SyncPayload } from '../../services/sync/types'

interface SyncCodeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SyncCodeModal: React.FC<SyncCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'share' | 'connect'>('share')
  const [hostCode, setHostCode] = useState<string>('')
  const [hostCreatedAt, setHostCreatedAt] = useState<number>(() => Date.now())
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600)
  const [copied, setCopied] = useState(false)
  const [peerConnected, setPeerConnected] = useState(false)

  // Connect tab state
  const [inputCode, setInputCode] = useState('')
  const [connectStatus, setConnectStatus] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { playlists, setPlaylists } = usePlaylistStore()
  const { currentTrack, isPlaying } = usePlayerStore()

  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Generate host code on open
  useEffect(() => {
    if (isOpen) {
      const newCode = generateSyncCode()
      setHostCode(newCode)
      setHostCreatedAt(Date.now())
      setSecondsRemaining(600)
      setPeerConnected(false)
      setErrorMessage(null)
    } else {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [isOpen])

  // Countdown timer for host code
  useEffect(() => {
    if (!isOpen || activeTab !== 'share') return

    const timer = setInterval(() => {
      const remaining = getRemainingTimeSeconds(hostCreatedAt)
      setSecondsRemaining(remaining)
      if (remaining <= 0) {
        // Expired - regenerate
        const newCode = generateSyncCode()
        setHostCode(newCode)
        setHostCreatedAt(Date.now())
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, activeTab, hostCreatedAt])

  // Start host broadcasting listener
  useEffect(() => {
    if (!isOpen || activeTab !== 'share' || !hostCode) return

    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }

    const unsub = subscribeToSyncChannel(hostCode, (payload) => {
      if (payload.type === 'SYNC_PLAYLIST_UPDATE' && payload.playlists) {
        setPlaylists(payload.playlists)
        setPeerConnected(true)
      }
    })

    unsubscribeRef.current = unsub

    // Initial broadcast of our playlists to whoever joins
    const syncData: SyncPayload = {
      type: 'SYNC_SNAPSHOT',
      senderDeviceId: getOrCreateDeviceId(),
      timestamp: Date.now(),
      playlists,
      currentTrack,
      isPlaying,
    }
    broadcastSyncPayload(hostCode, syncData).catch(() => {})

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [isOpen, activeTab, hostCode, playlists, currentTrack, isPlaying, setPlaylists])

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(hostCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRefreshHostCode = () => {
    const newCode = generateSyncCode()
    setHostCode(newCode)
    setHostCreatedAt(Date.now())
    setSecondsRemaining(600)
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (isRateLimited()) {
      setErrorMessage('Too many failed attempts. Please wait 1 minute before trying again.')
      return
    }

    const clean = normalizeSyncCode(inputCode)
    if (!validateSyncCode(clean)) {
      recordFailedAttempt()
      setErrorMessage('Please enter a valid 6-character sync code (e.g. VYN742).')
      return
    }

    setIsConnecting(true)
    setConnectStatus('Connecting to peer device...')

    try {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }

      const unsub = subscribeToSyncChannel(
        clean,
        (payload) => {
          if (payload.playlists && payload.playlists.length > 0) {
            setPlaylists(payload.playlists)
            setConnectStatus(`Successfully synced ${payload.playlists.length} playlists!`)
            resetRateLimit()
            setIsConnecting(false)
          }
        },
        (status) => {
          if (status === 'SUBSCRIBED') {
            setConnectStatus('Connected! Requesting playlist sync...')
            // Request snapshot from peer
            const requestPayload: SyncPayload = {
              type: 'SYNC_SNAPSHOT',
              senderDeviceId: getOrCreateDeviceId(),
              timestamp: Date.now(),
              playlists,
            }
            broadcastSyncPayload(clean, requestPayload).catch(() => {})
          } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
            setErrorMessage('Connection timed out. Ensure the code is active on the other device.')
            setIsConnecting(false)
          }
        }
      )

      unsubscribeRef.current = unsub

      // Timeout fallback for demo or offline mode
      setTimeout(() => {
        setIsConnecting(false)
        if (!connectStatus?.includes('Successfully')) {
          setConnectStatus('Connected to sync channel.')
        }
      }, 1500)
    } catch {
      recordFailedAttempt()
      setErrorMessage('Failed to connect to sync server.')
      setIsConnecting(false)
    }
  }

  const minutes = Math.floor(secondsRemaining / 60)
  const seconds = secondsRemaining % 60
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

  return (
    <div
      role="dialog"
      aria-label="Cross-Device Sync"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <div className="relative w-full max-w-md bg-vyn-surface border border-vyn-border rounded-3xl shadow-2xl overflow-hidden p-6 text-vyn-high">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-vyn-border">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-vyn-primary animate-pulse" />
            <h2 className="text-lg font-bold tracking-wide">Vynora Sync</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-vyn-primary/10 text-vyn-primary border border-vyn-primary/30 font-mono">
              P2P Realtime
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sync modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-vyn-muted hover:text-vyn-high hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4 p-1 bg-vyn-elevated rounded-xl border border-vyn-border">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'share'
                ? 'bg-vyn-primary text-vyn-canvas font-bold shadow-glow-cyan'
                : 'text-vyn-muted hover:text-vyn-high hover:bg-white/5'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Share Device
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('connect')}
            className={`flex-1 min-h-[44px] flex items-center justify-center gap-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'connect'
                ? 'bg-vyn-primary text-vyn-canvas font-bold shadow-glow-cyan'
                : 'text-vyn-muted hover:text-vyn-high hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Connect Code
          </button>
        </div>

        {/* Tab 1: Share Device (Host) */}
        {activeTab === 'share' && (
          <div className="mt-6 flex flex-col items-center text-center">
            <p className="text-sm text-vyn-muted leading-relaxed">
              Enter this 6-character code on your mobile phone or second laptop to sync playlists and audio in real-time without passwords:
            </p>

            {/* Big Code Display */}
            <div className="my-6 px-6 py-4 rounded-2xl bg-vyn-canvas border-2 border-vyn-primary/40 shadow-glow-cyan flex items-center gap-4">
              <span className="font-mono text-3xl font-black tracking-widest text-vyn-primary">
                {formatSyncCodeDisplay(hostCode)}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy sync code"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-vyn-primary/10 hover:bg-vyn-primary/20 text-vyn-primary transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            {/* Expiry Timer */}
            <div className="flex items-center gap-3 text-xs text-vyn-muted">
              <span>Code expires in:</span>
              <span className="font-mono text-vyn-primary font-bold bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                {timeFormatted}
              </span>
              <button
                type="button"
                onClick={handleRefreshHostCode}
                aria-label="Generate new sync code"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-vyn-muted hover:text-vyn-high hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Status Indicator */}
            <div className="mt-6 w-full p-3.5 rounded-xl bg-vyn-elevated border border-vyn-border flex items-center justify-center gap-2.5 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  peerConnected ? 'bg-emerald-400 animate-ping' : 'bg-vyn-primary animate-pulse'
                }`}
              />
              <span className="text-vyn-muted">
                {peerConnected
                  ? 'Paired with peer! Playlists synchronized in real-time.'
                  : 'Broadcasting code... Waiting for your mobile or second PC.'}
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Connect Code (Client) */}
        {activeTab === 'connect' && (
          <form onSubmit={handleConnect} className="mt-6 flex flex-col">
            <p className="text-sm text-vyn-muted mb-4 leading-relaxed">
              Enter the 6-character pairing code shown on your host device:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={7}
                placeholder="VYN-742"
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.toUpperCase())
                  setErrorMessage(null)
                }}
                aria-label="Enter 6-character sync code"
                className="flex-1 min-h-[48px] px-4 rounded-xl bg-vyn-canvas border-2 border-vyn-border focus:border-vyn-primary text-center font-mono text-2xl font-black tracking-widest text-vyn-primary placeholder:text-vyn-muted/30 focus:outline-none focus:ring-2 focus:ring-vyn-primary/20 shadow-inner transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={isConnecting}
                className="min-h-[48px] px-6 rounded-xl bg-vyn-primary hover:bg-vyn-primary/90 text-vyn-canvas font-bold text-sm flex items-center gap-2 disabled:opacity-50 transition-opacity shadow-glow-cyan cursor-pointer"
              >
                {isConnecting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Pair</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {connectStatus && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{connectStatus}</span>
              </div>
            )}

            <div className="mt-6 text-xs text-vyn-muted leading-relaxed space-y-1 bg-vyn-elevated/60 p-3 rounded-xl border border-vyn-border">
              <p>• Zero sign-in or passwords needed.</p>
              <p>• Real-time peer-to-peer sync via Supabase Realtime broadcast.</p>
              <p>• Connects phone, tablet, and desktop effortlessly.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
