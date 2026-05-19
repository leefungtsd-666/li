import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

// Crepe styles must come before custom styles to avoid specificity conflicts
import '@milkdown/crepe/theme/common/style.css';
import '@milkdown/crepe/theme/frame.css';

import './styles/global.css';
import './styles/theme.css';
import './styles/editor.css';
import './styles/editor-toolbar.css';
import './styles/editor-find.css';
import './styles/editor-focus.css';
import './styles/titlebar.css';
import './styles/outline.css';
import './styles/writing.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
