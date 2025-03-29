from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from models.schemas import DoctorCreate, DoctorOut, MonitoredMedication
from core.auth import get_current_doctor, get_password_hash
from api.main import db

router = APIRouter()

@router.post("/", response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
async def create_doctor(doctor: DoctorCreate):
    if await db.doctors.find_one({"email": doctor.email}):
        raise HTTPException(status_code=400, detail="Doctor already exists")
    doctor_data = doctor.dict()
    doctor_data["password"] = get_password_hash(doctor.password)
    doctor_data["role"] = "doctor"
    doctor_data["patients_monitored"] = []
    result = await db.doctors.insert_one(doctor_data)
    new_doctor = await db.doctors.find_one({"_id": result.inserted_id})
    new_doctor["_id"] = str(new_doctor["_id"])
    return new_doctor

@router.get("/{id}", response_model=DoctorOut)
async def get_doctor_by_id(id: str, current_user: dict = Depends(get_current_doctor)):
    doctor = await db.doctors.find_one({"_id": ObjectId(id)})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor["_id"] = str(doctor["_id"])
    return doctor

@router.post("/{doctor_id}/monitor-patient/{patient_id}")
async def monitor_patient(
    doctor_id: str,
    patient_id: str,
    medication: MonitoredMedication,
    current_user: dict = Depends(get_current_doctor)
):
    # Check if the doctor exists
    doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Check if the patient exists
    patient = await db.patients.find_one({"_id": ObjectId(patient_id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Check if the patient is already monitored by the doctor
    patient_monitored = next(
        (p for p in doctor.get("patients_monitored", []) if p["patient_id"] == patient_id),
        None,
    )

    if patient_monitored:
        # If the patient is already monitored, add the medication to the list
        await db.doctors.update_one(
            {"_id": ObjectId(doctor_id), "patients_monitored.patient_id": patient_id},
            {"$push": {"patients_monitored.$.medications_given": medication.dict()}},
        )
    else:
        # If the patient is not monitored, add the patient to the list with the medication
        await db.doctors.update_one(
            {"_id": ObjectId(doctor_id)},
            {"$push": {"patients_monitored": {
                "patient_id": patient_id,
                "name": patient["name"],
                "medications_given": [medication.dict()]
            }}},
        )

    # Check if the doctor is already assigned to the patient
    if "doctor_id" not in patient:
        patient["doctor_id"] = []

    if doctor_id not in patient["doctor_id"]:
        # Add the doctor to the patient's doctor_id array
        await db.patients.update_one(
            {"_id": ObjectId(patient_id)},
            {"$push": {"doctor_id": doctor_id}},
        )

    return {"message": "Patient monitored and medication added successfully"} 