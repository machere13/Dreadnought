import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ReorderProbe } from './ReorderProbe.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <h1>Reorder core probe</h1>
    <ReorderProbe />
    <button type="button">Outside</button>
  </StrictMode>,
);
