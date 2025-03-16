const express = require("express");
const router = express.Router();
const patientController = require("../controller/patient.controller");

// Routes
router.post("/patients", patientController.createPatient);
router.get("/patients/:id", patientController.getPatientById);

module.exports = router;
