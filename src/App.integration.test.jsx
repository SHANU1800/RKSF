import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

const user = { name: 'Provider User', email: 'provider@test.com', role: 'provider', _id: 'user-1' };
const providers = [{ _id: 'user-1', name: 'Provider User', role: 'provider', rating: 4.8 }];
const services = [{ _id: 'svc-1', title: 'Consulting', description: 'Biz advice', price: 1000, category: 'General', provider: providers[0] }];
const goods = [{ _id: 'good-1', title: 'Laptop', description: 'Great', price: 500, condition: 'Good', location: 'NYC', sellerName: 'Provider User', sellerId: 'user-1' }];

const jsonResponse = (data, status = 200) =>
  Promise.resolve(
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );

const mockFetch = vi.fn((url, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  if (url.endsWith('/auth/me')) return jsonResponse({ user });
  if (url.endsWith('/health')) return jsonResponse({ ok: true });
  if (url.endsWith('/users')) return jsonResponse(providers);
  if (url.endsWith('/services') && method === 'GET') return jsonResponse(services);
  if (url.endsWith('/services') && method === 'POST') return jsonResponse({ service: { ...services[0], _id: 'svc-2' } }, 201);
  if (url.endsWith('/goods') && method === 'GET') return jsonResponse(goods);
  if (url.includes('/orders') && method === 'POST') return jsonResponse({ order: { _id: 'order-1' } });
  return jsonResponse({});
});

describe('Core flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    global.fetch = mockFetch;
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('restores session and shows marketplace (login flow)', async () => {
    render(<App />);
    expect(await screen.findByText(/Marketplace/i)).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/auth/me'), expect.anything());
  });

  it('allows creating a service (create service flow)', async () => {
    render(<App />);
    await screen.findByText(/Marketplace/i);

    fireEvent.click(screen.getByText('+ Add Service'));

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Service' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Helpful' } });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'General' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Service/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/services'),
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });

  it('moves checkout into payment step', async () => {
    render(<App />);
    await screen.findByText(/Marketplace/i);

    fireEvent.click(await screen.findByText(/Buy Package/i));
    fireEvent.click(await screen.findByRole('button', { name: /Proceed to Payment/i }));

    await waitFor(() => {
      expect(screen.getByText(/Payment/i)).toBeInTheDocument();
    });
  });
});












