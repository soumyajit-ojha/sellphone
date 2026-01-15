import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8005',
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