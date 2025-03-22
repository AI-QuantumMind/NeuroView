import React, { useState, useEffect } from "react";

const AddPatientPopup = ({ onClose, onSubmit, isDark }) => {
  const [patients, setPatients] = useState([]); // List of patients
  const [selectedPatientId, setSelectedPatientId] = useState(""); // Selected patient ID
  const [medication, setMedication] = useState({
    medication_name: "",
    dosage: "",
    start_date: "",
    end_date: "",
  });

  // Fetch the list of patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/patients-list");
        if (!response.ok) {
          throw new Error("Failed to fetch patients");
        }
        const data = await response.json();
        setPatients(data);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedication({ ...medication, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedPatientId, medication);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`rounded-lg shadow-lg p-6 w-full max-w-md ${
          isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4">Add Patient</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Dropdown */}
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-gray-700 border-gray-600 focus:ring-indigo-400"
                : "bg-white border-gray-300 focus:ring-indigo-500"
            }`}
            required
          >
            <option value="" disabled>
              Select a patient
            </option>
            {patients.map((patient) => (
              <option key={patient.patient_id} value={patient.patient_id}>
                {patient.name}
              </option>
            ))}
          </select>

          {/* Medication Fields */}
          <input
            type="text"
            name="medication_name"
            placeholder="Medication Name"
            value={medication.medication_name}
            onChange={handleChange}
            className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-gray-700 border-gray-600 focus:ring-indigo-400"
                : "bg-white border-gray-300 focus:ring-indigo-500"
            }`}
            required
          />
          <input
            type="text"
            name="dosage"
            placeholder="Dosage"
            value={medication.dosage}
            onChange={handleChange}
            className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-gray-700 border-gray-600 focus:ring-indigo-400"
                : "bg-white border-gray-300 focus:ring-indigo-500"
            }`}
            required
          />
          <input
            type="date"
            name="start_date"
            placeholder="Start Date"
            value={medication.start_date}
            onChange={handleChange}
            className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-gray-700 border-gray-600 focus:ring-indigo-400"
                : "bg-white border-gray-300 focus:ring-indigo-500"
            }`}
            required
          />
          <input
            type="date"
            name="end_date"
            placeholder="End Date"
            value={medication.end_date}
            onChange={handleChange}
            className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-gray-700 border-gray-600 focus:ring-indigo-400"
                : "bg-white border-gray-300 focus:ring-indigo-500"
            }`}
          />

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className={`bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded-lg transition-colors duration-300 ${
                isDark ? "bg-gray-700 hover:bg-gray-600 text-gray-100" : ""
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientPopup;
