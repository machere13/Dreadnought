import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DialogProbe } from './DialogProbe.tsx';

createRoot(document.getElementById('root')!).render(<StrictMode>
  <h1>Dialog core probe</h1>
  <p>Initial focus, Tab / Shift+Tab, Escape, close and reopen.</p>
  <button type="button">Outside before</button>
  <DialogProbe />
  <button type="button">Outside after</button>
</StrictMode>);
