import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details for debugging
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      console.error('❌ Backend bağlantı hatası:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        message: error.message,
        code: error.code,
        suggestion: 'Backend\'in çalıştığından emin olun: http://localhost:8000'
      });
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect if we're already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  plan: string;
  credits?: number;
  created_at?: string;
}

export interface SEOOptimizeRequest {
  title: string;
  description?: string;
}

export interface SEOOptimizeResponse {
  optimized_title: string;
  optimized_description: string;
  keywords: string[];
  seo_score: number;
}

export interface PaymentPackage {
  id: number;
  credits: number;
  amount: number;
  label: string;
}

export interface PaymentCreateRequest {
  package_id: number;
}

export interface PaymentCreateResponse {
  checkout_url: string;
  payment_id: string;
  provider: string;
  amount: number;
  credits: number;
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<{ access_token: string }>('/auth/login', data);
    return response.data;
  },
  
  sendVerificationCode: async (email: string) => {
    const response = await api.post<{ message: string }>('/auth/send-verification-code', { email });
    return response.data;
  },
  
  verifyCode: async (email: string, code: string) => {
    const response = await api.post<{ verified: boolean; message: string }>('/auth/verify-code', { email, code });
    return response.data;
  },
  
  register: async (data: RegisterRequest & { verification_code: string }) => {
    const response = await api.post<{ access_token: string }>('/auth/register', data);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

export const seoService = {
  optimize: async (data: SEOOptimizeRequest) => {
    const response = await api.post<SEOOptimizeResponse>('/seo/optimize', data);
    return response.data;
  },
};

export const creditService = {
  getCredits: async () => {
    const response = await api.get<{ balance: number }>('/user/credits/get');
    return response.data;
  },
  
  useCredit: async () => {
    const response = await api.post<{ balance: number }>('/user/credits/use');
    return response.data;
  },
};

export const paymentService = {
  createSession: async (data: PaymentCreateRequest) => {
    const response = await api.post<PaymentCreateResponse>('/payments/create-session', data);
    return response.data;
  },
};

export const adminService = {
  listUsers: async () => {
    const response = await api.get<{ users: User[] }>('/admin/users');
    return response.data;
  },
  
  addCredits: async (userId: string, amount: number) => {
    const response = await api.post<{ balance: number }>('/admin/credits', {
      user_id: userId,
      amount,
    });
    return response.data;
  },
};

export default api;

