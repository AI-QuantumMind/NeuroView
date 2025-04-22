import os
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from passlib.context import CryptContext
import jwt
from bson import ObjectId
from VisionModel.ai_model import router as ai_router
from fastapi.middleware.cors import CORSMiddleware
from RAG.app import route_rag
from VisionModel.yolo_api import router as yolo_router
# -----------------------
# Load environment variables
# -----------------------
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")

# -----------------------
# Setup FastAPI and Database
# -----------------------
app = FastAPI()
app.mount("/patient", StaticFiles(directory="patient"), name="patient")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],      # Use ["*"] to allow all origins (not recommended for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
client = AsyncIOMotorClient(MONGO_URI)
db = client.get_default_database()  # you can also use client["final-year"]

# -----------------------
# Password Hashing and JWT Helpers
# -----------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = timedelta(hours=1)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

# -----------------------
# Utility for ObjectId conversion
# -----------------------
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# -----------------------
# Pydantic Models
# -----------------------
# --- For Doctor ---
class MonitoredMedication(BaseModel):
    medication_name: str
    dosage: str
    start_date: datetime
    end_date: Optional[datetime] = None

class MonitoredPatient(BaseModel):
    patient_id: str  # ObjectId stored as string
    name : str
    medications_given: List[MonitoredMedication] = []

class DoctorBase(BaseModel):
    name: str
    specialization: str
    hospital: str
    phone: str
    email: EmailStr

class DoctorCreate(DoctorBase):
    password: str

class DoctorOut(DoctorBase):
    id: str = Field(alias="_id")
    patients_monitored: List[MonitoredPatient] = []

    class Config:
        allow_population_by_field_name = True

# --- For Patient ---
class Medication(BaseModel):
    
    medication_name: str
    dosage: str
    start_date: datetime
    end_date: Optional[datetime] = None

# class Reports(BaseModel):
#     links: str

class MedicalRecord(BaseModel):
    condition: str
    diagnosis_date: datetime
    treatment: str
    medications: List[Medication] = []

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    phone: str
    email: EmailStr
    address: str
    report_ids:List[str]=[]

class PatientCreate(PatientBase):
    password: str

class PatientOut(PatientBase):
    id: str = Field(alias="_id")
    medical_records: List[MedicalRecord] = []
    doctor_id: Optional[List[str]] = None

    class Config:
        allow_population_by_field_name = True

# --- For Signup / Signin ---
class SignupModel(BaseModel):
    email: EmailStr
    password: str
    role: str  # "doctor" or "patient"
    # Additional fields for user creation
    name: str
    phone: str
    # For doctor:
    specialization: Optional[str] = None
    hospital: Optional[str] = None
    # For patient:
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None

class SigninModel(BaseModel):
    email: EmailStr
    password: str
# -----------------------
# API Routes
# -----------------------
# Create a new doctor
@app.post("/doctors", response_model=DoctorOut, status_code=status.HTTP_201_CREATED)
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

# Get doctor by id
@app.get("/doctors/{id}", response_model=DoctorOut)
async def get_doctor_by_id(id: str):
    doctor = await db.doctors.find_one({"_id": ObjectId(id)})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor["_id"] = str(doctor["_id"])
    return doctor

# get the Assigned patients
@app.get("/api/doctor/{doctor_id}/patients")
async def get_doctor_patients(doctor_id: str):
    try:
        doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        # Extract monitored patients with their details
        patients = []
        for monitored in doctor.get("patients_monitored", []):
            patient = await db.patients.find_one({"_id": ObjectId(monitored["patient_id"])})
            if patient:
                patients.append({
                    "_id": str(patient["_id"]),
                    "name": patient["name"],
                    "email": patient["email"]
                })
        
        return patients
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# update or assigns doctor to patient and patients to doctor
@app.post("/doctors/{doctor_id}/monitor-patient/{patient_id}")
async def monitor_patient(
    doctor_id: str,
    patient_id: str,
    medication: MonitoredMedication  # Use the existing MonitoredMedication model
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
                "name": patient["name"],  # Include the patient's name
                "medications_given": [medication.dict()]
            }}},
        )

    # Check if the doctor is already assigned to the patient
    if "doctor_id" not in patient:
        patient["doctor_id"] = []  # Initialize if not present

    if doctor_id not in patient["doctor_id"]:
        # Add the doctor to the patient's doctor_id array
        await db.patients.update_one(
            {"_id": ObjectId(patient_id)},
            {"$push": {"doctor_id": doctor_id}},
        )

    # Return success message
    return {"message": "Patient monitored and medication added successfully"}

@app.get("/doctor/patients/", response_model=List[MonitoredPatient])
async def get_doctor_patients(doctor_id: str):
    """
    Get all patients monitored by a specific doctor
    """
    doctor = await db.doctors.find_one({"_id": ObjectId(doctor_id)})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Return the list of monitored patients
    return doctor.get("patients_monitored", [])
# Patients API

# Create a new patient
@app.post("/patients", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
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

# Get patient by id
@app.get("/patients/{id}", response_model=PatientOut)
async def get_patient_by_id(id: str):
    patient = await db.patients.find_one({"_id": ObjectId(id)})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    patient["_id"] = str(patient["_id"])
    return patient


# Mount a static directory for reports
app.mount("/reports", StaticFiles(directory="patient"), name="reports")

@app.get("/api/report/{report_id}")
async def get_report(report_id: str):
    try:
        report = await db.reports.find_one({"_id": ObjectId(report_id)})
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # Return the report data including the URL to access it
        return {
            "id": str(report["_id"]),
            "name": report.get("name", "Medical Report"),
            "date": report.get("timestamp", ""),
            "doctor_id": report.get("doctor_id", ""),
            "report_url": f"/reports/{report['html_path'].split('patient/')[-1]}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add this to your FastAPI app
@app.get("/api/patient/{patient_id}/reports")
async def get_patient_reports(patient_id: str):
    try:
        # Fetch the patient to verify they exist
        patient = await db.patients.find_one({"_id": ObjectId(patient_id)})
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Fetch all reports for this patient
        reports = []
        for report_id in patient.get("report_ids", []):
            report = await db.reports.find_one({"_id": ObjectId(report_id)})
            if report:
                reports.append({
                    "id": str(report["_id"]),
                    "name": report.get("name", "Medical Report"),
                    "date": report.get("timestamp", ""),
                    "doctor_id": report.get("doctor_id", ""),
                    "html_path": report.get("html_path", "")
                })
        
        # Get doctor names for each report
        for report in reports:
            if report["doctor_id"]:
                doctor = await db.doctors.find_one({"_id": ObjectId(report["doctor_id"])})
                if doctor:
                    report["doctor_name"] = doctor.get("name", "Unknown Doctor")
        
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.put("/patients/{id}/medical-records", response_model=PatientOut)
async def update_medical_records(id: str, medical_records: List[MedicalRecord]):
    patient = await db.patients.find_one({"_id": ObjectId(id)})
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Append the new medical records to the existing ones
    updated_data = {"$push": {"medical_records": {"$each": jsonable_encoder(medical_records)}}}
    await db.patients.update_one({"_id": ObjectId(id)}, updated_data)

    # Return updated patient data
    updated_patient = await db.patients.find_one({"_id": ObjectId(id)})
    updated_patient["_id"] = str(updated_patient["_id"])  # Convert ObjectId to string
    return updated_patient

@app.get("/patients-list")
async def get_patients_list():
    try:
        # Fetch all patients from the database
        patients = await db.patients.find({}, {"_id": 1, "name": 1}).to_list(None)

        # Format the response
        patients_list = [
            {"patient_id": str(patient["_id"]), "name": patient["name"]}
            for patient in patients
        ]

        return patients_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

## Auth Api 
# Signup endpoint (for both doctors and patients)
@app.post("/signup")
async def signup(data: SignupModel):
    role = data.role.lower()
    if role not in ["doctor", "patient"]:
        raise HTTPException(status_code=400, detail="Invalid role. Choose 'doctor' or 'patient'.")
    collection = db.doctors if role == "doctor" else db.patients
    if await collection.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="User already exists")
    user_data = data.dict()
    user_data["password"] = get_password_hash(user_data["password"])
    user_data["role"] = role
    if role == "doctor":
        user_data.setdefault("patients_monitored", [])
    else:
        user_data.setdefault("medical_records", [])
    result = await collection.insert_one(user_data)
    user = await collection.find_one({"_id": result.inserted_id})
    
    user_id = str(user["_id"])
    token = create_access_token({"id":user_id, "role": role})
    
    return {"message": f"Signup successful as {role}", "token": token, "role": role,"id":user_id}

# Signin endpoint
@app.post("/signin")
async def signin(data: SigninModel):
    email = data.email
    # Determine role based on email; for example, if it starts with "dr." we expect a doctor.
    role = "doctor" if email.startswith("dr.") else "patient"
    collection = db.doctors if role == "doctor" else db.patients
    user = await collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    # Role validation: for doctors, ensure specialization exists; for patients, ensure it does not.
    if role == "doctor" and not user.get("specialization"):
        raise HTTPException(status_code=403, detail="Access denied. Expected role: doctor")
    if role == "patient" and user.get("specialization"):
        raise HTTPException(status_code=403, detail="Access denied. Expected role: patient")
    if not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    user_id = str(user["_id"])
    token = create_access_token({"id":user_id, "role": role})
    
    return {"message": f"Login successful as {role}", "token": token, "role": role,"id":user_id}

app.include_router(ai_router, prefix="")
app.include_router(yolo_router, prefix="/yolo")

# -----------------------
# Include the RAG routes
# -----------------------
app.include_router(route_rag,prefix="/rag")

# -----------------------
# Run the application
# -----------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
