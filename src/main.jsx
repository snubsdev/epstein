import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './styles/theme.css'
import './styles/util.css'
import App from './App.jsx'
import Viewer from './routes/Viewer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/viewer" element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
