import { PlaybackAdapterManager } from '@/adapters'

export type SleepTimerMode = 'time' | 'end_of_track' | null

type TimerCallback = (remainingSec: number | null, mode: SleepTimerMode) => void

export class SleepTimerManager {
  private static instance: SleepTimerManager | null = null
  private mode: SleepTimerMode = null
  private remainingSec: number | null = null
  private intervalId: number | null = null
  private listeners: Set<TimerCallback> = new Set()

  private constructor() {}

  public static getInstance(): SleepTimerManager {
    if (!SleepTimerManager.instance) {
      SleepTimerManager.instance = new SleepTimerManager()
    }
    return SleepTimerManager.instance
  }

  public subscribe(cb: TimerCallback): () => void {
    this.listeners.add(cb)
    cb(this.remainingSec, this.mode)
    return () => this.listeners.delete(cb)
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.remainingSec, this.mode))
  }

  public setTimer(option: number | 'end_of_track' | null) {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    if (option === null) {
      this.mode = null
      this.remainingSec = null
      this.notify()
      return
    }

    if (option === 'end_of_track') {
      this.mode = 'end_of_track'
      this.remainingSec = null
      this.notify()
      return
    }

    // Number of minutes
    this.mode = 'time'
    this.remainingSec = option * 60
    this.notify()

    this.intervalId = window.setInterval(() => {
      if (this.remainingSec === null) return

      if (this.remainingSec <= 1) {
        this.remainingSec = 0
        this.notify()
        this.triggerSleep()
      } else {
        this.remainingSec -= 1
        this.notify()
      }
    }, 1000)
  }

  public onTrackEnded() {
    if (this.mode === 'end_of_track') {
      this.triggerSleep()
    }
  }

  private async triggerSleep() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.mode = null
    this.remainingSec = null
    this.notify()

    const adapterManager = PlaybackAdapterManager.getInstance()
    // Smooth volume fade-out
    try {
      await adapterManager.setVolume(0.5)
      await new Promise((r) => setTimeout(r, 400))
      await adapterManager.setVolume(0.2)
      await new Promise((r) => setTimeout(r, 400))
      await adapterManager.pause()
      await adapterManager.setVolume(1.0) // restore
    } catch {
      await adapterManager.pause()
    }
  }

  public getStatus(): { mode: SleepTimerMode; remainingSec: number | null } {
    return { mode: this.mode, remainingSec: this.remainingSec }
  }
}

