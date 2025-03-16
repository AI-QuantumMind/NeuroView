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

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser({ token });
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route
            path="/signup"
            element={
              user ? (
                <Navigate to="/mri-dashboard" />
              ) : (
                <Signup onSignup={setUser} />
              )
            }
          />
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/mri-dashboard" />
              ) : (
                <Login onLogin={setUser} />
              )
            }
          />

          {user ? (
            <>
              <Route path="/mri-dashboard" element={<MRIDashboard />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/chat" element={<ChatInterface />} />
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
