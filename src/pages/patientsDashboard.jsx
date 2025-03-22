import React from "react";
import { Link } from "react-router-dom";
import { Brain, Moon, Sun, FileText, User, Calendar } from "lucide-react";
import Navbar from "../components/Navbar";

function PatientsDashboard({ isDark }) {
  // Accept isDark as a prop
  const role = localStorage.getItem("role");

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
  const reportButtonClasses = isDark
    ? "bg-indigo-600 text-white hover:bg-indigo-700"
    : "bg-indigo-500 text-white hover:bg-indigo-600";

  return (
    <div className={`min-h-screen ${containerClasses}`}>
      {/* Navigation Bar */}
      <Navbar isDark={isDark} dashboardType="patient" role={role} />

      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600">
          Patient Reports
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`${tileClasses} p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl`}
            >
              <div className="flex items-center space-x-4 mb-4">
                <FileText className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-semibold">{report.name}</h2>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Calendar className="w-5 h-5" />
                  <p className="text-sm">Date: {report.date}</p>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <User className="w-5 h-5" />
                  <p className="text-sm">Doctor: {report.doctor}</p>
                </div>
              </div>

              <a
                href={report.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-4 inline-block w-full py-2 text-center rounded-lg font-medium ${reportButtonClasses} transition-all duration-300`}
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
