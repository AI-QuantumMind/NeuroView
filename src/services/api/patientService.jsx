import axiosInstance from './axiosConfig';
import { PATIENT_ENDPOINTS } from './config';

const patientService = {
  createPatient: async (patientData) => {
    try {
      const response = await axiosInstance.post(PATIENT_ENDPOINTS.CREATE_PATIENT, patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPatient: async (id) => {
    try {
      const response = await axiosInstance.get(PATIENT_ENDPOINTS.GET_PATIENT(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateMedicalRecords: async (id, records) => {
    try {
      const response = await axiosInstance.put(
        PATIENT_ENDPOINTS.UPDATE_MEDICAL_RECORDS(id),
        records
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPatientsList: async () => {
    try {
      const response = await axiosInstance.get(PATIENT_ENDPOINTS.GET_PATIENTS_LIST);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default patientService; 