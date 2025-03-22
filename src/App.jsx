import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import MRIDashboard from "./MRIDashboard";
import AboutUs from "./AboutUs";
import ChatInterface from "./AIChat";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PatientsDashboard from "./pages/patientsDashboard";
import Navbar from "./components/Navbar"; // Import the Navbar component
import PatientProfile from "./pages/patient_profile"; // Import PatientProfile
import DoctorProfile from "./pages/doctor_profile"; // Import DoctorProfile

// ProtectedRoute Component
const ProtectedRoute = ({ user, roleRequired, children }) => {
  if (!user) return <Navigate to="/login" />;
  if (roleRequired && user.role !== roleRequired)
    return <Navigate to="/login" />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    // Retrieve dark mode state from localStorage on initial load
    const savedDarkMode = localStorage.getItem("darkMode");
    return savedDarkMode ? savedDarkMode === "true" : false;
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) setUser({ token, role });
    setLoading(false);
  }, []);

  // Save dark mode state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("darkMode", isDark ? "true" : "false");
  }, [isDark]);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <>
      <Router>
        <AppContent
          user={user}
          setUser={setUser}
          isDark={isDark}
          setIsDark={setIsDark}
        />
      </Router>
      <ToastContainer />
    </>
  );
}

// Separate component to handle route-specific logic
function AppContent({ user, setUser, isDark, setIsDark }) {
  const location = useLocation();

  // Define public routes where the Navbar should not be displayed
  const publicRoutes = ["/login", "/signup"];

  // Check if the current route is a public route
  const isPublicRoute = publicRoutes.includes(location.pathname);

  return (
    <>
      {/* Conditionally render Navbar */}
      {!isPublicRoute && (
        <Navbar
          isDark={isDark}
          setIsDark={setIsDark}
          dashboardType={user?.role === "doctor" ? "mri" : "patient"}
          role={user?.role}
        />
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<Signup onSignup={setUser} />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />

        {/* Protected Routes */}
        <Route
          path="/mri-dashboard"
          element={
            <ProtectedRoute user={user} roleRequired="doctor">
              <MRIDashboard isDark={isDark} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute user={user} roleRequired="patient">
              <PatientsDashboard isDark={isDark} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute user={user}>
              <AboutUs isDark={isDark} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute user={user}>
              <ChatInterface isDark={isDark} />
            </ProtectedRoute>
          }
        />

        {/* Profile Routes */}
        <Route
          path="/patient-profile"
          element={
            <ProtectedRoute user={user} roleRequired="patient">
              <PatientProfile isDark={isDark} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-profile"
          element={
            <ProtectedRoute user={user} roleRequired="doctor">
              <DoctorProfile isDark={isDark} />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route
          path="*"
          element={
            <Navigate
              to={
                user?.role === "doctor"
                  ? "/mri-dashboard"
                  : "/patient-dashboard"
              }
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
