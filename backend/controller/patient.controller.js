const Patient = require("../model/patient.model");

// Create a new patient
exports.createPatient = async (req, res) => {
  try {
    const newPatient = new Patient(req.body);
    const savedPatient = await newPatient.save();
    res.status(201).json(savedPatient);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create patient", details: error.message });
  }
};

// Get patient data by ID
exports.getPatientById = async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await Patient.findById(id).populate("doctor_id");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve patient data",
      details: error.message,
    });
  }
};
