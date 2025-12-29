import axios from 'axios';

// Create an Axios instance with default config
const api = axios.create({
    baseURL: '/api', // Adjust if your backend is on a different URL
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for HttpOnly cookies
});

// Interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Redirect to login if 401 and not already there
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
