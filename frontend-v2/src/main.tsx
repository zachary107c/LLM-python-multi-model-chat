import ReactDOM from 'react-dom/client';
import * as React from 'react';
import '@/styles/syntax.css';
import '@/styles/output.css';
// import '@/styles/confetti.css';
import { App } from '@/app';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);