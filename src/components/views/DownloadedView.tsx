import React, { useState, useEffect, useRef } from 'react'
import { HardDrive, ShieldCheck, Play, Upload, Trash2, Music, CheckCircle2, Sparkles } from 'lucide-react'
import { offlineStorage, type StoredAudioBlob, type StorageQuotaInfo } from '@/services/storage'
import { extractAudioFileDuration } from '@/utils/audioMetadata'
import { PlaybackAdapterManager } from '@/adapters'
import { useQueueStore } from '@/stores/useQueueStore'
import { usePlayerStore } from '@/stores/usePlayerStore'
import type { Track } from '@/types/track'
import { formatTime } from '@/utils/formatTime'

export const DownloadedView: React.FC = () => {
  const [storedTracks, setStoredTracks] = useState<StoredAudioBlob[]>([])
  const [quota, setQuota] = useState<StorageQuotaInfo | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { setQueue } = useQueueStore()
  const { currentTrack, isPlaying } = usePlayerStore()
  const adapterManager = PlaybackAdapterManager.getInstance()

  const mountedRef = useRef(true)

  const refreshStorage = async () => {
    const tracks = await offlineStorage.getAllStoredTracks()
    if (!mountedRef.current) return
    setStoredTracks(tracks)
    const quotaInfo = await offlineStorage.getStorageQuota()
    if (!mountedRef.current) return
    setQuota(quotaInfo)
  }

  useEffect(() => {
    mountedRef.current = true
    refreshStorage()
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleFiles = async (files: FileList | File[]) => {
    setIsProcessing(true)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|flac|ogg|m4a)$/i.test(file.name)) {
        continue
      }
      const duration = await extractAudioFileDuration(file)
      await offlineStorage.saveTrackBlob(file, { duration })
    }
    await refreshStorage()
    setIsProcessing(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files)
    }
  }

  const handlePlayTrack = async (stored: StoredAudioBlob, index: number) => {
    const objectUrl = await offlineStorage.createAudioObjectUrl(stored.id)
    if (!objectUrl) return

    const track: Track = {
      id: stored.id,
      title: stored.title,
      artist: stored.artist,
      duration: stored.duration,
      source: 'local',
      isLocal: true,
      audioUrl: objectUrl,
    }

    const allLocalTracks: Track[] = storedTracks.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      duration: t.duration,
      source: 'local',
      isLocal: true,
    }))

    setQueue(allLocalTracks, index)
    await adapterManager.playTrack(track)
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await offlineStorage.deleteTrackBlob(id)
    await refreshStorage()
  }

  return (
    <div className="p-4 md:p-8 pb-36 md:pb-12 space-y-6 max-w-6xl mx-auto select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-vyn-primary/10 border border-vyn-primary/20 text-vyn-primary text-[11px] font-medium mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Confirmed Decision D4 Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-vyn-high">
            Offline Storage & Local Audio Vault
          </h1>
          <p className="text-xs text-vyn-muted">
            100% Private IndexedDB audio blob storage • Zero server requests • Real Web Audio FFT
          </p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="min-h-[44px] min-w-[44px] px-4 py-2 rounded-xl bg-vyn-primary text-vyn-canvas text-xs font-semibold flex items-center gap-2 shadow-glow-cyan hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          <span>{isProcessing ? 'Importing Audio...' : '+ Import Local Songs'}</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.flac,.ogg,.m4a"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
          }}
        />
      </div>

      {/* Storage Quota & Security Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel-elevated p-5 rounded-2xl border border-vyn-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-vyn-muted uppercase tracking-wider font-semibold">Storage Meter</span>
            <HardDrive className="w-4 h-4 text-vyn-primary" />
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-lg font-display font-bold text-vyn-high tabular-nums">
                {quota ? `${quota.usedMB} MB` : '0.00 MB'}
              </span>
              <span className="text-xs text-vyn-muted tabular-nums">
                {quota ? `of ${quota.quotaMB} MB` : 'Calculating...'}
              </span>
            </div>
            {/* Storage Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-vyn-primary to-vyn-accent rounded-full transition-all duration-500"
                style={{ width: `${Math.max(1, Math.min(100, quota?.percentUsed || 0))}%` }}
              />
            </div>
          </div>
        </div>

        <div className="glass-panel-elevated p-5 rounded-2xl border border-vyn-border flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-vyn-secondary/10 border border-vyn-secondary/30 flex items-center justify-center text-vyn-secondary flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-vyn-high block">Sandboxed IndexedDB</span>
            <p className="text-[11px] text-vyn-muted">
              Audio blobs remain 100% on your device. Zero cloud uploads or data tracking.
            </p>
          </div>
        </div>

        <div className="glass-panel-elevated p-5 rounded-2xl border border-vyn-border flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-vyn-primary/10 border border-vyn-primary/30 flex items-center justify-center text-vyn-primary flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-vyn-high block">Real 64-Bin FFT Support</span>
            <p className="text-[11px] text-vyn-muted">
              Decoded through Web Audio AnalyserNode with hardware audio mastery.
            </p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Import Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-vyn-primary bg-vyn-primary/10 shadow-glow-cyan'
            : 'border-vyn-border hover:border-vyn-primary/40 bg-vyn-surface/40'
        }`}
      >
        <Upload className="w-8 h-8 text-vyn-muted mx-auto mb-2" />
        <h3 className="text-xs md:text-sm font-semibold text-vyn-high">
          Drag & Drop MP3, WAV, FLAC, or M4A audio files here
        </h3>
        <p className="text-[11px] text-vyn-muted mt-0.5">or click anywhere to browse local files from your computer</p>
      </div>

      {/* Offline Tracks Table */}
      <div className="glass-panel rounded-2xl border border-vyn-border overflow-hidden">
        <div className="px-5 py-3 border-b border-vyn-border/60 grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-vyn-muted">
          <span className="col-span-1">#</span>
          <span className="col-span-6 sm:col-span-5">Track & File</span>
          <span className="hidden sm:block sm:col-span-3">File Size</span>
          <span className="col-span-5 sm:col-span-3 text-right">Duration & Action</span>
        </div>

        <div className="divide-y divide-vyn-border/30">
          {storedTracks.length === 0 ? (
            <div className="p-12 text-center text-vyn-muted">
              <Music className="w-10 h-10 text-vyn-muted/40 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-vyn-high mb-1">No Offline Audio Files Found</h3>
              <p className="text-xs text-vyn-muted max-w-sm mx-auto">
                Import your MP3s or FLAC files to enjoy 100% offline playback with real hardware FFT.
              </p>
            </div>
          ) : (
            storedTracks.map((item, idx) => {
              const isCurrent = currentTrack?.id === item.id
              const sizeMB = (item.sizeBytes / (1024 * 1024)).toFixed(2)

              return (
                <div
                  key={item.id}
                  onClick={() => handlePlayTrack(item, idx)}
                  className={`px-5 py-3.5 grid grid-cols-12 items-center hover:bg-white/5 transition-colors cursor-pointer group ${
                    isCurrent ? 'bg-vyn-primary/10' : ''
                  }`}
                >
                  <div className="col-span-1 text-xs text-vyn-muted font-mono">
                    {isCurrent && isPlaying ? (
                      <span className="w-3 h-3 block rounded-full bg-vyn-primary animate-ping" />
                    ) : (
                      <>
                        <span className="group-hover:hidden">{idx + 1}</span>
                        <Play className="w-4 h-4 text-vyn-primary fill-current hidden group-hover:block" />
                      </>
                    )}
                  </div>

                  <div className="col-span-6 sm:col-span-5 min-w-0 pr-2">
                    <span
                      className={`text-xs font-semibold truncate block transition-colors ${
                        isCurrent ? 'text-vyn-primary' : 'text-vyn-high group-hover:text-vyn-primary'
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-[11px] text-vyn-muted truncate block">{item.artist}</span>
                  </div>

                  <div className="hidden sm:block sm:col-span-3 text-xs text-vyn-muted font-mono tabular-nums">
                    {sizeMB} MB
                  </div>

                  <div className="col-span-5 sm:col-span-3 flex items-center justify-end gap-3">
                    <span className="text-xs text-vyn-muted font-mono tabular-nums">
                      {formatTime(item.duration)}
                    </span>

                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Delete offline file"
                      aria-label={`Delete ${item.title}`}
                      className="min-h-[44px] min-w-[44px] w-9 h-9 rounded-lg hover:bg-white/10 flex items-center justify-center text-vyn-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
