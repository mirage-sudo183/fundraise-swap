import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Storage is handled by api/client.ts with fallback to memory

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
