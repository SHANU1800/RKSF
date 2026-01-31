import { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import LoginPage from './LoginPage';
import { SparklesIcon, CheckIcon, CheckCircleIcon, CloseIcon, PackageIcon, ClipboardIcon, CreditCardIcon, BellIcon, StarIcon, MessageIcon, LoaderIcon, LockIcon } from './components/icons/IconTypes';
import ProviderCards from './ProviderCards';
import ProvidersMap from './components/ProvidersMap';
import CustomerCare from './CustomerCare';
import SettingsPage from './components/SettingsPage';
import ThemeToggle from './components/ThemeToggle';
import { LocationModal } from './components/LocationModal';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/Toast';
import { handleApiError, validators } from './utils/errorHandler';
import { API_BASE_URL, SOCKET_URL } from './utils/apiConfig';
import { formatCurrency, formatTime } from './utils/format';
import { estimateBikeEtaMinutes, haversineDistanceKm } from './utils/geo';
import { t } from './i18n';
import { io } from 'socket.io-client';
import useSettingsStore from './store/settingsStore';
import { useRazorpay } from './hooks/useRazorpay';
import SkeletonLoader from './components/SkeletonLoader';
import BottomSheet from './components/BottomSheet';
import ContextMenu from './components/ContextMenu';
import Accordion from './components/Accordion';
import SwipeCard from './components/SwipeCard';
import MiniChatPreview from './components/MiniChatPreview';

const EmptyState = ({ title, body, actionLabel, onAction, icon }) => (
  <div className="glass-panel rounded-2xl border border-dashed border-white/10 p-8 text-center text-gray-400">
    <div className="text-3xl mb-3" aria-hidden="true">{icon || <SparklesIcon size={32} className="mx-auto text-primary-400" />}</div>
    <h4 className="text-white font-semibold text-lg mb-2">{title}</h4>
    <p className="text-gray-400 text-sm mb-4">{body}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 text-white font-semibold"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const Stepper = ({ steps, current }) => (
  <div className="flex items-center gap-2 mb-5">
    {steps.map((step, idx) => {
      const isActive = idx + 1 === current;
      const isDone = idx + 1 < current;
      return (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${
              isDone ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                : isActive ? 'bg-sky-500/20 border-sky-400/40 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400'
            }`}
          >
            {isDone ? <CheckIcon size={14} /> : idx + 1}
          </div>
          <span className={`text-xs sm:text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>{step}</span>
          {idx < steps.length - 1 && <div className="w-6 h-px bg-white/10" />}
        </div>
      );
    })}
  </div>
);

function App() {
  const { toasts, removeToast, success, error, warning, info, retry } = useToast();
  const { theme, reducedMotion } = useSettingsStore();
  const razorpay = useRazorpay();
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
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [activeChatRoom, setActiveChatRoom] = useState(null); // { id, title, subtitle, meta }
  const [chatMessages, setChatMessages] = useState({}); // {roomId: [{from, text, at, fromId}]}
  const [chatInput, setChatInput] = useState('');
  const [typingRooms, setTypingRooms] = useState({});
  const [lastReadAt, setLastReadAt] = useState({});
  const [userLocation, setUserLocation] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    age: '',
    dateOfBirth: '',
    bio: '',
  });
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'order', title: 'Order Confirmed', message: 'Your order #12345 has been confirmed', timestamp: new Date(Date.now() - 3600000), read: false },
    { id: 2, type: 'message', title: 'New Message', message: 'Provider sent you a message', timestamp: new Date(Date.now() - 7200000), read: false },
    { id: 3, type: 'promo', title: 'Special Offer', message: '20% off on selected services', timestamp: new Date(Date.now() - 86400000), read: true },
  ]);
  const [transactionFilter, setTransactionFilter] = useState('all');
  
  // Mobile-specific state
  const [touchStart, setTouchStart] = useState(0);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [_showContextMenu] = useState({ show: false, x: 0, y: 0, itemId: null });
  const [notificationBadges, setNotificationBadges] = useState({ order: 1, message: 1, promo: 0 });
  const [_expandedSections] = useState({
    personal: true,
    location: true,
    security: false,
    appearance: true,
    audio: true,
    notifications: true,
  });
  
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef({});
  const lastScrollRef = useRef(0);
  const contentRef = useRef(null);

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
          if (user.location?.latitude && user.location?.longitude) {
            setUserLocation(user.location);
          } else {
            setUserLocation(null);
          }
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

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light-theme', 'dark-theme');
    
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    } else {
      root.classList.add(`${theme}-theme`);
    }

    if (reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
  }, [theme, reducedMotion]);

  // Update notification badges
  useEffect(() => {
    const badges = {
      order: notifications.filter(n => n.type === 'order' && !n.read).length,
      message: notifications.filter(n => n.type === 'message' && !n.read).length,
      promo: notifications.filter(n => n.type === 'promo' && !n.read).length,
    };
    setNotificationBadges(badges);
  }, [notifications]);

  const fetchProviders = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/providers`);
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
      retry('Failed to load providers. Please retry.');
      setProviders([]);
    }
  }, [retry]);

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
      retry('Failed to load services. Retry in a moment.');
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  }, [retry]);

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
      retry('Could not load goods. Showing demo items; retry when online.');
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
  }, [retry]);

  // Fetch providers and services when user logs in - only trigger once per user
  useEffect(() => {
    if (currentUser) {
      fetchProviders();
      fetchServices();
      fetchGoods();
    }
  }, [currentUser, fetchProviders, fetchServices, fetchGoods]);

  // Socket connection for chat
  useEffect(() => {
    if (!currentUser?._id) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      auth: { userId: currentUser._id, name: currentUser.username },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('socket connected');
      if (currentUser?.role === 'provider' && currentUser?._id) {
        socket.emit('chat:join', { room: `provider-${currentUser._id}` });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('socket connect_error', err?.message || err);
      error('Realtime connection failed. We will retry automatically.');
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

      if (activeChatRoom?.id === key) {
        const readAt = new Date().toISOString();
        setLastReadAt((prev) => ({ ...prev, [key]: readAt }));
        socket.emit('chat:read', { roomId: key, at: readAt });
      }

      if (!activeChatRoom || activeChatRoom.id !== key) {
        info(msg.from ? `${msg.from}: ${msg.text}` : 'New message received');
      }
    });

    socket.on('chat:typing', ({ roomId, userId }) => {
      if (!roomId || userId === currentUser?._id) return;
      setTypingRooms((prev) => ({ ...prev, [roomId]: true }));
      if (typingTimeoutRef.current[roomId]) {
        clearTimeout(typingTimeoutRef.current[roomId]);
      }
      typingTimeoutRef.current[roomId] = setTimeout(() => {
        setTypingRooms((prev) => ({ ...prev, [roomId]: false }));
      }, 2000);
    });

    socket.on('chat:read', ({ roomId, at }) => {
      if (!roomId) return;
      setLastReadAt((prev) => ({ ...prev, [roomId]: at || new Date().toISOString() }));
    });

    socket.on('notification', (payload) => {
      const { type = 'info', message = 'New notification' } = payload || {};
      if (type === 'success') success(message);
      else if (type === 'error') error(message);
      else if (type === 'warning') warning(message);
      else info(message);
    });

    socket.on('disconnect', (reason) => {
      console.warn('socket disconnected', reason);
      warning(`Realtime disconnected: ${reason || 'unknown'}. Retrying...`);
    });

    socket.on('error', (err) => {
      console.error('socket error', err);
      error('Realtime channel error. Check your connection.');
    });

    return () => {
      socket.disconnect();
    };
  }, [activeChatRoom, currentUser, error, info, success, warning]);

  useEffect(() => {
    if (!activeChatRoom?.id || !socketRef.current) return;
    const readAt = new Date().toISOString();
    setLastReadAt((prev) => ({ ...prev, [activeChatRoom.id]: readAt }));
    socketRef.current.emit('chat:read', { roomId: activeChatRoom.id, at: readAt });
  }, [activeChatRoom?.id]);

  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setServerStatus('Connected');
      } else {
        setServerStatus('Server error');
      }
    } catch (err) {
      setServerStatus('Connection failed');
      console.error('Server health check failed:', err);
    }
  };

  const saveUserLocation = async (location) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(location),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save location');
      }

      const data = await response.json();
      if (data.location) {
        setUserLocation(data.location);
      }
    } catch (err) {
      console.error('Location update failed:', err);
      error(err.message || 'Could not save location');
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
    setUserLocation(null);
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
        if (userData.location?.latitude && userData.location?.longitude) {
          setUserLocation(userData.location);
        } else {
          setUserLocation(null);
        }
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
      if (user.location?.latitude && user.location?.longitude) {
        setUserLocation(user.location);
      } else {
        setUserLocation(null);
      }
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

  // ===== MOBILE INTERACTION HANDLERS =====
  
  // Swipe navigation handler
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (!isLeftSwipe && !isRightSwipe) return;

    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
      info(`Switched to ${tabs[currentIndex + 1].label}`);
    } else if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
      info(`Switched to ${tabs[currentIndex - 1].label}`);
    }
  };

  // Smart header scroll handler
  const handleContentScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const scrollDelta = scrollTop - lastScrollRef.current;
    lastScrollRef.current = scrollTop;
    
    if (scrollDelta > 10 && !headerCollapsed) {
      setHeaderCollapsed(true);
    } else if (scrollDelta < -10 && headerCollapsed) {
      setHeaderCollapsed(false);
    }
  };

  // Haptic feedback
  const triggerHaptic = (duration = 10) => {
    if (navigator.vibrate) {
      navigator.vibrate(duration);
    }
  };

  // Placeholder for future accordion functionality
  const _toggleSection = () => {
    // _expandedSections state available for future use
  };

  const tabs = [
    { id: 'market', label: 'Market', icon: '🏪' },
    { id: 'goods', label: 'Goods', icon: <PackageIcon size={18} /> },
    { id: 'myOrders', label: 'Orders', icon: <ClipboardIcon size={18} /> },
    { id: 'transactions', label: 'Wallet', icon: <CreditCardIcon size={18} /> },
    { id: 'notifications', label: 'Alerts', icon: <BellIcon size={18} /> },
    { id: 'reviews', label: 'Reviews', icon: <StarIcon size={18} /> },
    { id: 'chat', label: 'Chat', icon: <MessageIcon size={18} /> },
    { id: 'providers', label: 'Providers', icon: '👥' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'customerCare', label: 'Support', icon: '🎧' },
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

  const handleComingSoon = (label) => {
    info(`${label} is coming soon.`);
  };

  const handleTransactionFilter = (filter) => {
    setTransactionFilter(filter);
    const label = filter === 'all' ? 'All transactions' : filter === 'purchases' ? 'Purchases' : 'Refunds';
    info(`Showing ${label.toLowerCase()}.`);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    info('All notifications marked as read.');
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    info('Notification dismissed.');
  };

  const handleNotificationAction = (notif) => {
    markNotificationRead(notif.id);
    info(`Action queued for: ${notif.title}`);
  };

  const emitTyping = () => {
    if (!activeChatRoom?.id || !socketRef.current || !currentUser?._id) return;
    socketRef.current.emit('chat:typing', { roomId: activeChatRoom.id, userId: currentUser._id });
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


  // New Razorpay payment flow
  const processRazorpayPayment = async () => {
    if (!createdOrderId) {
      error('No order found');
      return;
    }

    setPaymentProcessing(true);
    setPaymentError(null);

    try {
      // Get auth token from cookie or make authenticated request
      const result = await razorpay.pay(createdOrderId, null, {
        merchantName: 'RKserve',
        themeColor: '#3b82f6',
      });

      if (result.success) {
        // Fetch the updated order bill
        const orderResponse = await fetch(`${API_BASE_URL}/orders/${createdOrderId}`, {
          credentials: 'include',
        });
        
        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          setOrderBill(orderData.bill || {
            billNumber: `INV-${createdOrderId.slice(-8).toUpperCase()}`,
            date: new Date().toLocaleDateString(),
            status: 'Paid',
            transactionId: result.paymentId,
          });
        }

        setShowPayment(false);
        success('Payment successful!');
      }
    } catch (err) {
      console.error('Razorpay payment error:', err);
      if (err.message !== 'Payment cancelled by user') {
        setPaymentError(err.message || 'Payment failed');
        error(err.message || 'Payment failed');
      }
    } finally {
      setPaymentProcessing(false);
    }
  };

  const processPayment = async () => {
    if (!createdOrderId) {
      error('No order found');
      return;
    }

    if (!razorpay.sdkReady) {
      warning('Payment gateway is still loading. Please try again in a moment.');
      return;
    }

    await processRazorpayPayment();
  };

  const checkoutSteps = [t('checkout.steps.details'), t('checkout.steps.payment'), t('checkout.steps.receipt')];
  const checkoutStep = orderBill ? 3 : showPayment ? 2 : 1;

  const renderContent = () => {
    switch (activeTab) {
      case 'providers':
        return (() => {
          const providersWithDistance = providers.map((provider) => {
            const distanceKm = haversineDistanceKm(
              userLocation?.latitude,
              userLocation?.longitude,
              provider.location?.latitude,
              provider.location?.longitude
            );
            const etaMinutes = estimateBikeEtaMinutes(distanceKm, 30);

            return {
              ...provider,
              distanceKm,
              etaMinutes,
            };
          });

          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Providers</h3>
                  <p className="text-gray-400 text-sm">Browse trusted service providers</p>
                </div>
                <span className="pill text-sm border-white/10 bg-white/5">{providers.length} providers</span>
              </div>

              {providers.length > 0 && (
                <div className="glass-panel rounded-2xl border border-white/10 p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Provider Map</p>
                      <p className="text-xs text-gray-400">Distance and ETA use a 30 km/h bike speed</p>
                    </div>
                    <button
                      onClick={() => setShowLocationModal(true)}
                      className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10"
                    >
                      {userLocation ? 'Update location' : 'Add location'}
                    </button>
                  </div>
                  <ProvidersMap userLocation={userLocation} providers={providersWithDistance} />
                  {!userLocation && (
                    <p className="text-xs text-gray-400">
                      Add your location to see provider distance and ETA.
                    </p>
                  )}
                </div>
              )}

              <ProviderCards
                providers={providersWithDistance.map((p) => ({
                  ...p,
                  onContact: () => openChatRoom(`provider-${p._id}`, p.name || 'Provider', p.email || '', { kind: 'provider', providerId: p._id }),
                  onViewServices: () => {
                    setActiveTab('market');
                    setSearchTerm(p.name || '');
                    info(`Showing services for ${p.name || 'provider'}.`);
                  },
                }))}
              />
            </div>
          );
        })();

      case 'settings':
        return <SettingsPage />;

      case 'profile':
        return (
          <div className="text-gray-300 space-y-6 animate-fade-in">
            {/* User Header Card */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-4 border border-white/5 shadow-lg animate-scale-in">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                    {currentUser?.username?.charAt(0).toUpperCase() || '👤'}
                  </div>
                  <div>
                    <p className="text-white font-bold text-xl">{currentUser?.username}</p>
                    <p className="text-gray-400 text-sm">{currentUser?.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="pill text-emerald-200 border-emerald-500/30 bg-emerald-500/10">
                        {currentUser?.role === 'provider' ? '🏢 Provider' : '👥 Customer'}
                      </span>
                      <span className="pill text-blue-200 border-blue-500/30 bg-blue-500/10">Verified</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setProfileEditMode(!profileEditMode)}
                  className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold border border-blue-400/30 transition-all hover:shadow-lg"
                >
                  {profileEditMode ? '✕ Cancel' : '✏️ Edit'}
                </button>
              </div>

              {/* Account Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="text-center p-3 bg-blue-500/5 rounded-xl">
                  <p className="text-2xl font-bold text-blue-400">12</p>
                  <p className="text-xs text-gray-400 mt-1">Orders</p>
                </div>
                <div className="text-center p-3 bg-emerald-500/5 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-400">4.8</p>
                  <p className="text-xs text-gray-400 mt-1">Rating</p>
                </div>
                <div className="text-center p-3 bg-purple-500/5 rounded-xl">
                  <p className="text-2xl font-bold text-purple-400">₹2.4k</p>
                  <p className="text-xs text-gray-400 mt-1">Spent</p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            {!profileEditMode ? (
              <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4 animate-slide-up">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">👤 Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">First Name</p>
                    <p className="text-white font-semibold mt-1">{profileForm.firstName || '—'}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Last Name</p>
                    <p className="text-white font-semibold mt-1">{profileForm.lastName || '—'}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
                    <p className="text-white font-semibold mt-1">{profileForm.phone || '—'}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Gender</p>
                    <p className="text-white font-semibold mt-1">{profileForm.gender || '—'}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Age</p>
                    <p className="text-white font-semibold mt-1">{profileForm.age || '—'}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Date of Birth</p>
                    <p className="text-white font-semibold mt-1">{profileForm.dateOfBirth || '—'}</p>
                  </div>
                </div>
                {profileForm.bio && (
                  <div className="p-3 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Bio</p>
                    <p className="text-white text-sm">{profileForm.bio}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4 animate-slide-up">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">✏️ Edit Profile</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                      className="px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                      className="px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm"
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                      className="px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm appearance-none cursor-pointer"
                      style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Age"
                      min="18"
                      max="120"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({...profileForm, age: e.target.value})}
                      className="px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm"
                    />
                  </div>
                  <input
                    type="date"
                    value={profileForm.dateOfBirth}
                    onChange={(e) => setProfileForm({...profileForm, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm"
                  />
                  <textarea
                    placeholder="Bio (optional)"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm resize-none"
                  />
                  <button
                    onClick={() => {
                      success('Profile updated successfully!');
                      setProfileEditMode(false);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all active:scale-[0.98]"
                  >
                    💾 Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Location Section */}
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-3 animate-slide-up">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">📍 Delivery Address</h4>
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="text-sm px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold border border-blue-400/30 transition-all"
                >
                  {userLocation ? 'Change' : 'Add'}
                </button>
              </div>

              {userLocation ? (
                <div className="bg-white/5 rounded-xl p-4 space-y-2 animate-scale-in">
                  <p className="text-white font-semibold">{userLocation.fullAddress}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">City</p>
                      <p className="text-white">{userLocation.city || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">State</p>
                      <p className="text-white">{userLocation.state || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Postal Code</p>
                      <p className="text-white">{userLocation.postalCode || '—'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Country</p>
                      <p className="text-white">{userLocation.country || '—'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-mono">
                    📍 {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No location set. Click "Add" to use GPS.</p>
              )}
            </div>

            {/* Account Security */}
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-3 animate-slide-up">
              <h4 className="text-lg font-semibold text-white flex items-center gap-2">🔒 Account Security</h4>
              <div className="space-y-2">
                <button className="w-full p-3 rounded-xl hover:bg-white/5 transition-all text-left text-sm font-semibold text-blue-400 hover:text-blue-300">
                  🔑 Change Password
                </button>
                <button className="w-full p-3 rounded-xl hover:bg-white/5 transition-all text-left text-sm font-semibold text-blue-400 hover:text-blue-300">
                  🔐 Two-Factor Authentication
                </button>
                <button className="w-full p-3 rounded-xl hover:bg-white/5 transition-all text-left text-sm font-semibold text-red-400 hover:text-red-300">
                  🚪 Logout from All Devices
                </button>
              </div>
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

              <div className="lg:col-span-2 glass-panel rounded-2xl border border-white/5 p-4 flex flex-col min-h-105">
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
                      {(chatMessages[activeChatRoom.id] || []).map((m, idx) => {
                        const isMine = m.fromId === currentUser._id;
                        const readAt = lastReadAt[activeChatRoom.id];
                        const isRead = isMine && readAt && new Date(readAt) >= new Date(m.at);
                        return (
                          <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-3 py-2 rounded-xl text-sm max-w-[75%] ${isMine ? 'bg-emerald-500/20 border border-emerald-400/40' : 'bg-white/5 border border-white/10'}`}>
                              <p className="text-gray-200 font-semibold">{m.from}</p>
                              <p className="text-white whitespace-pre-wrap wrap-break-word">{m.text}</p>
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <p className="text-[10px] text-gray-400">{formatTime(m.at)}</p>
                                {isMine && (
                                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">{isRead ? <><CheckIcon size={10} /><CheckIcon size={10} /></> : <CheckIcon size={10} />} {isRead ? t('chat.read') : t('chat.delivered')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {typingRooms[activeChatRoom.id] && (
                        <div className="text-xs text-slate-400 px-2">{t('chat.typing')}</div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => {
                          setChatInput(e.target.value);
                          emitTyping();
                        }}
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
                        className="px-4 py-3 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold"
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

      case 'myOrders':
        return (
          <div className="text-gray-300 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white">My Orders</h3>
              <p className="text-gray-400 text-sm">Track and manage your purchases</p>
            </div>

            <div className="glass-panel rounded-2xl border border-white/5 p-6">
              <div className="space-y-4">
                <p className="text-gray-400 text-center py-8">
                  No orders yet. Start shopping from the Marketplace!
                </p>
                <button
                  onClick={() => setActiveTab('market')}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                >
                  Browse Marketplace
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-3">
                <h4 className="text-lg font-semibold text-white">Order History</h4>
                <p className="text-gray-400 text-sm">Your purchase history will appear here</p>
              </div>
              <div className="glass-panel rounded-2xl border border-white/5 p-6 space-y-3">
                <h4 className="text-lg font-semibold text-white">Return/Refund</h4>
                <p className="text-gray-400 text-sm">Manage returns and refunds for your orders</p>
              </div>
            </div>
          </div>
        );

      case 'transactions':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Transactions & Invoices</h3>
              <p className="text-gray-400 text-sm">Financial records and billing documents</p>
            </div>

            <div className="glass-panel rounded-2xl border border-white/5 p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <button
                  onClick={() => handleTransactionFilter('all')}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    transactionFilter === 'all'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-white/10 hover:bg-white/15 text-gray-300 border border-white/10'
                  }`}
                >
                  All Transactions
                </button>
                <button
                  onClick={() => handleTransactionFilter('purchases')}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    transactionFilter === 'purchases'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-white/10 hover:bg-white/15 text-gray-300 border border-white/10'
                  }`}
                >
                  Purchases
                </button>
                <button
                  onClick={() => handleTransactionFilter('refunds')}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    transactionFilter === 'refunds'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-white/10 hover:bg-white/15 text-gray-300 border border-white/10'
                  }`}
                >
                  Refunds
                </button>
              </div>

              <div className="space-y-3">
                <div className="glass-panel border border-white/5 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold">Order #12345</p>
                      <p className="text-gray-400 text-sm">Premium Cleaning Service</p>
                      <p className="text-xs text-gray-500 mt-1">Jan 25, 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-lg">+2,500</p>
                      <p className="text-gray-400 text-sm">Paid</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleComingSoon('View invoice')}
                      className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 transition"
                    >
                      View Invoice
                    </button>
                    <button
                      onClick={() => handleComingSoon('Download PDF')}
                      className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 transition"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>

                <div className="glass-panel border border-white/5 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold">Order #12344</p>
                      <p className="text-gray-400 text-sm">Garden Tool Set</p>
                      <p className="text-xs text-gray-500 mt-1">Jan 22, 2026</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-bold text-lg">-1,200</p>
                      <p className="text-gray-400 text-sm">Refunded</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleComingSoon('View invoice')}
                      className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 transition"
                    >
                      View Invoice
                    </button>
                    <button
                      onClick={() => handleComingSoon('Download PDF')}
                      className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 transition"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass-panel rounded-2xl border border-white/5 p-4">
                <p className="text-gray-400 text-sm">Total Spent</p>
                <p className="text-white text-2xl font-bold mt-2">₹15,750</p>
              </div>
              <div className="glass-panel rounded-2xl border border-white/5 p-4">
                <p className="text-gray-400 text-sm">Total Refunded</p>
                <p className="text-red-400 text-2xl font-bold mt-2">₹1,200</p>
              </div>
              <div className="glass-panel rounded-2xl border border-white/5 p-4">
                <p className="text-gray-400 text-sm">This Month</p>
                <p className="text-green-400 text-2xl font-bold mt-2">₹5,300</p>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Notifications</h3>
                <p className="text-gray-400 text-sm">Stay updated with important alerts</p>
              </div>
              <button
                onClick={markAllNotificationsRead}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-semibold border border-white/10 transition text-sm"
              >
                Mark All Read
              </button>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="glass-panel rounded-2xl border border-white/5 p-8 text-center text-gray-400">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markNotificationRead(notif.id)}
                    className={`glass-panel rounded-2xl border p-4 cursor-pointer transition ${
                      notif.read ? 'border-white/5 bg-white/5' : 'border-blue-400/30 bg-blue-400/10'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-semibold">{notif.title}</p>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{notif.message}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          {notif.timestamp.toLocaleDateString()} {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationAction(notif);
                          }}
                          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 transition"
                        >
                          Action
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notif.id);
                          }}
                          className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-gray-400 hover:text-white transition"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="glass-panel rounded-2xl border border-white/5 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Notification Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-300">Order updates and confirmations</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-300">Messages from providers</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-gray-300">Promotional offers and deals</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-gray-300">Price drop alerts for saved searches</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white">Reviews & Ratings</h3>
              <p className="text-gray-400 text-sm">Manage your feedback and leave reviews</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-panel rounded-2xl border border-white/5 p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Pending Reviews</h4>
                <div className="space-y-3">
                  <div className="glass-panel border border-white/5 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold">Premium Cleaning Service</p>
                        <p className="text-gray-400 text-sm">Order #12345</p>
                      </div>
                      <p className="text-gray-400 text-xs">Jan 25, 2026</p>
                    </div>
                    <button
                      onClick={() => handleComingSoon('Write review')}
                      className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                    >
                      Write Review
                    </button>
                  </div>
                  <div className="glass-panel border border-white/5 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold">Garden Tool Set</p>
                        <p className="text-gray-400 text-sm">Order #12344</p>
                      </div>
                      <p className="text-gray-400 text-xs">Jan 22, 2026</p>
                    </div>
                    <button
                      onClick={() => handleComingSoon('Write review')}
                      className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition"
                    >
                      Write Review
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-2xl border border-white/5 p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Reviews You Left</h4>
                <div className="space-y-3">
                  <div className="glass-panel border border-white/5 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white font-semibold">Professional Plumber</p>
                      <div className="flex text-yellow-400">★★★★★</div>
                    </div>
                    <p className="text-gray-400 text-sm">Excellent service, very professional and on time.</p>
                    <p className="text-gray-500 text-xs mt-2">Jan 20, 2026</p>
                  </div>
                  <div className="glass-panel border border-white/5 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white font-semibold">Web Design Package</p>
                      <div className="flex text-yellow-400">★★★★</div>
                    </div>
                    <p className="text-gray-400 text-sm">Good quality work, minor delays in delivery.</p>
                    <p className="text-gray-500 text-xs mt-2">Jan 15, 2026</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl border border-white/5 p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Your Rating Summary (Providers Only)</h4>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Average Rating</p>
                  <p className="text-white text-3xl font-bold mt-2">4.8</p>
                  <div className="flex justify-center text-yellow-400 mt-1">★★★★★</div>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Total Reviews</p>
                  <p className="text-white text-3xl font-bold mt-2">47</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Response Rate</p>
                  <p className="text-white text-3xl font-bold mt-2">95%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Positive Reviews</p>
                  <p className="text-white text-3xl font-bold mt-2">44</p>
                </div>
              </div>
            </div>
          </div>
        );

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
                    className="px-4 py-2 rounded-xl bg-linear-to-r from-emerald-500 to-green-600 hover:shadow-lg hover:shadow-emerald-500/25 text-white font-semibold transition"
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
                              className="flex-1 py-2 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 hover:shadow-lg hover:shadow-sky-500/25 text-white font-semibold transition"
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
                      className="px-4 py-2 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 text-white font-semibold transition"
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
                        <div className="h-1 bg-linear-to-r from-blue-500 via-cyan-400 to-emerald-400" />
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
                              <div className="pill text-xs bg-white/5 border-white/10 text-yellow-200 flex items-center gap-1"><StarIcon size={12} filled /> {Number(service.rating).toFixed(1)}</div>
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
                              className="flex-1 py-2 rounded-xl bg-linear-to-r from-emerald-500 to-green-600 hover:shadow-lg hover:shadow-emerald-500/25 text-white font-semibold transition"
                            >
                              🧾 Buy Package
                            </button>
                            <button
                              onClick={() => openServiceChat(service)}
                              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-semibold transition flex items-center gap-1"
                            >
                              <MessageIcon size={14} /> Chat
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
    <div className="min-h-screen relative overflow-hidden bg-slate-950 text-slate-50 pb-24 sm:pb-0 page-shell">
      <div className="floating-blob blue" aria-hidden="true" />
      <div className="floating-blob pink" aria-hidden="true" />
      <div className="noisy-layer" aria-hidden="true" />

      {/* Header - Beautiful & Responsive */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10 header-veil">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-4">
            {/* Logo - Refined for mobile */}
            <div className="shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-br from-sky-400 via-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <span className="text-white font-bold text-lg sm:text-xl">R</span>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-sky-400 via-cyan-300 to-emerald-200 leading-tight">
                    RKserve
                  </h1>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-slate-400 -mt-0.5">Marketplace</p>
                </div>
              </div>
            </div>
            
            {/* User Info & Actions - Desktop */}
            <div className="hidden sm:flex items-center gap-5">
              <div className="text-right">
                <p className="text-white font-semibold leading-5 text-sm">{currentUser.username}</p>
                <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
              </div>
              <ThemeToggle />
              <span
                className="pill text-xs text-emerald-200 border-emerald-500/30 bg-emerald-500/10"
                role="status"
                aria-live="polite"
              >
                {serverStatus}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-linear-to-r from-rose-500 to-red-600 hover:shadow-lg hover:shadow-rose-500/25 text-white font-semibold transition text-sm"
              >
                Logout
              </button>
            </div>

            {/* Mobile Actions - Compact & Beautiful */}
            <div className="sm:hidden flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse"
                role="status"
                aria-label={serverStatus}
              />
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl bg-linear-to-br from-rose-500 to-red-600 text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-rose-500/20"
                aria-label="Logout"
              >
                ↗
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-10">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* Sidebar - Hidden on mobile, shown on tablet+ */}
          <aside className="hidden sm:block sm:w-52 glass-panel rounded-2xl p-4 h-fit sticky top-24 border border-white/5 shadow-xl lift-card">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition font-semibold border text-sm ${
                    activeTab === tab.id
                      ? 'bg-linear-to-r from-sky-500/20 to-emerald-500/10 text-white border-sky-400/40 shadow-lg'
                      : 'text-gray-300 border-transparent hover:bg-white/5 hover:border-white/5'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main 
            className="flex-1 min-w-0 fade-in content-shell"
            ref={contentRef}
            onScroll={handleContentScroll}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="mb-6 sm:mb-10 section-hero">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="badge-soft text-xs accent-dot">{activeTab}</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-cyan-300 to-emerald-200">
                  {activeTab === 'market'
                    ? 'Market'
                    : activeTab === 'rps'
                      ? 'Rock Paper Scissors'
                      : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h2>
              </div>
              <p className="text-gray-300 text-xs sm:text-sm max-w-2xl">
                {activeTab === 'market'
                  ? 'Explore curated services from trusted providers, search, filter, and transact in a few clicks.'
                  : activeTab === 'goods'
                    ? 'Browse items, chat live with sellers, and make offers on goods.'
                    : activeTab === 'rps'
                      ? 'Challenge the bot in a fast best-of match. First to the target wins.'
                    : activeTab === 'myOrders'
                      ? 'Track your purchases, manage orders, and handle returns.'
                      : activeTab === 'transactions'
                        ? 'View your financial records, invoices, and billing history.'
                        : activeTab === 'notifications'
                          ? 'Receive and manage important alerts about your orders and activity.'
                          : activeTab === 'reviews'
                            ? 'Leave reviews for services you purchased and see your ratings.'
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
      </div>

      {/* Floating Action Button (Mobile Only) */}
      <button
        onClick={() => {
          triggerHaptic(30);
          if (activeTab === 'market') {
            setShowGoodsModal(true);
          } else if (activeTab === 'goods') {
            setShowGoodsModal(true);
          } else {
            setShowServiceModal(true);
          }
        }}
        className="sm:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/40 flex items-center justify-center hover:shadow-xl hover:shadow-blue-500/60 active:scale-95 transition-all animate-bounce border border-blue-400/30"
        aria-label="Add new item"
        title={activeTab === 'market' ? 'Add Service' : 'Add Goods'}
      >
        <span className="text-2xl">➕</span>
      </button>

      {/* Mobile Bottom Navigation - Improved Design */}
      <nav className="sm:hidden mobile-nav animate-slide-up">
        <div className="flex justify-around items-stretch px-1 py-0 gap-0.5 w-full">
          {tabs.slice(0, 4).map((tab) => {
            const badgeCount = tab.id === 'notifications' ? (notificationBadges.order + notificationBadges.message) : 0;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowMobileMenu(false);
                  triggerHaptic(15);
                }}
                className={`mobile-nav-item flex-1 relative ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="mobile-nav-icon relative">{tab.icon}
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                      {badgeCount}
                    </span>
                  )}
                </span>
                <span className="mobile-nav-label">{tab.label}</span>
              </button>
            );
          })}
          <div className="relative flex-1">
            <button
              onClick={() => {
                setShowMobileMenu(!showMobileMenu);
                triggerHaptic(15);
              }}
              className={`mobile-nav-item w-full relative ${['profile', 'settings', 'customerCare', 'reviews', 'chat', 'notifications', 'providers', 'rps', 'wallet'].includes(activeTab) || showMobileMenu ? 'active' : ''}`}
            >
              <span className="mobile-nav-icon">⋯</span>
              <span className="mobile-nav-label">More</span>
            </button>
            
            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-2 z-50 animate-scale-in">
                <div className="space-y-1">
                  {tabs.slice(4).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'bg-linear-to-r from-blue-500/30 to-indigo-500/20 text-white border border-blue-400/40'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {showServiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" role="presentation">
          <div
            className="glass-panel w-full sm:max-w-lg sm:mx-4 max-h-[90vh] overflow-y-auto p-6 relative border border-white/10 shadow-2xl rounded-t-3xl sm:rounded-2xl animate-[slideUp_0.3s_ease-out]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
          >
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />
            
            <button
              onClick={() => setShowServiceModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close add service dialog"
            >
              ✕
            </button>
            <h3 id="service-modal-title" className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2"><SparklesIcon size={24} className="text-primary-400" /> Add Service</h3>
            <form className="space-y-4" onSubmit={submitService}>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">Title</label>
                <input
                  type="text"
                  value={serviceForm.title}
                  onChange={(e) => handleServiceField('title', e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-base"
                  placeholder="e.g., Premium Web Design"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">Description</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => handleServiceField('description', e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-base resize-none"
                  rows="3"
                  placeholder="Describe your service..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => handleServiceField('price', e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-base"
                    placeholder="999"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">Category</label>
                  <input
                    type="text"
                    value={serviceForm.category}
                    onChange={(e) => handleServiceField('category', e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-base"
                    placeholder="General"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={serviceSubmitting}
                className="w-full py-4 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-60 text-white font-bold transition-all text-base active:scale-[0.98]"
              >
                {serviceSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  '🚀 Publish Service'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {showGoodsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" role="presentation">
          <div
            className="glass-panel w-full sm:max-w-lg sm:mx-4 max-h-[90vh] overflow-y-auto p-6 relative border border-white/10 shadow-2xl rounded-t-3xl sm:rounded-2xl animate-[slideUp_0.3s_ease-out]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="goods-modal-title"
          >
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />
            
            <button
              onClick={() => setShowGoodsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close list goods dialog"
            >
              ✕
            </button>
            <h3 id="goods-modal-title" className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2"><PackageIcon size={24} className="text-primary-400" /> List Goods</h3>
            <form className="space-y-4" onSubmit={submitGoods}>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">Title</label>
                <input
                  type="text"
                  value={goodsForm.title}
                  onChange={(e) => handleGoodsField('title', e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-base"
                  placeholder="e.g., MacBook Pro 14"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-medium">Description</label>
                <textarea
                  value={goodsForm.description}
                  onChange={(e) => handleGoodsField('description', e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-base resize-none"
                  rows="3"
                  placeholder="Describe your item..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={goodsForm.price}
                    onChange={(e) => handleGoodsField('price', e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-base"
                    placeholder="15000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">Condition</label>
                  <select
                    value={goodsForm.condition}
                    onChange={(e) => handleGoodsField('condition', e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-base"
                  >
                    <option>New</option>
                    <option>Excellent</option>
                    <option>Good</option>
                    <option>Fair</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">📍 Location</label>
                  <input
                    type="text"
                    value={goodsForm.location}
                    onChange={(e) => handleGoodsField('location', e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-base"
                    placeholder="Mumbai"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-medium">🖼️ Image URL</label>
                  <input
                    type="url"
                    value={goodsForm.image}
                    onChange={(e) => handleGoodsField('image', e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-base"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={goodsSubmitting}
                className="w-full py-4 rounded-xl bg-linear-to-r from-emerald-500 to-green-600 hover:shadow-xl hover:shadow-emerald-500/25 disabled:opacity-60 text-white font-bold transition-all text-base active:scale-[0.98]"
              >
                {goodsSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing...
                  </span>
                ) : (
                  '🚀 Publish Listing'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && checkoutService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" role="presentation">
          <div
            className="glass-panel w-full sm:max-w-2xl sm:mx-4 max-h-[95vh] overflow-y-auto p-6 relative border border-white/10 shadow-2xl rounded-t-3xl sm:rounded-2xl animate-[slideUp_0.3s_ease-out]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-modal-title"
          >
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />
            
            <button
              onClick={() => {
                setShowCheckout(false);
                setOrderBill(null);
                setShowPayment(false);
                setCheckoutType('buy');
                setCheckoutDays(1);
                setCheckoutQuantity(1);
                setCreatedOrderId(null);
                setPaymentError(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
              aria-label="Close checkout dialog"
            >
              ✕
            </button>

            <Stepper steps={checkoutSteps} current={checkoutStep} />

            {!showPayment && !orderBill ? (
              <>
                <h3 id="checkout-modal-title" className="text-xl sm:text-2xl font-bold text-white mb-6">{checkoutService.title}</h3>

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
                    className="w-full py-3 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 hover:shadow-lg hover:shadow-sky-500/25 disabled:opacity-60 text-white font-bold transition"
                  >
                    {checkoutSubmitting ? 'Processing...' : 'Proceed to Payment'}
                  </button>
                </div>
              </>
            ) : showPayment ? (
              // Payment Form - Razorpay Integration
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><CreditCardIcon size={24} /> Payment</h2>
                
                {paymentError && (
                  <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg text-sm">
                    {paymentError}
                  </div>
                )}

                {/* Order Summary */}
                <div className="glass-panel border border-white/10 p-5 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3 pb-3 border-b border-white/10">
                    <PackageIcon size={20} className="text-primary-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{checkoutService?.title || checkoutService?.name}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {checkoutType === 'buy' ? `Qty: ${checkoutQuantity}` : `${checkoutDays} day${checkoutDays > 1 ? 's' : ''} rental`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">{formatCurrency(checkoutService.price * checkoutQuantity)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">GST (18%)</span>
                      <span className="text-white">{formatCurrency(Math.round(checkoutService.price * checkoutQuantity * 0.18))}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-white/10 text-base font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-emerald-400">{formatCurrency(Math.round(checkoutService.price * checkoutQuantity * 1.18))}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Methods Info */}
                <div className="glass-panel border border-white/10 p-4 rounded-2xl">
                  <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide mb-3">Accepted Payment Methods</p>
                  <div className="flex flex-wrap gap-2">
                    {['UPI', 'Cards', 'NetBanking', 'Wallets'].map((method) => (
                      <span key={method} className="px-3 py-1.5 bg-white/10 rounded-lg text-white text-xs font-medium">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Razorpay SDK Status */}
                {!razorpay.sdkReady && (
                  <div className="bg-amber-900/30 border border-amber-500/50 text-amber-300 p-3 rounded-xl text-sm flex items-center gap-2">
                    <LoaderIcon size={16} />
                    <span>Loading payment gateway...</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPayment(false);
                      setPaymentError(null);
                    }}
                    className="flex-1 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold border border-white/10 transition active:scale-[0.98]"
                  >
                    Back
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={paymentProcessing || !razorpay.sdkReady}
                    className="flex-1 py-4 rounded-xl bg-(--color-primary-500) hover:bg-(--color-primary-600) disabled:opacity-60 text-white font-bold transition active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {paymentProcessing ? (
                      <><LoaderIcon size={16} /> Processing...</>
                    ) : (
                      <><LockIcon size={16} /> Pay {formatCurrency(Math.round(checkoutService.price * checkoutQuantity * 1.18))}</>
                    )}
                  </button>
                </div>

                {/* Security Note */}
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                  <LockIcon size={18} className="text-gray-400 shrink-0" />
                  <p className="text-xs text-gray-400">
                    Payments are processed securely by Razorpay. Your card details are never stored on our servers.
                  </p>
                </div>
              </div>
            ) : (
              // Bill Display
              <div className="space-y-4">
                {/* Header */}
                <div className="border-b-2 border-gray-600 pb-6 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">RKserve</h1>
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

      {/* Location Modal */}
      {showLocationModal && (
        <LocationModal
          onSelectLocation={(location) => {
            setUserLocation(location);
            saveUserLocation(location);
            success(`Location set: ${location.city}, ${location.state}`);
          }}
          onClose={() => setShowLocationModal(false)}
        />
      )}

      {/* Global Chat Drawer - Beautiful Mobile Experience */}
      {activeChatRoom && activeTab !== 'chat' && (
        <div className="fixed inset-x-0 bottom-0 sm:bottom-4 sm:right-4 sm:left-auto w-full sm:max-w-md z-50 animate-[slideUp_0.3s_ease-out]">
          <div className="glass-panel sm:rounded-2xl rounded-t-3xl border border-white/10 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 sm:hidden" />
            
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  💬
                </div>
                <div>
                  <p className="text-white font-semibold leading-tight">{activeChatRoom.title}</p>
                  {activeChatRoom.subtitle && (
                    <p className="text-xs text-slate-400">{activeChatRoom.subtitle}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveChatRoom(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all active:scale-95"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900/60 px-4 py-4 flex-1 overflow-y-auto space-y-3 min-h-70 max-h-[50vh]">
              {(chatMessages[activeChatRoom.id] || []).length === 0 && (
                <div className="text-center py-8">
                  <span className="text-4xl mb-3 block">💬</span>
                  <p className="text-gray-400 text-sm">No messages yet</p>
                  <p className="text-gray-500 text-xs mt-1">Start the conversation!</p>
                </div>
              )}
              {(chatMessages[activeChatRoom.id] || []).map((m, idx) => {
                const isMine = m.fromId === currentUser._id;
                const readAt = lastReadAt[activeChatRoom.id];
                const isRead = isMine && readAt && new Date(readAt) >= new Date(m.at);
                return (
                  <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm max-w-[85%] shadow-lg ${isMine ? 'bg-linear-to-r from-emerald-500 to-green-600 text-white rounded-br-md' : 'bg-white/10 border border-white/10 rounded-bl-md'}`}>
                      {!isMine && <p className="text-emerald-400 font-semibold text-xs mb-1">{m.from}</p>}
                      <p className="text-white whitespace-pre-wrap wrap-break-word">{m.text}</p>
                      <div className="flex items-center justify-end gap-2 mt-1.5">
                        <p className="text-[10px] opacity-70">{formatTime(m.at)}</p>
                        {isMine && (
                          <span className="text-[10px] opacity-70">{isRead ? '✓✓' : '✓'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {typingRooms[activeChatRoom.id] && (
                <div className="flex items-center gap-2 text-xs text-slate-400 px-2">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  {t('chat.typing')}
                </div>
              )}
            </div>

            <div className="flex gap-2 p-4 border-t border-white/5 bg-slate-900/80">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => {
                  setChatInput(e.target.value);
                  emitTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3.5 bg-white/10 text-white rounded-2xl border border-white/10 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm"
              />
              <button
                onClick={sendChatMessage}
                disabled={!chatInput.trim()}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 text-white font-semibold transition-all active:scale-95 disabled:opacity-50"
              >
                ➤
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
