import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import LoginPage from './LoginPage';
import ProviderCards from './ProviderCards';
import CustomerCare from './CustomerCare';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/Toast';
import { handleApiError, validators } from './utils/errorHandler';
import { io } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const { toasts, addToast, removeToast, success, error, warning, info } = useToast();
  const [currentUser, setCurrentUser] = useState(null);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [goods, setGoods] = useState([]);
  const [serverStatus, setServerStatus] = useState('checking...');
  const [activeTab, setActiveTab] = useState('market');
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingGoods, setLoadingGoods] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [goodsSearchTerm, setGoodsSearchTerm] = useState('');
  const [goodsConditionFilter, setGoodsConditionFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('recent');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'General',
  });
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [showGoodsModal, setShowGoodsModal] = useState(false);
  const [goodsSubmitting, setGoodsSubmitting] = useState(false);
  const [goodsForm, setGoodsForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'Good',
    location: '',
    image: '',
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutService, setCheckoutService] = useState(null);
  const [checkoutType, setCheckoutType] = useState('buy'); // fixed to buy package
  const [checkoutDays, setCheckoutDays] = useState(1);
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [orderBill, setOrderBill] = useState(null);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
    upiId: '',
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [activeChatRoom, setActiveChatRoom] = useState(null); // { id, title, subtitle, meta }
  const [chatMessages, setChatMessages] = useState({}); // {roomId: [{from, text, at, fromId}]}
  const [chatInput, setChatInput] = useState('');
  const socketRef = useRef(null);

  // Check session on mount and auto-hydrate
  useEffect(() => {
    const hydrate = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user || {};
          const mappedUser = {
            username: user.name || user.email,
            role: user.role === 'provider' ? 'provider' : 'user',
            email: user.email,
            _id: user._id,
          };
          setCurrentUser(mappedUser);
          localStorage.setItem('user', JSON.stringify(mappedUser));
        } else if (response.status === 401) {
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Session hydration failed:', error);
      }
    };

    hydrate();
    checkServerHealth();
  }, []);

  const fetchProviders = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      if (!response.ok) {
        const errorData = handleApiError({ response });
        throw new Error(errorData.message);
      }

      const data = await response.json();
      const providerList = data
        .filter(user => user.role === 'provider')
        .map(provider => ({
          ...provider,
          rating: Number.isFinite(provider.rating) ? provider.rating : 4.5
        }));

      setProviders(providerList);
    } catch (err) {
      console.error('Error fetching providers:', err);
      error('Failed to load providers');
      setProviders([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      if (!response.ok) {
        const errorData = handleApiError({ response });
        throw new Error(errorData.message);
      }

      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching services:', err);
      error('Failed to load services');
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGoods = useCallback(async () => {
    setLoadingGoods(true);
    try {
      const response = await fetch(`${API_BASE_URL}/goods`);
      if (!response.ok) {
        throw new Error('Goods fetch failed');
      }
      const data = await response.json();
      setGoods(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Goods fetch failed, using fallback seed', err);
      setGoods([
        {
          _id: 'demo-1',
          title: 'MacBook Pro 14" M2',
          description: 'Lightly used, great battery, includes box.',
          price: 145000,
          condition: 'Excellent',
          location: 'Bengaluru',
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
          sellerName: 'Demo Provider',
          sellerId: 'provider-demo',
          createdAt: new Date().toISOString(),
        },
        {
          _id: 'demo-2',
          title: 'iPhone 14 Pro',
          description: '256GB, Deep Purple, with warranty.',
          price: 78000,
          condition: 'Good',
          location: 'Mumbai',
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9',
          sellerName: 'Tech Seller',
          sellerId: 'provider-demo2',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoadingGoods(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch providers and services when user logs in
  useEffect(() => {
    if (currentUser) {
      fetchProviders();
      fetchServices();
      fetchGoods();
    }
  }, [currentUser, fetchProviders, fetchServices, fetchGoods]);

  // Socket connection for chat
  useEffect(() => {
    if (!currentUser) return;

    const socket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      auth: { userId: currentUser._id, name: currentUser.username },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('socket connected');

      // Auto-join provider inbox room so providers receive customer messages without manual open
      if (currentUser?.role === 'provider' && currentUser?._id) {
        socket.emit('chat:join', { room: `provider-${currentUser._id}` });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('socket connect_error', err?.message || err);
      error('Realtime connection failed. Please refresh.');
    });

    socket.on('chat:message', (payload) => {
      const { roomId, goodsId, serviceId, message } = payload || {};
      const key = roomId || goodsId || serviceId;
      if (!key) return;
      const msg = message || payload;
      setChatMessages((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), msg],
      }));

      // passive toast if message for a different room
      if (!activeChatRoom || activeChatRoom.id !== key) {
        info(msg.from ? `${msg.from}: ${msg.text}` : 'New message received');
      }
    });

    socket.on('notification', (payload) => {
      const { type = 'info', message = 'New notification' } = payload || {};
      if (type === 'success') success(message);
      else if (type === 'error') error(message);
      else if (type === 'warning') warning(message);
      else info(message);
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected');
    });

    return () => {
      socket.disconnect();
    };
    // Note: toast helpers are intentionally omitted from deps to avoid
    // re-creating the socket on each render (they are stable enough).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setServerStatus('✅ Connected');
      } else {
        setServerStatus('❌ Server error');
      }
    } catch (err) {
      setServerStatus('❌ Connection failed');
      console.error('Server health check failed:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('user');
    setCurrentUser(null);
    setProviders([]);
    setServices([]);
    success('Logged out successfully');
  };
  
  const handleLogin = async (userData) => {
    try {
      // If userData is already a mapped user object (from quick login), just use it
      if (userData && userData.username && userData._id) {
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
        success(`Welcome back, ${userData.username}!`);
        return;
      }

      // Otherwise, perform login request (for regular form login)
      const { email, password } = userData;
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberMe: false }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await response.json();
      const user = data.user || {};
      const mappedUser = {
        username: user.name || user.email,
        role: user.role === 'provider' ? 'provider' : 'user',
        email: user.email,
        _id: user._id,
      };
      
      localStorage.setItem('user', JSON.stringify(mappedUser));
      setCurrentUser(mappedUser);
      success(`Welcome back, ${mappedUser.username}!`);
    } catch (err) {
      console.error('Login error:', err);
      error(err.message || 'Login failed');
      throw err;
    }
  };


  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const tabs = [
    { id: 'market', label: 'Market', icon: '🛒' },
    { id: 'goods', label: 'Goods', icon: '📦' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'providers', label: 'Providers', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'customerCare', label: 'Customer Care', icon: '🤝' },
  ];

  const categories = ['all', ...new Set(services.map(s => s.category || 'General'))];

  const filteredServices = services
    .filter((service) => {
      const matchesSearch = [service.title, service.description, service.provider?.name]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = categoryFilter === 'all' || (service.category || 'General') === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortOption === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortOption === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortOption === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      return 0; // recent (as-is order from API)
    });

  const filteredGoods = goods
    .filter((item) => {
      const matchesSearch = [item.title, item.description, item.location, item.sellerName]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(goodsSearchTerm.toLowerCase()));
      const matchesCondition = goodsConditionFilter === 'all' || (item.condition || '').toLowerCase() === goodsConditionFilter;
      return matchesSearch && matchesCondition;
    })
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const handleServiceField = (field, value) => {
    setServiceForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitService = async (e) => {
    e.preventDefault();
    if (!currentUser?._id) {
      error('Session expired. Please re-login.');
      return;
    }

    // Validate form
    const titleErr = validators.required(serviceForm.title);
    const descErr = validators.required(serviceForm.description);
    const priceErr = validators.required(serviceForm.price);
    
    if (titleErr || descErr || priceErr) {
      error(titleErr || descErr || priceErr);
      return;
    }

    setServiceSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...serviceForm,
          price: Number(serviceForm.price),
        }),
      });

      if (response.status === 401) {
        error('Session expired. Please re-login.');
        handleLogout();
        return;
      }

      if (response.status === 403) {
        error('Only providers can create services.');
        return;
      }

      if (!response.ok) {
        const errorData = handleApiError({ response });
        throw new Error(errorData.message);
      }

      await fetchServices();
      setShowServiceModal(false);
      setServiceForm({ title: '', description: '', price: '', category: 'General' });
      success('Service created successfully!');
    } catch (err) {
      console.error('Service creation error:', err);
      error(err.message || 'Failed to create service');
    } finally {
      setServiceSubmitting(false);
    }
  };

  const handleGoodsField = (field, value) => {
    setGoodsForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitGoods = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'provider') {
      warning('Only providers can list goods');
      return;
    }

    const missing = ['title', 'description', 'price', 'location'].find((k) => !goodsForm[k]);
    if (missing) {
      error(`Please fill ${missing}`);
      return;
    }

    setGoodsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/goods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...goodsForm,
          price: Number(goodsForm.price),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to list goods');
      }

      await fetchGoods();
      setShowGoodsModal(false);
      setGoodsForm({ title: '', description: '', price: '', condition: 'Good', location: '', image: '' });
      success('Goods listing created');
    } catch (err) {
      console.error('Goods submit error:', err);
      error(err.message || 'Could not create listing');
    } finally {
      setGoodsSubmitting(false);
    }
  };

  const openCheckout = (service) => {
    if (!currentUser) {
      warning('Please login to purchase');
      return;
    }
    setCheckoutService(service);
    setShowCheckout(true);
    setOrderBill(null);
    setShowPayment(false);
    setCheckoutQuantity(1);
    setCheckoutDays(1);
    setCreatedOrderId(null);
    setPaymentError(null);
    setCheckoutType('buy');
  };

  const openChatRoom = (roomId, title, subtitle = '', meta = {}) => {
    setActiveChatRoom({ id: roomId, title, subtitle, meta });
    if (socketRef.current) {
      socketRef.current.emit('chat:join', { room: roomId });
    }
  };

  const openGoodsChat = (item) => {
    openChatRoom(item._id, item.title, `Seller: ${item.sellerName || 'Provider'}`, { kind: 'goods', sellerId: item.sellerId });
  };

  const openServiceChat = (service) => {
    const roomId = `service-${service._id}`;
    const subtitle = service.provider?.name ? `Provider: ${service.provider.name}` : 'Provider chat';
    openChatRoom(roomId, service.title, subtitle, { kind: 'service', providerId: service.provider?._id });
  };

  const sendChatMessage = () => {
    if (!chatInput.trim() || !activeChatRoom || !socketRef.current) return;
    const message = {
      from: currentUser.username,
      fromId: currentUser._id,
      text: chatInput.trim(),
      at: new Date().toISOString(),
    };
    socketRef.current.emit('chat:message', { roomId: activeChatRoom.id, message });
    setChatMessages((prev) => ({
      ...prev,
      [activeChatRoom.id]: [...(prev[activeChatRoom.id] || []), message],
    }));
    setChatInput('');
  };

  const submitOrder = async () => {
    if (!checkoutService || !checkoutType) {
      error('Please select service and type');
      return;
    }

    setCheckoutSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceId: checkoutService._id,
          type: checkoutType,
          quantity: checkoutType === 'buy' ? checkoutQuantity : 1,
          durationDays: checkoutType === 'rent' ? checkoutDays : null,
        }),
      });

      if (response.status === 401) {
        error('Session expired. Please re-login.');
        handleLogout();
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const data = await response.json();
      setCreatedOrderId(data.order._id);
      setShowPayment(true);
      info('Proceed to payment');
    } catch (err) {
      console.error('Order creation error:', err);
      error(err.message || 'Failed to create order');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const processPayment = async () => {
    if (!createdOrderId) {
      error('No order found');
      return;
    }

    // Validate payment form
    if (paymentMethod === 'card') {
      const cardNum = paymentForm.cardNumber.replace(/\s/g, '');
      let validationError = '';
      
      if (!paymentForm.cardNumber) validationError = 'Card number is required';
      else if (!paymentForm.cardExpiry) validationError = 'Expiry date is required';
      else if (!paymentForm.cardCvv) validationError = 'CVV is required';
      else if (!paymentForm.cardName) validationError = 'Cardholder name is required';
      else if (cardNum.length !== 16) validationError = `Card number must be 16 digits (you have ${cardNum.length})`;
      
      if (validationError) {
        setPaymentError(validationError);
        return;
      }
    } else if (paymentMethod === 'upi') {
      const upiErr = validators.upiId(paymentForm.upiId);
      if (upiErr) {
        setPaymentError(upiErr);
        return;
      }
    }

    setPaymentError(null);
    setPaymentProcessing(true);

    try {
      info('Processing payment...');
      const response = await fetch(`${API_BASE_URL}/orders/${createdOrderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paymentMethod,
          cardNumber: paymentForm.cardNumber.replace(/\s/g, ''),
          cardExpiry: paymentForm.cardExpiry,
          cardCvv: paymentForm.cardCvv,
          upiId: paymentForm.upiId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setOrderBill(data.bill);
      setShowPayment(false);
      setPaymentForm({
        cardNumber: '',
        cardExpiry: '',
        cardCvv: '',
        cardName: '',
        upiId: '',
      });
      success('Payment successful!');
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentError(err.message || 'Payment processing failed');
      error(err.message || 'Payment failed');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'providers':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Providers</h3>
                <p className="text-gray-400 text-sm">Browse trusted service providers</p>
              </div>
              <span className="pill text-sm border-white/10 bg-white/5">{providers.length} providers</span>
            </div>
            <ProviderCards
              providers={providers.map((p) => ({
                ...p,
                onContact: () => openChatRoom(`provider-${p._id}`, p.name || 'Provider', p.email || '', { kind: 'provider', providerId: p._id }),
              }))}
            />
          </div>
        );

      case 'settings':
        return (
          <div className="text-gray-300 space-y-4">
            <h3 className="text-2xl font-bold text-white">Settings</h3>
            <div className="glass-panel rounded-2xl p-6 space-y-3 border border-white/5">
              <p className="text-gray-400">Placeholder settings panel. Add preferences and notification toggles here.</p>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span>Status:</span>
                <span className="pill text-emerald-200 border-emerald-500/30 bg-emerald-500/10">{serverStatus}</span>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="text-gray-300 space-y-4">
            <h3 className="text-2xl font-bold text-white">Profile</h3>
            <div className="glass-panel rounded-2xl p-6 space-y-3 border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">{currentUser.username}</p>
                  <p className="text-gray-400 capitalize text-sm">{currentUser.role}</p>
                </div>
                <div className="pill text-emerald-200 border-emerald-500/30 bg-emerald-500/10">Logged in</div>
              </div>
              <p className="text-gray-400 text-sm">Extend this area with contact info, passwords, and preferences.</p>
            </div>
          </div>
        );

      case 'customerCare':
        return (
          <CustomerCare currentUser={currentUser} />
        );

      case 'chat': {
        const recentRooms = Object.keys(chatMessages);
        const openGeneral = () => openChatRoom('general-support', 'General Support', 'Chat with support team', { kind: 'general' });
        return (
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl border border-white/5 p-4">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Messaging</p>
                  <h3 className="text-2xl font-bold text-white">All Chats</h3>
                  <p className="text-gray-400 text-sm">Start a conversation with providers or sellers.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={openGeneral}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold border border-white/10"
                  >
                    General Chat
                  </button>
                  <button
                    onClick={() => setActiveChatRoom(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold border border-white/5"
                  >
                    Clear selection
                  </button>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="glass-panel rounded-2xl border border-white/5 p-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-white mb-2">Providers</p>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {providers.length === 0 && <p className="text-xs text-gray-500">No providers loaded.</p>}
                    {providers.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => openChatRoom(`provider-${p._id}`, p.name || 'Provider', p.email || '', { kind: 'provider', providerId: p._id })}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 border border-white/5 text-gray-200"
                      >
                        <span className="font-semibold text-white">{p.name || 'Provider'}</span>
                        {p.email && <span className="block text-xs text-gray-400">{p.email}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white mb-2">Goods sellers</p>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {filteredGoods.length === 0 && <p className="text-xs text-gray-500">No goods loaded.</p>}
                    {filteredGoods.map((g) => (
                      <button
                        key={g._id}
                        onClick={() => openChatRoom(g._id, g.title, `Seller: ${g.sellerName || 'Provider'}`, { kind: 'goods', sellerId: g.sellerId })}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 border border-white/5 text-gray-200"
                      >
                        <span className="font-semibold text-white">{g.title}</span>
                        <span className="block text-xs text-gray-400">{g.sellerName || 'Provider'} • {g.location}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white mb-2">Recent rooms</p>
                  {recentRooms.length === 0 ? (
                    <p className="text-xs text-gray-500">No recent conversations.</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {recentRooms.map((id) => (
                        <button
                          key={id}
                          onClick={() => openChatRoom(id, 'Conversation', '', { kind: 'recent' })}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 border border-white/5 text-gray-200"
                        >
                          <span className="font-semibold text-white">{id}</span>
                          <span className="block text-xs text-gray-500">{chatMessages[id]?.length || 0} messages</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-4 flex flex-col min-h-[420px]">
                {activeChatRoom ? (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">Room</p>
                        <p className="text-white font-bold text-lg">{activeChatRoom.title}</p>
                        {activeChatRoom.subtitle && (
                          <p className="text-xs text-slate-400">{activeChatRoom.subtitle}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setActiveChatRoom(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex-1 bg-slate-900/60 rounded-xl border border-white/5 p-3 overflow-y-auto space-y-2">
                      {(chatMessages[activeChatRoom.id] || []).map((m, idx) => (
                        <div key={idx} className={`flex ${m.fromId === currentUser._id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`px-3 py-2 rounded-xl text-sm max-w-[75%] ${m.fromId === currentUser._id ? 'bg-emerald-500/20 border border-emerald-400/40' : 'bg-white/5 border border-white/10'}`}>
                            <p className="text-gray-200 font-semibold">{m.from}</p>
                            <p className="text-white whitespace-pre-wrap break-words">{m.text}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{new Date(m.at).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            sendChatMessage();
                          }
                        }}
                        placeholder="Type a message"
                        className="flex-1 px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                      />
                      <button
                        onClick={sendChatMessage}
                        className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold"
                      >
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                    Select a contact on the left to start chatting.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'goods': {
        const conditions = ['all', 'excellent', 'good', 'fair', 'new'];
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-bold text-white">Goods (OLX-style)</h3>
                <p className="text-gray-400 text-sm">Buy & sell items with real-time chat to the seller</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="pill text-sm border-white/10 bg-white/5">{filteredGoods.length} listed</span>
                {currentUser.role === 'provider' && (
                  <button
                    onClick={() => setShowGoodsModal(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg hover:shadow-emerald-500/25 text-white font-semibold transition"
                  >
                    + List Goods
                  </button>
                )}
              </div>
            </div>

            <div className="glass-panel rounded-2xl border border-white/5 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2 relative">
                <input
                  type="text"
                  placeholder="Search items, locations, sellers"
                  value={goodsSearchTerm}
                  onChange={(e) => setGoodsSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              </div>
              <select
                value={goodsConditionFilter}
                onChange={(e) => setGoodsConditionFilter(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
              >
                {conditions.map((c) => (
                  <option key={c} value={c}>{c === 'all' ? 'All conditions' : c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3 space-y-4">
                {loadingGoods ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="glass-panel border border-white/5 rounded-2xl p-4 animate-pulse space-y-3">
                        <div className="h-40 bg-white/10 rounded-lg" />
                        <div className="h-4 bg-white/10 rounded w-2/3" />
                        <div className="h-4 bg-white/10 rounded w-1/3" />
                        <div className="h-3 bg-white/10 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : filteredGoods.length === 0 ? (
                  <div className="glass-panel rounded-2xl border border-dashed border-white/10 p-8 text-center text-gray-400">No goods found</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGoods.map((item) => (
                      <div key={item._id} className="glass-panel rounded-2xl border border-white/5 overflow-hidden card-hover">
                        {item.image ? (
                          <div className="h-40 bg-gray-800/40">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-40 bg-slate-900/70 flex items-center justify-center text-gray-500">No image</div>
                        )}
                        <div className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-blue-300 font-semibold">{item.condition || 'Good'}</p>
                              <h4 className="text-lg font-bold text-white mt-1">{item.title}</h4>
                              <p className="text-gray-300 text-sm line-clamp-2">{item.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-emerald-300">₹{item.price}</p>
                              <p className="text-xs text-gray-400">{item.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <span>Seller: {item.sellerName || 'Provider'}</span>
                            <span>{new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openGoodsChat(item)}
                              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:shadow-lg hover:shadow-sky-500/25 text-white font-semibold transition"
                            >
                              View & Chat
                            </button>
                            <button
                              onClick={() => openCheckout(item)}
                              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-semibold transition"
                            >
                              Make Offer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case 'market':
      default:
        return (
          <div>
            <div className="mb-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-white">Marketplace</h3>
                  <p className="text-gray-400 text-sm">Services offered by providers</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="pill text-sm border-white/10 bg-white/5">{filteredServices.length} shown</span>
                  {currentUser.role === 'provider' && (
                    <button
                      onClick={() => setShowServiceModal(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 text-white font-semibold transition"
                    >
                      + Add Service
                    </button>
                  )}
                </div>
              </div>

              <div className="glass-panel rounded-2xl border border-white/5 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="col-span-1 lg:col-span-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search services or providers"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                  </div>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All categories' : cat}</option>
                  ))}
                </select>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                >
                  <option value="recent">Sort: Recent</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>

            {loadingServices ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="glass-panel border border-white/5 rounded-2xl p-6 animate-pulse space-y-4">
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="h-5 bg-white/10 rounded w-3/4" />
                    <div className="h-16 bg-white/10 rounded" />
                    <div className="flex justify-between">
                      <div className="h-4 bg-white/10 rounded w-20" />
                      <div className="h-4 bg-white/10 rounded w-12" />
                    </div>
                    <div className="h-10 bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-gray-400 border border-dashed border-gray-700 rounded-lg">
                    No services found
                  </div>
                ) : (
                  filteredServices.map((service) => {
                    const providerName = service.provider?.name || 'Unknown Provider';
                    const category = service.category || 'General';
                    const price = Number.isFinite(service.price) ? `₹${service.price}` : '—';
                    return (
                      <div key={service._id} className="glass-panel rounded-2xl border border-white/5 overflow-hidden card-hover">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />
                        {service.image && (
                          <div className="w-full h-48 bg-gray-700/40">
                            <img 
                              src={service.image} 
                              alt={service.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="p-6 flex flex-col gap-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-blue-300 font-semibold">{category}</p>
                              <h4 className="text-xl font-bold text-white mt-1">{service.title}</h4>
                              <p className="text-gray-300 text-sm mt-2 line-clamp-3">{service.description}</p>
                            </div>
                            {service.rating !== undefined && (
                              <div className="pill text-xs bg-white/5 border-white/10 text-yellow-200">⭐ {Number(service.rating).toFixed(1)}</div>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-400">
                            <div>
                              <p className="text-white font-semibold">{providerName}</p>
                              {service.provider?.email && (
                                <p className="text-xs text-gray-500">{service.provider.email}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-300">{price}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                openCheckout(service);
                                setCheckoutType('buy');
                              }}
                              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg hover:shadow-emerald-500/25 text-white font-semibold transition"
                            >
                              🧾 Buy Package
                            </button>
                            <button
                              onClick={() => openServiceChat(service)}
                              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-semibold transition"
                            >
                              💬 Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-50">
      <div className="floating-blob blue" aria-hidden="true" />
      <div className="floating-blob pink" aria-hidden="true" />
      <div className="noisy-layer" aria-hidden="true" />

      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">RKserve</p>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-200">Marketplace</h1>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-white font-semibold leading-5">{currentUser.username}</p>
              <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
            </div>
            <div className="flex items-center gap-2">
                <span className="pill text-xs text-emerald-200 border-emerald-500/30 bg-emerald-500/10">
                  {serverStatus}
                </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:shadow-lg hover:shadow-rose-500/25 text-white font-semibold transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-10 flex gap-6 relative">
        {/* Sidebar Tabs */}
        <aside className="w-48 glass-panel rounded-2xl p-4 h-fit sticky top-24 border border-white/5 shadow-xl">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition font-semibold border ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-sky-500/20 to-emerald-500/10 text-white border-sky-400/40 shadow-lg'
                    : 'text-gray-300 border-white/5 hover:bg-white/5'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="badge-soft">{activeTab}</span>
              <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-200">
                {activeTab === 'market' ? 'Market' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
            </div>
            <p className="text-gray-300 text-sm max-w-2xl">
              {activeTab === 'market'
                ? 'Explore curated services from trusted providers, search, filter, and transact in a few clicks.'
                : activeTab === 'goods'
                  ? 'Browse items, chat live with sellers, and make offers on goods.'
                  : activeTab === 'chat'
                    ? 'Keep all your conversations in one place and reach providers or sellers instantly.'
                : activeTab === 'providers'
                  ? `Discover ${providers.length} providers and review their offerings.`
                  : activeTab === 'settings'
                    ? 'Configure your experience and keep your workspace tidy.'
                  : activeTab === 'customerCare'
                    ? 'Get kind, empathetic support from our AI assistant — here to help without hurting feelings.'
                    : 'A quick snapshot of your profile and activity.'}
            </p>
          </div>

          {renderContent()}
        </main>
      </div>

      {showServiceModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-panel rounded-2xl w-full max-w-lg p-6 relative border border-white/10 shadow-2xl">
            <button
              onClick={() => setShowServiceModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Add Service</h3>
            <form className="space-y-4" onSubmit={submitService}>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={serviceForm.title}
                  onChange={(e) => handleServiceField('title', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Description</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => handleServiceField('description', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => handleServiceField('price', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Category</label>
                  <input
                    type="text"
                    value={serviceForm.category}
                    onChange={(e) => handleServiceField('category', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={serviceSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-60 text-white font-bold transition"
              >
                {serviceSubmitting ? 'Saving...' : 'Save Service'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showGoodsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-panel rounded-2xl w-full max-w-lg p-6 relative border border-white/10 shadow-2xl">
            <button
              onClick={() => setShowGoodsModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-4">List Goods</h3>
            <form className="space-y-4" onSubmit={submitGoods}>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={goodsForm.title}
                  onChange={(e) => handleGoodsField('title', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Description</label>
                <textarea
                  value={goodsForm.description}
                  onChange={(e) => handleGoodsField('description', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                  rows="3"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Price</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={goodsForm.price}
                    onChange={(e) => handleGoodsField('price', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Condition</label>
                  <select
                    value={goodsForm.condition}
                    onChange={(e) => handleGoodsField('condition', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                  >
                    <option>New</option>
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    value={goodsForm.location}
                    onChange={(e) => handleGoodsField('location', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Image URL (optional)</label>
                  <input
                    type="url"
                    value={goodsForm.image}
                    onChange={(e) => handleGoodsField('image', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={goodsSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-60 text-white font-bold transition"
              >
                {goodsSubmitting ? 'Listing...' : 'Publish Listing'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && checkoutService && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative border border-white/10 shadow-2xl">
            <button
              onClick={() => {
                setShowCheckout(false);
                setOrderBill(null);
                setShowPayment(false);
                setCheckoutType('buy');
                setCheckoutDays(1);
                setCheckoutQuantity(1);
                setCreatedOrderId(null);
                setPaymentForm({
                  cardNumber: '',
                  cardExpiry: '',
                  cardCvv: '',
                  cardName: '',
                  upiId: '',
                });
                setPaymentError(null);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>

            {!showPayment && !orderBill ? (
              <>
                <h3 className="text-2xl font-bold text-white mb-6">{checkoutService.title}</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm">Description</p>
                    <p className="text-white">{checkoutService.description}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Provider</p>
                    <p className="text-white font-semibold">{checkoutService.provider?.name || checkoutService.sellerName || 'Seller'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Price per unit</p>
                    <p className="text-white text-lg font-bold">₹{checkoutService.price}</p>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Quantity (1-100)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={checkoutQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setCheckoutQuantity(Math.min(100, Math.max(1, val)));
                      }}
                      className="w-full px-4 py-2 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400"
                    />
                  </div>

                  <div className="glass-panel border border-white/10 p-4 rounded-2xl">
                    <div className="flex justify-between mb-2">
                      <p className="text-gray-400">Unit Price:</p>
                      <p className="text-white">₹{checkoutService.price}</p>
                    </div>
                    <div className="flex justify-between mb-2">
                      <p className="text-gray-400">
                        {checkoutType === 'buy' ? `Quantity: ${checkoutQuantity}` : `Days: ${checkoutDays}`}
                      </p>
                      <p className="text-white">×</p>
                    </div>
                    <div className="border-t border-gray-700 mt-2 pt-2 flex justify-between">
                      <p className="text-white font-bold">Total:</p>
                      <p className="text-green-400 text-lg font-bold">
                        ₹{(checkoutService.price * checkoutQuantity).toFixed(0)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={submitOrder}
                    disabled={checkoutSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:shadow-lg hover:shadow-sky-500/25 disabled:opacity-60 text-white font-bold transition"
                  >
                    {checkoutSubmitting ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </>
            ) : showPayment ? (
              // Payment Form
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">💳 Payment</h2>
                
                {paymentError && (
                  <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg text-sm">
                    {paymentError}
                  </div>
                )}

                <div className="glass-panel border border-white/10 p-4 rounded-2xl mb-4">
                  <div className="flex justify-between">
                    <p className="text-gray-400">Amount to Pay:</p>
                    <p className="text-white text-xl font-bold">
                      ₹{Math.round((checkoutService.price * checkoutQuantity) * 1.18)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Includes 18% GST</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-3 rounded-xl font-semibold transition border ${
                        paymentMethod === 'card'
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-sky-400/40 shadow-lg shadow-sky-500/20'
                          : 'bg-slate-900/70 text-gray-200 border-white/10 hover:bg-white/5'
                      }`}
                    >
                      💳 Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`py-3 rounded-xl font-semibold transition border ${
                        paymentMethod === 'upi'
                          ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-sky-400/40 shadow-lg shadow-sky-500/20'
                          : 'bg-slate-900/70 text-gray-200 border-white/10 hover:bg-white/5'
                      }`}
                    >
                      📱 UPI
                    </button>
                  </div>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        value={paymentForm.cardNumber}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\s/g, '');
                          if (value.length > 16) value = value.slice(0, 16);
                          value = value.replace(/(\d{4})/g, '$1 ').trim();
                          setPaymentForm({ ...paymentForm, cardNumber: value });
                        }}
                        className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="JOHN DOE"
                        value={paymentForm.cardName}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          placeholder="12/28"
                          maxLength="5"
                          value={paymentForm.cardExpiry}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            setPaymentForm({ ...paymentForm, cardExpiry: value });
                          }}
                          className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300 mb-1">CVV</label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength="3"
                          value={paymentForm.cardCvv}
                          onChange={(e) => setPaymentForm({ ...paymentForm, cardCvv: e.target.value.replace(/\D/g, '') })}
                          className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@paytm"
                      value={paymentForm.upiId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, upiId: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPayment(false);
                      setPaymentError(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold border border-white/10 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={paymentProcessing}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-lg hover:shadow-emerald-500/20 disabled:opacity-60 text-white font-bold transition"
                  >
                    {paymentProcessing ? '⏳ Processing...' : '✓ Pay Now'}
                  </button>
                </div>
              </div>
            ) : (
              // Bill Display
              <div className="space-y-4">
                {/* Header */}
                <div className="border-b-2 border-gray-600 pb-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">RKserve</h1>
                      <p className="text-gray-500 text-sm">B2B Service Marketplace</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs uppercase tracking-wider">Invoice</p>
                      <p className="text-white font-bold text-xl">{orderBill.billNumber}</p>
                    </div>
                  </div>
                  <div className="bg-green-900/20 border border-green-700/50 text-green-400 p-3 rounded-lg inline-block">
                    <p className="font-semibold text-sm">✓ Payment Successful</p>
                  </div>
                </div>

                {/* Bill Details Grid */}
                <div className="grid grid-cols-2 gap-6 text-sm mb-6">
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">BILL TO</p>
                    <div className="mt-2">
                      <p className="text-white font-semibold text-lg">{orderBill.customer.name}</p>
                      <p className="text-gray-400 text-sm">{orderBill.customer.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">FROM</p>
                    <div className="mt-2">
                      <p className="text-white font-semibold text-lg">{orderBill.provider.name}</p>
                      <p className="text-gray-400 text-sm">{orderBill.provider.email}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Date Issued</p>
                    <p className="text-white font-semibold mt-1">{new Date(orderBill.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Order Status</p>
                    <p className="text-blue-400 font-semibold mt-1 capitalize">{orderBill.status}</p>
                  </div>
                </div>

                {/* Service Item Table */}
                <div className="border border-gray-700 rounded-lg overflow-hidden mb-6">
                  <div className="bg-gray-800/50 px-4 py-3 flex justify-between border-b border-gray-700">
                    <div className="flex-1">
                      <p className="text-gray-400 text-xs font-semibold uppercase">Description</p>
                    </div>
                    <div className="w-20 text-right">
                      <p className="text-gray-400 text-xs font-semibold uppercase">Qty</p>
                    </div>
                    <div className="w-28 text-right">
                      <p className="text-gray-400 text-xs font-semibold uppercase">Unit Price</p>
                    </div>
                    <div className="w-28 text-right">
                      <p className="text-gray-400 text-xs font-semibold uppercase">Amount</p>
                    </div>
                  </div>
                  <div className="px-4 py-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-white font-semibold">{orderBill.service.title}</p>
                        <p className="text-gray-400 text-sm mt-1">{orderBill.items[0].description}</p>
                      </div>
                      <div className="w-20 text-right">
                        <p className="text-white">{orderBill.items[0].quantity}</p>
                      </div>
                      <div className="w-28 text-right">
                        <p className="text-white">₹{orderBill.items[0].unitPrice.toFixed(2)}</p>
                      </div>
                      <div className="w-28 text-right">
                        <p className="text-white font-semibold">₹{orderBill.items[0].amount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment & Totals */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Payment Info */}
                  {orderBill.paymentMethod && (
                    <div className="bg-gray-800/30 border border-gray-700 p-4 rounded-lg">
                      <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Payment Information</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Method:</span>
                          <span className="text-white font-semibold capitalize">{orderBill.paymentMethod}</span>
                        </div>
                        {orderBill.transactionId && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Transaction ID:</span>
                            <span className="text-white font-mono text-xs">{orderBill.transactionId}</span>
                          </div>
                        )}
                        {orderBill.paidAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Paid At:</span>
                            <span className="text-white">{new Date(orderBill.paidAt).toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {orderBill.merchantUPI && (
                          <div className="border-t border-gray-700 pt-2 mt-2">
                            <p className="text-gray-500 text-xs mb-1">Received By:</p>
                            <p className="text-green-400 font-bold">{orderBill.merchantUPI}</p>
                            {orderBill.merchantName && <p className="text-gray-500 text-xs mt-1">{orderBill.merchantName}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Amounts */}
                  <div className="bg-gray-800/30 border border-gray-700 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal:</span>
                      <span className="text-white">₹{orderBill.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">GST (18%):</span>
                      <span className="text-white">₹{orderBill.tax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-3 flex justify-between">
                      <span className="text-white font-bold text-lg">Total Amount:</span>
                      <span className="text-green-400 font-bold text-2xl">₹{orderBill.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-700 pt-4 mt-6 text-center">
                  <p className="text-gray-500 text-xs">Thank you for your business! Keep this invoice for your records.</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowCheckout(false);
                      setOrderBill(null);
                      setShowPayment(false);
                      setCreatedOrderId(null);
                      setPaymentForm({
                        cardNumber: '',
                        cardExpiry: '',
                        cardCvv: '',
                        cardName: '',
                        upiId: '',
                      });
                      setCheckoutType('buy');
                    }}
                    className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Chat Drawer */}
      {activeChatRoom && activeTab !== 'chat' && (
        <div className="fixed bottom-4 right-4 w-full max-w-md z-50">
          <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Chat</p>
                <p className="text-white font-semibold leading-tight">{activeChatRoom.title}</p>
                {activeChatRoom.subtitle && (
                  <p className="text-xs text-slate-400">{activeChatRoom.subtitle}</p>
                )}
              </div>
              <button
                onClick={() => setActiveChatRoom(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900/60 px-4 py-3 h-64 overflow-y-auto space-y-2">
              {(chatMessages[activeChatRoom.id] || []).map((m, idx) => (
                <div key={idx} className={`flex ${m.fromId === currentUser._id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-xl text-sm max-w-[80%] ${m.fromId === currentUser._id ? 'bg-emerald-500/20 border border-emerald-400/40' : 'bg-white/5 border border-white/10'}`}>
                    <p className="text-gray-200 font-semibold">{m.from}</p>
                    <p className="text-white whitespace-pre-wrap break-words">{m.text}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{new Date(m.at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 p-3 border-t border-white/5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                placeholder="Type a message"
                className="flex-1 px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:outline-none"
              />
              <button
                onClick={sendChatMessage}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default App;
