import React from "react";

const MedicationsPopup = ({ medications, onClose, isDark }) => {
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
        <h2 className="text-xl font-bold mb-4">Medications Given</h2>
        {medications.length > 0 ? (
          <div className="space-y-4">
            {medications.map((med, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  isDark ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <p>
                  <span className="font-medium">Medication:</span>{" "}
                  {med.medication_name}
                </p>
                <p>
                  <span className="font-medium">Dosage:</span> {med.dosage}
                </p>
                <p>
                  <span className="font-medium">Start Date:</span>{" "}
                  {new Date(med.start_date).toLocaleDateString()}
                </p>
                {med.end_date && (
                  <p>
                    <span className="font-medium">End Date:</span>{" "}
                    {new Date(med.end_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No medications given yet.</p>
        )}
        <div className="flex justify-end mt-4">
          <button
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

export default MedicationsPopup;
