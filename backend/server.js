const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.router");
const patientRoutes = require("./routes/paitent.router"); // Added Patient Routes
const doctorRoutes = require("./routes/doctor.router"); // Added Doctor Routes
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
// Database Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes); // Added Patient Routes
app.use("/api/doctors", doctorRoutes); // Added Doctor Routes

// Start server
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is in use, trying another port...`);
      startServer(port + 1); // Try the next port
    } else {
      console.error("Server error:", err);
    }
  });
};

startServer(PORT);
