import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Moon, Sun, FileText, User, Calendar } from "lucide-react";

function PatientsDashboard() {
  const [isDark, setIsDark] = useState(false);

  // Example report data
  const reports = [
    {
      id: 1,
      name: "MRI Scan Report",
      date: "2023-10-15",
      doctor: "Dr. John Doe",
      pdfUrl:
        "https://vetoracle.com/wp-content/uploads/2019/11/MRI-and-CT-sample-report-1.pdf",
    },
    {
      id: 2,
      name: "CT Scan Report",
      date: "2023-10-10",
      doctor: "Dr. Jane Smith",
      pdfUrl: "/reports/report2.pdf",
    },
    {
      id: 3,
      name: "X-Ray Report",
      date: "2023-10-05",
      doctor: "Dr. Emily Brown",
      pdfUrl: "/reports/report3.pdf",
    },
  ];

  // Theme-dependent classes
  const containerClasses = isDark
    ? "bg-gray-900 text-gray-100"
    : "bg-gray-100 text-gray-800";
  const tileClasses = isDark
    ? "bg-gray-800 text-gray-100 hover:bg-gray-700"
    : "bg-white text-gray-800 hover:bg-gray-50";

  return (
    <div className={`min-h-screen ${containerClasses}`}>
      {/* Navigation Bar */}
      <nav
        className={`w-full flex items-center justify-between ${
          isDark ? "bg-gray-800 text-gray-300" : "bg-white text-gray-800"
        } px-6 py-3 shadow-lg`}
      >
        <div className="flex items-center space-x-2">
          <Link to="/mri-dashboard" className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold">NeuroView</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${
              isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900"
            } shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDark ? "focus:ring-gray-500" : "focus:ring-gray-400"
            }`}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span className="ml-2 text-sm font-medium">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className={`text-sm ${
              isDark
                ? "text-gray-300 hover:text-white"
                : "text-gray-800 hover:text-gray-900"
            }`}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Patient Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`${tileClasses} p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <FileText className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold">{report.name}</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <p className="text-sm">Date: {report.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-500" />
                  <p className="text-sm">Doctor: {report.doctor}</p>
                </div>
              </div>
              <a
                href={report.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 inline-block w-full py-2 text-center rounded-lg ${
                  isDark
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                } transition-all duration-300`}
              >
                View Report
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PatientsDashboard;
