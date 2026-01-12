import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Polyfill for browsers that block localStorage (iOS Safari via IP, private mode, etc.)
const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null,
};

try {
  const storage = window.localStorage;
  if (storage) {
    const test = '__storage_test__';
    storage.setItem(test, test);
    storage.removeItem(test);
  } else {
    throw new Error('localStorage not available');
  }
} catch {
  try {
    Object.defineProperty(window, 'localStorage', { value: noopStorage, writable: true });
    Object.defineProperty(window, 'sessionStorage', { value: noopStorage, writable: true });
  } catch {
    // Can't override, that's ok - our API client has its own fallback
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
