import styles from './Section.module.css'
import DocumentCard from './DocumentCard'

export default function Section({ section }) {
  if (!section.items.length) return null
  return (
    <section className={styles.section} id={section.key}>
      <h3 className={styles.title}>{section.category} · {section.items.length}</h3>
      <div className={styles.grid + ' reveal-stagger'}>
        {section.items.map((doc) => (
          <DocumentCard key={doc.url} doc={doc} />
        ))}
      </div>
    </section>
  )
}
