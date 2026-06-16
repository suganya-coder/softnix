/**
 * api.js — Mock API layer using Axios
 *
 * All frontend→backend communication goes through this module.
 * Custom (user-added) products are persisted to localStorage so
 * they survive page refreshes.
 */

import axios from 'axios';

const CUSTOM_PRODUCTS_KEY = 'softnix_custom_products';

// ── localStorage helpers ─────────────────────────────────────
export function loadCustomProducts() {
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomProduct(product) {
  try {
    const existing = loadCustomProducts();
    // avoid duplicates by id
    const updated = [product, ...existing.filter(p => p.id !== product.id)];
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('localStorage save failed', e);
  }
}

export function deleteCustomProduct(id) {
  try {
    const existing = loadCustomProducts();
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(existing.filter(p => p.id !== id)));
  } catch (e) {
    console.warn('localStorage delete failed', e);
  }
}

// Axios instance
const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': '1.0.0',
  },
  timeout: 8000,
});

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('session_token') || 'mock-session-abc123';
  config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    const msg =
      status === 404 ? 'Resource not found.' :
      status === 500 ? 'Server error. Please try again.' :
      err.message === 'Network Error' ? 'Network unavailable. Check your connection.' :
      err.message || 'Something went wrong.';
    return Promise.reject(new Error(msg));
  }
);

const delay = (ms = 420) => new Promise(r => setTimeout(r, ms));

// ════════════════════════════════════════════════════════════
//  PRODUCTS
// ════════════════════════════════════════════════════════════

/**
 * Fetch the full product catalogue (base + custom from localStorage).
 */
export async function fetchProducts() {
  const res = await api.get('products.json');
  await delay(300);
  const base = res.data;
  const custom = loadCustomProducts(); // prepend user-added products
  // merge: custom first, then base (exclude any base items that were re-added with same id)
  const baseIds = new Set(base.map(p => p.id));
  return [...custom, ...base.filter(p => !custom.find(c => c.id === p.id))];
}

export async function fetchProductById(id) {
  const all = await fetchProducts();
  const product = all.find(p => p.id === id);
  if (!product) throw new Error(`Product ${id} not found.`);
  return product;
}

export async function postCartAdd(payload) {
  await api.post('products.json', payload).catch(() => {});
  await delay(280);
  return {
    success: true,
    cartItemId: `ci_${Date.now()}`,
    message: `${payload.name} added to cart`,
  };
}

export async function patchCartItem(cartItemId, patch) {
  await delay(150);
  return { success: true, cartItemId, ...patch };
}

export async function deleteCartItem(cartItemId) {
  await delay(150);
  return { success: true, cartItemId };
}

export async function postWishlistToggle(productId) {
  await delay(180);
  return { success: true, productId, wishlisted: true };
}

export async function postCheckout(payload) {
  await delay(800);
  return {
    success: true,
    orderId: `ORD-${Date.now()}`,
    estimatedDelivery: '3–5 business days',
    total: payload.total,
  };
}

export async function fetchPincodeInfo(pin) {
  await delay(350);
  const isValid = /^\d{6}$/.test(pin);
  if (!isValid) throw new Error('Invalid pincode format');
  return {
    pin,
    city: 'Gurugram',
    state: 'Haryana',
    deliveryAvailable: true,
    estimatedDate: 'Mon, 9 Jun',
  };
}

export default api;
