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


export default api;