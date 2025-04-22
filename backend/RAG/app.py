import asyncio
from datetime import datetime
from bson import ObjectId  
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
async def generate_report(request: ReportRequest):
    try:
        # 1) Generate the HTML report
        report = await asyncio.to_thread(
            report_generation, 
            request.data_json, 
            request.patient_id, 
            request.doctor_id
        )

        client = AsyncIOMotorClient(MONGO_URI)
        db = client.get_default_database()

        # 2) Save HTML file
        dir_path = f"./patient/{request.patient_id}"
        await asyncio.to_thread(os.makedirs, dir_path, exist_ok=True)
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        report_filename = f"{dir_path}/medical_report_{timestamp}.html"
        with open(report_filename, "w") as file:
            file.write(report)

        # 3) Insert into reports collection
        report_document = {
            "patient_id": request.patient_id,
            "doctor_id": request.doctor_id,
            "html_path": report_filename,
            "timestamp": datetime.utcnow(),
        }
        result = await db.reports.insert_one(report_document)
        new_report_id = str(result.inserted_id)

        # 4) **Append the report ID to the patient’s report_ids array**
        await db.patients.update_one(
            {"_id": ObjectId(request.patient_id)},
            {"$push": {"report_ids": new_report_id}}
        )

        # 5) Return everything (including the new report_id)
        return {
            "report": report,
            "html_path": report_filename,
            "doctor_id": request.doctor_id,
            "time": timestamp,
            "report_id": new_report_id
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Report generation failed: {str(e)}"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Report generation failed: {str(e)}"
        )

@route_rag.post("/download")
def download_report(request: DownloadRequest):
    pdf_filename = convert_md_to_pdf(f"patient/{request.patient_id}/medical_report.md")
    with open(pdf_filename, "rb") as file:
        content = file.read()
    return Response(content, media_type="application/pdf", headers={
        "Content-Disposition": f"attachment; filename={os.path.basename(pdf_filename)}"
    })
