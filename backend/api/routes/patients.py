from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from typing import List
from models.schemas import PatientCreate, PatientOut, MedicalRecord
from core.auth import get_current_patient, get_current_doctor, get_password_hash
from api.main import db

router = APIRouter()

@router.post("/", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
async def create_patient(patient: PatientCreate):
    if await db.patients.find_one({"email": patient.email}):
        raise HTTPException(status_code=400, detail="Patient already exists")
    patient_data = patient.dict()
    patient_data["password"] = get_password_hash(patient.password)
    patient_data["role"] = "patient"
    patient_data["medical_records"] = []
    result = await db.patients.insert_one(patient_data)
    new_patient = await db.patients.find_one({"_id": result.inserted_id})
    new_patient["_id"] = str(new_patient["_id"])
    return new_patient

@router.get("/{id}", response_model=PatientOut)
async def get_patient_by_id(id: str, current_user: dict = Depends(get_current_patient)):
    patient = await db.patients.find_one({"_id": ObjectId(id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient["_id"] = str(patient["_id"])
    return patient

@router.put("/{id}/medical-records", response_model=PatientOut)
async def update_medical_records(
    id: str,
    medical_records: List[MedicalRecord],
    current_user: dict = Depends(get_current_doctor)
):
    patient = await db.patients.find_one({"_id": ObjectId(id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    await db.patients.update_one(
        {"_id": ObjectId(id)},
        {"$set": {"medical_records": [record.dict() for record in medical_records]}}
    )
    
    updated_patient = await db.patients.find_one({"_id": ObjectId(id)})
    updated_patient["_id"] = str(updated_patient["_id"])
    return updated_patient

@router.get("/list")
async def get_patients_list(current_user: dict = Depends(get_current_doctor)):
    patients = []
    cursor = db.patients.find()
    async for patient in cursor:
        patient["_id"] = str(patient["_id"])
        patients.append(patient)
    return patients 