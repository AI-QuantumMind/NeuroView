import axiosInstance from './axiosConfig';
import { DOCTOR_ENDPOINTS } from './config';

const doctorService = {
  createDoctor: async (doctorData) => {
    try {
      const response = await axiosInstance.post(DOCTOR_ENDPOINTS.CREATE_DOCTOR, doctorData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getDoctorById: async (id) => {
    try {
      const response = await axiosInstance.get(DOCTOR_ENDPOINTS.GET_DOCTOR(id));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  monitorPatient: async (doctorId, patientId, medicationData) => {
    try {
      const response = await axiosInstance.post(
        DOCTOR_ENDPOINTS.MONITOR_PATIENT(doctorId, patientId),
        medicationData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMonitoredPatients: async (doctorId) => {
    try {
      const response = await axiosInstance.get(DOCTOR_ENDPOINTS.GET_PATIENTS(doctorId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateProfile: async (doctorId, updateData) => {
    try {
      const response = await axiosInstance.put(DOCTOR_ENDPOINTS.UPDATE_PROFILE(doctorId), updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMedicalRecords: async (doctorId) => {
    try {
      const response = await axiosInstance.get(DOCTOR_ENDPOINTS.GET_MEDICAL_RECORDS(doctorId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addMedicalRecord: async (doctorId, patientId, recordData) => {
    try {
      const response = await axiosInstance.post(
        DOCTOR_ENDPOINTS.ADD_MEDICAL_RECORD(doctorId, patientId),
        recordData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAppointments: async (doctorId) => {
    try {
      const response = await axiosInstance.get(DOCTOR_ENDPOINTS.GET_APPOINTMENTS(doctorId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  scheduleAppointment: async (doctorId, appointmentData) => {
    try {
      const response = await axiosInstance.post(
        DOCTOR_ENDPOINTS.SCHEDULE_APPOINTMENT(doctorId),
        appointmentData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateAppointmentStatus: async (doctorId, appointmentId, status) => {
    try {
      const response = await axiosInstance.put(
        DOCTOR_ENDPOINTS.UPDATE_APPOINTMENT(doctorId, appointmentId),
        { status }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getNotifications: async (doctorId) => {
    try {
      const response = await axiosInstance.get(DOCTOR_ENDPOINTS.GET_NOTIFICATIONS(doctorId));
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  markNotificationAsRead: async (doctorId, notificationId) => {
    try {
      const response = await axiosInstance.put(
        DOCTOR_ENDPOINTS.MARK_NOTIFICATION_READ(doctorId, notificationId)
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default doctorService; 