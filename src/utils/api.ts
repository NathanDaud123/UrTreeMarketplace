import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-0eb859c3`;

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
    console.log(`API Request: ${method} ${endpoint}`, body ? { bodySize: JSON.stringify(body).length } : '');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    console.log(`API Response: ${method} ${endpoint} - Status: ${response.status}`);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      console.error(`API Error Response:`, errorData);
      throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const responseData = await response.json();
    console.log(`API Success: ${method} ${endpoint}`);
    return responseData;
  } catch (error: any) {
    console.error(`API Error (${method} ${endpoint}):`, {
      message: error.message,
      error: error
    });
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
    return apiRequest('/users/google-login', 'POST');
  },

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
  getAll: async (filters?: { category?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
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

  updateStatus: async (id: string, status: string) => {
    return apiRequest(`/orders/${id}/status`, 'PUT', { status });
  },
};

// ==================== CHAT API ====================

export const chatAPI = {
  getConversations: async (userId: string) => {
    return apiRequest(`/chats/${encodeURIComponent(userId)}`);
  },

  getOrCreate: async (buyerId: string, sellerId: string, productId: string) => {
    return apiRequest('/chats', 'POST', { buyerId, sellerId, productId });
  },

  getMessages: async (chatId: string) => {
    return apiRequest(`/chats/${chatId}/messages`);
  },

  sendMessage: async (chatId: string, messageData: any) => {
    return apiRequest(`/chats/${chatId}/messages`, 'POST', messageData);
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
