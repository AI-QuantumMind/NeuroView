import torch
import cv2
import numpy as np
import os

class YOLOModel:
    def __init__(self, model_path=None):
        if model_path is None:
            # Default to best.pt in the weights directory
            model_path = os.path.join(
                os.path.dirname(__file__),
                "weights",
                "best.pt"
            )
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
            
        self.model = torch.hub.load('ultralytics/yolov5', 'custom', path=model_path)
        self.model.eval()
    
    def predict(self, image):
        # Convert image to RGB if needed
        if len(image.shape) == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
        elif image.shape[2] == 4:
            image = cv2.cvtColor(image, cv2.COLOR_BGRA2RGB)
        elif image.shape[2] == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Run inference
        results = self.model(image)
        
        # Process results
        detections = []
        for pred in results.xyxy[0]:  # xyxy format
            x1, y1, x2, y2, conf, cls = pred.cpu().numpy()
            detections.append({
                'bbox': [float(x1), float(y1), float(x2), float(y2)],
                'confidence': float(conf),
                'class': int(cls)
            })
        
        return {
            'detections': detections,
            'image_size': image.shape[:2]
        } 