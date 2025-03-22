from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import cv2
import numpy as np
import os
import tempfile
from ultralytics import YOLO

app = FastAPI()
router = APIRouter()

YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH")

model = YOLO(YOLO_MODEL_PATH)

def read_imagefile(file_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

@router.post("/predict/")
async def predict_image(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png")):
        raise HTTPException(status_code=400, detail="Only image files (jpg, jpeg, png) are accepted")
    file_bytes = await file.read()
    image = read_imagefile(file_bytes)
    if image is None:
        raise HTTPException(status_code=400, detail="Error processing the image file")
    results = model.predict(source=image, imgsz=640, conf=0.5)
    annotated_image = results[0].plot(line_width=1)
    import os
    os.makedirs(".VisionModel/report", exist_ok=True)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        output_path = temp_file.name
        cv2.imwrite(output_path, annotated_image)
    report_path = "./VisionModel/report/annotated_image.jpg"
    cv2.imwrite(report_path, annotated_image)
    image_path = "./backend/VisionModel/report/annotated_image.jpg"
    return {"result": FileResponse(path=image_path, media_type="image/jpeg", filename="annotated_image.jpg")}


