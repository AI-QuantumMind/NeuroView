import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Brain, Moon, Sun, FileText, User, Calendar } from "lucide-react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PatientsDashboard({ isDark }) {
  const role = localStorage.getItem("role");
  const patientId = localStorage.getItem("userId"); // Assuming patient is logged in
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const backendUrl = "http://localhost:8000";
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

  // Fetch patient reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `http://localhost:8000/api/patient/${patientId}/reports`,
          {
            credentials: "include",
          }
        );
        console.log(response);
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }

        const data = await response.json();
        setReports(data);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [patientId]);

  if (isLoading) {
    return (
      <div className={`min-h-screen ${containerClasses}`}>
        <Navbar isDark={isDark} dashboardType="patient" role={role} />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-indigo-600">
            Patient Reports
          </h1>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${containerClasses}`}>
        <Navbar isDark={isDark} dashboardType="patient" role={role} />
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-6 text-indigo-600">
            Patient Reports
          </h1>
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${containerClasses}`}>
      {/* Navigation Bar */}
      <Navbar isDark={isDark} dashboardType="patient" role={role} />

      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600">
          Patient Reports
        </h1>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reports found for this patient.</p>
          </div>
        ) : (
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
                    <p className="text-sm">
                      Date: {new Date(report.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <User className="w-5 h-5" />
                    <p className="text-sm">
                      Doctor: {report.doctor_name || "Unknown"}
                    </p>
                  </div>
                </div>
                <a
                  href={`${backendUrl}${report.html_path.replace("./", "/")}`} // Converts "./patient/..." to "/patient/..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-4 inline-block w-full py-2 text-center rounded-lg font-medium ${reportButtonClasses} transition-all duration-300`}
                >
                  View Report
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientsDashboard;
