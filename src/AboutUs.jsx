import React from "react";
import { Brain } from "lucide-react";
import Navbar from "./components/Navbar";

function AboutUs({ isDark, setIsDark }) {
  // Accept isDark and setIsDark as props
  const role = localStorage.getItem("role");

  // Theme-dependent classes
  const containerClasses = isDark
    ? "bg-gray-900 text-gray-100"
    : "bg-gray-100 text-gray-800";
  const navClasses = isDark
    ? "bg-gray-800 border-b border-gray-700"
    : "bg-white border-b border-gray-200";
  const linkClasses = isDark
    ? "text-gray-300 hover:text-white"
    : "text-gray-800 hover:text-gray-900";

  return (
    <div className={`min-h-screen ${containerClasses} pt-9`}>
      {/* Navigation Panel */}
      <Navbar
        isDark={isDark}
        setIsDark={setIsDark}
        dashboardType="aboutUs"
        role={role}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">
            About NeuroView
          </h1>
          <p className="text-lg mb-6">
            NeuroView is an innovative AI-powered platform designed to simplify
            and enhance MRI analysis. Our product leverages advanced AI models
            to provide accurate segmentation and detailed insights, empowering
            clinicians and researchers alike.
          </p>

          <div className="mx-auto w-64 h-40 bg-gray-300 dark:bg-gray-700 flex items-center justify-center rounded-md shadow-md">
            <span className="text-gray-600 dark:text-gray-300">
              Image Placeholder
            </span>
          </div>
        </header>

        {/* Product Information */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
            Our Product
          </h2>
          <p className="max-w-2xl mx-auto text-center text-lg leading-relaxed">
            Combining state-of-the-art AI with an intuitive user interface,
            NeuroView enables fast and reliable MRI scan analysis. Whether used
            in clinical settings or research laboratories, our platform
            integrates seamlessly into existing workflows, delivering precision
            and efficiency.
          </p>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
            Our Team
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            {[
              { name: "Parth Masal", role: "Worked on LLM" },
              { name: "Mandar", role: "Worked on Website" },
              { name: "Prem", role: "Worked on AI Model" },
            ].map((member) => (
              <div
                key={member.name}
                className={`p-6 rounded-lg shadow-md w-full max-w-xs text-center ${
                  isDark
                    ? "bg-gray-800 text-gray-100"
                    : "bg-white text-gray-800"
                }`}
              >
                <h3 className="text-2xl font-bold">{member.name}</h3>
                <p className="mt-2 text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutUs;
