import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@/styles/output.css'
import '@/styles/syntax.css'
import '@radix-ui/themes/styles.css'
import { Theme } from "@radix-ui/themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from '@/pages/home';
import SettingsPage from '@/pages/settings';
import LoginPage from "@/pages/login";
import CreateAccountPage from './pages/create-account.tsx'
import ProtectedRoute from '@/components/navigation/protected-route';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Theme grayColor='slate' accentColor='gray' panelBackground='translucent'>
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<CreateAccountPage />} />
          <Route path="/" element={<App />}>
            <Route index element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  </Theme>
)