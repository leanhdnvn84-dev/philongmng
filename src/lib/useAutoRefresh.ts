'use client'
import { useEffect, useRef } from 'react'

/** Keeps a screen's data fresh without a manual "Làm mới": reloads every `ms` while the tab is visible,
 *  and right away when the user comes back to the tab or window. `refresh` should be quiet (no spinner, no error banner). */
export function useAutoRefresh(refresh: () => unknown, ms = 30_000) {
  const fn = useRef(refresh); fn.current = refresh
  useEffect(() => {
    let last = Date.now(), running = false
    const run = async () => {
      if (running || document.hidden) return
      running = true; last = Date.now()
      try { await fn.current() } catch { /* a refresh that fails waits for the next one */ } finally { running = false }
    }
    const t = setInterval(() => { if (Date.now() - last >= ms) run() }, 5_000)
    const back = () => { if (!document.hidden && Date.now() - last > 5_000) run() }
    document.addEventListener('visibilitychange', back); window.addEventListener('focus', back)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', back); window.removeEventListener('focus', back) }
  }, [ms])
}
