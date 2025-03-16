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
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
