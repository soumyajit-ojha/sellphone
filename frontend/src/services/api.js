import axios from 'axios';
import Qs from 'qs';

const api = axios.create({
    // Vercel proxy will handle /api to your EC2
    baseURL: import.meta.env.VITE_API_URL || '/api/v1',
    paramsSerializer: (params) => Qs.stringify(params, { arrayFormat: 'repeat' })  // You might need to npm install qs
});

// Interceptor: Injects JWT into every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor: Handles global error responses (like 401 Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect if it's a 401 and not from the login/register requests
        if (error.response && error.response.status === 401) {
            const isLoginRequest = error.config.url.includes('/auth/login');

            if (!isLoginRequest) {
                localStorage.clear();
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default api;