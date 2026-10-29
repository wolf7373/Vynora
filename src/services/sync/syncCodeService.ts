import { getSupabaseClient } from './supabaseClient'
import type { SyncCodeSession, SyncPayload } from './types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export const CODE_EXPIRY_MS = 10 * 60 * 1000 // 10 minutes (APP-06)
export const MAX_SYNC_ATTEMPTS = 5 // Rate limit (APP-06)

const ALPHANUMERIC_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // Clear, unambiguous uppercase alphanumeric

let failedAttempts = 0
let activeChannel: RealtimeChannel | null = null

/**
 * Gets or creates a persistent device ID for cross-device syncing
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server-device'
  const key = 'vynora_device_id'
  let id = localStorage.getItem(key)
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
    localStorage.setItem(key, id)
  }
  return id
}

/**
 * Generates a random 6-character uppercase alphanumeric sync code matching ^[A-Z0-9]{6}$
 */
export function generateSyncCode(): string {
  let result = ''
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHANUMERIC_CHARS.length)
    result += ALPHANUMERIC_CHARS.charAt(randomIndex)
  }
  return result
}

/**
 * Normalizes input code by stripping spaces, hyphens, and converting to uppercase
 */
export function normalizeSyncCode(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase()
}

/**
 * Validates whether the code meets the 6-character alphanumeric pattern ^[A-Z0-9]{6}$
 */
export function validateSyncCode(input: string): boolean {
  const normalized = normalizeSyncCode(input)
  return /^[A-Z0-9]{6}$/.test(normalized)
}

/**
 * Formats a 6-character code as VYN-XXX or XXX-XXX for human reading
 */
export function formatSyncCodeDisplay(code: string): string {
  const clean = normalizeSyncCode(code)
  if (clean.length <= 3) return clean
  return `${clean.slice(0, 3)}-${clean.slice(3, 6)}`
}

/**
 * Checks if a sync code session has exceeded its 10-minute expiry time
 */
export function isSyncCodeExpired(createdAt: number, now = Date.now()): boolean {
  return now - createdAt >= CODE_EXPIRY_MS
}

/**
 * Returns remaining seconds for a given session
 */
export function getRemainingTimeSeconds(createdAt: number, now = Date.now()): number {
  const elapsed = now - createdAt
  const remaining = Math.max(0, Math.floor((CODE_EXPIRY_MS - elapsed) / 1000))
  return remaining
}

/**
 * Rate limit protection: checks if max attempts have been exceeded
 */
export function isRateLimited(): boolean {
  return failedAttempts >= MAX_SYNC_ATTEMPTS
}

export function recordFailedAttempt(): number {
  failedAttempts += 1
  return failedAttempts
}

export function resetRateLimit(): void {
  failedAttempts = 0
}

/**
 * Creates a new SyncCodeSession
 */
export function createSyncSession(customCode?: string): SyncCodeSession {
  const code = customCode && validateSyncCode(customCode) ? normalizeSyncCode(customCode) : generateSyncCode()
  const now = Date.now()
  return {
    code,
    deviceId: getOrCreateDeviceId(),
    createdAt: now,
    expiresAt: now + CODE_EXPIRY_MS,
  }
}

/**
 * Subscribes to a Supabase Realtime channel for cross-device synchronization
 */
export function subscribeToSyncChannel(
  code: string,
  onPayloadReceived: (payload: SyncPayload) => void,
  onStatusChange?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void
): () => void {
  const normalized = normalizeSyncCode(code)
  const supabase = getSupabaseClient()
  const channelName = `vynora-sync:${normalized}`

  if (activeChannel) {
    try {
      supabase.removeChannel(activeChannel)
    } catch {
      // ignore
    }
  }

  const channel = supabase.channel(channelName, {
    config: {
      broadcast: { self: false },
    },
  })

  channel
    .on('broadcast', { event: 'sync-data' }, (event) => {
      if (event.payload) {
        onPayloadReceived(event.payload as SyncPayload)
      }
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        onStatusChange?.('SUBSCRIBED')
      } else if (status === 'TIMED_OUT') {
        onStatusChange?.('TIMED_OUT')
      } else if (status === 'CLOSED') {
        onStatusChange?.('CLOSED')
      } else if (status === 'CHANNEL_ERROR') {
        onStatusChange?.('CHANNEL_ERROR')
      }
    })

  activeChannel = channel

  return () => {
    try {
      supabase.removeChannel(channel)
    } catch {
      // ignore
    }
    if (activeChannel === channel) {
      activeChannel = null
    }
  }
}

/**
 * Broadcasts a sync payload to peers listening on the sync channel
 */
export async function broadcastSyncPayload(code: string, payload: SyncPayload): Promise<boolean> {
  const normalized = normalizeSyncCode(code)
  const supabase = getSupabaseClient()
  const channelName = `vynora-sync:${normalized}`

  const channel = activeChannel || supabase.channel(channelName)

  try {
    const res = await channel.send({
      type: 'broadcast',
      event: 'sync-data',
      payload,
    })
    return res === 'ok'
  } catch {
    return false
  }
}
