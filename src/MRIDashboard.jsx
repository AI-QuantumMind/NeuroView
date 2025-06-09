import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Niivue } from "@niivue/niivue";
import { Moon, Sun, Brain } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Navbar from "./components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function MRIDashboard() {
  const mriCanvasRef = useRef(null);
  const labelsCanvasRef = useRef(null);
  const [mriNv, setMriNv] = useState(null);
  const [labelsNv, setLabelsNv] = useState(null);
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [t1ceFile, setT1ceFile] = useState(null);
  const [flairFile, setFlairFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [labelName, setLabelName] = useState("labels.nii.gz");
  const [selectedInputType, setSelectedInputType] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [t1ceFileName, setT1ceFileName] = useState("");
  const [flairFileName, setFlairFileName] = useState("");
  const [selectedImageType, setSelectedImageType] = useState("t1ce");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const role = localStorage.getItem("role");

  const AI_MODELS = [
    { id: "tumor-seg-v1", name: "Tumor Segmentation v1" },
    { id: "tumor-seg-v2", name: "Tumor Segmentation v2" },
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
  const niivueBgColor = [0, 0, 0, 1];

  // Initialize Niivue for MRI canvas
  useEffect(() => {
    if (mriCanvasRef.current && !mriNv && selectedInputType === "nii.gz") {
      const nv = new Niivue({
        backColor: niivueBgColor,
        show3Dcrosshair: true,
        isColorbar: false,
        isCornerOrientationText: true,
      });
      nv.attachToCanvas(mriCanvasRef.current);
      setMriNv(nv);
    }
  }, [mriCanvasRef, mriNv, niivueBgColor, selectedInputType]);

  // Initialize Niivue for Labels canvas
  useEffect(() => {
    if (
      labelsCanvasRef.current &&
      !labelsNv &&
      selectedInputType === "nii.gz"
    ) {
      const nv = new Niivue({
        backColor: niivueBgColor,
        show3Dcrosshair: true,
        isColorbar: false,
        isCornerOrientationText: true,
      });
      nv.attachToCanvas(labelsCanvasRef.current);
      setLabelsNv(nv);
    }
  }, [labelsCanvasRef, labelsNv, niivueBgColor, selectedInputType]);

  // Fetch patients for doctors
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const doctorId = localStorage.getItem("userId");
        const response = await fetch(
          `http://localhost:8000/api/doctor/${doctorId}/patients`
        );
        if (!response.ok) throw new Error("Failed to fetch patients");
        const data = await response.json();
        const patientsWithReportIds = data.map((patient) => ({
          ...patient,
          report_ids: patient.report_ids || [],
        }));
        setPatients(patientsWithReportIds);
      } catch (err) {
        console.error("Error fetching patients:", err);
        setError(err.message);
        toast.error(err.message);
      }
    };

    if (role === "doctor") {
      fetchPatients();
    }
  }, [role]);

  // Update Niivue background color on dark mode toggle
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

  // T1CE file dropzone
  const { getRootProps: getT1ceRootProps, getInputProps: getT1ceInputProps } =
    useDropzone({
      onDrop: async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!file.name.toLowerCase().includes(".nii.gz")) {
          setError("Please upload a valid .nii.gz file for T1CE");
          toast.error("Please upload a valid .nii.gz file for T1CE");
          return;
        }

        try {
          const arrayBuffer = await file.arrayBuffer();
          setT1ceFile(arrayBuffer);
          setT1ceFileName(file.name);
          setError("");
          setIsRendered(false);
          await saveFileToBackend(file, "t1ce");
          toast.success("T1CE file uploaded successfully");
        } catch (err) {
          console.error(err);
          setError(
            "Error loading the T1CE file. Make sure it's a valid NIfTI file."
          );
          toast.error("Error loading the T1CE file.");
        }
      },
      accept: {
        "application/gzip": [".nii.gz"],
        "application/octet-stream": [".nii.gz"],
      },
    });

  // FLAIR file dropzone
  const { getRootProps: getFlairRootProps, getInputProps: getFlairInputProps } =
    useDropzone({
      onDrop: async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!file.name.toLowerCase().includes(".nii.gz")) {
          setError("Please upload a valid .nii.gz file for FLAIR");
          toast.error("Please upload a valid .nii.gz file for FLAIR");
          return;
        }

        try {
          const arrayBuffer = await file.arrayBuffer();
          setFlairFile(arrayBuffer);
          setFlairFileName(file.name);
          setError("");
          setIsRendered(false);
          await saveFileToBackend(file, "flair");
          toast.success("FLAIR file uploaded successfully");
        } catch (err) {
          console.error(err);
          setError(
            "Error loading the FLAIR file. Make sure it's a valid NIfTI file."
          );
          toast.error("Error loading the FLAIR file.");
        }
      },
      accept: {
        "application/gzip": [".nii.gz"],
        "application/octet-stream": [".nii.gz"],
      },
    });

  // Image file dropzone
  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } =
    useDropzone({
      onDrop: async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (!file.name.match(/\.(jpg|jpeg|png)$/i)) {
          setError("Please upload a valid image file (.jpg, .jpeg, .png)");
          toast.error("Please upload a valid image file (.jpg, .jpeg, .png)");
          return;
        }
        const imgUrl = URL.createObjectURL(file);
        setImageSrc(imgUrl);
        setT1ceFile(null);
        setFlairFile(null);
        setT1ceFileName("");
        setFlairFileName("");
        setError("");
        setIsRendered(false);
        toast.success("Image uploaded successfully");
      },
      accept: {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
      },
    });

  // Save file to backend
  const saveFileToBackend = async (file, fileType) => {
    try {
      const formData = new FormData();
      const newFileName = file.name.replace(".nii.gz", `_${fileType}.nii.gz`);
      const renamedFile = new File([file], newFileName, { type: file.type });
      formData.append(`${fileType}_file`, renamedFile);

      const response = await fetch(
        `http://localhost:8000/api/mri/upload/${fileType}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (fileType === "t1ce") {
        setT1ceFileName(newFileName);
      } else if (fileType === "flair") {
        setFlairFileName(newFileName);
      }
    } catch (err) {
      console.error(`Error saving ${fileType} file:`, err);
      setError(
        `Error saving ${fileType.toUpperCase()} file to backend: ${err.message}`
      );
      toast.error(`Error saving ${fileType.toUpperCase()} file.`);
    }
  };

  // Render selected image
  const handleRender = async () => {
    if (selectedInputType === "nii.gz") {
      if (!t1ceFile || !flairFile) {
        setError("Please upload both T1CE and FLAIR files.");
        toast.error("Please upload both T1CE and FLAIR files.");
        return;
      }

      try {
        if (mriNv) {
          const filename =
            selectedImageType === "t1ce" ? t1ceFileName : flairFileName;
          await mriNv.loadVolumes([
            {
              url: `backend/patient_data/mri_scans/user/${filename}`,
              colorMap: "gray",
              opacity: 1.0,
            },
          ]);
          setIsRendered(true);
          setError("");
          toast.success("Image rendered successfully");
        }
      } catch (err) {
        console.error(err);
        setError("Error rendering the file. Please try again.");
        toast.error("Error rendering the file.");
      }
    }
  };

  // Handle inference
  const handleInference = async () => {
    if (selectedInputType === "nii.gz" && (!t1ceFile || !flairFile)) {
      setError("Please upload both T1CE and FLAIR files.");
      toast.error("Please upload both T1CE and FLAIR files.");
      return;
    }
    if (selectedInputType === "image" && !imageSrc) {
      setError("Please upload an image.");
      toast.error("Please upload an image.");
      return;
    }
    if (!selectedModel) {
      setError("Please select a model.");
      toast.error("Please select a model.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      if (selectedInputType === "nii.gz") {
        const response = await fetch("http://localhost:8000/api/mri/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            t1ce_filename: t1ceFileName,
            flair_filename: flairFileName,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (labelsNv) {
          await labelsNv.loadVolumes([
            {
              url: `backend/patient_data/mri_scans/user/resize_t1ce.nii.gz`,
              color: "gray",
              opacity: 0.5,
            },
            {
              url: `backend/patient_data/mri_scans/user/${data.segmentation_file}`,
              colorMap: "winter",
              opacity: 1,
            },
          ]);
        }
        toast.success("Inference completed successfully");
      } else {
        const formData = new FormData();
        const blobResponse = await fetch(imageSrc);
        const blob = await blobResponse.blob();
        formData.append("file", blob, "input_image.jpg");
        formData.append("model", selectedModel);

        const endpoint =
          selectedModel === "tumor-seg-v1"
            ? "http://localhost:8000/ai/predict/"
            : "http://localhost:8000/yolo/predict/";

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.detail || `Server error: ${response.status}`
          );
        }

        const data = await response.json();
        setResultImage(data.result.path);
        toast.success("Inference completed successfully");
      }
    } catch (err) {
      console.error("Inference Error:", err);
      setError(err.message || "Error running inference or loading labels.");
      toast.error(err.message || "Error running inference.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Save labels
  const handleSaveLabels = () => {
    if (!labelsNv) {
      setError("No label volume to save.");
      toast.error("No label volume to save.");
      return;
    }
    toast.success(`Labels saved as "${labelName}"`);
  };

  // Generate report
  const handleGenerateReport = async () => {
    if (!selectedPatient) {
      setError("Please select a patient");
      toast.error("Please select a patient");
      return;
    }

    setIsGeneratingReport(true);
    setError("");

    try {
      const doctorId = localStorage.getItem("userId");

      // Load JSON file
      const jsonResponse = await fetch(
        "./backend/VisionModel/report/mri_report.json"
      );
      if (!jsonResponse.ok) {
        throw new Error(`Failed to load JSON file: ${jsonResponse.status}`);
      }
      const dataJson = await jsonResponse.json();

      const response = await fetch("http://localhost:8000/rag/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: selectedPatient,
          doctor_id: doctorId,
          data_json: dataJson,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || `Report generation failed: ${response.status}`
        );
      }

      const data = await response.json();
      setPatients((prev) =>
        prev.map((p) =>
          p._id === selectedPatient
            ? {
                ...p,
                report_ids: Array.isArray(p.report_ids)
                  ? [...p.report_ids, data.report_id]
                  : [data.report_id],
              }
            : p
        )
      );
      toast.success("Report generated successfully", {
        toastId: `report-${selectedPatient}-${Date.now()}`,
      });
    } catch (err) {
      console.error("Report Generation Error:", err);
      setError(err.message);
      toast.error(err.message || "Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className={`flex flex-col min-h-screen ${containerClasses}`}>
      <Navbar
        isDark={isDark}
        setIsDark={setIsDark}
        dashboardType="mri"
        role={role}
      />
      <div className="flex flex-1">
        <aside
          className={`${sideBarClasses} w-72 p-6 shadow-lg rounded-r-lg overflow-y-auto sticky top-16`}
          style={{ maxHeight: "calc(100vh - 4rem)" }}
        >
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-2">Input Type</h2>
              <select
                id="inputType"
                value={selectedInputType}
                onChange={(e) => {
                  setSelectedInputType(e.target.value);
                  setT1ceFile(null);
                  setFlairFile(null);
                  setImageSrc(null);
                  setT1ceFileName("");
                  setFlairFileName("");
                  setIsRendered(false);
                }}
                className={`w-full p-2 border rounded ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
              >
                <option value="">--Select Input Type--</option>
                <option value="nii.gz">NIfTI GZ (.nii.gz)</option>
                <option value="image">Image (.jpg, .jpeg, .png)</option>
              </select>
            </div>

            {selectedInputType === "nii.gz" && (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-bold mb-2">Upload T1CE MRI</h2>
                  <div
                    {...getT1ceRootProps()}
                    className={`border-2 border-dashed ${
                      isDark ? "border-gray-600" : "border-gray-400"
                    } p-6 rounded-lg text-center cursor-pointer transition-all duration-300 ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <input {...getT1ceInputProps()} />
                    <p className={`text-sm ${textPrimary}`}>
                      Browse / Drop T1CE file
                    </p>
                  </div>
                  {t1ceFileName && (
                    <div className="mt-2 text-sm text-green-500">
                      T1CE uploaded: {t1ceFileName}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-bold mb-2">Upload FLAIR MRI</h2>
                  <div
                    {...getFlairRootProps()}
                    className={`border-2 border-dashed ${
                      isDark ? "border-gray-600" : "border-gray-400"
                    } p-6 rounded-lg text-center cursor-pointer transition-all duration-300 ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    <input {...getFlairInputProps()} />
                    <p className={`text-sm ${textPrimary}`}>
                      Browse / Drop FLAIR file
                    </p>
                  </div>
                  {flairFileName && (
                    <div className="mt-2 text-sm text-green-500">
                      FLAIR uploaded: {flairFileName}
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedInputType === "image" && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">Upload Image</h2>
                <div
                  {...getImageRootProps()}
                  className={`border-2 border-dashed ${
                    isDark ? "border-gray-600" : "border-gray-400"
                  } p-6 rounded-lg text-center cursor-pointer transition-all duration-300 ${
                    isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                  }`}
                >
                  <input {...getImageInputProps()} />
                  <p className={`text-sm ${textPrimary}`}>
                    Browse / Drop image file
                  </p>
                </div>
              </div>
            )}

            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}

            {selectedInputType === "nii.gz" &&
              t1ceFile &&
              flairFile &&
              !isRendered && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm mb-2">
                      Select Image to Render
                    </label>
                    <select
                      className={`w-full p-2 border rounded ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-800"
                      }`}
                      value={selectedImageType}
                      onChange={(e) => setSelectedImageType(e.target.value)}
                    >
                      <option value="t1ce">T1CE</option>
                      <option value="flair">FLAIR</option>
                    </select>
                  </div>
                  <button
                    onClick={handleRender}
                    className="mt-4 w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded transition-all duration-300"
                  >
                    Render Image
                  </button>
                </>
              )}

            <div className="mb-6">
              <h2 className="text-lg font-bold mb-2">Segmentation Options</h2>
              <select
                className={`w-full p-2 border rounded ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-white border-gray-300 text-gray-800"
                }`}
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
              <button
                onClick={handleInference}
                disabled={isProcessing}
                className={`mt-4 w-full py-2 text-white rounded ${
                  isProcessing
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } transition-all duration-300`}
              >
                {isProcessing ? "Running..." : "Run"}
              </button>
            </div>

            {role === "doctor" && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">Report Generation</h2>
                <select
                  className={`w-full p-2 border rounded ${
                    isDark
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} ({patient.email})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleGenerateReport}
                  disabled={!selectedPatient || isGeneratingReport}
                  className={`mt-4 w-full py-2 text-white rounded ${
                    isGeneratingReport
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-500 hover:bg-purple-600"
                  } transition-all duration-300`}
                >
                  {isGeneratingReport
                    ? "Generating Report..."
                    : "Generate & Assign Report"}
                </button>
              </div>
            )}
          </div>
        </aside>
        <main className="flex-1 p-6">
          {selectedInputType === "nii.gz" ? (
            <div className="grid grid-cols-2 gap-6 h-full">
              <div
                className={`${viewerBgClasses} shadow-lg rounded-lg p-4 flex flex-col`}
              >
                <div className="flex items-center justify-between border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                  <span className="font-semibold">MRI Viewer</span>
                </div>
                <div className="relative flex-1 border rounded-lg dark:border-gray-700">
                  <canvas
                    ref={mriCanvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>
              </div>
              <div
                className={`${viewerBgClasses} shadow-lg rounded-lg p-4 flex flex-col`}
              >
                <div className="flex items-center justify-between border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                  <span className="font-semibold">Labels Viewer</span>
                </div>
                <div className="relative flex-1 border rounded-lg dark:border-gray-700">
                  <canvas
                    ref={labelsCanvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 h-full">
              <div
                className={`${viewerBgClasses} shadow-lg rounded-lg p-4 flex flex-col`}
              >
                <div className="flex items-center justify-between border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                  <span className="font-semibold">Input Image</span>
                </div>
                <div className="relative flex-1 border rounded-lg dark:border-gray-700 flex items-center justify-center">
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt="Input"
                      className="max-h-full max-w-full"
                    />
                  )}
                </div>
              </div>
              <div
                className={`${viewerBgClasses} shadow-lg rounded-lg p-4 flex flex-col`}
              >
                <div className="flex items-center justify-between border-b pb-2 mb-2 border-gray-200 dark:border-gray-700">
                  <span className="font-semibold">Result Image</span>
                </div>
                <div className="relative flex-1 border rounded-lg dark:border-gray-700 flex items-center justify-center">
                  {resultImage && (
                    <img
                      src={resultImage}
                      alt="Result"
                      className="max-h-full max-w-full"
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme={isDark ? "dark" : "light"}
        limit={3}
      />
    </div>
  );
}

export default MRIDashboard;
