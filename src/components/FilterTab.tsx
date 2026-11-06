'use client'

import { useEffect, useState } from 'react'
import { Filter } from 'lucide-react'
import Portal from '@/components/Portal'
import { useDockSide } from '@/lib/dock'

/** Phone-only slim tab on the screen edge that opens a filter sheet. It tucks into the edge while scrolling down or idle. */
export default function FilterTab({ onOpen, active = false }: { onOpen: () => void; active?: boolean }) {
  const [dock] = useDockSide()
  const [tuck, setTuck] = useState(false)
  useEffect(() => {
    let last = window.scrollY, idle: ReturnType<typeof setTimeout>
    const arm = () => { clearTimeout(idle); idle = setTimeout(() => setTuck(true), 3000) }
    const on = () => { const y = window.scrollY; setTuck(y > last + 6 ? true : y < last - 6 ? false : (t) => t); last = y; arm() }
    window.addEventListener('scroll', on, { passive: true }); arm()
    return () => { window.removeEventListener('scroll', on); clearTimeout(idle) }
  }, [])
  return (
    <Portal>
      <button type="button" onClick={() => { setTuck(false); onOpen() }} aria-label="Mở bộ lọc"
        className={`lg:hidden print:hidden fixed top-[48%] z-30 grid h-28 w-7 place-items-center border border-white/40 bg-gradient-to-b from-blue-500/90 to-blue-700/90 text-white shadow-[0_2px_8px_rgba(37,99,235,.28)] backdrop-blur transition-transform duration-300 active:brightness-90 ${dock === 'left' ? `left-0 rounded-r-full border-l-0 ${tuck ? '-translate-x-3.5' : ''}` : `right-0 rounded-l-full border-r-0 ${tuck ? 'translate-x-3.5' : ''}`}`}>
        <Filter className="h-4 w-4" strokeWidth={2.2} />
        {active && <span className="absolute top-2 h-2 w-2 rounded-full bg-white ring-2 ring-blue-700" />}
      </button>
    </Portal>
  )
}
