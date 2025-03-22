import React, { useState } from "react";

const PatientDetailsPopup = ({ patient, onClose, onSubmit, isDark }) => {
  const [medication, setMedication] = useState({
    medication_name: "",
    dosage: "",
    start_date: "",
    end_date: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedication((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(medication);
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${
        isDark ? "text-gray-100" : "text-gray-800"
      }`}
      style={{ zIndex: 1000 }}
    >
      <div
        className={`rounded-lg p-6 w-11/12 md:w-96 max-h-[90vh] overflow-y-auto ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Patient Details</h2>
        <div className="space-y-4">
          <p>
            <span className="font-medium">Name:</span> {patient.name}
          </p>
          <p>
            <span className="font-medium">Age:</span> {patient.age}
          </p>
          <p>
            <span className="font-medium">Gender:</span> {patient.gender}
          </p>
          <p>
            <span className="font-medium">Email:</span> {patient.email}
          </p>
          <p>
            <span className="font-medium">Phone:</span> {patient.phone}
          </p>
        </div>

        {/* <h3 className="text-lg font-semibold mt-6 mb-4">Add Medication</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Medication Name</label>
            <input
              type="text"
              name="medication_name"
              value={medication.medication_name}
              onChange={handleChange}
              className={`w-full p-2 rounded ${
                isDark
                  ? "bg-gray-700 text-gray-100"
                  : "bg-gray-100 text-gray-800"
              }`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Dosage</label>
            <input
              type="text"
              name="dosage"
              value={medication.dosage}
              onChange={handleChange}
              className={`w-full p-2 rounded ${
                isDark
                  ? "bg-gray-700 text-gray-100"
                  : "bg-gray-100 text-gray-800"
              }`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={medication.start_date}
              onChange={handleChange}
              className={`w-full p-2 rounded ${
                isDark
                  ? "bg-gray-700 text-gray-100"
                  : "bg-gray-100 text-gray-800"
              }`}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <input
              type="date"
              name="end_date"
              value={medication.end_date}
              onChange={handleChange}
              className={`w-full p-2 rounded ${
                isDark
                  ? "bg-gray-700 text-gray-100"
                  : "bg-gray-100 text-gray-800"
              }`}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
            >
              Add Medication
            </button>
          </div>
        </form> */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsPopup;
