import styles from './HeaderHero.module.css'

export default function HeaderHero() {
  return (
    <header className={styles.header}>
      <div className="container">
        <span className="badge">Public Records</span>
        <h1 className={styles.title}>DOJ Epstein Files</h1>
        <p className={styles.subtitle}>Department of Justice Disclosures • 3.5M+ pages released</p>
      </div>
    </header>
  )
}
