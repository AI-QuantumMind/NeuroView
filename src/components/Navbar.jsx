import React, { useState } from "react";
import { Menu, X, Brain, LogOut, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const Navbar = ({ isDark, setIsDark, dashboardType, role }) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine if the user is a doctor
  const isDoc = role === "doctor";

  // Determine the profile path based on the role
  const profilePath = isDoc ? "/doctor-profile" : "/patient-profile";

  // Navigation links
  const navLinks = [
    {
      name: "Dashboard",
      path: isDoc ? "/mri-dashboard" : "/patient-dashboard",
    },
    { name: "Chat", path: "/chat" },
    { name: "About", path: "/about" },
    { name: "Profile", path: profilePath }, // Add Profile link
  ];

  // Update the Dashboard path based on dashboardType
  if (dashboardType === "mri") {
    navLinks[0].path = "/mri-dashboard";
  } else if (dashboardType === "patient") {
    navLinks[0].path = "/patient-dashboard";
  }

  // Toggle mobile menu
  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  // Close mobile menu when a link is clicked
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav
      className={`w-full fixed top-0 left-0 z-50 flex items-center justify-between px-6 py-3 
        ${
          isDark ? "bg-gray-900 text-gray-300" : "bg-white text-gray-800"
        } shadow-lg`}
    >
      {/* Logo and Brand Name */}
      <div className="flex items-center space-x-2">
        <Link
          to={`/${dashboardType}-dashboard`}
          className="flex items-center space-x-2"
        >
          <Brain className="w-8 h-8 text-indigo-600" />
          <span className="text-xl font-bold text-indigo-600">NeuroView</span>
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center space-x-6 ml-auto">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`hover:text-indigo-500 transition-colors duration-300 ${
              isDark ? "text-gray-300" : "text-gray-800"
            } font-medium`}
          >
            {link.name}
          </Link>
        ))}

        {/* Dark/Light Mode Button */}
        {/* <button
          onClick={() => setIsDark(!isDark)}
          className={`p-2 rounded-lg transition-colors duration-300 ${
            isDark
              ? "bg-gray-800 text-indigo-400 hover:bg-gray-700"
              : "bg-gray-200 text-indigo-600 hover:bg-indigo-100"
          }`}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button> */}

        {/* Logout Button */}
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("userId");
            window.location.href = "/login";
          }}
          className={`p-2 rounded-lg transition-colors duration-300 ${
            isDark
              ? "bg-gray-800 text-indigo-400 hover:bg-gray-700"
              : "bg-gray-200 text-indigo-600 hover:bg-indigo-100"
          }`}
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden p-2 rounded-lg focus:outline-none"
        aria-label="Toggle Mobile Menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-indigo-600" />
        ) : (
          <Menu className="w-6 h-6 text-indigo-600" />
        )}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
              onClick={closeMobileMenu}
            />

            {/* Mobile Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-16 left-0 right-0 ${
                isDark ? "bg-gray-900" : "bg-white"
              } shadow-lg md:hidden`}
            >
              <div className="container mx-auto px-4 py-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={`block py-2 hover:text-indigo-500 transition-colors duration-300 ${
                      isDark ? "text-gray-300" : "text-gray-800"
                    } font-medium`}
                  >
                    {link.name}
                  </Link>
                ))}

                {/* Dark/Light Mode Button */}
                <button
                  onClick={() => {
                    setIsDark(!isDark);
                    closeMobileMenu();
                  }}
                  className={`w-full text-left py-2 hover:text-indigo-500 transition-colors duration-300 ${
                    isDark ? "text-gray-300" : "text-gray-800"
                  } font-medium`}
                  aria-label={
                    isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  {isDark ? "Light Mode" : "Dark Mode"}
                </button>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    localStorage.removeItem("userId");
                    window.location.href = "/login";
                  }}
                  className={`w-full text-left py-2 hover:text-indigo-500 transition-colors duration-300 ${
                    isDark ? "text-gray-300" : "text-gray-800"
                  } font-medium`}
                  aria-label="Logout"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
