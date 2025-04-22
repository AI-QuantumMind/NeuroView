import nibabel as nib
import numpy as np
from scipy.ndimage import zoom

# Load the original NIfTI file
input_path = "../patient_data/mri_scans/user/segmentation_output.nii.gz"
img = nib.load(input_path)
data = img.get_fdata()
affine = img.affine

# Print original shape
print(f"Original shape: {data.shape}")  # Should be (128, 128, 155)

# Define target shape
target_shape = (240, 240, 155)

# Compute zoom factors (only for x and y, keep z same)
zoom_factors = (
    target_shape[0] / data.shape[0],
    target_shape[1] / data.shape[1],
    1.0 
)

# Resize using interpolation
resized_data = zoom(data, zoom_factors, order=3)  # order=3 is cubic interpolation

# Save resized NIfTI
resized_img = nib.Nifti1Image(resized_data, affine)
output_path = "resized_file.nii.gz"
nib.save(resized_img, output_path)

print(f"Resized image saved to: {output_path}")
