import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, full_name: string) => 
    api.post('/auth/register', { email, password, full_name }),
  getMe: () => api.get('/auth/me')
};

// Products API
export const productsApi = {
  getAll: (categoryId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('category_id', categoryId);
    if (search) params.append('search', search);
    return api.get(`/products?${params.toString()}`);
  },
  getById: (id: string) => api.get(`/products/${id}`),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`)
};

// Categories API
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`)
};

// Orders API
export const ordersApi = {
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (data: any) => api.post('/orders', data),
  updateStatus: (id: string, status: string) => 
    api.put(`/orders/${id}/status`, { status })
};

// Users API
export const usersApi = {
  getAll: () => api.get('/users')
};

// Analytics API
export const analyticsApi = {
  get: () => api.get('/analytics')
};

// Upload API
export const uploadApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// Translations API
export const translationsApi = {
  getByLang: (lang: string) => api.get(`/translations/${lang}`),
  upsert: (payload: { key: string; en: string; ar: string; type?: string; ref_id?: string }) => api.post('/translations', payload)
};