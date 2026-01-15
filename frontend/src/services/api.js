import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
});

// Interceptor to add user-id header to every request
api.interceptors.request.use((config) => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        config.headers['user-id'] = userId;
    }
    return config;
});

export default api;