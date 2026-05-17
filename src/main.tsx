import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Crepe styles must come before custom styles to avoid specificity conflicts
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

import './styles/global.css';
import './styles/theme.css';
import './styles/editor.css';
import './styles/titlebar.css';
import './styles/outline.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
