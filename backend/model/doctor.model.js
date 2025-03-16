const mongoose = require("mongoose");

// Monitored Patient Schema
const monitoredPatientSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  medications_given: [
    {
      medication_name: { type: String, required: true },
      dosage: { type: String, required: true },
      start_date: { type: Date, required: true },
      end_date: { type: Date },
    },
  ],
});

// Doctor Schema
const doctorSchema = new mongoose.Schema(
  {
    // Personal Info
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    hospital: { type: String, required: true },
    // Contact Info
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // Authentication
    password: { type: String, required: true },
    role: { type: String, default: "doctor" }, // Added role field for clear identification

    // Patients Monitoring
    patients_monitored: { type: [monitoredPatientSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
