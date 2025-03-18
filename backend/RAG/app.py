from datetime import datetime
import os
from fastapi import FastAPI,Response
from pydantic import BaseModel
from RAG.chatbot import chatbot_response
from fastapi.middleware.cors import CORSMiddleware
from RAG.report_generation import report_generation
from utils import convert_md_to_pdf
from fastapi import APIRouter


data_json = {
  "patient_info": {
    "full_name": "John Doe",
    "age": 45,
    "gender": "Male",
    "contact_details": "+1-234-567-8901",
    "patient_id": "MR2025001"
  },
  
  "exam_details": {
    "body_part": "Brain",
    "positioning": "Supine",
    "contrast_used": "true",
    "slice_thickness": "5mm",
    "anatomical_landmarks": "Standard neuroimaging reference points",
    "special_instructions": "Patient sedated due to claustrophobia"
  },
  "clinical_indications": {
    "present_symptoms": ["Headache", "Dizziness", "Memory loss"],
    "relevant_medical_history": "Previous transient ischemic attack",
    "prior_tests": "CT Scan (2024-12-15): No acute abnormalities"
  },
  "image_findings": {
    "description": "Mild periventricular white matter hyperintensities noted.",
    "abnormalities": [
      {
        "location": "Left frontal lobe",
        "size": "1.5 cm",
        "characteristics": "Hyperintense lesion with no mass effect"
      }
    ],
    "incidental_findings": "Mild sinusitis noted."
  },
  "impressions": {
    "summary": "Findings suggestive of chronic microvascular ischemic changes.",
    "differential_diagnoses": ["Small vessel disease", "Chronic ischemic gliosis"],
    "recommendations": "Clinical correlation advised. Consider follow-up MRI in 6 months."
  },
  "signature": {
    "doctor_name": "Dr. Emily Carter",
    "credentials": "MD, Radiology",
    "license_number": "RAD789123"
  }
}

route_rag = APIRouter()

# route_rag.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],  # Exact origin for your React app
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Ensure OPTIONS is included
#     allow_headers=["*"],
# )

class ChatRequest(BaseModel):
    query: str

@route_rag.get("/")
def home():
    return {"message": "Welcome to the Chatbot API"}


@route_rag.post("/chat")
def chat(request: ChatRequest):
    response = chatbot_response(request.query)
    return {"query": request.query, "response": response}

@route_rag.post("/report")
def generate_report():
    """
    Fetches MRI data from the /mri endpoint, generates a report, and returns it.
    """
    # mri_data_response = requests.get("http://localhost:8000/mri")  # TODO: Update with actual API URL
    
    # if mri_data_response.status_code != 200:
    #     return {"error": "Failed to fetch MRI data"}
    
    # data_json = mri_data_response.json()
    report = report_generation(data_json)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_filename = f"patient/medical_report.md" #TODO : add timestamp to reportfile
    
    os.makedirs("patient", exist_ok=True)
    
    with open(report_filename, "w") as file:
        file.write(report)
    
    return {"report": report}

@route_rag.get("/download")
def download_report():
    """
    Converts the latest medical report from Markdown to PDF and serves it for download.
    """
    
    
    pdf_filename = convert_md_to_pdf("medical_report.md") #TODO add the actuall filename
    
    with open(pdf_filename, "rb") as file:
        content = file.read()
    
    return Response(content, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename={os.path.basename(pdf_filename)}"
    })

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(route_rag, host="0.0.0.0", port=8000)
