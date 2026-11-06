'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Portal from '@/components/Portal'

interface Ask { message: string; title?: string; okLabel?: string; danger?: boolean }

/** In-page replacement for window.confirm(): `const [confirm, dialog] = useConfirm()`, render {dialog}, then `if (!(await confirm('…'))) return`. */
export function useConfirm(): [(message: string, opts?: Omit<Ask, 'message'>) => Promise<boolean>, React.ReactNode] {
  const [ask, setAsk] = useState<Ask | null>(null)
  const resolver = useRef<((v: boolean) => void) | null>(null)

  const confirm = useCallback((message: string, opts: Omit<Ask, 'message'> = {}) => new Promise<boolean>((resolve) => {
    resolver.current?.(false)
    resolver.current = resolve
    setAsk({ message, ...opts })
  }), [])
  const close = useCallback((v: boolean) => { resolver.current?.(v); resolver.current = null; setAsk(null) }, [])

  const dialog = ask ? <ConfirmDialog ask={ask} onClose={close} /> : null
  return [confirm, dialog]
}

function ConfirmDialog({ ask, onClose }: { ask: Ask; onClose: (v: boolean) => void }) {
  const ok = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    ok.current?.focus()
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(false) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <Portal>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-4 pl-fade print:hidden" role="alertdialog" aria-modal="true" aria-label={ask.title ?? 'Xác nhận'}
        onMouseDown={(e) => e.target === e.currentTarget && onClose(false)}>
        <div className="pl-sheet w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-pop">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-[17px] font-extrabold text-navy-900">{ask.title ?? (ask.danger ? 'Xác nhận xóa' : 'Xác nhận')}</h2>
            <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft whitespace-pre-line">{ask.message}</p>
          </div>
          <div className="flex justify-end gap-2 border-t bg-navy-50 px-4 py-3">
            <button className="btn-secondary" onClick={() => onClose(false)}>Hủy</button>
            <button ref={ok} className={ask.danger ? 'btn-danger' : 'btn-primary'} onClick={() => onClose(true)}>{ask.okLabel ?? (ask.danger ? 'Xóa' : 'Đồng ý')}</button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
