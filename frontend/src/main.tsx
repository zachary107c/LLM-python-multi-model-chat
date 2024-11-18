import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "@/styles/output.css";
import "@/styles/syntax.css";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatPage from "@/pages/chat.tsx";
import ModelsPage from "./pages/models.tsx";
import LoginPage from "@/pages/login";
import CreateAccountPage from "./pages/create-account.tsx";
import ProtectedRoute from "@/components/navigation/protected-route";
import ProfilePage from "./pages/profile.tsx";
import SettingsPage from "./pages/settings.tsx";
import { UserSettingsProvider } from "./components/userSettings/user-settings-provider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools />
    <Theme grayColor="slate" accentColor="gray" panelBackground="translucent">
      <React.StrictMode>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<CreateAccountPage />} />
            <Route
              path="/"
              element={
                <UserSettingsProvider>
                  <App />
                </UserSettingsProvider>
              }
            >
              <Route
                index
                element={
                  <ProtectedRoute>
                    <UserSettingsProvider>
                      <ChatPage />
                    </UserSettingsProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/models"
                element={
                  <ProtectedRoute>
                    <UserSettingsProvider>
                      <ModelsPage />
                    </UserSettingsProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserSettingsProvider>
                      <ProfilePage />
                    </UserSettingsProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <UserSettingsProvider>
                      <SettingsPage />
                    </UserSettingsProvider>
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </React.StrictMode>{" "}
    </Theme>
  </QueryClientProvider>
);
