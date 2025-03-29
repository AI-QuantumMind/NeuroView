import React, { useState } from 'react';
import { visionService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useDropzone } from 'react-dropzone';

const MRIDashboard = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.nii', '.nii.gz', '.dcm', '.jpg', '.png']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      setFile(acceptedFiles[0]);
      setAnalysis(null);
    }
  });

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const response = await visionService.analyzeMRI(file, token);
      setAnalysis(response);
    } catch (error) {
      console.error('Error analyzing MRI:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!analysis) return;

    setIsLoading(true);
    try {
      const response = await visionService.generateReport(analysis, token);
      // Handle report generation
      console.log('Report generated:', response);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">MRI Analysis Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Upload MRI</h2>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
          >
            <input {...getInputProps()} />
            {file ? (
              <p className="text-green-600">{file.name}</p>
            ) : (
              <p>Drag and drop an MRI file here, or click to select</p>
            )}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!file || isLoading}
            className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Analyze MRI
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : analysis ? (
            <div>
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(analysis, null, 2)}
              </pre>
              <button
                onClick={handleGenerateReport}
                className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              >
                Generate Report
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Upload an MRI file to see analysis results</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MRIDashboard; 