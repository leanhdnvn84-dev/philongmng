// Identical GETs fired within two seconds share one request (a page's panels often ask for the same counts
// while the list reloads). Any save clears it, so nothing stale is shown after a change.
const recent = new Map<string, { at: number; p: Promise<any> }>()
const TTL = 2000

export function dedupeGet<T>(url: string, load: () => Promise<T>): Promise<T> {
  const hit = recent.get(url)
  if (hit && Date.now() - hit.at < TTL) return hit.p as Promise<T>
  const p = load()
  recent.set(url, { at: Date.now(), p })
  p.catch(() => recent.delete(url))
  if (recent.size > 200) for (const [k, v] of Array.from(recent)) if (Date.now() - v.at > TTL) recent.delete(k)
  return p
}
export const clearDedupe = () => recent.clear()
