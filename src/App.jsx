import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WeddingProvider } from "./context/WeddingContext";

// --- AUTH PAGES ---
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// --- NEW LANDING PAGE ---
import Landing from "./pages/auth/Landing"; 

// --- COUPLE PAGES ---
import CoupleDashboard from "./pages/couple/Dashboard";
import Guests from "./pages/couple/Guests";
import Wedding from "./pages/couple/Wedding";
import Vendors from "./pages/couple/Vendors";
import Reminders from "./pages/couple/Reminders";
import Tasks from "./pages/couple/Tasks";
import Budgets from "./pages/couple/Budgets";
import Events from "./pages/couple/Events";
import Bookings from "./pages/couple/Bookings";

// --- GUEST / PUBLIC PAGES ---
import WeddingInfo from "./pages/guest/WeddingInfo";
import GuestRSVP from "./pages/guest/RSVP";
import PublicWedding from "./pages/public/PublicWedding";

// --- VENDOR PAGES ---
import VendorDashboard from "./pages/vendor/Dashboard";
import VendorBookings from "./pages/vendor/Bookings";
import VendorProfile from "./pages/vendor/Profile";

// --- PROTECTED ROUTE WRAPPER ---
// This ensures only logged-in users can see specific pages
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If a Vendor tries to access a Couple page (or vice versa), send them to login
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. PUBLIC LANDING PAGE (The new modern "Front Door") */}
      <Route path="/" element={<Landing />} />
      
      {/* 2. AUTH ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 3. PUBLIC GUEST ROUTES (For guests viewing wedding info) */}
      <Route path="/rsvp/:token" element={<GuestRSVP />} />
      <Route path="/wedding/:token" element={<PublicWedding />} />
      <Route path="/guest/wedding/:token" element={<WeddingInfo />} />

      {/* 4. COUPLE PROTECTED ROUTES (Rose Theme) */}
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

      {/* 5. VENDOR PROTECTED ROUTES (Teal/Slate Theme) */}
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

      {/* 6. FALLBACK (If page doesn't exist, go to Landing) */}
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