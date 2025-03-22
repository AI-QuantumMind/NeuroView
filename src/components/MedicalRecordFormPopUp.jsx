import React, { useState } from "react";
import Loader from "./loader"; // Import the Loader component
import { toast, ToastContainer } from "react-toastify"; // Import toast and ToastContainer
import "react-toastify/dist/ReactToastify.css";

const MedicalRecordFormPopup = ({ onClose, onSubmit, isDark }) => {
  const [recordData, setRecordData] = useState({
    condition: "",
    diagnosis_date: "",
    treatment: "",
    medications: [
      { medication_name: "", dosage: "", start_date: "", end_date: "" },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  // Handle medication changes
  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...recordData.medications];
    updatedMedications[index][field] = value;
    setRecordData({ ...recordData, medications: updatedMedications });
  };

  // Add a new medication field
  const addMedicationField = () => {
    setRecordData({
      ...recordData,
      medications: [
        ...recordData.medications,
        { medication_name: "", dosage: "", start_date: "", end_date: "" },
      ],
    });
  };

  // Remove a medication field
  const removeMedicationField = (index) => {
    const updatedMedications = recordData.medications.filter(
      (_, i) => i !== index
    );
    setRecordData({ ...recordData, medications: updatedMedications });
  };

  // Utility function to format dates correctly
  const formatDate = (date) =>
    date && !isNaN(new Date(date).getTime()) ? `${date}T00:00:00` : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading

    const formattedRecordData = {
      ...recordData,
      diagnosis_date: formatDate(recordData.diagnosis_date),
      medications: recordData.medications.map((med) => ({
        ...med,
        start_date: formatDate(med.start_date),
        end_date: formatDate(med.end_date) || null,
      })),
    };

    try {
      await onSubmit(formattedRecordData); // Call the parent's submit handler
      toast.success("Record updated successfully!");
      onClose(); // Close the popup after successful submission
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to update record. Please try again.");
    } finally {
      setIsSubmitting(false); // Stop loading
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto ${
          isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        <h2 className="text-2xl font-bold mb-4">Add/Update Medical Record</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Condition Field */}
          <input
            type="text"
            placeholder="Condition"
            value={recordData.condition}
            onChange={(e) =>
              setRecordData({ ...recordData, condition: e.target.value })
            }
            className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-gray-700 border-gray-600 focus:ring-indigo-400"
                : "bg-white border-gray-300 focus:ring-indigo-500"
            }`}
            required
          />

          {/* Diagnosis Date Field */}
          <input
            type="date"
            placeholder="Diagnosis Date"
            value={recordData.diagnosis_date}
            onChange={(e) =>
              setRecordData({ ...recordData, diagnosis_date: e.target.value })
            }
            className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-gray-700 border-gray-600 focus:ring-indigo-400"
                : "bg-white border-gray-300 focus:ring-indigo-500"
            }`}
          />

          {/* Treatment Field */}
          <input
            type="text"
            placeholder="Treatment"
            value={recordData.treatment}
            onChange={(e) =>
              setRecordData({ ...recordData, treatment: e.target.value })
            }
            className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
              isDark
                ? "bg-gray-700 border-gray-600 focus:ring-indigo-400"
                : "bg-white border-gray-300 focus:ring-indigo-500"
            }`}
          />

          {/* Medications Section */}
          {recordData.medications.map((med, index) => (
            <div key={index} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Medication Name"
                value={med.medication_name}
                onChange={(e) =>
                  handleMedicationChange(
                    index,
                    "medication_name",
                    e.target.value
                  )
                }
                className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 focus:ring-indigo-400"
                    : "bg-white border-gray-300 focus:ring-indigo-500"
                }`}
              />
              <input
                type="text"
                placeholder="Dosage"
                value={med.dosage}
                onChange={(e) =>
                  handleMedicationChange(index, "dosage", e.target.value)
                }
                className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 focus:ring-indigo-400"
                    : "bg-white border-gray-300 focus:ring-indigo-500"
                }`}
              />
              <input
                type="date"
                placeholder="Start Date"
                value={med.start_date}
                onChange={(e) =>
                  handleMedicationChange(index, "start_date", e.target.value)
                }
                className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 focus:ring-indigo-400"
                    : "bg-white border-gray-300 focus:ring-indigo-500"
                }`}
              />
              <input
                type="date"
                placeholder="End Date"
                value={med.end_date}
                onChange={(e) =>
                  handleMedicationChange(index, "end_date", e.target.value)
                }
                className={`border rounded-md p-2 w-full focus:outline-none focus:ring-2 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 focus:ring-indigo-400"
                    : "bg-white border-gray-300 focus:ring-indigo-500"
                }`}
              />

              {/* Remove Medication Button */}
              {recordData.medications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedicationField(index)}
                  className="text-red-500 hover:text-red-700 text-sm self-end"
                >
                  🗑️ Remove Medication
                </button>
              )}
            </div>
          ))}

          {/* Add Another Medication Button */}
          <button
            type="button"
            onClick={addMedicationField}
            className="text-indigo-500 hover:text-indigo-700 text-sm"
          >
            ➕ Add Another Medication
          </button>

          {/* Form Buttons */}
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
              disabled={isSubmitting} // Disable button during submission
              className={`flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600"
              } text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300`}
            >
              {isSubmitting ? <Loader /> : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalRecordFormPopup;
