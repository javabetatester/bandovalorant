import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LobbiesProvider } from './context/LobbiesContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LobbiesProvider>
      <App />
    </LobbiesProvider>
  </StrictMode>
);
