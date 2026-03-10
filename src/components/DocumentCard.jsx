import { Link } from 'react-router-dom'
import styles from './DocumentCard.module.css'

function isPdfUrl(url) {
  return /\.pdf($|\?)/i.test(url)
}

export default function DocumentCard({ doc }) {
  const canView = isPdfUrl(doc.url)
  const to = canView ? `/viewer?src=${encodeURIComponent(doc.url)}` : doc.url
  const props = canView
    ? { to }
    : { as: 'a', href: to, target: '_blank', rel: 'noopener noreferrer' }

  // If it's not a PDF, we link out; if it is, we push to on-site viewer
  return (
    <div className={styles.card}>
      {canView ? (
        <Link className={styles.link + ' focus-ring'} to={to}>
          <h2 className={styles.h2}>{doc.title}</h2>
          <span className={styles.cta}>Open →</span>
        </Link>
      ) : (
        <a className={styles.link + ' focus-ring'} href={to} target="_blank" rel="noopener noreferrer">
          <h2 className={styles.h2}>{doc.title}</h2>
          <span className={styles.cta}>View on justice.gov →</span>
        </a>
      )}
    </div>
  )
}
