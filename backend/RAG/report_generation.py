import os
from dotenv import load_dotenv
import requests
from llama_index.llms.gemini import Gemini

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

llm = Gemini(
    model="models/gemini-2.0-flash",
)

# patient_details={
#   "name": "admin",
#   "age": 22,
#   "gender": "male",
#   "phone": "1234567890",
#   "email": "admin@gmail.com",
#   "address": "Pune",
#   "_id": "67d6d54673def64d23e53ecf",
#   "medical_records": [
#     {
#       "condition": "Hypertension",
#       "diagnosis_date": "2024-01-10T00:00:00",
#       "treatment": "Lifestyle changes and medication",
#       "medications": [
#         {
#           "medication_name": "Amlodipine",
#           "dosage": "5mg",
#           "start_date": "2024-01-15T00:00:00",
#           "end_date": "2024-06-15T00:00:00"
#         },
#         {
#           "medication_name": "Losartan",
#           "dosage": "50mg",
#           "start_date": "2024-01-15T00:00:00",
#           "end_date": "2024-06-15T00:00:00"
#         }
#       ]
#     },
#     {
#       "condition": "Asthma",
#       "diagnosis_date": "2023-09-05T00:00:00",
#       "treatment": "Inhaler therapy",
#       "medications": [
#         {
#           "medication_name": "Salbutamol",
#           "dosage": "2 puffs as needed",
#           "start_date": "2023-09-10T00:00:00",
#           "end_date": null
#         }
#       ]
#     }
#   ],
#   "doctor_id": null
# }
# docotr_details={
#   "name": "admin",
#   "specialization": "Orthopedics",
#   "hospital": "General Hospital",
#   "phone": "1234567890",
#   "email": "dr.admin@gmail.com",
#   "_id": "67d6d3e473def64d23e53ec2",
#   "patients_monitored": []
# }
# dummy_data_json={
#     "details": {
#         "dimensions": [
#             240,
#             240,
#             155
#         ],
#         "voxel_size": [
#             1.0,
#             1.0,
#             1.0
#         ],
#         "slice_thickness": "1.0mm",
#         "data_type": "int16",
#         "description": ""
#     },
#     "prediction_insights": {
#         "affected_percentage": {
#             "necrotic_tissue_volume": "0.13%",
#             "edema_volume": "0.02%",
#             "enhancing_tumor_volume": "0.26%"
#         },
#         "abnormalities_detected": True,
#     },
#     "segmentation_file": "output_prediction.nii.gz"
# }

def get_patient_details(patient_id):
    """
    Fetches patient details from the database using the provided patient ID.
    Returns patient details excluding _id, doctor_id, start_date, and end_date.
    """
    url = f"http://localhost:8000/patients/{patient_id}"
    
    try:
        response = requests.get(url)
        
        if response.status_code != 200:
            return {"error": "Failed to fetch patient details"}
        
        patient_details = response.json()
        
        # Extract necessary details
        filtered_details = {
            "name": patient_details.get("name"),
            "age": patient_details.get("age"),
            "_id": patient_details.get("_id"),
            "gender": patient_details.get("gender"),
            "phone": patient_details.get("phone"),
            "email": patient_details.get("email"),
            "address": patient_details.get("address"),
            "medical_records": []
        }

        # Process medical records, excluding start_date and end_date
        for record in patient_details.get("medical_records", []):
            medical_record = {
                "condition": record.get("condition"),
                "diagnosis_date": record.get("diagnosis_date"),
                "treatment": record.get("treatment"),
                "medications": []
            }

            for med in record.get("medications", []):
                medical_record["medications"].append({
                    "medication_name": med.get("medication_name"),
                    "dosage": med.get("dosage")
                })
            
            filtered_details["medical_records"].append(medical_record)

        return filtered_details

    except requests.exceptions.RequestException as e:
        return {"error": f"Request failed: {str(e)}"}
    

def get_doctor_details(doctor_id):
    """
    Fetches doctor details from the database using the provided doctor ID.
    Returns only the name, phone, email, and hospital.
    """
    url = f"http://localhost:8000/doctors/{doctor_id}"
    
    try:
        response = requests.get(url)
        
        if response.status_code != 200:
            return {"error": "Failed to fetch doctor details"}
        
        doctor_details = response.json()
        
        # Filter the required fields
        filtered_details = {
            "name": doctor_details.get("name"),
            "phone": doctor_details.get("phone"),
            "email": doctor_details.get("email"),
            "hospital": doctor_details.get("hospital")
        }
        
        return filtered_details

    except requests.exceptions.RequestException as e:
        return {"error": f"Request failed: {str(e)}"}
    


def report_generation(data_json,patient_id,doctor_id):
    """
    Generates a medical report in Markdown format using the provided JSON data.
    """

    patient_details=get_patient_details(patient_id)
    doctor_details=get_doctor_details(doctor_id)

    

    data_json.update({
    "patient": patient_details,
    "doctor": doctor_details
    })
    with open("./RAG/template.txt", "r") as file:   #TODO : add the relative path kuch to gadbad hai
        template = file.read()
    
    response = llm.complete(
        f"""
        Follow the following steps to generate a report in markdown format: {template} 
        
        Here's the data required in JSON format: {data_json}
        """
    )
    
    response_text = response.text
    start_delimiter = "```markdown"
    end_delimiter = "```"
    start_index = response_text.find(start_delimiter) + len(start_delimiter)
    end_index = response_text.rfind(end_delimiter)
    if start_index != -1:
        return response_text[start_index:end_index].strip()

# Example usage (assuming data_json comes from an API call)
# report = report_generation(data_json)
# print(report)
