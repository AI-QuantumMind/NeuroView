import React, { useState, useEffect } from "react";

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get the doctor's ID from localStorage
  const userId = localStorage.getItem("userId");

  // Fetch doctor data from the API
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/doctors/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch doctor data");
        }
        const data = await response.json();
        setDoctor(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [userId]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!doctor) {
    return <div className="text-center py-8">No doctor data found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 pt-20">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Doctor Profile
        </h1>

        {/* Profile Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Personal Information
            </h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Name:</span> {doctor.name}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {doctor.email}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Phone:</span> {doctor.phone}
              </p>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Professional Information
            </h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Specialization:</span>{" "}
                {doctor.specialization}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Hospital:</span> {doctor.hospital}
              </p>
            </div>
          </div>
        </div>

        {/* Patients Monitored Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Patients Monitored
          </h2>
          {doctor.patients_monitored.length > 0 ? (
            <ul className="space-y-2">
              {doctor.patients_monitored.map((patient, index) => (
                <li key={index} className="text-gray-600">
                  {patient}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No patients monitored yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
