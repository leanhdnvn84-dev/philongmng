import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import crypto from 'node:crypto'
import { isProgressPhotoRef, keyPart, progressPhotoKey, r2Configured, r2Delete, r2Get, r2KeyOf, r2List, r2Put, r2Ref, r2Serve, signV4 } from './r2'
import { copyBackupToR2, r2BackupStatus } from './r2Backup'

const ENV = { R2_ACCOUNT_ID: 'acc123', R2_ACCESS_KEY_ID: 'AKID', R2_SECRET_ACCESS_KEY: 'secret', R2_BUCKET: 'philong' }
const empty = crypto.createHash('sha256').update('').digest('hex')

describe('signV4 (AWS published S3 examples)', () => {
  const base = { host: 'examplebucket.s3.amazonaws.com', amzDate: '20130524T000000Z', region: 'us-east-1', keyId: 'AKIAIOSFODNN7EXAMPLE', secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', payloadHash: empty }
  it('GET object', () => {
    const { authorization } = signV4({ ...base, method: 'GET', path: '/test.txt', headers: { range: 'bytes=0-9', 'x-amz-content-sha256': empty, 'x-amz-date': base.amzDate } })
    expect(authorization).toBe('AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41')
  })
  it('GET bucket (list objects)', () => {
    const { authorization, qs } = signV4({ ...base, method: 'GET', path: '/', query: { prefix: 'J', 'max-keys': '2' }, headers: { 'x-amz-content-sha256': empty, 'x-amz-date': base.amzDate } })
    expect(qs).toBe('max-keys=2&prefix=J')
    expect(authorization.endsWith('Signature=34b48302e7b5fa45bde8084f4b7868a86f0a534bc59db6670ed5711ef69dc6f7')).toBe(true)
  })
})

describe('R2 off (no variables)', () => {
  beforeEach(() => { for (const k of Object.keys(ENV)) vi.stubEnv(k, '') })
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })
  it('is not configured and never calls the network', async () => {
    const f = vi.fn(); vi.stubGlobal('fetch', f)
    expect(r2Configured()).toBe(false)
    expect(await copyBackupToR2('a.json.gz', new Uint8Array([1]), 'application/gzip')).toBeNull()
    expect(await r2BackupStatus()).toEqual({ bat: false })
    await expect(r2Put('x', new Uint8Array())).rejects.toThrow(/Chưa cấu hình/)
    expect(f).not.toHaveBeenCalled()
  })
  it('needs all four variables', () => {
    vi.stubEnv('R2_ACCOUNT_ID', 'a'); vi.stubEnv('R2_ACCESS_KEY_ID', 'b'); vi.stubEnv('R2_SECRET_ACCESS_KEY', 'c')
    expect(r2Configured()).toBe(false)
    vi.stubEnv('R2_BUCKET', 'd')
    expect(r2Configured()).toBe(true)
  })
})

describe('R2 on (fake fetch)', () => {
  let store: Map<string, { body: Uint8Array; type: string; t: string }>
  let calls: { method: string; url: URL; headers: Headers }[]
  let tick = 0
  beforeEach(() => {
    for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v)
    store = new Map(); calls = []; tick = 0
    vi.stubGlobal('fetch', vi.fn(async (u: string, init: RequestInit) => {
      const url = new URL(u), method = init.method ?? 'GET', headers = new Headers(init.headers)
      calls.push({ method, url, headers })
      if (url.host !== 'acc123.r2.cloudflarestorage.com' || !headers.get('authorization')?.startsWith('AWS4-HMAC-SHA256 Credential=AKID/')) return new Response('<Error><Code>AccessDenied</Code></Error>', { status: 403 })
      const key = decodeURIComponent(url.pathname.replace(/^\/philong\/?/, ''))
      if (method === 'PUT') {
        const body = new Uint8Array(init.body as Uint8Array)
        if (headers.get('x-amz-content-sha256') !== crypto.createHash('sha256').update(body).digest('hex')) return new Response('', { status: 400 })
        store.set(key, { body, type: headers.get('content-type') ?? '', t: new Date(Date.UTC(2026, 0, 1, 0, 0, tick++)).toISOString() }); return new Response('', { status: 200 })
      }
      if (method === 'DELETE') { store.delete(key); return new Response(null, { status: 204 }) }
      if (url.searchParams.get('list-type') === '2') {
        const pre = url.searchParams.get('prefix') ?? '', start = Number(url.searchParams.get('continuation-token') ?? 0)
        const keys = [...store.keys()].filter((k) => k.startsWith(pre)).sort(), page = keys.slice(start, start + 3)
        const more = start + 3 < keys.length
        return new Response(`<?xml version="1.0"?><ListBucketResult>${page.map((k) => `<Contents><Key>${k.replace(/&/g, '&amp;')}</Key><LastModified>${store.get(k)!.t}</LastModified><Size>${store.get(k)!.body.length}</Size></Contents>`).join('')}<IsTruncated>${more}</IsTruncated>${more ? `<NextContinuationToken>${start + 3}</NextContinuationToken>` : ''}</ListBucketResult>`)
      }
      const o = store.get(key)
      return o ? new Response(o.body as BodyInit, { headers: { 'content-type': o.type, 'content-length': String(o.body.length) } }) : new Response('<Error><Code>NoSuchKey</Code></Error>', { status: 404 })
    }))
  })
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

  it('put / get / list (paged) / delete', async () => {
    await r2Put('a/b c&d.txt', new TextEncoder().encode('xin chào'), 'text/plain')
    expect(calls[0].url.pathname).toBe('/philong/a/b%20c%26d.txt')
    expect(calls[0].headers.get('x-amz-acl')).toBeNull() // never public
    const g = await r2Get('a/b c&d.txt')
    expect(await g!.text()).toBe('xin chào')
    expect(await r2Get('missing')).toBeNull()
    for (let i = 0; i < 6; i++) await r2Put(`p/${i}`, new Uint8Array([i]))
    const l = await r2List('p/')
    expect(l.map((o) => o.key)).toEqual(['p/0', 'p/1', 'p/2', 'p/3', 'p/4', 'p/5'])
    expect((await r2List('a/'))[0].key).toBe('a/b c&d.txt')
    await r2Delete('p/0')
    expect((await r2List('p/')).length).toBe(5)
  })

  it('reports R2 errors with their code', async () => {
    vi.stubEnv('R2_ACCOUNT_ID', 'wrong')
    await expect(r2Put('x', new Uint8Array([1]))).rejects.toThrow('R2 403 AccessDenied')
  })

  it('backup copies go to a dated folder and only the newest 30 of each kind are kept', async () => {
    for (let i = 0; i < 33; i++) {
      const r = await copyBackupToR2(`philong-sao-luu-SL${String(i).padStart(4, '0')}.json.gz`, new Uint8Array([i]), 'application/gzip')
      expect(r?.ok).toBe(true)
      if (r?.ok) expect(r.key).toMatch(/^sao-luu\/\d{4}-\d{2}-\d{2}\/philong-sao-luu-SL\d{4}\.json\.gz$/)
    }
    await copyBackupToR2('V27.xlsx', new Uint8Array([9]), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    const keys = [...store.keys()]
    expect(keys.filter((k) => k.endsWith('.json.gz')).length).toBe(30)
    expect(keys.some((k) => k.endsWith('SL0000.json.gz'))).toBe(false)
    expect(keys.some((k) => k.endsWith('SL0032.json.gz'))).toBe(true)
    const s = await r2BackupStatus()
    expect(s).toMatchObject({ bat: true, soBan: 30, soV27: 1 })
    if (s.bat) expect(s.moiNhat?.key.endsWith('SL0032.json.gz')).toBe(true)
  })

  it('an R2 failure is returned, never thrown', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network down') }))
    expect(await copyBackupToR2('a.json.gz', new Uint8Array([1]), 'application/gzip')).toEqual({ ok: false, error: 'network down' })
    expect(await r2BackupStatus()).toEqual({ bat: true, loi: 'network down' })
  })

  it('serves files privately: images inline, other types as download, sandboxed', async () => {
    await r2Put('k1', new Uint8Array([1, 2, 3]), 'image/jpeg')
    const r = await r2Serve('k1', 'Ảnh công trình.jpg', 'image/jpeg')
    expect(r.headers.get('content-disposition')).toMatch(/^inline; filename=".*"; filename\*=UTF-8''%E1%BA%A2nh%20c%C3%B4ng%20tr%C3%ACnh\.jpg$/)
    expect(r.headers.get('content-security-policy')).toContain('sandbox')
    expect(r.headers.get('cache-control')).toContain('private')
    expect(new Uint8Array(await r.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]))
    await r2Put('k2', new TextEncoder().encode('<svg/>'), 'image/svg+xml')
    expect((await r2Serve('k2', 'x.svg', 'image/svg+xml')).headers.get('content-disposition')).toMatch(/^attachment/)
    expect((await r2Serve('nope', 'x', null)).status).toBe(404)
  })
})

describe('file references', () => {
  it('tells R2 objects from Google Drive ids', () => {
    expect(r2KeyOf(r2Ref('tep-dinh-kem/x/1/a.pdf'))).toBe('tep-dinh-kem/x/1/a.pdf')
    expect(r2KeyOf('1AQKcVuQJGOdT-Mryqsl6JdhlgC0Nsmw2')).toBeNull()
    expect(r2KeyOf(null)).toBeNull()
  })
  it('makes ASCII key parts', () => {
    expect(keyPart('Biên bản nghiệm thu (đợt 1).pdf')).toBe('Bien_ban_nghiem_thu_dot_1_.pdf')
    expect(keyPart('../..')).toBe('tep')
  })
  it('accepts a progress photo only for the record it was uploaded for', () => {
    const ref = r2Ref(progressPhotoKey('cong_viec', 'CV0001'))
    expect(isProgressPhotoRef(ref, 'cong_viec', 'CV0001')).toBe(true)
    expect(isProgressPhotoRef(ref, 'cong_viec', 'CV0002')).toBe(false)
    expect(isProgressPhotoRef(ref, 'cong_viec_hang_ngay', 'CV0001')).toBe(false)
    expect(isProgressPhotoRef('r2/anh-tien-do/cong_viec/CV0001/../../sao-luu/x.jpg', 'cong_viec', 'CV0001')).toBe(false)
    expect(isProgressPhotoRef('r2/tep-dinh-kem/cong_viec/CV0001/1-a.jpg', 'cong_viec', 'CV0001')).toBe(false)
  })
})
