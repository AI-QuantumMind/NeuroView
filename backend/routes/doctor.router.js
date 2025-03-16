const express = require("express");
const router = express.Router();
const doctorController = require("../controller/doctor.controller");

// Routes
router.post("/doctors", doctorController.createDoctor);
router.get("/doctors/:id", doctorController.getDoctorById);

module.exports = router;
