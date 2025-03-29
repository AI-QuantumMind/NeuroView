import { create } from 'zustand';
import { authService } from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: async (credentials) => {
    try {
      const response = await authService.signin(credentials);
      localStorage.setItem('token', response.access_token);
      set({ 
        user: response.user,
        token: response.access_token,
        isAuthenticated: true 
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  signup: async (userData) => {
    try {
      const response = await authService.signup(userData);
      return response;
    } catch (error) {
      throw error;
    }
  },
}));

export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout, signup } = useAuthStore();
  return { user, token, isAuthenticated, login, logout, signup };
}; 