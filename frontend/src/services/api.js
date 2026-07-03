import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to automatically add authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
};

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
};

export const lostService = {
  create: async (formData) => {
    const response = await api.post('/lost-items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getAll: async (params = {}) => {
    const response = await api.get('/lost-items', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/lost-items/${id}`);
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/lost-items/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/lost-items/${id}`);
    return response.data;
  },
};

export const foundService = {
  create: async (formData) => {
    const response = await api.post('/found-items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getAll: async (params = {}) => {
    const response = await api.get('/found-items', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/found-items/${id}`);
    return response.data;
  },
  update: async (id, formData) => {
    const response = await api.put(`/found-items/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/found-items/${id}`);
    return response.data;
  },
};

export const searchService = {
  search: async (params) => {
    const response = await api.get('/search', { params });
    return response.data;
  },
};

export const matchService = {
  getMatches: async () => {
    const response = await api.get('/matches');
    return response.data;
  },
  getAIComparedMatches: async (lostItemId) => {
    const response = await api.get(`/matches/ai-compare/${lostItemId}`);
    return response.data;
  },
  verifyMatchWithAI: async (lostItemId, foundItemId) => {
    const response = await api.post('/matches/ai-verify', { lostItemId, foundItemId });
    return response.data;
  },
};

export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export const adminService = {
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },
  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data;
  },
  deleteReport: async (id, type) => {
    const response = await api.delete(`/admin/report/${id}`, {
      params: { type },
    });
    return response.data;
  },
};

export default api;
export const API_URL = API_BASE_URL; // Expose base url for rendering uploaded images
export const UPLOAD_URL = 'http://localhost:5000/uploads'; // Expose upload folder path
