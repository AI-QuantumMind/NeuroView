import axiosInstance from './axiosConfig';
import { RAG_ENDPOINTS } from './config';

const ragService = {
  chat: async (message) => {
    try {
      const response = await axiosInstance.post(RAG_ENDPOINTS.CHAT, { message });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  generateReport: async (data) => {
    try {
      const response = await axiosInstance.post(RAG_ENDPOINTS.GENERATE_REPORT, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default ragService; 