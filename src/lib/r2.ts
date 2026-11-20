import 'server-only'
import crypto from 'node:crypto'

/**
 * Cloudflare R2 (S3-compatible) storage, OFF until the four variables below are set in Vercel:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
 * Requests are signed with AWS Signature V4 using node:crypto (no SDK). Objects are never made public:
 * the bucket stays private and files are only served back through API routes that check permissions.
 */

type Cfg = { account: string; keyId: string; secret: string; bucket: string }

function cfg(): Cfg | null {
  const account = process.env.R2_ACCOUNT_ID?.trim(), keyId = process.env.R2_ACCESS_KEY_ID?.trim()
  const secret = process.env.R2_SECRET_ACCESS_KEY?.trim(), bucket = process.env.R2_BUCKET?.trim()
  return account && keyId && secret && bucket ? { account, keyId, secret, bucket } : null
}

export const r2Configured = () => cfg() !== null

/** Stored in file_id columns for objects kept in R2 ("r2/<key>"). Google Drive ids never contain "/". */
export const r2Ref = (key: string) => `r2/${key}`
export const r2KeyOf = (fileId: string | null | undefined) => (fileId && fileId.startsWith('r2/') ? fileId.slice(3) : null)

/** ASCII-only, safe piece of an object key (the original name is kept in the database). */
export const keyPart = (s: string, max = 80) =>
  (s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^[._]+/, '').slice(0, max)) || 'tep'

/** Progress photos: anh-tien-do/<bang>/<id>/<time>-<random>.jpg (the shape is checked again when the photo is linked). */
export const progressPhotoKey = (bang: string, id: string) =>
  `anh-tien-do/${bang}/${id}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`
export const isProgressPhotoRef = (fileId: string, bang: string, id: string) => {
  const key = r2KeyOf(fileId), pre = `anh-tien-do/${bang}/${id}/`
  return !!key && key.startsWith(pre) && /^\d{10,16}-[0-9a-f]{8}\.jpg$/.test(key.slice(pre.length))
}

const enc = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
const sha256 = (d: string | Uint8Array) => crypto.createHash('sha256').update(d).digest('hex')
const hmac = (k: crypto.BinaryLike, d: string) => crypto.createHmac('sha256', k).update(d).digest()

/** AWS Signature V4 "Authorization" header value (exported for the unit test against AWS's published examples). */
export function signV4(r: { method: string; host: string; path: string; query?: Record<string, string>; headers: Record<string, string>;
  payloadHash: string; amzDate: string; region: string; keyId: string; secret: string }) {
  const day = r.amzDate.slice(0, 8)
  const qs = Object.entries(r.query ?? {}).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, v]) => `${enc(k)}=${enc(v)}`).join('&')
  const h: Record<string, string> = {}
  for (const [k, v] of Object.entries({ host: r.host, ...r.headers })) h[k.toLowerCase()] = String(v).trim()
  const names = Object.keys(h).sort()
  const canonical = [r.method, r.path, qs, names.map((n) => `${n}:${h[n]}\n`).join(''), names.join(';'), r.payloadHash].join('\n')
  const scope = `${day}/${r.region}/s3/aws4_request`
  const toSign = ['AWS4-HMAC-SHA256', r.amzDate, scope, sha256(canonical)].join('\n')
  const kSign = hmac(hmac(hmac(hmac('AWS4' + r.secret, day), r.region), 's3'), 'aws4_request')
  const sig = crypto.createHmac('sha256', kSign).update(toSign).digest('hex')
  return { qs, authorization: `AWS4-HMAC-SHA256 Credential=${r.keyId}/${scope}, SignedHeaders=${names.join(';')}, Signature=${sig}` }
}

async function call(method: 'GET' | 'PUT' | 'DELETE', key: string, opts: { query?: Record<string, string>; body?: Uint8Array; type?: string; timeout?: number } = {}) {
  const c = cfg()
  if (!c) throw new Error('Chưa cấu hình Cloudflare R2')
  const host = `${c.account}.r2.cloudflarestorage.com`
  const path = '/' + enc(c.bucket) + (key ? '/' + key.split('/').map(enc).join('/') : '')
  const amzDate = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const payloadHash = sha256(opts.body ?? '')
  const headers: Record<string, string> = { 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate }
  if (opts.type) headers['content-type'] = opts.type
  const { qs, authorization } = signV4({ method, host, path, query: opts.query, headers, payloadHash, amzDate, region: 'auto', keyId: c.keyId, secret: c.secret })
  return fetch(`https://${host}${path}${qs ? '?' + qs : ''}`, {
    method, body: opts.body as BodyInit | undefined, cache: 'no-store',
    headers: { ...headers, authorization }, signal: AbortSignal.timeout(opts.timeout ?? 30000),
  })
}

async function failText(res: Response) {
  const t = await res.text().catch(() => '')
  const code = /<Code>([^<]+)<\/Code>/.exec(t)?.[1]
  return `R2 ${res.status}${code ? ' ' + code : ''}`
}

export async function r2Put(key: string, body: Uint8Array, type = 'application/octet-stream') {
  const res = await call('PUT', key, { body, type, timeout: 45000 })
  if (!res.ok) throw new Error(await failText(res))
}

/** The object as a fetch Response (stream it back), or null if it does not exist. */
export async function r2Get(key: string): Promise<Response | null> {
  const res = await call('GET', key)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(await failText(res))
  return res
}

export async function r2Delete(key: string) {
  const res = await call('DELETE', key)
  if (!res.ok && res.status !== 404) throw new Error(await failText(res))
}

export type R2Object = { key: string; size: number; lastModified: string }
const unxml = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')

export async function r2List(prefix: string, limit = 5000): Promise<R2Object[]> {
  const out: R2Object[] = []
  let token: string | null = null
  do {
    const query: Record<string, string> = { 'list-type': '2', prefix, 'max-keys': '1000' }
    if (token) query['continuation-token'] = token
    const res = await call('GET', '', { query })
    if (!res.ok) throw new Error(await failText(res))
    const xml = await res.text()
    for (const m of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const pick = (t: string) => new RegExp(`<${t}>([\\s\\S]*?)</${t}>`).exec(m[1])?.[1] ?? ''
      out.push({ key: unxml(pick('Key')), size: Number(pick('Size')) || 0, lastModified: pick('LastModified') })
    }
    token = /<IsTruncated>true<\/IsTruncated>/.test(xml) ? unxml(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/.exec(xml)?.[1] ?? '') || null : null
  } while (token && out.length < limit)
  return out
}

/** Serves an R2 object back to a signed-in user who passed the permission check (never a public link). */
export async function r2Serve(key: string, name: string, mime: string | null) {
  const obj = await r2Get(key)
  if (!obj) return new Response(JSON.stringify({ success: false, error: 'Không tìm thấy tệp trong kho lưu trữ' }), { status: 404, headers: { 'Content-Type': 'application/json' } })
  const type = mime || obj.headers.get('content-type') || 'application/octet-stream'
  // only raster images and PDF open in the browser; anything else (svg, office, text…) downloads
  const inline = /^(image\/(jpeg|png|webp|gif)|application\/pdf)$/.test(type)
  const ascii = name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_')
  const h = new Headers({
    'Content-Type': type, 'Cache-Control': 'private, max-age=3600', 'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "sandbox; default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'",
    'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${ascii}"; filename*=UTF-8''${enc(name)}`,
  })
  const len = obj.headers.get('content-length'); if (len) h.set('Content-Length', len)
  return new Response(obj.body, { headers: h })
}
