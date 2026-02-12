import { useState } from 'react';
import { AlertCircleIcon, EyeIcon, EyeOffIcon, CheckIcon } from './components/icons/IconTypes';
import { API_BASE_URL } from './utils/apiConfig';
// import loginBg from './assets/login_bg.jpg';
import loginIllustration from './assets/Mobile login-pana.png';

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
    return { text: 'Medium', color: 'text-[#00f0ff]' };
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
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
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

      // Store token in localStorage for API requests
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

      onLogin(mappedUser);
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength();

  const quickLogin = async (testEmail) => {
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
        role: user.role === 'provider' ? 'provider' : user.role === 'admin' ? 'admin' : 'user',
        email: user.email,
        _id: user._id,
      };

      // Store token in localStorage for API requests
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

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

      // Store token in localStorage for API requests
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
      }

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
    <div className="w-full min-h-screen flex items-center justify-center p-4 lg:p-16 bg-gradient-to-br from-black via-zinc-900 to-black relative overflow-hidden">
      {/* Enhanced SVG Background with Cyan Accents */}
      <svg className="absolute inset-0 w-full h-full z-1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#00f0ff" strokeWidth="0.5" opacity="0.1"/>
          </pattern>
          <linearGradient id="cyanGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{stopColor: '#00f0ff', stopOpacity: 0.2}} />
            <stop offset="100%" style={{stopColor: '#00f0ff', stopOpacity: 0}} />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <circle cx="15%" cy="25%" r="20%" fill="url(#cyanGlow)" />
        <circle cx="85%" cy="75%" r="25%" fill="url(#cyanGlow)" />
        <circle cx="50%" cy="50%" r="15%" fill="#00f0ff" opacity="0.03" />
      </svg>
      
      {/* Animated cyan glow orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#00f0ff] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00f0ff] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2s'}} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00f0ff] rounded-full filter blur-3xl opacity-5 animate-pulse-glow" style={{animationDelay: '1s'}} />
      
      {/* Main Container - Two Column Layout */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 relative z-10">
        
        {/* Left Side - Illustration (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[40%] items-center justify-center animate-slide-in-left">
          <div className="relative w-full max-w-md">
            <img 
              src={loginIllustration} 
              alt="Login Illustration" 
              className="w-full h-auto drop-shadow-2xl animate-float"
            />
            {/* Glow effect behind illustration */}
            <div className="absolute inset-0 bg-[#00f0ff] rounded-full blur-3xl opacity-20 -z-10" />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-[60%]">
          <div className="w-full max-w-xl mx-auto">
          {/* Modern Black Card with Cyan Accents */}
          <div className="bg-gradient-to-br from-zinc-900 to-black backdrop-blur-md rounded-3xl shadow-2xl p-10 border-2 border-[#00f0ff]/20 relative overflow-hidden animate-scale-in">
            {/* Cyan glow effect on card */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#00f0ff] rounded-full blur-3xl opacity-10" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#00f0ff] rounded-full blur-3xl opacity-10" />
            
            {/* Content wrapper */}
            <div className="relative z-10">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[#00f0ff] font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                <span className="w-1 h-4 bg-[#00f0ff] rounded-full" />
                {isSignup ? 'NEW MEMBERS' : 'ALREADY MEMBERS'}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-[#00f0ff] text-sm transition-all duration-300 font-medium"
              >
                Need help?
              </button>
            </div>

            {/* Login/Signup Toggle - Only show when not in OTP mode */}
            {activeTab === 'password' && (
              <div className="flex gap-3 mb-6 bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(false);
                    setErrors({});
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
                    !isSignup 
                      ? 'bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] text-black shadow-lg shadow-[#00f0ff]/30' 
                      : 'text-gray-400 hover:text-white hover:bg-zinc-700/50'
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
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
                    isSignup 
                      ? 'bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] text-black shadow-lg shadow-[#00f0ff]/30' 
                      : 'text-gray-400 hover:text-white hover:bg-zinc-700/50'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Login Method Tabs (only for login, not signup) */}
            {!isSignup && (
              <div className="flex gap-3 mb-6 bg-zinc-800/50 p-1.5 rounded-xl border border-zinc-700">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('password');
                    setErrors({});
                  }}
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
                    activeTab === 'password'
                      ? 'bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] text-black shadow-lg shadow-[#00f0ff]/30'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-700/50'
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
                  className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
                    activeTab === 'otp'
                      ? 'bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] text-black shadow-lg shadow-[#00f0ff]/30'
                      : 'text-gray-400 hover:text-white hover:bg-zinc-700/50'
                  }`}
                >
                  Email OTP
                </button>
              </div>
            )}

            {errors.form && (
              <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-3 backdrop-blur-sm">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <AlertCircleIcon size={16} />
                </div>
                <span className="font-medium">{errors.form}</span>
              </div>
            )}

            {/* Password Login Form */}
            {activeTab === 'password' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {isSignup && (
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    className={`w-full px-5 py-4 bg-zinc-800/50 text-white text-base rounded-xl border-2 ${
                      errors.name ? 'border-red-500/50' : 'border-zinc-700'
                    } focus:outline-none focus:border-[#00f0ff] transition-all duration-300 placeholder:text-gray-500`}
                      placeholder="Full Name"
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-2 ml-1">{errors.name}</p>}
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-5 py-4 bg-zinc-800/50 text-white text-base rounded-xl border-2 ${
                      errors.email ? 'border-red-500/50' : 'border-zinc-700'
                    } focus:outline-none focus:border-[#00f0ff] transition-all duration-300 placeholder:text-gray-500`}
                    placeholder={isSignup ? "Email address" : "ritanshukumar18@gmail.com"}
                  />
                  {errors.email && <p className="text-red-400 text-xs mt-2 ml-1">{errors.email}</p>}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-5 py-4 pr-14 bg-zinc-800/50 text-white rounded-xl border-2 ${
                      errors.password ? 'border-red-500/50' : 'border-zinc-700'
                    } focus:outline-none focus:border-[#00f0ff] transition-all duration-300 placeholder:text-gray-500`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00f0ff] transition-all duration-300"
                  >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                  {errors.password && <p className="text-red-400 text-xs mt-2 ml-1">{errors.password}</p>}
                  {strength && !isSignup && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            strength.text === 'Too short' ? 'w-1/4 bg-gradient-to-r from-red-500 to-red-600' :
                            strength.text === 'Weak' ? 'w-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600' :
                            strength.text === 'Medium' ? 'w-3/4 bg-gradient-to-r from-[#00f0ff] to-[#33f3ff]' :
                            'w-full bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-bold ${strength.color}`}>{strength.text}</span>
                    </div>
                  )}
                </div>

                {isSignup && (
                  <div>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-5 py-4 bg-zinc-800/50 text-white text-base rounded-xl border-2 border-zinc-700 focus:outline-none focus:border-[#00f0ff] transition-all duration-300 cursor-pointer"
                    >
                      <option value="user" className="bg-zinc-900">Customer</option>
                      <option value="provider" className="bg-zinc-900">Service Provider</option>
                    </select>
                  </div>
                )}

                {!isSignup && (
                  <label className="flex items-center gap-3 text-sm text-gray-400 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer w-5 h-5 rounded border-2 border-zinc-700 bg-zinc-800/50 text-[#00f0ff] focus:ring-[#00f0ff] focus:ring-2 cursor-pointer transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded border-2 border-[#00f0ff] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="group-hover:text-[#00f0ff] transition-colors duration-300">Remember me</span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:from-[#33f3ff] hover:to-[#00f0ff] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#00f0ff]/30 hover:shadow-[#00f0ff]/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                      Please wait...
                    </span>
                  ) : (
                    isSignup ? 'Create Account' : 'SIGN IN'
                  )}
                </button>
              </form>
            )}

            {/* OTP Login Form */}
            {activeTab === 'otp' && (
              <form onSubmit={otpStep === 'request' ? handleOtpRequest : handleOtpVerify} className="space-y-5">
                {otpErrors.form && (
                  <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-xl text-red-400 text-sm backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                        <AlertCircleIcon size={16} />
                      </div>
                      <span className="font-medium">{otpErrors.form}</span>
                    </div>
                    {otpErrors.attemptsLeft !== undefined && (
                      <div className="text-xs mt-2 text-red-300 ml-11">Attempts remaining: {otpErrors.attemptsLeft}</div>
                    )}
                  </div>
                )}

                {otpStep === 'request' ? (
                  <>
                    <div>
                      <input
                        type="email"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        disabled={otpLoading}
                        className={`w-full px-5 py-4 bg-zinc-800/50 text-white text-base rounded-xl border-2 ${
                          otpErrors.email ? 'border-red-500/50' : 'border-zinc-700'
                        } focus:outline-none focus:border-[#00f0ff] transition-all duration-300 disabled:opacity-50 placeholder:text-gray-500`}
                        placeholder="Email address"
                      />
                      {otpErrors.email && <p className="text-red-400 text-xs mt-2 ml-1">{otpErrors.email}</p>}
                    </div>

                    <div className="p-5 bg-[#00f0ff]/10 border-2 border-[#00f0ff]/30 rounded-xl backdrop-blur-sm">
                      <p className="text-sm text-[#00f0ff] text-center font-medium leading-relaxed">
                        We'll send a 6-digit code to your email. No password needed! 🔒
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:from-[#33f3ff] hover:to-[#00f0ff] disabled:opacity-50 text-black font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#00f0ff]/30 hover:shadow-[#00f0ff]/50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {otpLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        'Send OTP Code'
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-5 bg-gradient-to-r from-[#00f0ff]/10 to-green-500/10 border-2 border-[#00f0ff]/30 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#00f0ff]/20 flex items-center justify-center border-2 border-[#00f0ff]/40">
                          <span className="text-2xl">✉️</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-green-400 font-bold">OTP sent successfully!</p>
                          <p className="text-xs text-gray-300 mt-0.5">{otpEmail}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Expires: {otpExpiresAt?.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        disabled={otpLoading}
                        maxLength="6"
                        className={`w-full px-5 py-6 bg-zinc-800/50 text-[#00f0ff] rounded-xl text-center text-3xl tracking-[0.5em] focus:outline-none focus:border-[#00f0ff] disabled:opacity-50 font-mono border-2 ${
                          otpErrors.otp ? 'border-red-500/50' : 'border-zinc-700'
                        } transition-all duration-300`}
                        placeholder="••••••"
                      />
                      {otpErrors.otp && <p className="text-red-400 text-xs mt-2 text-center">{otpErrors.otp}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={otpLoading || otpCode.length !== 6}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00f0ff] to-[#33f3ff] hover:from-[#33f3ff] hover:to-[#00f0ff] disabled:opacity-50 text-black font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-lg shadow-[#00f0ff]/30 hover:shadow-[#00f0ff]/50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {otpLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-5 h-5 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <CheckIcon size={18} />
                          Verify & Sign In
                        </span>
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
                      className="w-full py-3 text-sm text-gray-400 hover:text-[#00f0ff] transition-all duration-300 font-semibold"
                    >
                      ← Request new code
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Account Toggle */}
            <div className="mt-6 pt-6 border-t border-zinc-700/50 text-center">
              <p className="text-gray-400 text-sm">
                {isSignup ? "Already have an account?" : "Don't have an account yet?"}{' '}
                <button 
                  type="button"
                  onClick={() => {
                    setIsSignup(!isSignup);
                    setActiveTab('password');
                    setErrors({});
                    setOtpErrors({});
                  }}
                  className="text-[#00f0ff] hover:text-[#33f3ff] font-semibold transition-colors duration-300 underline decoration-transparent hover:decoration-[#00f0ff]"
                >
                  {isSignup ? 'Sign In' : 'Create an account'}
                </button>
              </p>
            </div>
            </div>
          </div>

          {/* Quick Login - Dev Only */}
          <div className="mt-6 text-center bg-gradient-to-br from-zinc-900 to-black backdrop-blur-md rounded-2xl p-6 shadow-2xl border-2 border-zinc-700">
            <p className="text-gray-400 text-xs mb-4 font-semibold uppercase tracking-wider">Quick login (dev)</p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => quickLogin('customer@test.com')}
                disabled={loading}
                className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all duration-300 border-2 border-zinc-700 hover:border-[#00f0ff]/50 hover:shadow-lg hover:shadow-[#00f0ff]/20 hover:scale-105 active:scale-95"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => quickLogin('provider@test.com')}
                disabled={loading}
                className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all duration-300 border-2 border-zinc-700 hover:border-[#00f0ff]/50 hover:shadow-lg hover:shadow-[#00f0ff]/20 hover:scale-105 active:scale-95"
              >
                Provider
              </button>
              <button
                type="button"
                onClick={() => quickLogin('admin@test.com')}
                disabled={loading}
                className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all duration-300 border-2 border-zinc-700 hover:border-[#00f0ff]/50 hover:shadow-lg hover:shadow-[#00f0ff]/20 hover:scale-105 active:scale-95"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
        </div>
        {/* End Right Side - Login Form */}
        
      </div>
      {/* End Main Container */}
    </div>
  );
}

export default LoginPage;












