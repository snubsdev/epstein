import './App.css'

const documents = [
  {
    category: "Data Sets",
    items: [
      { title: "Data Set 1", url: "https://www.justice.gov/epstein/doj-disclosures/data-set-1-files" },
      { title: "Data Set 2", url: "https://www.justice.gov/epstein/doj-disclosures/data-set-2-files" },
      { title: "Data Set 3", url: "https://www.justice.gov/epstein/doj-disclosures/data-set-3-files" },
      { title: "Data Set 4", url: "https://www.justice.gov/epstein/doj-disclosures/data-set-4-files" },
      { title: "Data Set 5", url: "https://www.justice.gov/epstein/doj-disclosures/data-set-5-files" },
      { title: "Data Set 6", url: "https://www.justice.gov/epstein/doj-disclosures/data-set-6-files" },
      { title: "Data Set 7", url: "https://www.justice.gov/epstein/doj-disclosures/data-set-7-files" },
      { title: "Data Set 8", url: "https://www.justice.gov/epstein/doj-disclosures/data-set-8-files" },
      { title: "Data Set 9", url: "https://www.justice.gov/epstein/doj-disclosures/data-set-9-files" },
      { title: "Data Set 10", url: "https://www.justice.gov/epstein/doj-disclosures/data-set-10-files" },
      { title: "Data Set 11", url: "https://www.justice.gov/epstein/doj-disclosures/data-set-11-files" },
      { title: "Data Set 12", url: "https://www.justice.gov/epstein/doj-disclosures/data-set-12-files" },
    ]
  },
  {
    category: "FOIA Records",
    items: [
      { title: "FBI Documents", url: "https://www.justice.gov/epstein/doj-disclosures/foia-federal-bureau-investigation-fbi" },
      { title: "Florida Records", url: "https://www.justice.gov/epstein/doj-disclosures/foia-florida" },
      { title: "Customs and Border Protection", url: "https://www.justice.gov/epstein/doj-disclosures/foia-customs-and-border-protection-cbp" },
      { title: "Federal Bureau of Prisons", url: "https://www.justice.gov/epstein/doj-disclosures/foia-federal-bureau-prisons-bop" },
    ]
  },
  {
    category: "Court Records",
    items: [
      { title: "United States v. Epstein (SDNY 2019)", url: "https://www.justice.gov/epstein/doj-disclosures/court-records-united-states-v-epstein-no-119-cr-00490-sdny-2019" },
      { title: "United States v. Maxwell", url: "https://www.justice.gov/epstein/doj-disclosures/court-records-united-states-v-maxwell-no-120-cr-00330-sdny-2020" },
      { title: "Ghislaine Maxwell Proffer", url: "https://www.justice.gov/epstein/doj-disclosures/maxwell-proffer" },
    ]
  },
  {
    category: "Other",
    items: [
      { title: "Memoranda & Correspondence", url: "https://www.justice.gov/epstein/doj-disclosures/memoranda-and-correspondence" },
      { title: "Full Epstein Library Search", url: "https://www.justice.gov/epstein/search" },
      { title: "House Oversight Committee Records", url: "https://oversight.house.gov/release/oversight-committee-releases-epstein-records-provided-by-the-department-of-justice/" },
    ]
  }
]

function App() {
  return (
    <div className="container">
      <header>
        <span className="badge">Public Records</span>
        <h1>DOJ Epstein Files</h1>
        <p className="subtitle">Department of Justice Disclosures • 3.5M+ Pages Released</p>
      </header>
      
      <main>
        {documents.map((section, idx) => (
          <section key={idx}>
            <h3 className="section-title">{section.category}</h3>
            <div className="documents-grid">
              {section.items.map((doc, docIdx) => (
                <a 
                  key={docIdx} 
                  href={doc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="document-card"
                >
                  <h2>{doc.title}</h2>
                  <span className="link-text">View Documents →</span>
                </a>
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer>
        <p>Public records released pursuant to the <a href="https://www.congress.gov/bill/118th-congress/house-bill/4405" target="_blank" rel="noopener">Epstein Files Transparency Act (H.R. 4405)</a></p>
        <p className="source">Source: <a href="https://www.justice.gov/epstein" target="_blank">justice.gov/epstein</a></p>
      </footer>
    </div>
  )
}

export default App
