import { useEffect, useState } from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import reactQueryClient from "./api/query-client";

import { RegistrationScreen } from "../pages/registration-screen";
import { CodeConfirmationScreen } from "../pages/code-confirmation-screen";
import { ApplicationScreen } from "../pages/applications-screen";
import { ArchiveScreen } from "../pages/archive-screen";
import { ProfileScreen } from "../pages/profile-screen";

//admin
import { AdminLogin } from "../pages/admin-login-screen";
import { AdminApplicationScreen } from "../pages/admin-applications-screen";
import { AdminArchiveScreen } from "../pages/admin-archive-screen";
import { AdminCreateApplication } from "../pages/admin-create-application";
import { AdminProfileScreen } from "../pages/admin-profile-screen";

import { LoaderScreen } from "../pages/loader-screen";

// Layouts
import { MainLayout } from "./layout/main-layout";
import { AuthLayout } from "./layout/auth-layout";

// Auth Hook
import { useAuthData } from "../entities/auth-user/api/use-auth-data";

// Styles
import "./styles/global.css";
import "./styles/fonts.css";

function App() {
  const [loading, setLoading] = useState(true);
  const { token, loadToken } = useAuthData();

  useEffect(() => {
    loadToken()
  }, [])

  useEffect(() => {
    if (token) {
      reactQueryClient.refetchQueries()
    } else {
      reactQueryClient.resetQueries()
      reactQueryClient.clear()
    }
  }, [token])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoaderScreen />;
  }

  let isAdmin = true;

  return (
    <QueryClientProvider client={reactQueryClient}>
      <BrowserRouter>
        <Routes>
          {token ? (
            isAdmin ? (
              <>
                <Route path="/admin/profile" element={<MainLayout isAdmin><AdminProfileScreen /></MainLayout>} />
                <Route path="/admin/create-application" element={<MainLayout isBottomPanel={false}><AdminCreateApplication /></MainLayout>} />
                <Route path="/admin/archive" element={<MainLayout isAdmin><AdminArchiveScreen /></MainLayout>} />
                <Route path="/admin/application" element={<MainLayout isAdmin isCreateApplication><AdminApplicationScreen /></MainLayout>} />
                <Route path="*" element={<Navigate to="/admin/application" replace />} />
              </>
            ) : (
              <>
                <Route path="/application" element={<MainLayout><ApplicationScreen /></MainLayout>} />
                <Route path="/archive" element={<MainLayout><ArchiveScreen /></MainLayout>} />
                <Route path="/profile" element={<MainLayout><ProfileScreen /></MainLayout>} />
                <Route path="*" element={<Navigate to="/application" replace />} />
              </>
            )
          ) : (
            <>
              <Route path="/admin" element={<AuthLayout><AdminLogin /></AuthLayout>} />
              <Route path="/" element={<AuthLayout><RegistrationScreen /></AuthLayout>} />
              <Route path="/code-confirmation" element={<AuthLayout><CodeConfirmationScreen /></AuthLayout>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;