'use client'

import { useCallback, useEffect, useState } from 'react'

export type DockSide = 'left' | 'right'
const KEY = 'pl_dock_side'
const EVT = 'pl-dock-side'

/** Which side of the screen the phone's floating menu / filter buttons sit on (kept per device). */
export function useDockSide(): [DockSide, (s: DockSide) => void] {
  const [side, setSide] = useState<DockSide>('left')
  useEffect(() => {
    try { const v = localStorage.getItem(KEY); if (v === 'left' || v === 'right') setSide(v) } catch { /* private mode */ }
    const on = (e: Event) => setSide((e as CustomEvent<DockSide>).detail)
    window.addEventListener(EVT, on)
    return () => window.removeEventListener(EVT, on)
  }, [])
  const set = useCallback((s: DockSide) => {
    setSide(s)
    try { localStorage.setItem(KEY, s) } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent(EVT, { detail: s }))
  }, [])
  return [side, set]
}
