import { useEffect, useRef, useState } from 'react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import styles from './Viewer.module.css'

GlobalWorkerOptions.workerSrc = workerSrc

export default function Viewer() {
  const params = new URLSearchParams(location.search)
  const src = params.get('src')
  const [pdf, setPdf] = useState(null)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(0)
  const [scale, setScale] = useState(1)
  const [error, setError] = useState('')
  const canvasRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        setError('')
        // Avoid double-encoding: src comes decoded from URLSearchParams
        // and may already contain %20 etc. Pass it through as-is.
        const url = `/proxy/pdf?url=${src}`
        const doc = await getDocument(url).promise
        if (!cancelled) { setPdf(doc); setPages(doc.numPages); setPage(1) }
      } catch (e) {
        if (!cancelled) setError('Could not load PDF via proxy. You can open it on justice.gov instead.')
      }
    })()
    return () => { cancelled = true }
  }, [src])

  useEffect(() => {
    if (!pdf) return
    ;(async () => {
      const p = await pdf.getPage(page)
      const viewport = p.getViewport({ scale })
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      await p.render({ canvasContext: ctx, viewport }).promise
    })()
  }, [pdf, page, scale])

  const openOriginal = () => window.open(src, '_blank', 'noopener')

  return (
    <div className={styles.viewer}>
      <div className={styles.toolbar + ' container'}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Prev</button>
        <span className={styles.info}>{page} / {pages || '…'}</span>
        <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={!pages || page >= pages}>Next</button>
        <span className={styles.sep} />
        <button onClick={() => setScale(s => Math.max(0.5, +(s - 0.1).toFixed(2)))}>-</button>
        <button onClick={() => setScale(s => Math.min(3, +(s + 0.1).toFixed(2)))}>+</button>
        <button onClick={() => setScale(1)}>Fit</button>
        <span className={styles.flex} />
        <button onClick={openOriginal}>Open on justice.gov</button>
      </div>
      {error ? (
        <div className={styles.error + ' container'}>
          <p>{error}</p>
          <p><a onClick={openOriginal} href={src} target="_blank" rel="noopener noreferrer">Open original PDF</a></p>
        </div>
      ) : (
        <div className={styles.stage + ' container'}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>
      )}
    </div>
  )
}
