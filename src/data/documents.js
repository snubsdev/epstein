function makeDataset(id) {
  return {
    title: `Data Set ${id}`,
    slug: String(id),
    path: `/datasets/${id}`,
    url: `https://www.justice.gov/epstein/doj-disclosures/data-set-${id}-files`,
  }
}

function makeRecord(title, slug) {
  return {
    title,
    slug,
    path: `/records/${slug}`,
    url: `https://www.justice.gov/epstein/doj-disclosures/${slug}`,
  }
}

export const documents = [
  {
    category: 'Data Sets',
    key: 'datasets',
    items: [
      makeDataset(1),
      makeDataset(2),
      makeDataset(3),
      makeDataset(4),
      makeDataset(5),
      makeDataset(6),
      makeDataset(7),
      makeDataset(8),
      makeDataset(9),
      makeDataset(10),
      makeDataset(11),
      makeDataset(12),
    ],
  },
  {
    category: 'FOIA Records',
    key: 'foia',
    items: [
      makeRecord('FBI Documents', 'foia-federal-bureau-investigation-fbi'),
      makeRecord('Florida Records', 'foia-florida'),
      makeRecord('Customs and Border Protection', 'foia-customs-and-border-protection-cbp'),
      makeRecord('Federal Bureau of Prisons', 'foia-federal-bureau-prisons-bop'),
    ],
  },
  {
    category: 'Court Records',
    key: 'court',
    items: [
      makeRecord('United States v. Epstein (SDNY 2019)', 'court-records-united-states-v-epstein-no-119-cr-00490-sdny-2019'),
      makeRecord('United States v. Maxwell', 'court-records-united-states-v-maxwell-no-120-cr-00330-sdny-2020'),
      makeRecord('Ghislaine Maxwell Proffer', 'maxwell-proffer'),
    ],
  },
  {
    category: 'Other',
    key: 'other',
    items: [
      makeRecord('Memoranda & Correspondence', 'memoranda-and-correspondence'),
      { title: 'Full Epstein Library Search', url: 'https://www.justice.gov/epstein/search' },
      { title: 'House Oversight Committee Records', url: 'https://oversight.house.gov/release/oversight-committee-releases-epstein-records-provided-by-the-department-of-justice/' },
    ],
  },
]

const collectionIndex = new Map(
  documents
    .flatMap(section => section.items)
    .filter(item => item.path)
    .map(item => [item.path, item])
)

export function getCollection(routeType, slug) {
  return collectionIndex.get(`/${routeType}/${slug}`) || null
}
