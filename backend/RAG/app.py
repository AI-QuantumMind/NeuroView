from datetime import datetime
import os
from fastapi import Response, HTTPException, APIRouter
from pydantic import BaseModel
from RAG.chatbot import chatbot_response
from RAG.report_generation import report_generation
from utils import convert_md_to_pdf
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
route_rag = APIRouter()

class ChatRequest(BaseModel):
    query: str

class ReportRequest(BaseModel):
    patient_id: str
    doctor_id: str
    data_json: dict

class DownloadRequest(BaseModel):
    patient_id: str

@route_rag.post("/chat")
def chat(request: ChatRequest):
    response = chatbot_response(request.query)
    return {"query": request.query, "response": response}

@route_rag.post("/report")
def generate_report(request: ReportRequest):
    report = report_generation(request.data_json, request.patient_id, request.doctor_id)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_filename = f"./patient/{request.patient_id}/medical_report_{timestamp}.md"
    os.makedirs(f"./patient/{request.patient_id}", exist_ok=True)
    with open(report_filename, "w") as file:
        file.write(report)
    pdf_filename = convert_md_to_pdf(report_filename)
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_default_database()
    report_document = {
        "patient_id": request.patient_id,
        "doctor_id": request.doctor_id,
        "report_content": report,
        "pdf_path": pdf_filename,
        "timestamp": timestamp,
        "generated_at": datetime.now()
    }
    result = db.reports.insert_one(report_document)
    client.close()
    return {"report": report, "pdf_path": pdf_filename, "doctor_id": request.doctor_id, "time": timestamp}

@route_rag.post("/download")
def download_report(request: DownloadRequest):
    pdf_filename = convert_md_to_pdf(f"patient/{request.patient_id}/medical_report.md")
    with open(pdf_filename, "rb") as file:
        content = file.read()
    return Response(content, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename={os.path.basename(pdf_filename)}"
    })
