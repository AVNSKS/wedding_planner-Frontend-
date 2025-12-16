import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WeddingProvider } from "./context/WeddingContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import CoupleDashboard from "./pages/couple/Dashboard";
import Guests from "./pages/couple/Guests";
import Wedding from "./pages/couple/Wedding";
import Vendors from "./pages/couple/Vendors";
import Reminders from "./pages/couple/Reminders";
import Tasks from "./pages/couple/Tasks";
import Budgets from "./pages/couple/Budgets";
import Events from "./pages/couple/Events";
import Bookings from "./pages/couple/Bookings";

import Home from "./pages/public/Home";
import WeddingInfo from "./pages/guest/WeddingInfo";
import GuestRSVP from "./pages/guest/RSVP";
import PublicWedding from "./pages/public/PublicWedding";

import VendorDashboard from "./pages/vendor/Dashboard";
import VendorBookings from "./pages/vendor/Bookings";
import VendorProfile from "./pages/vendor/Profile";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public guest routes */}
      <Route path="/rsvp/:token" element={<GuestRSVP />} />
      <Route path="/wedding/:token" element={<PublicWedding />} />
      <Route path="/guest/wedding/:token" element={<WeddingInfo />} />

      {/* Couple protected routes */}
      <Route
        path="/couple/dashboard"
        element={
          <ProtectedRoute allowedRoles={["couple"]}>
            <CoupleDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/couple/guests"
        element={
          <ProtectedRoute allowedRoles={["couple"]}>
            <Guests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/couple/wedding"
        element={
          <ProtectedRoute allowedRoles={["couple"]}>
            <Wedding />
          </ProtectedRoute>
        }
      />
      <Route
        path="/couple/vendors"
        element={
          <ProtectedRoute allowedRoles={["couple"]}>
            <Vendors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/couple/bookings"
        element={
          <ProtectedRoute allowedRoles={["couple"]}>
            <Bookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/couple/tasks"
        element={
          <ProtectedRoute allowedRoles={["couple"]}>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/couple/budgets"
        element={
          <ProtectedRoute allowedRoles={["couple"]}>
            <Budgets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/couple/events"
        element={
          <ProtectedRoute allowedRoles={["couple"]}>
            <Events />
          </ProtectedRoute>
        }
      />
      <Route
        path="/couple/reminders"
        element={
          <ProtectedRoute allowedRoles={["couple"]}>
            <Reminders />
          </ProtectedRoute>
        }
      />

      {/* Vendor protected routes */}
      <Route
        path="/vendor/dashboard"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <VendorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/bookings"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <VendorBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/profile"
        element={
          <ProtectedRoute allowedRoles={["vendor"]}>
            <VendorProfile />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <WeddingProvider>
        <Router>
          <AppRoutes />
        </Router>
      </WeddingProvider>
    </AuthProvider>
  );
};

export default App;
