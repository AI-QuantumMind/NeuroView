const mongoose = require("mongoose");

// Medication Schema
const medicationSchema = new mongoose.Schema({
  medication_name: { type: String, required: true },
  dosage: { type: String, required: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date },
});

// Medical Record Schema
const medicalRecordSchema = new mongoose.Schema({
  condition: { type: String, required: true },
  diagnosis_date: { type: Date, required: true },
  treatment: { type: String, required: true },
  medications: { type: [medicationSchema], default: [] },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
});

// Patient Schema
const patientSchema = new mongoose.Schema(
  {
    // Personal Info
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },

    // Contact Info
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },

    // Authentication
    password: { type: String, required: true },
    role: { type: String, default: "patient" }, // Added role field for clear identification

    // Medical Details
    medical_records: { type: [medicalRecordSchema], default: [] },
    doctor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      // required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
