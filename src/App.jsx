import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import MRIDashboard from "./MRIDashboard";
import AboutUs from "./AboutUs";
import ChatInterface from "./AIChat";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PatientsDashboard from "./pages/patientsDashboard";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // Get role from localStorage
    if (token && role) {
      setUser({ token, role }); // Set user with token and role
    }
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/signup"
            element={
              user ? (
                <Navigate
                  to={
                    user.role === "doctor"
                      ? "/mri-dashboard"
                      : "/patient-dashboard"
                  }
                />
              ) : (
                <Signup onSignup={setUser} />
              )
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={
                    user.role === "doctor"
                      ? "/mri-dashboard"
                      : "/patient-dashboard"
                  }
                />
              ) : (
                <Login onLogin={setUser} />
              )
            }
          />

          {user ? (
            <>
              {user.role === "doctor" && (
                <>
                  <Route path="/mri-dashboard" element={<MRIDashboard />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/chat" element={<ChatInterface />} />
                </>
              )}
              {user.role === "patient" && (
                <Route
                  path="/patient-dashboard"
                  element={<PatientsDashboard />}
                />
              )}
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
