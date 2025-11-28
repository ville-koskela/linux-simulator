import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './App.tsx';
import {
  SettingsProvider,
  TranslationsProvider,
  WindowProvider,
} from './contexts';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <SettingsProvider>
      <TranslationsProvider>
        <WindowProvider>
          <App />
        </WindowProvider>
      </TranslationsProvider>
    </SettingsProvider>
  </StrictMode>
);
