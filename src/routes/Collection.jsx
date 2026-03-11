import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import DocumentCard from '../components/DocumentCard'
import { getCollection } from '../data/documents'
import styles from './Collection.module.css'

function buildSourceUrl(collection, page) {
  const url = new URL(collection.url)
  if (page > 0) url.searchParams.set('page', String(page))
  return url.toString()
}

function getPageNumber(searchParams) {
  const raw = Number(searchParams.get('page') || '0')
  return Number.isFinite(raw) && raw >= 0 ? raw : 0
}

export default function Collection() {
  const params = useParams()
  const routeType = location.pathname.startsWith('/datasets/') ? 'datasets' : 'records'
  const collection = getCollection(routeType, params.slug)
  const [searchParams, setSearchParams] = useSearchParams()
  const page = getPageNumber(searchParams)
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, hasPrev: false, hasNext: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const sourceUrl = useMemo(() => (
    collection ? buildSourceUrl(collection, page) : ''
  ), [collection, page])

  useEffect(() => {
    if (!collection) return

    let cancelled = false

    ;(async () => {
      try {
        setLoading(true)
        setError('')
        const resp = await fetch(`/proxy/list?url=${encodeURIComponent(sourceUrl)}`)
        if (!resp.ok) throw new Error('Could not load files')

        const data = await resp.json()
        if (cancelled) return

        setItems(data.items || [])
        setPagination(data.pagination || { page, totalPages: 1, hasPrev: false, hasNext: false })
      } catch {
        if (!cancelled) setError('Could not load the DOJ file list right now.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [collection, page, sourceUrl])

  if (!collection) {
    return (
      <main className={styles.page}>
        <div className="container">
          <p><Link to="/">Back to library</Link></p>
          <h1 className={styles.title}>Collection not found</h1>
        </div>
      </main>
    )
  }

  function goToPage(nextPage) {
    const next = new URLSearchParams(searchParams)
    if (nextPage > 0) next.set('page', String(nextPage))
    else next.delete('page')
    setSearchParams(next)
  }

  return (
      <main className={styles.page}>
      <div className="container">
        <p className={styles.back}><Link to="/">Back to library</Link></p>
        <div className={styles.hero}>
          <div>
            <p className={styles.kicker}>{routeType === 'datasets' ? 'Data set' : 'Records collection'}</p>
            <h1 className={styles.title}>{collection.title}</h1>
            <p className={styles.meta}>
              Individual PDFs proxied through this site.
              {' '}
              <a href={collection.url} target="_blank" rel="noopener noreferrer">Source page on justice.gov</a>
            </p>
          </div>
          <div className={styles.pageInfo}>
            Page {pagination.page + 1} of {Math.max(1, pagination.totalPages)}
          </div>
        </div>

        {error ? (
          <div className={styles.notice}>{error}</div>
        ) : loading ? (
          <div className={styles.notice}>Loading files...</div>
        ) : (
          <>
            <div className={styles.grid}>
              {items.map((item) => (
                <DocumentCard key={item.url} doc={item} />
              ))}
            </div>

            {!items.length && <div className={styles.notice}>No PDFs were found on this DOJ page.</div>}

            <div className={styles.pagination}>
              <button onClick={() => goToPage(page - 1)} disabled={!pagination.hasPrev}>Prev page</button>
              <button onClick={() => goToPage(page + 1)} disabled={!pagination.hasNext}>Next page</button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
