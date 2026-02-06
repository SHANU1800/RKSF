import { useState } from 'react';
import { AlertCircleIcon, EyeIcon, EyeOffIcon, CheckIcon } from './components/icons/IconTypes';
import { API_BASE_URL } from './utils/apiConfig';
import loginBg from './assets/login_bg.jpg';

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
    return { text: 'Medium', color: 'text-[#0a0a0a]' };
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
    <div className="w-full min-h-screen flex items-center justify-center lg:justify-end p-4 lg:p-16 bg-black relative overflow-hidden">
      {/* Background image overlay for desktop only */}
      <div 
        className="hidden lg:block absolute inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.7
        }}
      />
      
      {/* SVG Background Patterns */}
      <svg className="absolute inset-0 w-full h-full opacity-5 z-1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <circle cx="20%" cy="30%" r="15%" fill="white" opacity="0.1" />
        <circle cx="80%" cy="70%" r="20%" fill="white" opacity="0.05" />
        <rect x="60%" y="20%" width="30%" height="30%" fill="white" opacity="0.08" />
        <polygon points="10,10 30,80 50,40" fill="white" opacity="0.05" />
      </svg>
      
      {/* Login Container - Centered on mobile, right on desktop */}
      <div className="w-full max-w-md mx-4 lg:mx-0 lg:mr-12 xl:mr-24 relative z-10">
          {/* White Login Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-10 border border-gray-200">
            {/* Card Header */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[#F7D047] font-bold text-xs uppercase tracking-wider">
                {isSignup ? 'NEW MEMBERS' : 'ALREADY MEMBERS'}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
              >
                Need help?
              </button>
            </div>

            {/* Login/Signup Toggle - Only show when not in OTP mode */}
            {activeTab === 'password' && (
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(false);
                    setErrors({});
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                    !isSignup 
                      ? 'bg-white text-[#0a0a0a] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
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
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                    isSignup 
                      ? 'bg-white text-[#0a0a0a] shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Login Method Tabs (only for login, not signup) */}
            {!isSignup && (
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('password');
                    setErrors({});
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                    activeTab === 'password'
                      ? 'bg-white text-[#0a0a0a] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
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
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                    activeTab === 'otp'
                      ? 'bg-white text-[#0a0a0a] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Email OTP
                </button>
              </div>
            )}

            {errors.form && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex items-center gap-2">
                <AlertCircleIcon size={16} />
                <span>{errors.form}</span>
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
                    className={`w-full px-4 py-3 bg-white text-gray-800 text-base rounded border ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:border-[#0a0a0a]`}
                      placeholder="Full Name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-4 py-3 bg-white text-gray-800 text-base rounded border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:border-[#0a0a0a]`}
                    placeholder={isSignup ? "Email address" : "Mahisa Dyan Diptya"}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 pr-12 bg-white text-gray-800 rounded border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:border-[#0a0a0a]`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  {strength && !isSignup && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            strength.text === 'Too short' ? 'w-1/4 bg-red-500' :
                            strength.text === 'Weak' ? 'w-1/2 bg-yellow-500' :
                            strength.text === 'Medium' ? 'w-3/4 bg-[#0a0a0a]' :
                            'w-full bg-[#0a0a0a]'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-semibold ${strength.color}`}>{strength.text}</span>
                    </div>
                  )}
                </div>

                {isSignup && (
                  <div>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-4 py-3 bg-white text-gray-800 text-base rounded border border-gray-300 focus:outline-none focus:border-[#0a0a0a]"
                    >
                      <option value="user">Customer</option>
                      <option value="provider">Service Provider</option>
                    </select>
                  </div>
                )}

                {!isSignup && (
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0a0a0a] focus:ring-[#0a0a0a]"
                    />
                    <span>Remember me</span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-lg bg-[#0a0a0a] hover:bg-[#000000] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm uppercase tracking-wider transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Please wait...
                    </span>
                  ) : (
                    isSignup ? 'Create Account' : 'Sign In'
                  )}
                </button>
              </form>
            )}

            {/* OTP Login Form */}
            {activeTab === 'otp' && (
              <form onSubmit={otpStep === 'request' ? handleOtpRequest : handleOtpVerify} className="space-y-5">
                {otpErrors.form && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertCircleIcon size={16} />
                      <span>{otpErrors.form}</span>
                    </div>
                    {otpErrors.attemptsLeft !== undefined && (
                      <div className="text-xs mt-2 text-red-500">Attempts remaining: {otpErrors.attemptsLeft}</div>
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
                        className={`w-full px-4 py-3 bg-white text-gray-800 text-base rounded border ${
                          otpErrors.email ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:border-[#0a0a0a] disabled:opacity-60`}
                        placeholder="Email address"
                      />
                      {otpErrors.email && <p className="text-red-500 text-xs mt-1">{otpErrors.email}</p>}
                    </div>

                    <div className="p-4 bg-[#0a0a0a]/10 border border-[#0a0a0a]/20 rounded-lg">
                      <p className="text-sm text-[#0a0a0a] text-center">
                        We'll send a 6-digit code to your email. No password needed!
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={otpLoading}
                      className="w-full py-3.5 rounded-lg bg-[#0a0a0a] hover:bg-[#000000] disabled:opacity-60 text-white font-bold text-sm uppercase tracking-wider transition-colors"
                    >
                      {otpLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        'Send OTP Code'
                      )}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-[#0a0a0a]/10 border border-[#0a0a0a]/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0a0a0a]/20 flex items-center justify-center">
                          <span className="text-xl">✉️</span>
                        </div>
                        <div>
                          <p className="text-sm text-green-700 font-semibold">OTP sent!</p>
                          <p className="text-xs text-gray-600">{otpEmail}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
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
                        className={`w-full px-4 py-5 bg-white text-gray-800 rounded-lg text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-[#0a0a0a] disabled:opacity-60 font-mono border ${
                          otpErrors.otp ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="••••••"
                      />
                      {otpErrors.otp && <p className="text-red-500 text-xs mt-1 text-center">{otpErrors.otp}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={otpLoading || otpCode.length !== 6}
                      className="w-full py-3.5 rounded-lg bg-[#0a0a0a] hover:bg-[#000000] disabled:opacity-60 text-white font-bold text-sm uppercase tracking-wider transition-colors"
                    >
                      {otpLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <CheckIcon size={16} />
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
                      className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors font-semibold"
                    >
                      ← Request new code
                    </button>
                  </>
                )}
              </form>
            )}
          </div>

          {/* Footer - Below Card */}
          <div className="mt-6 text-center bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <p className="text-gray-700 text-sm mb-1 font-medium">
              {isSignup ? "Already have an account?" : "Don't have an account yet?"}
            </p>
            <button 
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setActiveTab('password');
                setErrors({});
                setOtpErrors({});
              }}
              className="text-[#0a0a0a] hover:text-[#000000] font-bold text-sm transition-colors"
            >
              {isSignup ? 'Sign In' : 'Create an account'}
            </button>
          </div>

          {/* Quick Login - Dev Only */}
          <div className="mt-6 text-center bg-black/80 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20">
            <p className="text-white/90 text-xs mb-3 font-medium">Quick login (dev)</p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => quickLogin('customer@test.com')}
                disabled={loading}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all border border-white/30"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => quickLogin('provider@test.com')}
                disabled={loading}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all border border-white/30"
              >
                Provider
              </button>
              <button
                type="button"
                onClick={() => quickLogin('admin@test.com')}
                disabled={loading}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-all border border-white/30"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default LoginPage;












