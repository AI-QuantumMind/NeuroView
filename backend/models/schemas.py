from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId

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

# Doctor Models
class MonitoredMedication(BaseModel):
    medication_name: str
    dosage: str
    start_date: datetime
    end_date: datetime

class MonitoredPatient(BaseModel):
    patient_id: str
    name: str
    medications_given: List[MonitoredMedication] = []

class DoctorBase(BaseModel):
    name: str
    specialization: str
    hospital: str
    phone: str
    email: EmailStr

class DoctorCreate(BaseModel):
    name: str
    specialization: str
    hospital: str
    phone: str
    email: EmailStr
    password: str

class DoctorOut(BaseModel):
    _id: str
    name: str
    specialization: str
    hospital: str
    phone: str
    email: EmailStr
    patients_monitored: List[dict]

# Patient Models
class Medication(BaseModel):
    medication_name: str
    dosage: str
    start_date: datetime
    end_date: Optional[datetime] = None

class MedicalRecord(BaseModel):
    condition: str
    diagnosis_date: datetime
    treatment: str
    medications: List[MonitoredMedication]

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    phone: str
    email: EmailStr
    address: str

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    phone: str
    email: EmailStr
    address: str
    password: str

class PatientOut(BaseModel):
    _id: str
    name: str
    age: int
    gender: str
    phone: str
    email: EmailStr
    address: str
    medical_records: List[dict]
    doctor_id: List[str]

# Authentication Models
class SignupModel(BaseModel):
    email: EmailStr
    password: str
    role: str
    name: str
    phone: str
    specialization: Optional[str] = None
    hospital: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    address: Optional[str] = None

class SigninModel(BaseModel):
    email: EmailStr
    password: str 