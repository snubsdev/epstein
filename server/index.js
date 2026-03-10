import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { request } from 'undici'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8787
const DIST = path.join(__dirname, '..', 'dist')
const ALLOWED_HOSTS = new Set(['www.justice.gov'])

// Serve static frontend
app.use(express.static(DIST, { maxAge: '1h', index: false }))

// Healthcheck for Railway
app.get('/healthz', (_req, res) => {
  res.status(200).send('ok')
})

// Tiny PDF proxy with strict allowlist and streaming
app.get('/proxy/pdf', async (req, res) => {
  try {
    const raw = req.query.url
    if (!raw) return res.status(400).send('Missing url')

    let u
    try {
      u = new URL(raw)
    } catch {
      return res.status(400).send('Invalid url')
    }

    if (u.protocol !== 'https:') return res.status(400).send('Only https allowed')
    if (!ALLOWED_HOSTS.has(u.hostname)) return res.status(400).send('Host not allowed')

    // Follow up to 5 redirects manually, ensuring host stays allowed.
    let current = u
    let hops = 0
    let finalResp
    while (hops <= 5) {
      const resp = await request(current.toString(), {
        method: 'GET',
        headers: {
          // Bypass DOJ age gate (client sets this cookie on their domain)
          // See DOJ script: cookieName 'justiceGovAgeVerified' = true
          'cookie': 'justiceGovAgeVerified=true',
          'accept': 'application/pdf,application/octet-stream;q=0.9,*/*;q=0.8',
          'user-agent': 'Mozilla/5.0 (compatible; jepste.in-pdf-proxy/1.0)'
        },
        maxRedirections: 0
      })

      const status = resp.statusCode
      if (status >= 300 && status < 400) {
        const loc = resp.headers.location
        if (!loc) return res.status(502).send('Redirect without Location')
        const next = new URL(loc, current)
        if (next.protocol !== 'https:' || !ALLOWED_HOSTS.has(next.hostname)) {
          return res.status(400).send('Redirected host not allowed')
        }
        current = next
        hops++
        // drain body on redirect to free socket
        try { await resp.body.cancel() } catch {}
        continue
      }

      if (status >= 400) return res.status(502).send(`Upstream ${status}`)
      finalResp = resp
      break
    }

    if (!finalResp) return res.status(502).send('Too many redirects')

    const ct = String(finalResp.headers['content-type'] || '').toLowerCase()
    if (!ct.includes('pdf') && !current.pathname.toLowerCase().endsWith('.pdf')) {
      return res.status(415).send('Not a PDF')
    }

    res.setHeader('Content-Type', finalResp.headers['content-type'] || 'application/pdf')
    if (finalResp.headers.etag) res.setHeader('ETag', finalResp.headers.etag)
    if (finalResp.headers['last-modified']) res.setHeader('Last-Modified', finalResp.headers['last-modified'])
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'no-referrer')

    finalResp.body.pipe(res)
  } catch (e) {
    res.status(502).send('Proxy error')
  }
})

// SPA fallback: serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`)
})
