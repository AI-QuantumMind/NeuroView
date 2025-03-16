import React, { useRef, useState, useEffect } from 'react';
import { Niivue } from '@niivue/niivue';
import { useDropzone } from 'react-dropzone';
import { Brain } from 'lucide-react';

function MRIDasboard() {
  const mriCanvasRef = useRef(null);
  const labelsCanvasRef = useRef(null);

  const [mriNv, setMriNv] = useState(null);
  const [labelsNv, setLabelsNv] = useState(null);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [volumeFile, setVolumeFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [labelName, setLabelName] = useState('labels.nii.gz');

  // Toggle for light/dark theme
  const [isDark, setIsDark] = useState(false);

  // Example AI models
  const AI_MODELS = [
    { id: 'tumor-seg-v1', name: 'Tumor Segmentation v1' },
    { id: 'tumor-seg-v2', name: 'Tumor Segmentation v2' },
    { id: 'multi-class-seg', name: 'Multi-class Segmentation' },
  ];

  // Theme-dependent classes
  const containerClasses = isDark
    ? 'bg-gray-900 text-gray-100'
    : 'bg-gray-100 text-gray-800';
  const navClasses = isDark
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';
  const sideBarClasses = isDark
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-200';
  const viewerBgClasses = isDark
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-gray-300';

  // For text contrast in elements that override the container text
  const textPrimary = isDark ? 'text-gray-300' : 'text-gray-800';
  const textSecondary = isDark ? 'text-gray-500' : 'text-gray-800';

  // Niivue background color, updated dynamically
  const niivueBgColor = isDark ? [0, 0, 0, 1] : [0.95, 0.95, 0.95, 1];

  // Initialize Niivue for MRI viewer
  useEffect(() => {
    if (mriCanvasRef.current && !mriNv) {
      const nv = new Niivue({
        backColor: niivueBgColor,
        show3Dcrosshair: true,
        isColorbar: false,
        isCornerOrientationText: true,
      });
      nv.attachToCanvas(mriCanvasRef.current);
      setMriNv(nv);
    }
  }, [mriCanvasRef, mriNv, niivueBgColor]);

  // Initialize Niivue for Labels viewer
  useEffect(() => {
    if (labelsCanvasRef.current && !labelsNv) {
      const nv = new Niivue({
        backColor: niivueBgColor,
        show3Dcrosshair: true,
        isColorbar: false,
        isCornerOrientationText: true,
      });
      nv.attachToCanvas(labelsCanvasRef.current);
      setLabelsNv(nv);
    }
  }, [labelsCanvasRef, labelsNv, niivueBgColor]);

  // Update Niivue background color if theme changes
  useEffect(() => {
    if (mriNv) {
      mriNv.opts.backColor = niivueBgColor;
      mriNv.drawScene();
    }
    if (labelsNv) {
      labelsNv.opts.backColor = niivueBgColor;
      labelsNv.drawScene();
    }
  }, [isDark, mriNv, labelsNv, niivueBgColor]);

  // Dropzone logic for MRI file
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (
        !file.name.endsWith('.nii') &&
        !file.name.endsWith('.nii.gz')
      ) {
        setError('Please upload a valid .nii or .nii.gz file');
        return;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        setVolumeFile(arrayBuffer);
        setError('');

        // Load into the MRI viewer
        if (mriNv) {
          await mriNv.loadVolumes([
            {
              url: arrayBuffer,
              name: file.name,
              colorMap: 'gray',
              opacity: 1.0,
            },
          ]);
        }
      } catch (err) {
        console.error(err);
        setError('Error loading the file. Make sure it’s a valid NIfTI file.');
      }
    },
    accept: {
      'application/gzip': ['.nii.gz'],
      'application/octet-stream': ['.nii'],
    },
  });

  // Handler to simulate AI inference
  const handleInference = async () => {
    if (!volumeFile || !selectedModel) {
      setError('Please select a model and load a volume first.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Example: Load the same volume in the "Labels Viewer" with a different colorMap
      if (labelsNv) {
        await labelsNv.loadVolumes([
          {
            url: volumeFile,
            name: 'AI Processed Labels',
            colorMap: 'red',
            opacity: 0.5,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setError('Error running inference.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler to simulate saving labels
  const handleSaveLabels = () => {
    if (!labelsNv) {
      setError('No label volume to save.');
      return;
    }
    // In a real app, you'd export or save the label data from Niivue here.
    alert(`Saving labels as "${labelName}" (simulate).`);
  };

  return (
    <div className={`flex flex-col min-h-screen ${containerClasses}`}>
      {/* Top Navigation Bar */}
      <nav
        className={`w-full flex items-center justify-between ${navClasses} px-4 py-2`}
      >
        <div className="flex items-center space-x-2">
          <Brain className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-bold">NeuroView</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`text-sm ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-gray-900'}`}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <a
            href="about"
            className={`text-sm ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-800 hover:text-gray-900'}`}
          >
            About
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className={`${sideBarClasses} w-72 p-4`}>
          {/* Open Brain T1 MRI */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-1">Open Brain T1 MRI</h2>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-800'} mb-2`}>
              Select NIfTI to Browse
            </p>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed border-gray-400 p-4 rounded text-center cursor-pointer text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
            >
              <input {...getInputProps()} />
              Browse / Drop file
            </div>
            {error && (
              <p className="mt-2 text-red-500 text-sm">
                {error}
              </p>
            )}
          </div>

          {/* Segmentation Options */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2">Segmentation Options</h2>
            <div>
              <label className="block text-sm mb-1">Model</label>
              <select
                className="w-full p-2 border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="">--Select Model--</option>
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleInference}
              disabled={isProcessing}
              className={`mt-3 w-full py-2 text-white rounded ${
                isProcessing
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isProcessing ? 'Running...' : 'Run'}
            </button>
          </div>

          {/* Save Labels */}
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2">Save Labels</h2>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-3 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
            />
            <button
              onClick={handleSaveLabels}
              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Save
            </button>
          </div>

        </aside>

        {/* Two Viewers Side by Side */}
        <main className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* MRI Viewer */}
            <div className={`${viewerBgClasses} shadow rounded p-4 flex flex-col`}>
              {/* Viewer top bar */}
              <div className="flex items-center justify-between border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                <span className="font-semibold">MRI Viewer</span>
                
              </div>
              {/* Canvas container */}
              <div className="relative flex-1 border rounded dark:border-gray-700">
                <canvas
                  ref={mriCanvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            </div>

            {/* Labels Viewer */}
            <div className={`${viewerBgClasses} shadow rounded p-4 flex flex-col`}>
              {/* Viewer top bar */}
              <div className="flex items-center justify-between border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                <span className="font-semibold">Labels Viewer</span>
                
              </div>
              {/* Canvas container */}
              <div className="relative flex-1 border rounded dark:border-gray-700">
                <canvas
                  ref={labelsCanvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MRIDasboard;
