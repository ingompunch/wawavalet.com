// Safeguard to prevent and ignore browser extension (MetaMask, Rabby, etc.) injection conflict errors on 'window.ethereum'
try {
  if (typeof window !== 'undefined') {
    // 1. Listen for and ignore the specific browser extension TypeError
    window.addEventListener('error', (event) => {
      const msg = event.message || '';
      if (msg.includes('ethereum') || msg.includes('Cannot redefine property: ethereum')) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }, true);

    window.addEventListener('unhandledrejection', (event) => {
      const reasonMsg = (event.reason && event.reason.message) || '';
      if (reasonMsg.includes('ethereum') || reasonMsg.includes('Cannot redefine property: ethereum')) {
        event.preventDefault();
      }
    });

    // 2. Pre-define window.ethereum as configurable so extension scripts can safely redefine/override it
    try {
      const desc = Object.getOwnPropertyDescriptor(window, 'ethereum');
      if (!desc || desc.configurable) {
        let ethInstance = (window as any).ethereum;
        Object.defineProperty(window, 'ethereum', {
          get() {
            return ethInstance;
          },
          set(val) {
            ethInstance = val;
          },
          configurable: true,
          enumerable: true,
        });
      }
    } catch (e) {
      // Suppress property definition failures
    }
  }
} catch (err) {
  // Suppress any errors that could occur during property definition
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
