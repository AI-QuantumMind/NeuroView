from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId
from models.schemas import SignupModel, SigninModel
from core.auth import get_password_hash, verify_password, create_access_token
from api.main import db

router = APIRouter()

@router.post("/signup")
async def signup(data: SignupModel):
    # Check if user already exists in either collection
    doctor_exists = await db.doctors.find_one({"email": data.email})
    patient_exists = await db.patients.find_one({"email": data.email})
    
    if doctor_exists or patient_exists:
        raise HTTPException(status_code=400, detail="User already exists")

    # Create user data based on role
    user_data = data.dict()
    user_data["password"] = get_password_hash(data.password)
    
    # Insert into appropriate collection
    collection = "doctors" if data.role == "doctor" else "patients"
    result = await db[collection].insert_one(user_data)

    return {"message": "User created successfully", "id": str(result.inserted_id)}

@router.post("/signin")
async def signin(form_data: OAuth2PasswordRequestForm = Depends()):
    # Check both collections for the user
    doctor = await db.doctors.find_one({"email": form_data.username})
    patient = await db.patients.find_one({"email": form_data.username})
    
    user = doctor or patient
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(
        data={
            "sub": str(user["_id"]),
            "role": "doctor" if doctor else "patient"
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "role": "doctor" if doctor else "patient"
    } 