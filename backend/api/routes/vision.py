from fastapi import APIRouter, UploadFile, File, Depends
from services.vision.inference import process_mri_image
from services.vision.report import generate_report
from core.auth import get_current_doctor

router = APIRouter()

@router.post("/analyze-mri")
async def analyze_mri(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_doctor)
):
    # Process the MRI image
    analysis_result = await process_mri_image(file)
    
    # Generate report based on analysis
    report = await generate_report(analysis_result)
    
    return {
        "analysis": analysis_result,
        "report": report
    }

@router.post("/generate-report")
async def create_report(
    analysis_data: dict,
    current_user: dict = Depends(get_current_doctor)
):
    report = await generate_report(analysis_data)
    return {"report": report} 