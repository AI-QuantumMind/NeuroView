import axiosInstance from './axiosConfig';
import { AUTH_ENDPOINTS } from './config';

const authService = {
  signup: async (userData) => {
    try {
      const response = await axiosInstance.post(AUTH_ENDPOINTS.SIGNUP, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  signin: async (credentials) => {
    try {
      const formData = new FormData();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      const response = await axiosInstance.post(
        AUTH_ENDPOINTS.SIGNIN,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default authService; 