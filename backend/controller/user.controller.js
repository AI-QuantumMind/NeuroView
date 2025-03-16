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
    if (!["doctor", "patient"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Invalid role. Choose 'doctor' or 'patient'." });
    }

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

    // Call respective controller
    if (role === "doctor") {
      await createDoctor(req, res);
    } else {
      await createPatient(req, res);
    }
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
    const isDoctor = email.startsWith("dr.");
    const user = isDoctor
      ? await Doctor.findOne({ email })
      : await Patient.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Role validation
    const expectedRole = isDoctor ? "doctor" : "patient";
    if (
      (isDoctor && !user.specialization) ||
      (!isDoctor && user.specialization)
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

    // Generate Token
    const token = jwt.sign(
      { id: user._id, role: expectedRole },
      "your_secret_key",
      {
        expiresIn: "1h",
      }
    );

    res
      .status(200)
      .json({ message: `Login successful as ${expectedRole}`, token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in", details: error.message });
  }
};
