import { describe, it, expect, beforeEach } from 'vitest'
import {
  generateSyncCode,
  normalizeSyncCode,
  validateSyncCode,
  formatSyncCodeDisplay,
  isSyncCodeExpired,
  getRemainingTimeSeconds,
  isRateLimited,
  recordFailedAttempt,
  resetRateLimit,
  createSyncSession,
  CODE_EXPIRY_MS,
  MAX_SYNC_ATTEMPTS,
} from '../../services/sync/syncCodeService'

describe('syncCodeService (Milestone 7)', () => {
  beforeEach(() => {
    resetRateLimit()
  })

  it('generates a 6-character uppercase alphanumeric code matching ^[A-Z0-9]{6}$', () => {
    for (let i = 0; i < 20; i++) {
      const code = generateSyncCode()
      expect(code).toHaveLength(6)
      expect(/^[A-Z0-9]{6}$/.test(code)).toBe(true)
    }
  })

  it('normalizes codes by removing whitespace and hyphens and converting to uppercase', () => {
    expect(normalizeSyncCode('vyn-742')).toBe('VYN742')
    expect(normalizeSyncCode(' abc 123 ')).toBe('ABC123')
    expect(normalizeSyncCode('v-y-n-4-2-a')).toBe('VYN42A')
  })

  it('validates 6-character alphanumeric sync codes correctly', () => {
    expect(validateSyncCode('VYN742')).toBe(true)
    expect(validateSyncCode('vyn-742')).toBe(true)
    expect(validateSyncCode('ABCDEF')).toBe(true)
    expect(validateSyncCode('123456')).toBe(true)

    // Invalid codes
    expect(validateSyncCode('12345')).toBe(false) // too short
    expect(validateSyncCode('1234567')).toBe(false) // too long
    expect(validateSyncCode('VYN@!#')).toBe(false) // special characters
  })

  it('formats sync code for clean human display (XXX-XXX)', () => {
    expect(formatSyncCodeDisplay('VYN742')).toBe('VYN-742')
    expect(formatSyncCodeDisplay('vyn742')).toBe('VYN-742')
    expect(formatSyncCodeDisplay('AB')).toBe('AB')
  })

  it('enforces 10-minute expiry time correctly (APP-06)', () => {
    const baseTime = 1000000
    // Active within 10 minutes
    expect(isSyncCodeExpired(baseTime, baseTime + 5 * 60 * 1000)).toBe(false)
    expect(isSyncCodeExpired(baseTime, baseTime + 9.9 * 60 * 1000)).toBe(false)

    // Expired at or after 10 minutes (600,000ms)
    expect(isSyncCodeExpired(baseTime, baseTime + CODE_EXPIRY_MS)).toBe(true)
    expect(isSyncCodeExpired(baseTime, baseTime + 11 * 60 * 1000)).toBe(true)
  })

  it('calculates remaining seconds accurately', () => {
    const baseTime = 1000000
    // At start: 600s
    expect(getRemainingTimeSeconds(baseTime, baseTime)).toBe(600)
    // 2 minutes later: 480s
    expect(getRemainingTimeSeconds(baseTime, baseTime + 120000)).toBe(480)
    // Expired: 0s
    expect(getRemainingTimeSeconds(baseTime, baseTime + 700000)).toBe(0)
  })

  it('enforces rate limit after 5 failed attempts (APP-06)', () => {
    expect(isRateLimited()).toBe(false)
    for (let i = 1; i <= MAX_SYNC_ATTEMPTS; i++) {
      recordFailedAttempt()
    }
    expect(isRateLimited()).toBe(true)

    resetRateLimit()
    expect(isRateLimited()).toBe(false)
  })

  it('creates a valid SyncSession with 10-minute expiry', () => {
    const session = createSyncSession()
    expect(session.code).toHaveLength(6)
    expect(session.expiresAt - session.createdAt).toBe(CODE_EXPIRY_MS)
    expect(session.deviceId).toBeDefined()
  })
})

