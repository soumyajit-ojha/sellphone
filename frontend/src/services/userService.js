import api from './api';

export const userService = {
    register: (data) => api.post('/api/auth/register', data),
    login: (data) => api.post('/api/auth/login', data),
    getProfile: () => api.get('/api/user/profile'),
    updateProfile: (data) => api.put('/api/user/profile', data),
    deleteAccount: () => api.delete('/api/auth/delete-account'),

    // Address methods
    getAddresses: () => api.get('/api/user/addresses'),
    addAddress: (data) => api.post('/api/user/address', data),
    deleteAddress: (id) => api.delete(`/api/user/address/${id}`),
};