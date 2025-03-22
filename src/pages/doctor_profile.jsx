import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Import Navbar component
import AddMedicationPopup from "../components/AddMedicationPopup"; // Existing component
import AddPatientPopup from "../components/AddPatientPopup"; // New component
import PatientDetailsPopup from "../components/PatientDetailsPopup"; // New component
import MedicationsPopup from "../components/MedicationsPopup"; // New component
import { FaPills, FaPlusCircle, FaPaperclip, FaEye } from "react-icons/fa"; // Import icons from react-icons

const DoctorProfile = ({ isDark, setIsDark }) => {
  // Accept isDark and setIsDark as props
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null); // For adding medication
  const [isMedicationFormOpen, setIsMedicationFormOpen] = useState(false); // For displaying the medication form
  const [isAddPatientFormOpen, setIsAddPatientFormOpen] = useState(false); // For displaying the add patient form
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false); // For displaying patient details
  const [isMedicationsPopupOpen, setIsMedicationsPopupOpen] = useState(false); // For displaying medications

  // Get the doctor's ID from localStorage
  const userId = localStorage.getItem("userId");

  // Fetch doctor data from the API
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/doctors/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch doctor data");
        }
        const data = await response.json();
        setDoctor(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [userId]);

  // Handle adding medication for a monitored patient
  const handleAddMedication = async (medication) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/doctors/${userId}/monitor-patient/${selectedPatient.patient_id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(medication),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add medication");
      }

      // Refetch doctor data to update the UI
      const updatedDoctor = await fetch(
        `http://127.0.0.1:8000/doctors/${userId}`
      ).then((res) => res.json());
      setDoctor(updatedDoctor);
      setIsMedicationFormOpen(false); // Close the form after successful submission
    } catch (error) {
      console.error("Error adding medication:", error);
    }
  };

  // Handle adding a new patient to the monitored list
  const handleAddPatient = async (patientId, medication) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/doctors/${userId}/monitor-patient/${patientId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(medication),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add patient");
      }

      // Refetch doctor data to update the UI
      const updatedDoctor = await fetch(
        `http://127.0.0.1:8000/doctors/${userId}`
      ).then((res) => res.json());
      setDoctor(updatedDoctor);
      setIsAddPatientFormOpen(false); // Close the form after successful submission
    } catch (error) {
      console.error("Error adding patient:", error);
    }
  };

  // Handle opening patient details popup
  const handlePatientClick = async (patientId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/patients/${patientId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch patient data");
      }
      const data = await response.json();
      setSelectedPatient(data);
      setIsPatientDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  // Handle opening medications popup
  const handleMedicationsClick = (patient) => {
    setSelectedPatient(patient);
    setIsMedicationsPopupOpen(true);
  };

  // Handle opening add medication form
  const handleAddMedicationClick = (patient) => {
    setSelectedPatient(patient);
    setIsMedicationFormOpen(true);
  };

  if (loading) {
    return (
      <div
        className={`text-center py-8 ${
          isDark ? "text-gray-100" : "text-gray-800"
        }`}
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`text-center py-8 ${
          isDark ? "text-red-400" : "text-red-500"
        }`}
      >
        {error}
      </div>
    );
  }

  if (!doctor) {
    return (
      <div
        className={`text-center py-8 ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        No doctor data found.
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-gray-900" : "bg-gray-100"
      } pt-20 pb-8`}
    >
      <Navbar
        isDark={isDark}
        setIsDark={setIsDark}
        dashboardType="doctor"
        role="doctor"
      />

      <div
        className={`max-w-4xl mx-auto rounded-xl shadow-lg p-8 ${
          isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        <h1 className="text-3xl font-bold mb-6">
          {"Hello, Dr. " + doctor.name}
        </h1>

        {/* Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Name:</span> {doctor.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {doctor.email}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {doctor.phone}
              </p>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Professional Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Specialization:</span>{" "}
                {doctor.specialization}
              </p>
              <p>
                <span className="font-medium">Hospital:</span> {doctor.hospital}
              </p>
            </div>
          </div>
        </div>

        {/* Patients Monitored Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Patients Monitored</h2>
          {doctor.patients_monitored.length > 0 ? (
            <ul className="space-y-2">
              {doctor.patients_monitored.map((patient, index) => (
                <li
                  key={index}
                  className={`flex items-center justify-between ${
                    isDark ? "hover:text-indigo-400" : "hover:text-indigo-500"
                  } transition-colors duration-300`}
                >
                  <div className="flex items-center gap-2">
                    {/* Patient Name */}
                    <span
                      onClick={() => handlePatientClick(patient.patient_id)}
                    >
                      {patient.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Attach Report Button */}
                    <button
                      onClick={() => {}}
                      className="p-2 text-blue-500 hover:text-blue-600"
                      title="Attach Report"
                    >
                      <FaPaperclip />
                    </button>
                    {/* View Report Button */}
                    <button
                      onClick={() => {}}
                      className="p-2 text-purple-500 hover:text-purple-600"
                      title="View Report"
                    >
                      <FaEye />
                    </button>
                    {/* Add Medication Button */}
                    <button
                      onClick={() => handleAddMedicationClick(patient)}
                      className="p-2 text-green-500 hover:text-green-600"
                      title="Add Medication"
                    >
                      <FaPlusCircle />
                    </button>
                    {/* View Medications Button */}
                    <button
                      onClick={() => handleMedicationsClick(patient)}
                      className="p-2 text-indigo-500 hover:text-indigo-600"
                      title="View Medications"
                    >
                      <FaPills />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No patients monitored yet.</p>
          )}
          <button
            onClick={() => setIsAddPatientFormOpen(true)}
            className="mt-4 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Add Patient
          </button>
        </div>
      </div>

      {/* Popup for Adding Medication */}
      {isMedicationFormOpen && (
        <AddMedicationPopup
          onClose={() => setIsMedicationFormOpen(false)}
          onSubmit={handleAddMedication}
          isDark={isDark}
        />
      )}

      {/* Popup for Adding Patient */}
      {isAddPatientFormOpen && (
        <AddPatientPopup
          onClose={() => setIsAddPatientFormOpen(false)}
          onSubmit={handleAddPatient}
          isDark={isDark}
        />
      )}

      {/* Popup for Patient Details */}
      {isPatientDetailsOpen && selectedPatient && (
        <PatientDetailsPopup
          patient={selectedPatient}
          onClose={() => setIsPatientDetailsOpen(false)}
          onSubmit={handleAddMedication}
          isDark={isDark}
        />
      )}

      {/* Popup for Medications */}
      {isMedicationsPopupOpen && selectedPatient && (
        <MedicationsPopup
          medications={selectedPatient.medications_given || []}
          onClose={() => setIsMedicationsPopupOpen(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
};

export default DoctorProfile;
