from fastapi import APIRouter, HTTPException, Depends
from services.rag.chatbot import get_chatbot_response
from services.rag.report_generation import generate_medical_report
from core.auth import get_current_doctor

router = APIRouter()

@router.post("/chat")
async def chat(
    query: str,
    current_user: dict = Depends(get_current_doctor)
):
    try:
        response = await get_chatbot_response(query)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-report")
async def create_medical_report(
    patient_data: dict,
    current_user: dict = Depends(get_current_doctor)
):
    try:
        report = await generate_medical_report(patient_data)
        return {"report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 