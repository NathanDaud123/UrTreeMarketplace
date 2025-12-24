import { supabaseUrl, publicAnonKey } from './supabase/info';
import { createClient } from '@jsr/supabase__supabase-js@2.49.8';

const API_BASE_URL = `${supabaseUrl}/functions/v1/make-server-0eb859c3`;

// Create Supabase client for Auth
const supabase = createClient(supabaseUrl, publicAnonKey);

// Upload file to Supabase Storage
export const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
  try {
    // Convert file to base64 for now (since we don't have storage bucket set up)
    // In production, use Supabase Storage API
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    const base64Data = await base64Promise;
    return base64Data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
};

// Helper function to make API requests
async function apiRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  };

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    console.log(`API Request: ${method} ${endpoint}`, body ? { body: body, bodySize: JSON.stringify(body).length } : '');
    console.log(`API URL: ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    console.log(`API Response: ${method} ${endpoint} - Status: ${response.status}`);
    
    if (!response.ok) {
      let errorData;
      try {
        const text = await response.text();
        console.error(`API Error Response Text:`, text);
        errorData = JSON.parse(text);
      } catch (e) {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      console.error(`API Error Response:`, errorData);
      
      // Create error with more context
      const error = new Error(errorData.error || `API request failed with status ${response.status}`);
      (error as any).status = response.status;
      (error as any).statusText = response.statusText;
      (error as any).responseData = errorData;
      throw error;
    }

    const responseData = await response.json();
    console.log(`API Success: ${method} ${endpoint}`, responseData);
    return responseData;
  } catch (error: any) {
    console.error(`API Error (${method} ${endpoint}):`, {
      message: error.message,
      error: error,
      stack: error.stack
    });
    
    // Better error messages for network errors (only for actual network failures)
    // Don't show "edge not deployed" if we got a response (even if it's an error)
    if ((error.message?.includes('Failed to fetch') || 
         error.message?.includes('NetworkError') ||
         error.name === 'TypeError' ||
         error.message?.includes('Network request failed')) &&
        !error.status) { // Only if we didn't get a response status (actual network failure)
      const errorMsg = `Tidak dapat terhubung ke server. Pastikan edge function sudah di-deploy di Supabase. URL: ${API_BASE_URL}${endpoint}`;
      console.error('Network error:', errorMsg);
      throw new Error(errorMsg);
    }
    
    throw error;
  }
}

// ==================== USER API ====================

export const userAPI = {
  register: async (email: string, password: string, name: string) => {
    return apiRequest('/users/register', 'POST', { email, password, name });
  },

  login: async (email: string, password: string) => {
    return apiRequest('/users/login', 'POST', { email, password });
  },

  loginWithGoogle: async () => {
    try {
      // Use Supabase Auth for Google OAuth
      // Get current path for redirect
      const redirectUrl = window.location.origin + window.location.pathname;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        throw new Error(error.message || 'Failed to initiate Google login');
      }
      
      // This will redirect to Google, so we return the URL
      // The actual login will happen in the callback
      return { redirectUrl: data.url, message: 'Redirecting to Google...' };
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    }
  },
  
  // Export supabase client for use in other files
  getSupabaseClient: () => supabase,

  getUser: async (email: string) => {
    return apiRequest(`/users/${encodeURIComponent(email)}`);
  },

  updateUser: async (email: string, updates: any) => {
    return apiRequest(`/users/${encodeURIComponent(email)}`, 'PUT', updates);
  },

  applySeller: async (email: string, sellerData: any) => {
    return apiRequest(`/users/${encodeURIComponent(email)}/apply-seller`, 'POST', sellerData);
  },

  switchRole: async (email: string, newRole: 'buyer' | 'seller') => {
    return apiRequest(`/users/${encodeURIComponent(email)}/switch-role`, 'POST', { newRole });
  },

  setPin: async (email: string, pin: string) => {
    return apiRequest(`/users/${encodeURIComponent(email)}/set-pin`, 'POST', { pin });
  },

  verifyPin: async (email: string, pin: string) => {
    return apiRequest(`/users/${encodeURIComponent(email)}/verify-pin`, 'POST', { pin });
  },

  changePin: async (email: string, newPin: string) => {
    return apiRequest(`/users/${encodeURIComponent(email)}/change-pin`, 'POST', { newPin });
  },
};

// ==================== PRODUCT API ====================

export const productAPI = {
  getAll: async (filters?: { category?: string; search?: string; includeInactive?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.includeInactive) params.append('includeInactive', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/products${query}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/products/${id}`);
  },

  getBySeller: async (sellerId: string) => {
    return apiRequest(`/products/seller/${encodeURIComponent(sellerId)}`);
  },

  create: async (productData: any) => {
    return apiRequest('/products', 'POST', productData);
  },

  update: async (id: string, updates: any) => {
    return apiRequest(`/products/${id}`, 'PUT', updates);
  },

  delete: async (id: string) => {
    return apiRequest(`/products/${id}`, 'DELETE');
  },
};

// ==================== CART API ====================

export const cartAPI = {
  get: async (userId: string) => {
    return apiRequest(`/cart/${encodeURIComponent(userId)}`);
  },

  update: async (userId: string, cart: any[]) => {
    return apiRequest(`/cart/${encodeURIComponent(userId)}`, 'PUT', { cart });
  },

  clear: async (userId: string) => {
    return apiRequest(`/cart/${encodeURIComponent(userId)}`, 'DELETE');
  },
};

// ==================== ORDER API ====================

export const orderAPI = {
  create: async (orderData: any) => {
    return apiRequest('/orders', 'POST', orderData);
  },

  getByBuyer: async (buyerId: string) => {
    return apiRequest(`/orders/buyer/${encodeURIComponent(buyerId)}`);
  },

  getBySeller: async (sellerId: string) => {
    return apiRequest(`/orders/seller/${encodeURIComponent(sellerId)}`);
  },

  getById: async (id: string) => {
    return apiRequest(`/orders/${id}`);
  },

  updateStatus: async (id: string, status: string, trackingNumber?: string) => {
    return apiRequest(`/orders/${id}/status`, 'PUT', { status, trackingNumber });
  },
};

// ==================== SELLER API ====================

export const sellerAPI = {
  getPaymentInfo: async (sellerId: string) => {
    return apiRequest(`/sellers/${encodeURIComponent(sellerId)}/payment-info`);
  },
};

// ==================== CHAT API ====================

export const chatAPI = {
  getConversations: async (email: string) => {
    return apiRequest(`/chats/${encodeURIComponent(email)}`);
  },

  getOrCreate: async (buyerId: string, sellerId: string, productId?: string, orderId?: string) => {
    return apiRequest('/chats', 'POST', { buyerId, sellerId, productId, orderId });
  },

  getMessages: async (chatId: string) => {
    return apiRequest(`/chats/${chatId}/messages`);
  },

  sendMessage: async (chatId: string, senderId: string, message: string, messageType?: string, attachmentUrl?: string) => {
    return apiRequest(`/chats/${chatId}/messages`, 'POST', { senderId, message, messageType, attachmentUrl });
  },

  markAsRead: async (chatId: string, userId: string) => {
    return apiRequest(`/chats/${chatId}/read`, 'PUT', { userId });
  },
};

// ==================== REVIEW API ====================

export const reviewAPI = {
  getByProduct: async (productId: string) => {
    return apiRequest(`/reviews/product/${productId}`);
  },

  create: async (reviewData: any) => {
    return apiRequest('/reviews', 'POST', reviewData);
  },
};

// ==================== ADMIN API ====================

export const adminAPI = {
  getAllUsers: async () => {
    return apiRequest('/admin/users');
  },

  getAllOrders: async () => {
    return apiRequest('/admin/orders');
  },

  getStats: async () => {
    return apiRequest('/admin/stats');
  },

  getSellerApplications: async () => {
    return apiRequest('/admin/seller-applications');
  },

  approveSellerApplication: async (applicationId: string) => {
    return apiRequest(`/admin/seller-applications/${applicationId}/approve`, 'POST');
  },

  rejectSellerApplication: async (applicationId: string) => {
    return apiRequest(`/admin/seller-applications/${applicationId}/reject`, 'POST');
  },

  getUserDetail: async (email: string) => {
    return apiRequest(`/admin/users/${encodeURIComponent(email)}`);
  },
};

// ==================== PAYMENT API ====================

export const paymentAPI = {
  getConfig: async () => {
    return apiRequest('/payment-config');
  },

  getPaymentStatus: async (orderId: string) => {
    return apiRequest(`/payment-status/${orderId}`);
  },

  sendNotification: async (notificationData: any) => {
    return apiRequest('/payment-notification', 'POST', notificationData);
  },
};
