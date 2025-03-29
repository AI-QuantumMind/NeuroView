export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const AUTH_ENDPOINTS = {
  SIGNUP: '/auth/signup',
  SIGNIN: '/auth/signin'
};

export const DOCTOR_ENDPOINTS = {
  CREATE_DOCTOR: '/doctors',
  GET_DOCTOR: (id) => `/doctors/${id}`,
  MONITOR_PATIENT: (doctorId, patientId) => `/doctors/${doctorId}/patients/${patientId}/monitor`,
  GET_PATIENTS: (doctorId) => `/doctors/${doctorId}/patients`,
  UPDATE_PROFILE: (doctorId) => `/doctors/${doctorId}/profile`,
  GET_MEDICAL_RECORDS: (doctorId) => `/doctors/${doctorId}/medical-records`,
  ADD_MEDICAL_RECORD: (doctorId, patientId) => `/doctors/${doctorId}/patients/${patientId}/medical-records`,
  GET_APPOINTMENTS: (doctorId) => `/doctors/${doctorId}/appointments`,
  SCHEDULE_APPOINTMENT: (doctorId) => `/doctors/${doctorId}/appointments`,
  UPDATE_APPOINTMENT: (doctorId, appointmentId) => `/doctors/${doctorId}/appointments/${appointmentId}`,
  GET_NOTIFICATIONS: (doctorId) => `/doctors/${doctorId}/notifications`,
  MARK_NOTIFICATION_READ: (doctorId, notificationId) => `/doctors/${doctorId}/notifications/${notificationId}/read`
};

export const PATIENT_ENDPOINTS = {
  CREATE_PATIENT: '/patients',
  GET_PATIENT: (id) => `/patients/${id}`,
  UPDATE_MEDICAL_RECORDS: (id) => `/patients/${id}/medical-records`,
  GET_PATIENTS_LIST: '/patients'
};

export const VISION_ENDPOINTS = {
  ANALYZE_MRI: '/vision/analyze-mri',
  GENERATE_REPORT: '/vision/generate-report'
};

export const RAG_ENDPOINTS = {
  CHAT: '/rag/chat',
  GENERATE_REPORT: '/rag/generate-report'
}; 