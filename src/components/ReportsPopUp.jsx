// components/ReportsPopup.js
import React from "react";

const ReportsPopup = ({ reports, onClose, isDark, onSelectReport }) => {
  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        isDark ? "bg-black bg-opacity-70" : "bg-black bg-opacity-50"
      }`}
    >
      <div
        className={`rounded-lg p-6 w-full max-w-md ${
          isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Patient Reports</h2>
        {reports.length === 0 ? (
          <p className="text-gray-500">No reports available</p>
        ) : (
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {reports.map((report, index) => (
              <li
                key={index}
                className={`p-3 rounded-lg cursor-pointer ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
                onClick={() => onSelectReport(report)}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{report.name}</span>
                  <span className="text-sm text-gray-400">
                    {new Date(report.date).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsPopup;
