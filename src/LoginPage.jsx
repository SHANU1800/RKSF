import { useState } from 'react';

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

      const response = await fetch(`https://rksb.onrender.com${endpoint}`, {
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
      const response = await fetch('https://rksb.onrender.com/api/auth/login', {
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
      const response = await fetch('https://rksb.onrender.com/api/auth/otp/request', {
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
      console.log('✅ OTP sent! Check your email for the 6-digit code');
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
      const response = await fetch('https://rksb.onrender.com/api/auth/otp/verify', {
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

      console.log('✅ Login successful via OTP!');
      onLogin(mappedUser);
    } catch (err) {
      console.error('OTP verify error:', err);
      setOtpErrors({ form: 'Network error. Please try again.' });
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
      <div className="floating-blob blue" aria-hidden="true" />
      <div className="floating-blob pink" aria-hidden="true" />
      <div className="noisy-layer" aria-hidden="true" />
      <div className="w-full max-w-xl relative">
        <div className="glass-panel rounded-2xl shadow-2xl p-10 border border-white/10">
          <div className="text-center mb-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Welcome to</p>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-200">RKserve</h1>
            <p className="text-gray-400 text-sm">Sign in to manage orders and services</p>
          </div>

          <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsSignup(false);
                setErrors({});
              }}
              className={`flex-1 py-2 rounded-xl font-semibold transition ${
                !isSignup ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignup(true);
                setErrors({});
              }}
              className={`flex-1 py-2 rounded-xl font-semibold transition ${
                isSignup ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-300 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login/Signup Tabs */}
          {!isSignup && (
            <div className="flex gap-2 mb-4 bg-white/5 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('password');
                  setErrors({});
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                  activeTab === 'password'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('otp');
                  setOtpErrors({});
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${
                  activeTab === 'otp'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                📧 OTP
              </button>
            </div>
          )}

          {errors.form && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
              {errors.form}
            </div>
          )}

          {/* Password Login Form */}
          {activeTab === 'password' && (
          <form onSubmit={handleSubmit} className="space-y-4" id="authForm">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl focus:outline-none focus:ring-2 ${
                    errors.name ? 'border border-red-500 focus:ring-red-500' : 'border border-white/10 focus:ring-blue-500'
                  }`}
                  placeholder="Jane Doe"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl focus:outline-none focus:ring-2 ${
                  errors.email ? 'border border-red-500 focus:ring-red-500' : 'border border-white/10 focus:ring-blue-500'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl focus:outline-none focus:ring-2 pr-10 ${
                    errors.password ? 'border border-red-500 focus:ring-red-500' : 'border border-white/10 focus:ring-blue-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              {strength && (
                <p className={`text-xs mt-1 font-semibold ${strength.color}`}>
                  Password strength: {strength.text}
                </p>
              )}
            </div>

            {!isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/10"
                >
                  <option value="user">Customer</option>
                  <option value="provider">Provider</option>
                </select>
              </div>
            )}

            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">I am a</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-white/10"
                >
                  <option value="user">Customer</option>
                  <option value="provider">Provider</option>
                </select>
              </div>
            )}

            {!isSignup && (
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4"
                />
                Remember me for 30 days
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-60 text-white font-bold transition duration-200"
            >
              {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
            </button>
          </form>
          )}

          {/* OTP Login Form */}
          {activeTab === 'otp' && (
          <form onSubmit={otpStep === 'request' ? handleOtpRequest : handleOtpVerify} className="space-y-4">
            {otpErrors.form && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded text-red-400 text-sm">
                <div>{otpErrors.form}</div>
                {otpErrors.attemptsLeft !== undefined && (
                  <div className="text-xs mt-1">Attempts left: {otpErrors.attemptsLeft}</div>
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
                    className={`w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl focus:outline-none focus:ring-2 disabled:opacity-60 ${
                      otpErrors.email ? 'border border-red-500 focus:ring-red-500' : 'border border-white/10 focus:ring-blue-500'
                    }`}
                    placeholder="you@example.com"
                  />
                  {otpErrors.email && <p className="text-red-400 text-xs mt-1">{otpErrors.email}</p>}
                </div>

                <p className="text-xs text-gray-400 text-center">
                  We'll send a 6-digit code to your email. No password needed!
                </p>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-60 text-white font-bold transition duration-200"
                >
                  {otpLoading ? '⏳ Sending...' : '📧 Send OTP Code'}
                </button>
              </>
            ) : (
              <>
                <div className="bg-blue-900/20 border border-blue-700 rounded-xl p-3 mb-4">
                  <p className="text-sm text-blue-300">
                    ✅ OTP sent to <strong>{otpEmail}</strong>
                  </p>
                  <p className="text-xs text-blue-400 mt-1">
                    Expires at: {otpExpiresAt?.toLocaleTimeString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">6-Digit Code</label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    disabled={otpLoading}
                    maxLength="6"
                    className={`w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl text-center text-2xl letter-spacing-2 focus:outline-none focus:ring-2 disabled:opacity-60 font-mono ${
                      otpErrors.otp ? 'border border-red-500 focus:ring-red-500' : 'border border-white/10 focus:ring-blue-500'
                    }`}
                    placeholder="000000"
                  />
                  {otpErrors.otp && <p className="text-red-400 text-xs mt-1">{otpErrors.otp}</p>}
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otpCode.length !== 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/20 disabled:opacity-60 text-white font-bold transition duration-200"
                >
                  {otpLoading ? '⏳ Verifying...' : '✓ Verify & Login'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpStep('request');
                    setOtpCode('');
                    setOtpErrors({});
                  }}
                  disabled={otpLoading}
                  className="w-full py-2 text-sm text-gray-400 hover:text-white transition"
                >
                  ← Request new OTP
                </button>
              </>
            )}
          </form>
          )}

          <p className="text-center text-xs text-gray-500 mt-6">
            {isSignup ? 'Already have an account? Switch to Login' : 'New here? Switch to Sign Up'}
          </p>

          <div className="border-t border-white/10 pt-4 mt-6">
            <p className="text-xs text-gray-400 text-center mb-3">Quick login (dev only)</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => quickLogin('customer@test.com', 'user')}
                disabled={loading}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition border border-white/10"
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => quickLogin('provider@test.com', 'provider')}
                disabled={loading}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition border border-white/10"
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
