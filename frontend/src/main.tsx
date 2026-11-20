import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { loadContent } from './content/runtime';
import './index.css';

const root = createRoot(document.getElementById('root')!);

// Apply admin-edited content (articles, FAQs, services, settings, SEO) before the first render so
// visitors never see default text flash into edited text. Falls back to built-in content on any failure.
void loadContent().finally(() =>
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);
