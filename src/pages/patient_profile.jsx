import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MedicalRecordPopup from "../components/MedicalRecordPopUp";
import MedicalRecordFormPopup from "../components/MedicalRecordFormPopUp";

const PatientProfile = ({ isDark }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [doctor, setDoctor] = useState(null); // State to store doctor details

  const id = localStorage.getItem("userId");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/patients/${id}`);
        if (!response.ok) throw new Error("Failed to fetch patient data");

        const data = await response.json();
        setPatient(data);

        // Fetch doctor details if doctor_id exists
        if (data.doctor_id && data.doctor_id.length > 0) {
          const doctorResponse = await fetch(
            `http://127.0.0.1:8000/doctors/${data.doctor_id[0]}`
          );
          if (!doctorResponse.ok)
            throw new Error("Failed to fetch doctor data");

          const doctorData = await doctorResponse.json();
          setDoctor(doctorData);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  const handleAddOrUpdateRecord = async (recordData) => {
    const formattedRecordData = {
      ...recordData,
      diagnosis_date: recordData.diagnosis_date
        ? new Date(recordData.diagnosis_date).toISOString()
        : null,
      medications: recordData.medications.map((med) => ({
        ...med,
        start_date: med.start_date
          ? new Date(med.start_date).toISOString()
          : null,
        end_date: med.end_date ? new Date(med.end_date).toISOString() : null,
      })),
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/patients/${id}/medical-records`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([formattedRecordData]),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update record: ${response.statusText}`);
      }

      // Re-fetch the patient data to update the UI
      const updatedPatientResponse = await fetch(
        `http://127.0.0.1:8000/patients/${id}`
      );
      if (!updatedPatientResponse.ok) {
        throw new Error("Failed to fetch updated patient data");
      }

      const updatedPatientData = await updatedPatientResponse.json();
      setPatient(updatedPatientData);

      console.log("Record updated successfully");
    } catch (error) {
      console.error("Error updating record:", error);
    }
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

  if (!patient) {
    return (
      <div
        className={`text-center py-8 ${
          isDark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        No patient data found.
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
        isDark={isDark} // Pass isDark to Navbar
        dashboardType="patient"
        role="patient"
      />

      <div
        className={`max-w-4xl mx-auto rounded-xl shadow-lg p-8 ${
          isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        <h1 className="text-3xl font-bold mb-6">👋 Welcome, {patient.name}!</h1>

        {/* Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Name:</span> {patient.name}
              </p>
              <p>
                <span className="font-medium">Email:</span> {patient.email}
              </p>
              <p>
                <span className="font-medium">Age:</span> {patient.age}
              </p>
              <p>
                <span className="font-medium">Gender:</span> {patient.gender}
              </p>
              <p>
                <span className="font-medium">Phone:</span> {patient.phone}
              </p>
              <p>
                <span className="font-medium">Address:</span> {patient.address}
              </p>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Assigned Doctors</h2>
            {doctor ? (
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Doctor Name:</span>{" "}
                  {doctor.name}
                </p>
                <p>
                  <span className="font-medium">Specialization:</span>{" "}
                  {doctor.specialization}
                </p>
                <p>
                  <span className="font-medium">Hospital:</span>{" "}
                  {doctor.hospital}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {doctor.phone}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {doctor.email}
                </p>
              </div>
            ) : (
              <p>No doctor assigned.</p>
            )}
          </div>
        </div>

        {/* Medical Records Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Medical Records</h2>

          {patient.medical_records.length > 0 ? (
            <ul
              className={`space-y-2 text-sm border ${
                isDark ? "border-gray-700" : "border-gray-300"
              } p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}
            >
              {patient.medical_records.map((record, index) => (
                <li
                  key={index}
                  className={`cursor-pointer ${
                    isDark ? "hover:text-indigo-400" : "hover:text-indigo-500"
                  } transition-colors duration-300`}
                  onClick={() => setSelectedRecord(record)}
                >
                  {record.condition}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">No medical records found.</p>
          )}

          {/* Add or Update Medical Record Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Add/Update Record
            </button>
          </div>
        </div>
      </div>

      {/* Popup for Medical Record Details */}
      {selectedRecord && (
        <MedicalRecordPopup
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          isDark={isDark} // Pass isDark to MedicalRecordPopup
        />
      )}

      {/* Popup for Add/Update Form */}
      {isFormOpen && (
        <MedicalRecordFormPopup
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleAddOrUpdateRecord}
          isDark={isDark} // Pass isDark to MedicalRecordFormPopup
        />
      )}
    </div>
  );
};

export default PatientProfile;
