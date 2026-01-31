import { useState } from 'react';
import { LockIcon, AlertCircleIcon, EyeIcon, EyeOffIcon, CheckIcon } from './components/icons/IconTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rksb.onrender.com/api';

function LoginPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState('password'); // 'password' or 'otp'
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // OTP states
  const [otpEmail, setOtpEmail] = useState('');
  const [otpRequestId, setOtpRequestId] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpStep, setOtpStep] = useState('request'); // 'request' or 'verify'
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpErrors, setOtpErrors] = useState({});

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { text: 'Too short', color: 'text-red-400' };
    if (password.length < 10) return { text: 'Weak', color: 'text-yellow-400' };
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { text: 'Strong', color: 'text-green-400' };
    return { text: 'Medium', color: 'text-blue-400' };
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password || password.length < 6) newErrors.password = 'Password must be 6+ characters';
    if (isSignup && !name) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const payload = isSignup
        ? { email, password, name, role }
        : { email, password, rememberMe };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error || 'Login failed' });
        return;
      }

      const user = data.user || {};
      const mappedUser = {
        username: user.name || name || email,
        role: user.role === 'provider' ? 'provider' : 'user',
        email: user.email,
        _id: user._id,
      };

      onLogin(mappedUser);
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  const quickLogin = async (testEmail, testRole) => {
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: testEmail, 
          password: 'TestPass123', 
          rememberMe: false 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error || 'Login failed' });
        return;
      }

      const user = data.user || {};
      const mappedUser = {
        username: user.name || testEmail,
        role: user.role === 'provider' ? 'provider' : 'user',
        email: user.email,
        _id: user._id,
      };

      onLogin(mappedUser);
    } catch (err) {
      console.error('Quick login error:', err);
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // OTP Functions
  const handleOtpRequest = async (e) => {
    e.preventDefault();
    if (!otpEmail) {
      setOtpErrors({ email: 'Email is required' });
      return;
    }

    setOtpLoading(true);
    setOtpErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpErrors({ form: data.error || 'Failed to send OTP' });
        return;
      }

      setOtpRequestId(data.requestId);
      setOtpExpiresAt(new Date(data.expiresAt));
      setOtpStep('verify');
      console.log('OTP sent! Check your email for the 6-digit code');
    } catch (err) {
      console.error('OTP request error:', err);
      setOtpErrors({ form: 'Network error. Please try again.' });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    
    if (!otpCode || otpCode.length !== 6) {
      setOtpErrors({ otp: 'OTP must be 6 digits' });
      return;
    }

    setOtpLoading(true);
    setOtpErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requestId: otpRequestId, otp: otpCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setOtpErrors({ 
          form: data.error || 'OTP verification failed',
          attemptsLeft: data.attemptsLeft
        });
        return;
      }

      const user = data.user || {};
      const mappedUser = {
        username: user.username || user.email,
        role: user.role === 'provider' ? 'provider' : 'customer',
        email: user.email,
        _id: user._id,
      };

      console.log('Login successful via OTP!');
      onLogin(mappedUser);
    } catch (err) {
      console.error('OTP verify error:', err);
      setOtpErrors({ form: 'Network error. Please try again.' });
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Beautiful animated background */}
      <div className="floating-blob blue" aria-hidden="true" />
      <div className="floating-blob pink" aria-hidden="true" />
      <div className="noisy-layer" aria-hidden="true" />
      
      {/* Gradient orbs for extra depth */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-linear-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-linear-to-tr from-purple-500/15 to-transparent rounded-full blur-3xl" aria-hidden="true" />
      
      <div className="w-full max-w-md sm:max-w-xl relative">
        <div className="glass-panel rounded-3xl shadow-2xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-sky-400 via-cyan-400 to-emerald-400" />
          
          {/* Logo and Welcome */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-linear-to-br from-sky-400 via-cyan-400 to-emerald-400 flex items-center justify-center shadow-xl shadow-cyan-500/30">
              <span className="text-white font-bold text-3xl sm:text-4xl">R</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-sky-400 via-cyan-300 to-emerald-200">
              RKserve
            </h1>
            <p className="text-gray-400 text-sm sm:text-base mt-2">Your trusted marketplace</p>
          </div>

          {/* Login/Signup Toggle */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1.5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsSignup(false);
                setErrors({});
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                !isSignup 
                  ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignup(true);
                setErrors({});
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                isSignup 
                  ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Login Method Tabs (only for login) */}
          {!isSignup && (
            <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('password');
                  setErrors({});
                }}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'password'
                    ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <LockIcon size={14} className="inline mr-1" /> Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('otp');
                  setOtpErrors({});
                }}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'otp'
                    ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                📧 Email OTP
              </button>
            </div>
          )}

          {errors.form && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 text-sm flex items-center gap-3">
              <AlertCircleIcon size={20} className="text-yellow-400" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Password Login Form */}
          {activeTab === 'password' && (
          <form onSubmit={handleSubmit} className="space-y-4" id="authForm">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.name ? 'border-2 border-red-500 focus:ring-red-500' : 'border border-white/10 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircleIcon size={12} className="inline" /> {errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl focus:outline-none focus:ring-2 transition-all ${
                  errors.email ? 'border-2 border-red-500 focus:ring-red-500' : 'border border-white/10 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircleIcon size={12} className="inline" /> {errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl focus:outline-none focus:ring-2 pr-12 transition-all ${
                    errors.password ? 'border-2 border-red-500 focus:ring-red-500' : 'border border-white/10 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                >
                  {showPassword ? <EyeIcon size={18} /> : <EyeOffIcon size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><AlertCircleIcon size={12} className="inline" /> {errors.password}</p>}
              {strength && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        strength.text === 'Too short' ? 'w-1/4 bg-red-500' :
                        strength.text === 'Weak' ? 'w-1/2 bg-yellow-500' :
                        strength.text === 'Medium' ? 'w-3/4 bg-blue-500' :
                        'w-full bg-green-500'
                      }`}
                    />
                  </div>
                  <span className={`text-xs font-semibold ${strength.color}`}>{strength.text}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">I am a</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/10"
              >
                <option value="user">👤 Customer</option>
                <option value="provider">🏢 Service Provider</option>
              </select>
            </div>

            {!isSignup && (
              <label className="flex items-center gap-3 text-sm text-gray-300 py-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded-md border-gray-600 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                <span className="group-hover:text-white transition-colors">Remember me for 30 days</span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base transition-all duration-200 active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : (
                isSignup ? '🚀 Create Account' : '→ Sign In'
              )}
            </button>
          </form>
          )}

          {/* OTP Login Form */}
          {activeTab === 'otp' && (
          <form onSubmit={otpStep === 'request' ? handleOtpRequest : handleOtpVerify} className="space-y-4">
            {otpErrors.form && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircleIcon size={20} className="text-yellow-400" />
                  <span>{otpErrors.form}</span>
                </div>
                {otpErrors.attemptsLeft !== undefined && (
                  <div className="text-xs mt-2 text-red-400">Attempts remaining: {otpErrors.attemptsLeft}</div>
                )}
              </div>
            )}

            {otpStep === 'request' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    disabled={otpLoading}
                    className={`w-full px-4 py-3.5 bg-slate-900/70 text-white rounded-xl focus:outline-none focus:ring-2 disabled:opacity-60 transition-all ${
                      otpErrors.email ? 'border-2 border-red-500 focus:ring-red-500' : 'border border-white/10 focus:ring-blue-500'
                    }`}
                    placeholder="you@example.com"
                  />
                  {otpErrors.email && <p className="text-red-400 text-xs mt-1.5"><AlertCircleIcon size={12} className="inline" /> {otpErrors.email}</p>}
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-xl">
                  <p className="text-sm text-blue-300 text-center">
                    📧 We'll send a 6-digit code to your email. No password needed!
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-4 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-xl hover:shadow-blue-500/25 disabled:opacity-60 text-white font-bold text-base transition-all duration-200 active:scale-[0.98]"
                >
                  {otpLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    '📧 Send OTP Code'
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-xl">✉️</span>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-300 font-semibold">OTP sent!</p>
                      <p className="text-xs text-gray-400">{otpEmail}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Expires: {otpExpiresAt?.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Enter 6-Digit Code</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={otpLoading}
                    maxLength="6"
                    className={`w-full px-4 py-4 bg-slate-900/70 text-white rounded-xl text-center text-3xl tracking-[0.5em] focus:outline-none focus:ring-2 disabled:opacity-60 font-mono ${
                      otpErrors.otp ? 'border-2 border-red-500 focus:ring-red-500' : 'border border-white/10 focus:ring-blue-500'
                    }`}
                    placeholder="••••••"
                  />
                  {otpErrors.otp && <p className="text-red-400 text-xs mt-1.5 text-center"><AlertCircleIcon size={12} className="inline" /> {otpErrors.otp}</p>}
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otpCode.length !== 6}
                  className="w-full py-4 rounded-xl bg-linear-to-r from-emerald-500 to-green-600 hover:shadow-xl hover:shadow-green-500/25 disabled:opacity-60 text-white font-bold text-base transition-all duration-200 active:scale-[0.98]"
                >
                  {otpLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <><CheckIcon size={16} className="inline mr-1" /> Verify & Sign In</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpStep('request');
                    setOtpCode('');
                    setOtpErrors({});
                  }}
                  disabled={otpLoading}
                  className="w-full py-3 text-sm text-gray-400 hover:text-white transition-colors font-semibold"
                >
                  ← Request new code
                </button>
              </>
            )}
          </form>
          )}

          <p className="text-center text-xs text-gray-500 mt-6">
            {isSignup ? 'Already have an account? ' : 'New here? '}
            <button 
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-400 hover:text-blue-300 font-semibold"
            >
              {isSignup ? 'Sign In' : 'Create Account'}
            </button>
          </p>

          {/* Quick Login - Dev Only */}
          <div className="border-t border-white/10 pt-5 mt-6">
            <p className="text-xs text-gray-500 text-center mb-3">Quick login (development)</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => quickLogin('customer@test.com', 'user')}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all border border-white/10 active:scale-[0.98]"
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => quickLogin('provider@test.com', 'provider')}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all border border-white/10 active:scale-[0.98]"
              >
                🏢 Provider
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
