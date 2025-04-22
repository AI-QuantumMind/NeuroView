from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from fastapi.responses import JSONResponse, FileResponse
import nibabel as nib
import numpy as np
import cv2
import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
import tempfile
from tensorflow import keras
from keras import backend as K
from dotenv import load_dotenv
import json

router = APIRouter()

load_dotenv()
MODEL_PATH = os.getenv("MODEL_PATH")

# Create base directory for patient data
PATIENT_DATA_DIR = "./patient_data/mri_scans/user"  
os.makedirs(PATIENT_DATA_DIR, exist_ok=True)

# Custom metrics for model evaluation
def dice_coef(y_true, y_pred, smooth=1.0):
    class_num = 4
    total_loss = 0
    for i in range(class_num):
        y_true_f = K.flatten(y_true[:,:,:,i])
        y_pred_f = K.flatten(y_pred[:,:,:,i])
        intersection = K.sum(y_true_f * y_pred_f)
        loss = ((2. * intersection + smooth) / (K.sum(y_true_f) + K.sum(y_pred_f) + smooth))
        total_loss += loss
    return total_loss / class_num

def precision(y_true, y_pred):
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    predicted_positives = K.sum(K.round(K.clip(y_pred, 0, 1)))
    return true_positives / (predicted_positives + K.epsilon())

def sensitivity(y_true, y_pred):
    true_positives = K.sum(K.round(K.clip(y_true * y_pred, 0, 1)))
    possible_positives = K.sum(K.round(K.clip(y_true, 0, 1)))
    return true_positives / (possible_positives + K.epsilon())

def specificity(y_true, y_pred):
    true_negatives = K.sum(K.round(K.clip((1-y_true) * (1-y_pred), 0, 1)))
    possible_negatives = K.sum(K.round(K.clip(1-y_true, 0, 1)))
    return true_negatives / (possible_negatives + K.epsilon())

def dice_coef_necrotic(y_true, y_pred, epsilon=1e-6):
    intersection = K.sum(K.abs(y_true[:,:,:,1] * y_pred[:,:,:,1]))
    return (2. * intersection) / (K.sum(K.square(y_true[:,:,:,1])) + K.sum(K.square(y_pred[:,:,:,1])) + epsilon)

def dice_coef_edema(y_true, y_pred, epsilon=1e-6):
    intersection = K.sum(K.abs(y_true[:,:,:,2] * y_pred[:,:,:,2]))
    return (2. * intersection) / (K.sum(K.square(y_true[:,:,:,2])) + K.sum(K.square(y_pred[:,:,:,2])) + epsilon)

def dice_coef_enhancing(y_true, y_pred, epsilon=1e-6):
    intersection = K.sum(K.abs(y_true[:,:,:,3] * y_pred[:,:,:,3]))
    return (2. * intersection) / (K.sum(K.square(y_true[:,:,:,3])) + K.sum(K.square(y_pred[:,:,:,3])) + epsilon)

custom_objects = {
    "dice_coef": dice_coef,
    "precision": precision,
    "sensitivity": sensitivity,
    "specificity": specificity,
    "dice_coef_necrotic": dice_coef_necrotic,
    "dice_coef_edema": dice_coef_edema,
    "dice_coef_enhancing": dice_coef_enhancing
}

model = keras.models.load_model(MODEL_PATH, custom_objects=custom_objects, compile=False)

IMG_SIZE = 128
VOLUME_SLICES = 155
VOLUME_START_AT = 0

# Removed unused preprocess_image and predict functions

def predictByPath(file_t1ce, file_flair):
    X = np.empty((VOLUME_SLICES, IMG_SIZE, IMG_SIZE, 2))
    
    vol_path = file_flair
    flair = nib.load(f"../backend/patient_data/mri_scans/user/{file_flair}").get_fdata()
    
    vol_path = file_t1ce
    ce = nib.load(f"../backend/patient_data/mri_scans/user/{file_t1ce}").get_fdata()
    
    for j in range(VOLUME_SLICES):
        X[j,:,:,0] = cv2.resize(flair[:,:,j+VOLUME_START_AT], (IMG_SIZE,IMG_SIZE))
        X[j,:,:,1] = cv2.resize(ce[:,:,j+VOLUME_START_AT], (IMG_SIZE,IMG_SIZE))
    t1ce_path = os.path.join(PATIENT_DATA_DIR, "resize_t1ce.nii.gz")
    flair_path = os.path.join(PATIENT_DATA_DIR, "resize_flair.nii.gz")
    save_nifti(np.transpose(X[:,:,:,0], (1, 2, 0)), flair_path)
    save_nifti(np.transpose(X[:,:,:,1], (1, 2, 0)), t1ce_path)
    return model.predict(X/np.max(X), verbose=1)

def save_nifti(data, file_path):
    data = data.astype(np.float32)
    nifti_img = nib.Nifti1Image(data, np.eye(4))
    nib.save(nifti_img, file_path)

def extract_mri_details(nifti_image):
    header = nifti_image.header
    details = {
        "dimensions": [int(dim) for dim in nifti_image.shape],
        "voxel_size": [float(vx) for vx in header.get_zooms()],
        "slice_thickness": f"{float(header.get_zooms()[2])}mm",
        "data_type": str(header.get_data_dtype())
    }
    if 'descrip' in header:
        details['description'] = header['descrip'].item().decode('utf-8')
    return details

def extract_prediction_details(segmentation):
    region_volumes = {
        "necrotic_tissue_volume": int(np.sum(segmentation == 1)),
        "edema_volume": int(np.sum(segmentation == 2)),
        "enhancing_tumor_volume": int(np.sum(segmentation == 3))
    }

    total_volume = np.prod(segmentation.shape)
    insights = {
        "affected_percentage": {
            region: f"{(volume / total_volume) * 100:.2f}%" 
            for region, volume in region_volumes.items()
        },
        "abnormalities_detected": any(volume > 0 for volume in region_volumes.values())
    }
    return insights

# Helper function to handle file uploads
async def save_uploaded_file(file: UploadFile, file_type: str):
    if not file.filename.endswith(".nii.gz"):
        raise HTTPException(status_code=400, detail=f"Only .nii.gz files are accepted for {file_type}")
    
    try:
        # Create patient directory structure
        patient_dir = PATIENT_DATA_DIR
        os.makedirs(patient_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(patient_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        return JSONResponse(
            content={"message": f"{file_type} file saved successfully at {file_path}"},
            status_code=200
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving {file_type} file: {str(e)}")

@router.post("/api/mri/upload/t1ce")
async def upload_t1ce_file(t1ce_file: UploadFile = File(...)):
    return await save_uploaded_file(t1ce_file, "T1CE")

@router.post("/api/mri/upload/flair")
async def upload_flair_file(flair_file: UploadFile = File(...)):
    return await save_uploaded_file(flair_file, "FLAIR")

@router.post("/api/mri/predict")
async def predict_mri(t1ce_filename: str = Body(...), flair_filename: str = Body(...)):
    try:
        # Use the predictByPath function
        prediction = predictByPath(t1ce_filename, flair_filename)
        save_nifti(np.transpose(prediction[:,:,:,1], (1, 2, 0)), "./one.nii.gz")
        save_nifti(np.transpose(prediction[:,:,:,2], (1, 2, 0)), "./two.nii.gz")
        save_nifti(np.transpose(prediction[:,:,:,3], (1, 2, 0)), "./three.nii.gz")
        segmentation = np.argmax(prediction, axis=-1)
        
        # Save segmentation output
        output_path = os.path.join(PATIENT_DATA_DIR, "segmentation_output.nii.gz")
        save_nifti(np.transpose(segmentation, (1, 2, 0)), output_path)
        
        # Load T1CE file for details
        nifti_image = nib.load(f"../backend/patient_data/mri_scans/user/{t1ce_filename}")
        mri_details = extract_mri_details(nifti_image)
        prediction_details = extract_prediction_details(segmentation)

        report = {
            "mri_details": mri_details,
            "prediction_details": prediction_details,
            "segmentation_file": output_path,
            "t1ce_file": t1ce_filename,
        }

        report_path = os.path.join(PATIENT_DATA_DIR, "mri_report.json")
        with open(report_path, "w") as json_file:
            json.dump(report, json_file, indent=4)

        return {
            "report": FileResponse(path=report_path, filename="mri_report.json", media_type="application/json"),
            "segmentation_file": "segmentation_output.nii.gz",
            "file_name": t1ce_filename,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")
