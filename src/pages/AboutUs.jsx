import React from 'react';
import { Brain, Microscope, Target, Globe } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-full">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            About NeuroView
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A cutting-edge platform that combines advanced artificial intelligence with medical expertise to provide comprehensive healthcare solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
                <Microscope className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 ml-3">Our Technology</h2>
            </div>
            <p className="text-gray-600">
              We leverage state-of-the-art vision models for MRI analysis and RAG (Retrieval-Augmented Generation)
              systems for intelligent medical assistance. Our AI-powered platform provides accurate and efficient
              medical insights to support healthcare professionals.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 ml-3">Our Mission</h2>
            </div>
            <p className="text-gray-600">
              To enhance healthcare delivery by providing accurate, efficient, and accessible medical AI solutions
              that support healthcare professionals in their decision-making process. We aim to make advanced
              medical technology accessible and user-friendly.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 ml-3">Our Vision</h2>
            </div>
            <p className="text-gray-600">
              To become the leading platform for AI-powered medical assistance, making advanced healthcare
              technology accessible to medical professionals worldwide. We envision a future where AI enhances
              every aspect of healthcare delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs; 