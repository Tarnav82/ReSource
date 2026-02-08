
import axios from 'axios';
import { WasteAnalysisRequest, WasteAnalysisResponse } from './types';

// Backend API URL - gets from environment or defaults to localhost
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Get user ID from localStorage
const getUserId = (): string | null => {
  return localStorage.getItem('user_id');
};

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercept requests to add auth token
axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.params = config.params || {};
    config.params.token = token;
  }
  return config;
});

/**
 * ===== AUTHENTICATION =====
 */

export const registerUser = async (email: string, password: string, companyName?: string, walletAddress?: string) => {
  try {
    const response = await axiosInstance.post('/api/auth/register', {
      email,
      password,
      company_name: companyName,
      wallet_address: walletAddress
    });

    if (response.data.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_id', response.data.user.id);
      localStorage.setItem('user_email', response.data.user.email);
      localStorage.setItem('user_company', response.data.user.company_name || '');
    }

    return response.data;
  } catch (error) {
    console.error("Registration Error:", error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', {
      email,
      password
    });

    if (response.data.success && response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_id', response.data.user.id);
      localStorage.setItem('user_email', response.data.user.email);
      localStorage.setItem('user_company', response.data.user.company_name || '');
    }

    return response.data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_company');
};

export const getCurrentUser = async () => {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const response = await axiosInstance.get('/api/auth/me', {
      params: { token }
    });

    return response.data.user || null;
  } catch (error) {
    console.error("Get Current User Error:", error);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * ===== WASTE ANALYSIS =====
 */

export const analyzeWaste = async (data: WasteAnalysisRequest): Promise<WasteAnalysisResponse> => {
  try {
    const response = await axiosInstance.post('/api/waste/analyze', {
      description: data.description,
      quantity: data.quantity,
      hazard: data.hazard,
      location: data.location,
    });

    if (response.status === 200 && response.data) {
      return response.data as WasteAnalysisResponse;
    }

    throw new Error('Unexpected response format from backend');
  } catch (error) {
    console.error("Backend Analysis Error:", error);

    // Fallback to mock data if backend is unavailable
    console.warn("Backend unavailable. Using mock data for preview.");
    return {
      category: "Industrial Waste",
      buyer: "Recycling Facility",
      revenue: data.quantity * 0.50,
      savings: data.quantity * 0.15,
      co2: (data.quantity * 2.5) / 1000,
      landfill: 85.0
    };
  }
};

/**
 * ===== MARKETPLACE OPERATIONS =====
 */

export const createListing = async (
  title: string,
  description: string,
  quantity_kg: number,
  location: string,
  latitude?: number,
  longitude?: number
) => {
  try {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User must be logged in to create listing');
    }

    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('quantity_kg', quantity_kg.toString());
    formData.append('location', location);
    if (latitude) formData.append('latitude', latitude.toString());
    if (longitude) formData.append('longitude', longitude.toString());

    const response = await axios.post(`${BACKEND_URL}/api/marketplace/listing`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { token: getAuthToken() }
    });

    return response.data;
  } catch (error) {
    console.error("Create Listing Error:", error);
    throw error;
  }
};

export const getMarketplaceListings = async () => {
  try {
    const response = await axiosInstance.get('/api/marketplace/listings');
    return response.data.listings || [];
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
};

export const getMarketplaceStats = async () => {
  try {
    const response = await axiosInstance.get('/api/marketplace/stats');
    return response.data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { total_listings: 0, categories: {} };
  }
};

export const createTransaction = async (
  listing_id: string,
  buyer_id: string,
  seller_id: string,
  quantity_bought: number,
  total_price?: number,
  seller_address?: string,
  category: string = "Unknown"
) => {
  try {
    const formData = new FormData();
    formData.append('listing_id', listing_id);
    formData.append('buyer_id', buyer_id);
    formData.append('seller_id', seller_id);
    formData.append('quantity_bought', quantity_bought.toString());
    if (total_price) formData.append('total_price', total_price.toString());
    if (seller_address) formData.append('seller_address', seller_address);
    formData.append('category', category);

    const response = await axios.post(`${BACKEND_URL}/api/marketplace/transaction`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { token: getAuthToken() }
    });

    return response.data;
  } catch (error) {
    console.error("Create Transaction Error:", error);
    throw error;
  }
};

/**
 * Health check to verify backend is running
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.get('/api/health');
    return response.status === 200;
  } catch {
    console.warn("Backend health check failed");
    return false;
  }
};
