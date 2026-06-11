import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './u1_logic_viz.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
