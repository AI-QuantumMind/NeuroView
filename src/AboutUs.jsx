import React from "react";
import { Brain } from "lucide-react";
import Navbar from "./components/Navbar";

function AboutUs({ isDark, setIsDark }) {
  const role = localStorage.getItem("role");

  const containerClasses = isDark
    ? "bg-gray-900 text-gray-100"
    : "bg-gray-100 text-gray-800";

  return (
    <div className={`min-h-screen ${containerClasses} pt-9`}>
      {/* Navbar */}
      <Navbar
        isDark={isDark}
        setIsDark={setIsDark}
        dashboardType="aboutUs"
        role={role}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10 space-y-16">
        {/* Header Section */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-indigo-600">
            About NeuroView
          </h1>
          <p className="text-lg max-w-2xl mx-auto">
            NeuroView is an innovative AI-powered platform that simplifies MRI
            analysis using advanced segmentation models. Designed to empower
            both clinicians and researchers, it delivers actionable insights
            with precision and ease.
          </p>
          <div className="mx-auto w-56 max-w-lg h-56 rounded-md overflow-hidden shadow-lg">
            <img
              src="src\assets\image.jpg"
              alt="AI-powered MRI visualization"
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Product Info */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-semibold text-indigo-600">
            Our Product
          </h2>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed">
            NeuroView blends cutting-edge AI with a user-friendly interface to
            enable fast, accurate, and reliable MRI scan interpretation. Ideal
            for both clinical and research environments, it integrates
            seamlessly into your workflow.
          </p>
        </section>

        {/* Team Section */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl font-semibold text-indigo-600">Our Team</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { name: "Parth Masal", role: "LLM Integration" },
              {
                name: "Mandar Kulkarni",
                role: "Frontend Development and integration",
              },
              { name: "Prem Gaikwad", role: "AI Model Engineering" },
            ].map((member) => (
              <div
                key={member.name}
                className={`p-6 w-64 rounded-lg shadow-md transform transition duration-300 hover:scale-105 hover:shadow-xl ${
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
      </main>
    </div>
  );
}

export default AboutUs;
