const Doctor = require("../model/doctor.model");
const Patient = require("../model/patient.model");
const { createDoctor } = require("./doctor.controller");
const { createPatient } = require("./patient.controller");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Signup Controller
exports.signup = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Validate role
    if (!["doctor", "patient"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Choose 'doctor' or 'patient'." });
    }

    // Check if user already exists
    const existingUser =
      role === "doctor"
        ? await Doctor.findOne({ email })
        : await Patient.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    req.body.password = hashedPassword;

    // Create user based on role
    let user;
    if (role === "doctor") {
      user = new Doctor(req.body);
    } else {
      user = new Patient(req.body);
    }

    // Save user to the database
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Include role in the token payload
      "your_secret_key", // Replace with a secure secret key
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Return success response with token and role
    res.status(201).json({
      message: `Signup successful as ${role}`,
      token,
      role: user.role, // Explicitly return the role
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res
      .status(500)
      .json({ error: "Error registering user", details: error.message });
  }
};

// Signin Controller
exports.signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Determine if the user is a doctor or patient based on email
    const isDoctor = email.startsWith("dr.");
    const user = isDoctor
      ? await Doctor.findOne({ email })
      : await Patient.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Validate role
    const expectedRole = isDoctor ? "doctor" : "patient";
    if (
      (isDoctor && !user.specialization) || // Doctor should have a specialization
      (!isDoctor && user.specialization) // Patient should not have a specialization
    ) {
      return res.status(403).json({
        message: `Access denied. Expected role: ${expectedRole}`,
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: expectedRole }, // Include role in the token payload
      "your_secret_key", // Replace with a secure secret key
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Return success response with token and role
    res.status(200).json({
      message: `Login successful as ${expectedRole}`,
      token,
      role: expectedRole, // Explicitly return the role
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Error logging in", details: error.message });
  }
};
