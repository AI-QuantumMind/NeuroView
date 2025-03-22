from fastapi import APIRouter, UploadFile, File, HTTPException
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

def preprocess_image(nifti_image):
    data = nifti_image.get_fdata()
    X = np.zeros((VOLUME_SLICES, IMG_SIZE, IMG_SIZE, 2))
    for j in range(VOLUME_SLICES):
        X[j, :, :, 0] = cv2.resize(data[:, :, j + VOLUME_START_AT], (IMG_SIZE, IMG_SIZE))
        X[j, :, :, 1] = cv2.resize(data[:, :, j + VOLUME_START_AT], (IMG_SIZE, IMG_SIZE))
    return X / np.max(X)

def predict(image):
    prediction = model.predict(image, verbose=1)
    return prediction

def save_nifti(data, file_path):
    data = data.astype(np.uint8)
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

@router.post("/predict/")
async def predict_mri(file: UploadFile = File(...)):
    if not file.filename.endswith(".nii.gz"):
        raise HTTPException(status_code=400, detail="Only .nii.gz files are accepted")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".nii.gz") as temp_file:
        temp_file.write(await file.read())
        temp_file_path = temp_file.name

    nifti_image = nib.load(temp_file_path)
    processed_image = preprocess_image(nifti_image)
    prediction = predict(processed_image)
    segmentation = np.argmax(prediction, axis=-1)
    
    output_file_path = "./VisionModel/report/output_prediction.nii.gz"
    save_nifti(segmentation, output_file_path)

    mri_details = extract_mri_details(nifti_image)
    prediction_details = extract_prediction_details(segmentation)

    report = {
        "mri_details": mri_details,
        "prediction_details": prediction_details,
        "segmentation_file": output_file_path
    }

    report_path = "./VisionModel/report/mri_report.json"
    with open(report_path, "w") as json_file:
        json.dump(report, json_file, indent=4)

    return {
        "report": FileResponse(path=report_path, filename="./VisionModel/report/mri_report.json", media_type="application/json"),
        "segmentation_file": FileResponse(path=output_file_path, filename="./VisionModel/report/output_prediction.nii.gz", media_type="application/octet-stream")
    }
