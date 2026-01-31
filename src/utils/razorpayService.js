/**
 * Razorpay Payment Service - Frontend
 * Handles loading Razorpay SDK and processing payments
 */

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Track script loading state
let razorpayScriptLoaded = false;
let razorpayScriptLoading = false;
let loadingPromise = null;

/**
 * Load Razorpay checkout script
 * @returns {Promise<void>}
 */
export async function loadRazorpayScript() {
  if (razorpayScriptLoaded) {
    return Promise.resolve();
  }

  if (razorpayScriptLoading && loadingPromise) {
    return loadingPromise;
  }

  razorpayScriptLoading = true;

  loadingPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existingScript) {
      razorpayScriptLoaded = true;
      razorpayScriptLoading = false;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      razorpayScriptLoaded = true;
      razorpayScriptLoading = false;
      resolve();
    };

    script.onerror = () => {
      razorpayScriptLoading = false;
      reject(new Error('Failed to load Razorpay SDK'));
    };

    document.body.appendChild(script);
  });

  return loadingPromise;
}

/**
 * Check if Razorpay is available
 * @returns {boolean}
 */
export function isRazorpayAvailable() {
  return typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined';
}

/**
 * Get payment configuration from backend
 * @returns {Promise<Object>}
 */
export async function getPaymentConfig() {
  const response = await fetch(`${API_BASE}/payments/config`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch payment configuration');
  }

  return response.json();
}

/**
 * Create a payment order
 * @param {string} orderId - The app order ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>}
 */
export async function createPaymentOrder(orderId, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/payments/create-order`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ orderId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment order');
  }

  return response.json();
}

/**
 * Verify payment after Razorpay checkout
 * @param {Object} paymentData - Payment data from Razorpay
 * @param {string} orderId - The app order ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>}
 */
export async function verifyPayment(paymentData, orderId, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/payments/verify`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
      orderId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Payment verification failed');
  }

  return response.json();
}

/**
 * Get payment status for an order
 * @param {string} orderId - The order ID
 * @param {string} token - Auth token
 * @returns {Promise<Object>}
 */
export async function getPaymentStatus(orderId, token) {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/payments/${orderId}/status`, {
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payment status');
  }

  return response.json();
}

/**
 * Request refund for an order
 * @param {string} orderId - The order ID
 * @param {string} reason - Refund reason
 * @param {string} token - Auth token
 * @returns {Promise<Object>}
 */
export async function requestRefund(orderId, reason, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/payments/refund`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ orderId, reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Refund request failed');
  }

  return response.json();
}

/**
 * Open Razorpay checkout modal
 * @param {Object} options - Checkout options
 * @returns {Promise<Object>} Payment result
 */
export function openRazorpayCheckout(options) {
  return new Promise((resolve, reject) => {
    if (!isRazorpayAvailable()) {
      reject(new Error('Razorpay SDK not loaded'));
      return;
    }

    const {
      razorpayKeyId,
      razorpayOrderId,
      amount,
      currency = 'INR',
      merchantName = 'RKserve',
      description = 'Order Payment',
      prefill = {},
      notes = {},
      themeColor = '#3b82f6',
    } = options;

    const rzpOptions = {
      key: razorpayKeyId,
      amount,
      currency,
      name: merchantName,
      description,
      order_id: razorpayOrderId,
      prefill: {
        name: prefill.name || '',
        email: prefill.email || '',
        contact: prefill.contact || '',
      },
      notes,
      theme: {
        color: themeColor,
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled by user'));
        },
        escape: true,
        animation: true,
      },
      handler: function (response) {
        resolve({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
    };

    try {
      const rzp = new window.Razorpay(rzpOptions);
      
      rzp.on('payment.failed', function (response) {
        reject(new Error(response.error.description || 'Payment failed'));
      });

      rzp.open();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Process complete payment flow
 * @param {string} orderId - App order ID
 * @param {string} token - Auth token
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Payment result
 */
export async function processPayment(orderId, token, options = {}) {
  // Load Razorpay script if not loaded
  await loadRazorpayScript();

  // Create payment order
  const orderData = await createPaymentOrder(orderId, token);

  // Open Razorpay checkout
  const paymentResult = await openRazorpayCheckout({
    razorpayKeyId: orderData.razorpayKeyId,
    razorpayOrderId: orderData.razorpayOrderId,
    amount: orderData.amount,
    currency: orderData.currency,
    merchantName: options.merchantName || 'RKserve',
    description: `Payment for ${orderData.orderDetails?.serviceName || 'Order'}`,
    prefill: orderData.prefill,
    notes: {
      orderId: orderId,
    },
    themeColor: options.themeColor || '#3b82f6',
  });

  // Verify payment
  const verificationResult = await verifyPayment(paymentResult, orderId, token);

  return {
    success: true,
    paymentId: paymentResult.razorpay_payment_id,
    orderId: orderId,
    ...verificationResult,
  };
}

/**
 * Format amount for display
 * @param {number} amount - Amount in rupees
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export function formatAmount(amount, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default {
  loadRazorpayScript,
  isRazorpayAvailable,
  getPaymentConfig,
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus,
  requestRefund,
  openRazorpayCheckout,
  processPayment,
  formatAmount,
};
