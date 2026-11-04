'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/** Renders overlays at <body> so no ancestor (sticky header with backdrop-filter, transforms…) can clip or offset them. */
export default function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted ? createPortal(children, document.body) : null
}
