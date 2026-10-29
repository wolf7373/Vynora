import { describe, it, expect } from 'vitest'
import { formatTime } from '@/utils/formatTime'

describe('formatTime utility', () => {
  it('formats zero and sub-minute durations', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(9)).toBe('0:09')
    expect(formatTime(45)).toBe('0:45')
  })

  it('formats standard minute:second tracks', () => {
    expect(formatTime(60)).toBe('1:00')
    expect(formatTime(125)).toBe('2:05')
    expect(formatTime(270)).toBe('4:30')
  })

  it('formats hours for long mixes or audio sets', () => {
    expect(formatTime(3600)).toBe('1:00:00')
    expect(formatTime(3665)).toBe('1:01:05')
    expect(formatTime(7325)).toBe('2:02:05')
  })

  it('handles negative or invalid values gracefully', () => {
    expect(formatTime(-10)).toBe('0:00')
    expect(formatTime(NaN)).toBe('0:00')
  })
})

