import express from 'express'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { request } from 'undici'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8787
const DIST = path.join(__dirname, '..', 'dist')
const ALLOWED_HOSTS = new Set(['www.justice.gov', 'www.tescoinsurance.com'])
const ALLOWED_PREFIX = '/'

// Serve static frontend
app.use(express.static(DIST, { maxAge: '1h', index: false }))

// Healthcheck for Railway
app.get('/healthz', (_req, res) => {
  res.status(200).send('ok')
})

function parseJusticeUrl(raw) {
  const input = Array.isArray(raw) ? raw[0] : raw
  if (!input) return { error: 'Missing url' }

  let url
  try {
    url = new URL(input)
  } catch {
    return { error: 'Invalid url' }
  }

  if (url.protocol !== 'https:') return { error: 'Only https allowed' }
  if (!ALLOWED_HOSTS.has(url.hostname)) return { error: 'Host not allowed' }
  if (!url.pathname.startsWith(ALLOWED_PREFIX)) return { error: 'Path not allowed' }

  return { url }
}

async function fetchJusticeResource(url, accept) {
  let current = url
  let hops = 0
  let finalResp

  while (hops <= 5) {
    const resp = await request(current.toString(), {
      method: 'GET',
      headers: {
        cookie: 'justiceGovAgeVerified=true',
        accept,
        'user-agent': 'Mozilla/5.0 (compatible; jepste.in-pdf-proxy/1.0)'
      },
      maxRedirections: 0
    })

    const status = resp.statusCode
    if (status >= 300 && status < 400) {
      const loc = resp.headers.location
      if (!loc) throw new Error('Redirect without Location')

      const next = new URL(loc, current)
      const parsed = parseJusticeUrl(next.toString())
      if (parsed.error) throw new Error(parsed.error)

      current = parsed.url
      hops++
      try { await resp.body.cancel() } catch {
        // Ignore socket cleanup failures on redirects.
      }
      continue
    }

    if (status >= 400) throw new Error(`Upstream ${status}`)

    finalResp = resp
    break
  }

  if (!finalResp) throw new Error('Too many redirects')

  return { current, response: finalResp }
}

function decodeHtml(text) {
  return text.replace(/&(#?\w+);/g, (_match, entity) => {
    switch (entity) {
      case 'amp': return '&'
      case 'quot': return '"'
      case '#39':
      case '#039':
      case 'apos': return "'"
      case 'lt': return '<'
      case 'gt': return '>'
      default: return `&${entity};`
    }
  })
}

function stripTags(text) {
  return decodeHtml(text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractPdfLinks(html, baseUrl) {
  const items = []
  const seen = new Set()
  const re = /<a\b[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi
  let match

  while ((match = re.exec(html))) {
    const href = decodeHtml(match[2])
    if (!/\.pdf(?:$|\?)/i.test(href)) continue

    const url = new URL(href, baseUrl).toString()
    if (!url.startsWith('https://www.justice.gov/epstein/files/')) continue
    if (seen.has(url)) continue

    seen.add(url)
    items.push({
      title: stripTags(match[3]) || decodeURIComponent(url.split('/').pop()),
      url,
    })
  }

  return items
}

function extractPagination(html, currentUrl) {
  const rawPage = Number(currentUrl.searchParams.get('page') || '0')
  const currentPage = Number.isFinite(rawPage) && rawPage >= 0 ? rawPage : 0
  let maxPage = currentPage
  const re = /[?&]page=(\d+)/g
  let match

  while ((match = re.exec(html))) {
    maxPage = Math.max(maxPage, Number(match[1]))
  }

  return {
    page: currentPage,
    totalPages: maxPage + 1,
    hasPrev: currentPage > 0,
    hasNext: currentPage < maxPage,
  }
}

// Tiny PDF proxy with strict allowlist and streaming
app.get('/proxy/pdf', async (req, res) => {
  try {
    const parsed = parseJusticeUrl(req.query.url)
    if (parsed.error) return res.status(400).send(parsed.error)

    const { current, response } = await fetchJusticeResource(
      parsed.url,
      'application/pdf,application/octet-stream;q=0.9,*/*;q=0.8'
    )

    const ct = String(response.headers['content-type'] || '').toLowerCase()
    if (!ct.includes('pdf') && !current.pathname.toLowerCase().endsWith('.pdf')) {
      return res.status(415).send('Not a PDF')
    }

    res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf')
    if (response.headers.etag) res.setHeader('ETag', response.headers.etag)
    if (response.headers['last-modified']) res.setHeader('Last-Modified', response.headers['last-modified'])
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'no-referrer')

    response.body.pipe(res)
  } catch {
    res.status(502).send('Proxy error')
  }
})

app.get('/proxy/list', async (req, res) => {
  try {
    const parsed = parseJusticeUrl(req.query.url)
    if (parsed.error) return res.status(400).send(parsed.error)

    const { current, response } = await fetchJusticeResource(
      parsed.url,
      'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'
    )

    const html = await response.body.text()
    const items = extractPdfLinks(html, current)

    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.json({ items, pagination: extractPagination(html, current) })
  } catch {
    res.status(502).send('List proxy error')
  }
})

// SPA fallback: serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`)
})
