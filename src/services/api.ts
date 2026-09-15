/**
 * Sofia Express Delivery - API Service Client
 * Connects React UI to PHP REST API & MySQL backend.
 * Provides live synchronization with the server database.
 */

import { Store, Product, DriverProfile, Order, ChatMessage, OrderRating } from '../types';

const API_BASE = '/api';

export const apiService = {
  // 1. STORES API
  // Returns null when the server/DB is unreachable (so callers can fall back to
  // local demo data), and an array (possibly empty) whenever the DB answered
  // successfully — an empty array is a real, trustworthy state (e.g. no stores yet).
  async getStores(type?: 'restaurant' | 'grocery'): Promise<Store[] | null> {
    try {
      const url = type ? `${API_BASE}/stores.php?type=${type}` : `${API_BASE}/stores.php`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      if (json.status === 'fallback') return null;
      return Array.isArray(json.data) ? json.data : [];
    } catch (e) {
      console.warn('API getStores error (falling back to local):', e);
      return null;
    }
  },

  async createStore(store: Omit<Store, 'id'> | Store): Promise<{ success: boolean; id?: string }> {
    try {
      const res = await fetch(`${API_BASE}/stores.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(store),
      });
      const data = await res.json();
      return { success: res.ok, id: data.id };
    } catch (e) {
      console.error('API createStore error:', e);
      return { success: false };
    }
  },

  async updateStore(id: string, updates: Partial<Store>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/stores.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      return res.ok;
    } catch (e) {
      console.error('API updateStore error:', e);
      return false;
    }
  },

  async deleteStore(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/stores.php?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('API deleteStore error:', e);
      return false;
    }
  },

  // 2. PRODUCTS API
  async getProducts(storeId?: string, category?: string): Promise<Product[] | null> {
    try {
      const params = new URLSearchParams();
      if (storeId) params.append('store_id', storeId);
      if (category && category !== 'all') params.append('category', category);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetch(`${API_BASE}/products.php${query}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      if (json.status === 'fallback') return null;
      return Array.isArray(json.data) ? json.data : [];
    } catch (e) {
      console.warn('API getProducts error (falling back):', e);
      return null;
    }
  },

  async createProduct(product: Omit<Product, 'id'> | Product): Promise<{ success: boolean; id?: string }> {
    try {
      const res = await fetch(`${API_BASE}/products.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      return { success: res.ok, id: data.id };
    } catch (e) {
      console.error('API createProduct error:', e);
      return { success: false };
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/products.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      return res.ok;
    } catch (e) {
      console.error('API updateProduct error:', e);
      return false;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/products.php?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('API deleteProduct error:', e);
      return false;
    }
  },

  // 3. DRIVERS API
  async getDrivers(): Promise<DriverProfile[] | null> {
    try {
      const res = await fetch(`${API_BASE}/drivers.php`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      if (json.status === 'fallback') return null;
      return Array.isArray(json.data) ? json.data : [];
    } catch (e) {
      console.warn('API getDrivers error:', e);
      return null;
    }
  },

  async createDriver(driver: Omit<DriverProfile, 'id'> | DriverProfile): Promise<{ success: boolean; id?: string }> {
    try {
      const res = await fetch(`${API_BASE}/drivers.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(driver),
      });
      const data = await res.json();
      return { success: res.ok, id: data.id };
    } catch (e) {
      console.error('API createDriver error:', e);
      return { success: false };
    }
  },

  async updateDriver(id: string, updates: Partial<DriverProfile>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/drivers.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      return res.ok;
    } catch (e) {
      console.error('API updateDriver error:', e);
      return false;
    }
  },

  async deleteDriver(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/drivers.php?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error('API deleteDriver error:', e);
      return false;
    }
  },

  // 4. ORDERS API
  async getOrders(): Promise<Order[] | null> {
    try {
      const res = await fetch(`${API_BASE}/orders.php`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      if (json.status === 'fallback') return null;
      return Array.isArray(json.data) ? json.data : [];
    } catch (e) {
      console.warn('API getOrders error:', e);
      return null;
    }
  },

  async createOrder(order: Order): Promise<{ success: boolean; id?: string }> {
    try {
      const res = await fetch(`${API_BASE}/orders.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      const data = await res.json();
      return { success: res.ok, id: data.id };
    } catch (e) {
      console.error('API createOrder error:', e);
      return { success: false };
    }
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/orders.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      return res.ok;
    } catch (e) {
      console.error('API updateOrder error:', e);
      return false;
    }
  },

  // 5. REVIEWS API
  async submitReview(orderId: string, rating: OrderRating, extra?: { storeId?: string; driverId?: string }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/reviews.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, rating, ...extra }),
      });
      return res.ok;
    } catch (e) {
      console.error('API submitReview error:', e);
      return false;
    }
  },

  // 6. CHAT API
  async getChatMessages(orderId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`${API_BASE}/chat.php?order_id=${encodeURIComponent(orderId)}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('API getChatMessages error:', e);
      return [];
    }
  },

  async sendChatMessage(orderId: string, message: { text: string; senderRole: string; senderName: string }): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/chat.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, ...message }),
      });
      return res.ok;
    } catch (e) {
      console.error('API sendChatMessage error:', e);
      return false;
    }
  }
};
