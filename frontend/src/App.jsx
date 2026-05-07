import { Navigate, Route, Routes } from "react-router-dom";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminPollDetailPage from "./pages/AdminPollDetailPage";
import PublicPollPage from "./pages/PublicPollPage";
import LandingPage from "./pages/LandingPage";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("top20_token");
  return token ? children : <Navigate to="/admin/login" replace />;
}

function RedirectIfAuthenticated({ children }) {
  const token = localStorage.getItem("top20_token");
  return token ? <Navigate to="/admin/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RedirectIfAuthenticated>
            <LandingPage />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/admin/login"
        element={
          <RedirectIfAuthenticated>
            <AdminLoginPage />
          </RedirectIfAuthenticated>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute>
            <AdminDashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/polls/:pollId"
        element={
          <PrivateRoute>
            <AdminPollDetailPage />
          </PrivateRoute>
        }
      />
      <Route path="/votacao/:slug" element={<PublicPollPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
