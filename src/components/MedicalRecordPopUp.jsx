import React from "react";

const MedicalRecordPopup = ({ record, onClose, isDark }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div
      className={`rounded-lg shadow-lg p-6 w-full max-w-md ${
        isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
      }`}
    >
      <h2 className="text-2xl font-bold mb-4">Medical Record Details</h2>
      <div className="space-y-2">
        <p>
          <span className="font-medium">Condition:</span> {record.condition}
        </p>
        <p>
          <span className="font-medium">Diagnosis Date:</span>{" "}
          {record.diagnosis_date || "N/A"}
        </p>
        <p>
          <span className="font-medium">Treatment:</span>{" "}
          {record.treatment || "N/A"}
        </p>
        <p>
          <span className="font-medium">Medications:</span>{" "}
          {record.medications
            ? record.medications.map((med, idx) => (
                <span key={idx}>
                  {med.medication_name} ({med.dosage})
                  {idx < record.medications.length - 1 ? ", " : ""}
                </span>
              ))
            : "N/A"}
        </p>
      </div>

      <button
        className={`mt-4 w-full py-2 font-bold rounded-lg ${
          isDark
            ? "bg-indigo-600 hover:bg-indigo-700"
            : "bg-indigo-500 hover:bg-indigo-600"
        } text-white transition-colors duration-300`}
        onClick={onClose}
      >
        Close
      </button>
    </div>
  </div>
);

export default MedicalRecordPopup;
