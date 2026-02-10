import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TailwindTest from './TailwindTest.jsx'

// Toggle this to test Tailwind CSS installation
const SHOW_TAILWIND_TEST = false;

createRoot(document.getElementById('root')).render(
  SHOW_TAILWIND_TEST ? <TailwindTest /> : <App />
)












