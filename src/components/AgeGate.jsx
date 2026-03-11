import { useEffect, useRef, useState } from 'react'
import styles from './AgeGate.module.css'

export default function AgeGate({ children }) {
  const [ok, setOk] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('epf_age_verified') === 'true'
  })
  const firstBtn = useRef(null)

  useEffect(() => {
    if (!ok) setTimeout(() => firstBtn.current?.focus(), 0)
  }, [ok])

  if (ok) return children

  return (
    <div className={styles.wrap} role="dialog" aria-modal="true" aria-labelledby="age-title">
      <div className={styles.modal}>
        <h2 id="age-title">Are you 18 or older?</h2>
        <p>This site links to official DOJ records which may include sensitive content.</p>
        <div className={styles.actions}>
          <button ref={firstBtn} className={styles.primary}
            onClick={() => { localStorage.setItem('epf_age_verified', 'true'); setOk(true) }}>Yes, continue</button>
          <a className={styles.secondary} href="https://www.justice.gov/epstein">Go to justice.gov</a>
        </div>
      </div>
    </div>
  )
}
