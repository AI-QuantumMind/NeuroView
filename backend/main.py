import nibabel as nib

# Load the .nii file
img = nib.load("./patient_data/mri_scans/user/segmentation_output.nii.gz")

img = img.get_fdata()
img  = img[:,:,:,1]
# Save it as .nii.gz (this will compress it)
nib.save(img, "./patient_data/test_scan/rts.nii.gz")
