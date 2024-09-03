import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@/styles/output.css'
import '@/styles/syntax.css'
import '@radix-ui/themes/styles.css'
import { Theme } from "@radix-ui/themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from '@/pages/home';
import SettingsPage from '@/pages/settings'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <Theme grayColor='slate' accentColor='gray' panelBackground='translucent'>
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  </Theme>
)