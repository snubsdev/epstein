import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import styles from './UtilityBar.module.css'

export default function UtilityBar({ data, onFilter }) {
  const params = new URLSearchParams(location.search)
  const [q, setQ] = useState(params.get('q') || '')
  const [cat, setCat] = useState(params.get('cat') || 'all')

  const fuse = useMemo(() => new Fuse(
    data.flatMap(s => s.items.map(i => ({ ...i, category: s.category, key: s.key }))),
    { keys: ['title', 'category'], threshold: 0.3 }
  ), [data])

  useEffect(() => {
    const next = new URLSearchParams(location.search)
    if (q) next.set('q', q); else next.delete('q')
    if (cat && cat !== 'all') next.set('cat', cat); else next.delete('cat')
    const url = `${location.pathname}?${next.toString()}`.replace(/\?$/, '')
    history.replaceState(null, '', url)

    let results = data
    if (cat && cat !== 'all') results = data.filter(s => s.key === cat)
    if (q.trim()) {
      const hits = fuse.search(q.trim()).map(x => x.item.url)
      results = results.map(s => ({ ...s, items: s.items.filter(i => hits.includes(i.url)) }))
    }
    onFilter(results)
  }, [q, cat, data])

  return (
    <div className={styles.bar}>
      <div className={styles.inner + ' container'}>
        <label className="sr-only" htmlFor="q">Search</label>
        <input id="q" className={styles.input} value={q} onChange={e => setQ(e.target.value)} placeholder="Search titles…" />
        <div className={styles.filters}>
          {['all','datasets','foia','court','other'].map(k => (
            <button key={k} className={styles.filter + ' ' + (cat===k?styles.active:'')}
              onClick={() => setCat(k)} aria-pressed={cat===k}>{k==='all'?'All':k.replace(/^./,c=>c.toUpperCase())}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
