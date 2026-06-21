import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PageLoader from "./components/PageLoader.jsx";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import UserDashboard from "./pages/users/UserDashboard.jsx";
import BoardView from "./pages/users/BoardView.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminBoards from "./pages/admin/AdminBoards.jsx";
import BoardForm from "./pages/admin/BoardForm.jsx";
import MyTasks from './pages/users/MyTask';
import MyProfile from './pages/MyProfile';
import UserBoards from './pages/users/UserBoards.jsx'

function AppRoutes() {
  // Assumes AuthContext exposes { user, isLoading } via useAuth().
  // `user` should be null when logged out, or { ...fields, role } when logged in.
  const { user, isLoading } = useAuth();

  // Don't render any route yet — we don't know if the user is authenticated
  // until the /auth/me check (run inside AuthContext) resolves. Without this,
  // you'd flash the Login page for a split second even when already logged in.
  if (isLoading) {
    return <PageLoader />;
  }

  const isAuthenticated = Boolean(user);
  const isAdmin = user?.role === "admin";

  // Where a logged-in user lands by default — role decides the destination
  const homeRoute = isAdmin ? "/admin" : "/";

  return (
    <Routes>
      {/* Public routes — bounce straight past Login/Register if already authenticated */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? <Login /> : <Navigate to={homeRoute} replace />
        }
      />
      <Route
        path="/register"
        element={
          !isAuthenticated ? (
            <Register />
          ) : (
            <Navigate to={homeRoute} replace />
          )
        }
      />

      {/* User routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<UserDashboard />} />
        <Route path="/boards/:id" element={<BoardView />} />
        <Route path="/me" element={<MyProfile />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/user/boards" element={<UserBoards />}/>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/boards" element={<AdminBoards />} />
        <Route path="/admin/boards/new" element={<BoardForm />} />
        <Route path="/admin/boards/:id/edit" element={<BoardForm />} />
        <Route path="/admin/board/:id/view" element={<BoardView />} />
      </Route>

      {/* Catch-all: send authenticated users to their real home (role-aware),
          everyone else to Login. Fixes the old "/dashboard" dead-end. */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? homeRoute : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}