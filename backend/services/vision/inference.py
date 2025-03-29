from fastapi import UploadFile
import cv2
import numpy as np
from .model.yolo_model import YOLOModel

async def process_mri_image(file: UploadFile):
    # Read the uploaded file
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Initialize YOLO model (will use default path from weights directory)
    model = YOLOModel()
    
    # Process the image
    results = model.predict(img)
    
    return results 