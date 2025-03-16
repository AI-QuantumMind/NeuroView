import React, { useState } from 'react';
import { Brain } from 'lucide-react';
function AboutUs() {
  // Default to light mode (isDark false)
  const [isDark, setIsDark] = useState(false);

  // Theme-dependent classes
  const containerClasses = isDark
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gray-100 text-gray-800';
  const navClasses = isDark
    ? 'bg-gray-800 border-b border-gray-700'
    : 'bg-white border-b border-gray-200';
  const linkClasses = isDark
    ? 'text-gray-300 hover:text-white'
    : 'text-gray-800 hover:text-gray-900';

  return (
    <div className={`min-h-screen ${containerClasses}`}>
      {/* Navigation Panel */}
      <nav className={`${navClasses} shadow py-4`}>
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center space-x-2">
            {/* Logo (replace /logo.png with your logo path) */}
            <Brain className="w-10 h-10 text-blue-500" />
            <h1 className="text-2xl font-bold">NeuroView</h1>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/" className={`text-sm ${linkClasses}`}>
              Home
            </a>
            <a href="/about" className={`text-sm ${linkClasses}`}>
              About Us
            </a>
            <a href="/contact" className={`text-sm ${linkClasses}`}>
              Contact
            </a>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`text-sm ${linkClasses}`}
            >
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About NeuroView</h1>
          <p className="text-lg mb-6">
            NeuroView is an innovative AI-powered platform designed to simplify and enhance MRI analysis.
            Our product leverages advanced AI models to provide accurate segmentation and detailed insights,
            empowering clinicians and researchers alike.
          </p>
          {/* Placeholder for About Us image */}
          <div className="mx-auto w-64 h-40 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-600 dark:text-gray-300">Image Placeholder</span>
          </div>
        </header>

        {/* Product Information */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-center mb-6">Our Product</h2>
          <p className="max-w-2xl mx-auto text-center text-xl">
            Combining state-of-the-art AI with an intuitive user interface, NeuroView enables fast and reliable MRI scan analysis.
            Whether used in clinical settings or research laboratories, our platform integrates seamlessly into existing workflows,
            delivering precision and efficiency.
          </p>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-3xl font-semibold text-center mb-6">Our Team</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xs text-center">
              <h3 className="text-2xl font-bold">Parth Masal</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Worked on LLM
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xs text-center">
              <h3 className="text-2xl font-bold">Mandar</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Worked on Website
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xs text-center">
              <h3 className="text-2xl font-bold">Prem</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Worked on AI Model
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutUs;
