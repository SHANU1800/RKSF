// Frontend error handling utilities
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      status: error.response.status,
      message: error.response.data?.error || 'Server error occurred',
      details: error.response.data?.details,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      status: 0,
      message: 'No response from server. Check your connection.',
      details: null,
    };
  } else {
    // Error in request setup
    return {
      status: -1,
      message: error.message || 'An unexpected error occurred',
      details: null,
    };
  }
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export const isValidationError = (error) => {
  return error.response?.status === 400 || error.response?.status === 409;
};

export const isAuthError = (error) => {
  return error.response?.status === 401 || error.response?.status === 403;
};

// Toast notification types
export const toastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Form validation helpers
export const validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) ? null : 'Invalid email address';
  },

  password: (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain number';
    return null;
  },

  phone: (phone) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone.replace(/\D/g, '')) ? null : 'Phone must be 10 digits';
  },

  upiId: (upiId) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return regex.test(upiId) ? null : 'Invalid UPI ID format';
  },

  cardNumber: (cardNumber) => {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length !== 16) return 'Card number must be 16 digits';
    return null;
  },

  url: (url) => {
    try {
      new URL(url);
      return null;
    } catch {
      return 'Invalid URL';
    }
  },

  required: (value) => {
    return value && value.trim() ? null : 'This field is required';
  },

  minLength: (value, min) => {
    return value && value.length >= min ? null : `Minimum ${min} characters required`;
  },

  maxLength: (value, max) => {
    return value && value.length <= max ? null : `Maximum ${max} characters allowed`;
  },
};
