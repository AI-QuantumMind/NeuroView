import { toast } from 'react-toastify';

export const handleApiError = (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    toast.error(message);
    return message;
};

export const handleApiSuccess = (message) => {
    toast.success(message);
};

export const isApiError = (error) => {
    return error.response?.status >= 400;
};

export const getErrorMessage = (error) => {
    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }
    if (error.message) {
        return error.message;
    }
    return 'An unexpected error occurred';
}; 