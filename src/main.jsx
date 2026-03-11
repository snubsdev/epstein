import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './styles/theme.css'
import './styles/util.css'
import App from './App.jsx'
import AgeGate from './components/AgeGate.jsx'
import Collection from './routes/Collection.jsx'
import Viewer from './routes/Viewer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AgeGate><App /></AgeGate>} />
        <Route path="/datasets/:slug" element={<AgeGate><Collection /></AgeGate>} />
        <Route path="/records/:slug" element={<AgeGate><Collection /></AgeGate>} />
        <Route path="/viewer" element={<AgeGate><Viewer /></AgeGate>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
