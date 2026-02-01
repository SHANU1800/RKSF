const DEFAULT_API_BASE = 'http://localhost:5000/api';

const normalizeApiBase = (value) => {
  if (!value) return DEFAULT_API_BASE;
  const trimmed = value.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

export const API_BASE_URL = normalizeApiBase(
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || ''
);

export const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000').replace(/\/+$/, '');
