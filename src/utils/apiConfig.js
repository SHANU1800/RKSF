const DEFAULT_API_BASE = import.meta.env.DEV ? '/api' : 'https://rksb.onrender.com/api';

const normalizeApiBase = (value) => {
  if (!value) return DEFAULT_API_BASE;
  const trimmed = value.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

// Get API base URL from environment or use default
const envApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
export const API_BASE_URL = normalizeApiBase(envApiUrl);

// Get Socket URL from environment or use default
export const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || 'https://rksb.onrender.com').replace(/\/+$/, '');

// Log API configuration in development (helps with debugging)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:');
  console.log('  API_BASE_URL:', API_BASE_URL);
  console.log('  SOCKET_URL:', SOCKET_URL);
  console.log('  Environment:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
  });
}
