const Doctor = require("../model/doctor.model");

// Create a new doctor
exports.createDoctor = async (req, res) => {
  try {
    const newDoctor = new Doctor(req.body);
    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create doctor", details: error.message });
  }
};

// Get doctor data by ID
exports.getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.findById(id).populate(
      "patients_monitored.patient_id"
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve doctor data",
      details: error.message,
    });
  }
};
