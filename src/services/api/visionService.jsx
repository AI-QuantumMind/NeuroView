import axiosInstance from './axiosConfig';
import { VISION_ENDPOINTS } from './config';

const visionService = {
  analyzeMRI: async (imageData) => {
    try {
      const response = await axiosInstance.post(VISION_ENDPOINTS.ANALYZE_MRI, imageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  generateReport: async (analysisData) => {
    try {
      const response = await axiosInstance.post(VISION_ENDPOINTS.GENERATE_REPORT, analysisData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default visionService; 