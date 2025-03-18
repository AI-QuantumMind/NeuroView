import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; // Import the Navbar component

const PatientProfile = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDark, setIsDark] = useState(false); // State for dark/light mode

  // Get the patient's ID from localStorage
  const id = localStorage.getItem("userId");

  // Fetch patient data from the API
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/patients/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch patient data");
        }
        const data = await response.json();
        setPatient(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!patient) {
    return <div className="text-center py-8">No patient data found.</div>;
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
      {/* Add Navbar */}
      <Navbar
        isDark={isDark}
        setIsDark={setIsDark}
        dashboardType="patient"
        role="patient"
      />

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mt-20">
        <h1
          className={`text-3xl font-bold ${
            isDark ? "text-gray-100" : "text-gray-800"
          } mb-6`}
        >
          Patient Profile
        </h1>

        {/* Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2
              className={`text-xl font-semibold ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Personal Information
            </h2>
            <div className="space-y-2">
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                <span className="font-medium">Name:</span> {patient.name}
              </p>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                <span className="font-medium">Email:</span> {patient.email}
              </p>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                <span className="font-medium">Age:</span> {patient.age}
              </p>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                <span className="font-medium">Gender:</span> {patient.gender}
              </p>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                <span className="font-medium">Phone:</span> {patient.phone}
              </p>
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                <span className="font-medium">Address:</span> {patient.address}
              </p>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h2
              className={`text-xl font-semibold ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Medical Information
            </h2>
            <div className="space-y-2">
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                <span className="font-medium">Doctor ID:</span>{" "}
                {patient.doctor_id || "Not assigned"}
              </p>
            </div>
          </div>
        </div>

        {/* Medical Records Section */}
        <div className="mt-8">
          <h2
            className={`text-xl font-semibold ${
              isDark ? "text-gray-300" : "text-gray-700"
            } mb-4`}
          >
            Medical Records
          </h2>
          {patient.medical_records.length > 0 ? (
            <ul className="space-y-2">
              {patient.medical_records.map((record, index) => (
                <li
                  key={index}
                  className={isDark ? "text-gray-400" : "text-gray-600"}
                >
                  {record}
                </li>
              ))}
            </ul>
          ) : (
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              No medical records found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
