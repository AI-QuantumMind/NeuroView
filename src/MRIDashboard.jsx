import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Niivue } from "@niivue/niivue";
import { Moon, Sun } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Brain } from "lucide-react";
import Navbar from "./components/Navbar";

function MRIDasboard() {
  const mriCanvasRef = useRef(null);
  const labelsCanvasRef = useRef(null);
  const [mriNv, setMriNv] = useState(null);
  const [labelsNv, setLabelsNv] = useState(null);
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [volumeFile, setVolumeFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [labelName, setLabelName] = useState("labels.nii.gz");
  const [selectedInputType, setSelectedInputType] = useState("");
  const [isDark, setIsDark] = useState(false);
  const role = localStorage.getItem("role");
  const AI_MODELS = [
    { id: "tumor-seg-v1", name: "Tumor Segmentation v1" },
    { id: "tumor-seg-v2", name: "Tumor Segmentation v2" }
  ];
  const containerClasses = isDark
    ? "bg-gray-900 text-gray-100"
    : "bg-gray-100 text-gray-800";
  const navClasses = isDark
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";
  const sideBarClasses = isDark
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";
  const viewerBgClasses = isDark
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-300";
  const textPrimary = isDark ? "text-gray-300" : "text-gray-800";
  const textSecondary = isDark ? "text-gray-500" : "text-gray-800";
  const niivueBgColor = [0, 0, 0, 1];
  useEffect(() => {
    if (mriCanvasRef.current && !mriNv && selectedInputType === "nii.gz") {
      const nv = new Niivue({
        backColor: niivueBgColor,
        show3Dcrosshair: true,
        isColorbar: false,
        isCornerOrientationText: true
      });
      nv.attachToCanvas(mriCanvasRef.current);
      setMriNv(nv);
    }
  }, [mriCanvasRef, mriNv, niivueBgColor, selectedInputType]);
  useEffect(() => {
    if (labelsCanvasRef.current && !labelsNv && selectedInputType === "nii.gz") {
      const nv = new Niivue({
        backColor: niivueBgColor,
        show3Dcrosshair: true,
        isColorbar: false,
        isCornerOrientationText: true
      });
      nv.attachToCanvas(labelsCanvasRef.current);
      setLabelsNv(nv);
    }
  }, [labelsCanvasRef, labelsNv, niivueBgColor, selectedInputType]);
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
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;
      if (selectedInputType === "nii.gz") {
        if (!file.name.endsWith(".nii") && !file.name.endsWith(".nii.gz")) {
          setError("Please upload a valid .nii or .nii.gz file");
          return;
        }
        try {
          const arrayBuffer = await file.arrayBuffer();
          setVolumeFile(arrayBuffer);
          setImageSrc(null);
          setError("");
          if (mriNv) {
            await mriNv.loadVolumes([
              {
                url: arrayBuffer,
                name: file.name,
                colorMap: "gray",
                opacity: 1.0
              }
            ]);
          }
        } catch (err) {
          console.error(err);
          setError("Error loading the file. Make sure it's a valid NIfTI file.");
        }
      } else {
        if (
          !file.name.match(/\.(jpg|jpeg|png)$/i)
        ) {
          setError("Please upload a valid image file (.jpg, .jpeg, .png)");
          return;
        }
        const imgUrl = URL.createObjectURL(file);
        setImageSrc(imgUrl);
        setVolumeFile(null);
        setError("");
      }
    },
    accept: {
      "application/gzip": [".nii.gz"],
      "application/octet-stream": [".nii"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"]
    }
  });
  const handleInference = async () => {
    if ((!volumeFile && !imageSrc) || !selectedModel) {
      setError("Please select a model and load an input first.");
      return;
    }
    setIsProcessing(true);
    setError("");
    try {
      const formData = new FormData();
      if (selectedInputType === "nii.gz") {
        const fileBlob = new Blob([volumeFile], { type: "application/octet-stream" });
        formData.append("file", fileBlob, "mri_volume.nii.gz");
      } else {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        formData.append("file", blob, "input_image.jpg");
      }
      formData.append("model", selectedModel);
      const endpoint =
        selectedModel === "tumor-seg-v1"
          ? "http://localhost:8000/ai/predict"
          : "http://localhost:8000/yolo/predict";
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Server error: ${response.status}`);
        console.log(response)
      }
      const data = await response.json();
      console.log(data)
      if (selectedModel === "tumor-seg-v1") {
        if (labelsNv) {
          await labelsNv.loadVolumes([
            {
              url: data.segmentation_file.path,
              colorMap: "summer",
              opacity: 0.5
            },
            {
              url: volumeFile,
              colorMap: "gray",
              opacity: .5
            }
          ]);
        }
      } else {
        setResultImage(data.result.path);
      }
    } catch (err) {
      console.error("Inference Error:", err);
      setError(err.message || "Error running inference or loading labels.");
    } finally {
      setIsProcessing(false);
    }
  };
  const handleSaveLabels = () => {
    if (!labelsNv) {
      setError("No label volume to save.");
      return;
    }
    alert(`Saving labels as "${labelName}" (simulate).`);
  };
  return (
    <div className={`flex flex-col min-h-screen ${containerClasses}`}>
      <Navbar isDark={isDark} setIsDark={setIsDark} dashboardType="mri" role={role} />
      <div className="flex flex-1">
        <aside className={`${sideBarClasses} w-72 p-6 shadow-lg rounded-r-lg`}>
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2">Open Brain T1 MRI</h2>
            <p className={`text-sm ${textSecondary} mb-4`}>Select input file to Browse</p>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed ${isDark ? "border-gray-600" : "border-gray-400"} p-6 rounded-lg text-center cursor-pointer transition-all duration-300 ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
            >
              <input {...getInputProps()} />
              <p className={`text-sm ${textPrimary}`}>Browse / Drop file</p>
            </div>
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2">Input Type</h2>
            <div>
              <label htmlFor="inputType" className="block text-sm mb-2">Input Type</label>
              <select
                id="inputType"
                value={selectedInputType}
                onChange={(e) => setSelectedInputType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">--Select Input Type--</option>
                <option value="nii.gz">NIfTI GZ (.nii.gz)</option>
                <option value="image">Image (.jpg, .jpeg, .png)</option>
              </select>
            </div>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2">Segmentation Options</h2>
            <div>
              <label className="block text-sm mb-2">Model</label>
              <select
                className={`w-full p-2 border rounded ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"}`}
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
              className={`mt-4 w-full py-2 text-white rounded ${isProcessing ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"} transition-all duration-300`}
            >
              {isProcessing ? "Running..." : "Run"}
            </button>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-2">Save Labels</h2>
            <label className="block text-sm mb-2">Name</label>
            <input
              type="text"
              className={`w-full p-2 border rounded mb-4 ${isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"}`}
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
            />
            <button
              onClick={handleSaveLabels}
              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-all duration-300"
            >
              Save
            </button>
          </div>
        </aside>
        <main className="flex-1 p-6">
          {selectedInputType === "nii.gz" ? (
            <div className="grid grid-cols-2 gap-6 h-full">
              <div className={`${viewerBgClasses} shadow-lg rounded-lg p-4 flex flex-col`}>
                <div className="flex items-center justify-between border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                  <span className="font-semibold">MRI Viewer</span>
                </div>
                <div className="relative flex-1 border rounded-lg dark:border-gray-700">
                  <canvas ref={mriCanvasRef} className="absolute top-0 left-0 w-full h-full" />
                </div>
              </div>
              <div className={`${viewerBgClasses} shadow-lg rounded-lg p-4 flex flex-col`}>
                <div className="flex items-center justify-between border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                  <span className="font-semibold">Labels Viewer</span>
                </div>
                <div className="relative flex-1 border rounded-lg dark:border-gray-700">
                  <canvas ref={labelsCanvasRef} className="absolute top-0 left-0 w-full h-full" />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 h-full">
              <div className={`${viewerBgClasses} shadow-lg rounded-lg p-4 flex flex-col`}>
                <div className="flex items-center justify-between border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                  <span className="font-semibold">Input Image</span>
                </div>
                <div className="relative flex-1 border rounded-lg dark:border-gray-700 flex items-center justify-center">
                  {imageSrc && <img src={imageSrc} alt="Input" className="max-h-full max-w-full" />}
                </div>
              </div>
              <div className={`${viewerBgClasses} shadow-lg rounded-lg p-4 flex flex-col`}>
                <div className="flex items-center justify-between border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                  <span className="font-semibold">Result Image</span>
                </div>
                <div className="relative flex-1 border rounded-lg dark:border-gray-700 flex items-center justify-center">
                  {resultImage && <img src={resultImage} alt="Result" className="max-h-full max-w-full" />}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default MRIDasboard;
