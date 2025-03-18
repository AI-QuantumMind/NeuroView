import os
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, EmailStr, Field
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from passlib.context import CryptContext
import jwt
from bson import ObjectId
from fastapi.middleware.cors import CORSMiddleware

# -----------------------
# Load environment variables
# -----------------------
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")

# -----------------------
# Setup FastAPI and Database
# -----------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Use ["*"] to allow all origins (not recommended for production)
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

class PatientCreate(PatientBase):
    password: str

class PatientOut(PatientBase):
    id: str = Field(alias="_id")
    medical_records: List[MedicalRecord] = []
    doctor_id: Optional[str] = None

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
    user["_id"] = str(user["_id"])
    token = create_access_token({"id": user["_id"], "role": role})
    return {"message": f"Signup successful as {role}", "token": token, "role": role}

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
    token = create_access_token({"id": str(user["_id"]), "role": role})
    return {"message": f"Login successful as {role}", "token": token, "role": role}

# -----------------------
# Run the application
# -----------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
