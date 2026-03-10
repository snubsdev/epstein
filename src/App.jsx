import './App.css'
import HeaderHero from './components/HeaderHero'
import UtilityBar from './components/UtilityBar'
import Section from './components/Section'
import AgeGate from './components/AgeGate'
import { useMemo, useState } from 'react'
import { documents as base } from './data/documents'

function App() {
  const [filtered, setFiltered] = useState(base)
  const nonEmpty = useMemo(() => filtered.map(s => ({ ...s, items: s.items.slice() })), [filtered])

  return (
    <AgeGate>
      <div className="container">
        <HeaderHero />
      </div>
      <UtilityBar data={base} onFilter={setFiltered} />
      <main>
        <div className="container">
          {nonEmpty.map((section) => (
            <Section key={section.key} section={section} />
          ))}
        </div>
      </main>
      <footer>
        <div className="container" style={{textAlign:'center', padding:'2rem 1rem'}}>
          <p>Public records released pursuant to the <a href="https://www.congress.gov/bill/118th-congress/house-bill/4405" target="_blank" rel="noopener">Epstein Files Transparency Act (H.R. 4405)</a></p>
          <p className="source">Source: <a href="https://www.justice.gov/epstein" target="_blank" rel="noopener">justice.gov/epstein</a></p>
        </div>
      </footer>
    </AgeGate>
  )
}

export default App
