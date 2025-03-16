import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MRIDashboard from "./MRIDashboard";
import AboutUs from "./AboutUs";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MRIDashboard />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;
