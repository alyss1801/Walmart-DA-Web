import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, Sparkles, ShoppingCart, TrendingUp, BarChart3, Users } from 'lucide-react';

// ============================================================
// ANIMATED PARTICLES COMPONENT
// ============================================================
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 10 + 15
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white/10 animate-float"
          style={{
            width: p.size + 'px',
            height: p.size + 'px',
            left: p.left + '%',
            bottom: '-10px',
            animationDelay: p.delay + 's',
            animationDuration: p.duration + 's'
          }}
        />
      ))}
    </div>
  );
};

// ============================================================
// WALMART SPARK LOGO COMPONENT (Animated)
// ============================================================
const WalmartSpark = ({ className = "", animate = true }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} ${animate ? 'animate-pulse-slow' : ''}`}
      fill="currentColor"
    >
      {/* 6 spark rays */}
      <g className={animate ? 'animate-spin-slow origin-center' : ''}>
        <ellipse cx="50" cy="15" rx="8" ry="20" className="fill-walmart-yellow" />
        <ellipse cx="50" cy="85" rx="8" ry="20" className="fill-walmart-yellow" />
        <ellipse cx="15" cy="50" rx="20" ry="8" className="fill-walmart-yellow" />
        <ellipse cx="85" cy="50" rx="20" ry="8" className="fill-walmart-yellow" />
        <ellipse cx="24" cy="24" rx="8" ry="20" transform="rotate(45 24 24)" className="fill-walmart-yellow" />
        <ellipse cx="76" cy="24" rx="8" ry="20" transform="rotate(-45 76 24)" className="fill-walmart-yellow" />
        <ellipse cx="24" cy="76" rx="8" ry="20" transform="rotate(-45 24 76)" className="fill-walmart-yellow" />
        <ellipse cx="76" cy="76" rx="8" ry="20" transform="rotate(45 76 76)" className="fill-walmart-yellow" />
      </g>
      <circle cx="50" cy="50" r="12" className="fill-walmart-yellow" />
    </svg>
  );
};

// ============================================================
// ANIMATED STATS CARD
// ============================================================
const AnimatedStatCard = ({ icon: Icon, value, label, delay }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`bg-white/10 backdrop-blur-sm rounded-lg p-3 transform transition-all duration-700 
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
    >
      <Icon className="w-5 h-5 text-walmart-yellow mb-1" />
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-blue-200">{label}</p>
    </div>
  );
};

// ============================================================
// MAIN LOGIN PAGE COMPONENT
// ============================================================
const LoginPage = ({ onLogin }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Animation states
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    // Stagger animations
    setTimeout(() => setShowForm(true), 300);
    setTimeout(() => setShowStats(true), 800);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!userId || !password) {
      setError('Please enter both User ID and Password');
      return;
    }

    setIsLoading(true);
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Demo credentials
    if (userId === 'admin' && password === 'walmart2024') {
      onLogin({ userId, name: 'Walmart Associate' });
    } else {
      setError('Invalid credentials. Try: admin / walmart2024');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ============================================================ */}
      {/* LEFT SIDE - Branding & Animation */}
      {/* ============================================================ */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 relative flex-col justify-center items-center p-12">
        {/* Floating particles */}
        <FloatingParticles />
        
        {/* Animated background circles */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Animated Walmart Spark */}
          <div className="mb-6 flex justify-center">
            <WalmartSpark className="w-24 h-24" animate={true} />
          </div>
          
          {/* Logo text */}
          <h1 className="text-4xl font-light text-white mb-2">
            <span className="font-light">my</span>
            <span className="font-bold">walmart</span>
            <span className="font-light">.com</span>
          </h1>
          
          <p className="text-blue-200 text-lg mt-4 mb-8">Analytics Dashboard Portal</p>
          
          {/* Animated tagline */}
          <div className={`transition-all duration-1000 ${showForm ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-white/80 text-sm max-w-sm mx-auto">
              Access real-time insights, track performance metrics, and make data-driven decisions for your Walmart business.
            </p>
          </div>

          {/* Stats cards */}
          {showStats && (
            <div className="grid grid-cols-2 gap-3 mt-10 max-w-xs mx-auto">
              <AnimatedStatCard icon={ShoppingCart} value="$6.88B" label="Total Revenue" delay={0} />
              <AnimatedStatCard icon={Users} value="50K+" label="Customers" delay={200} />
              <AnimatedStatCard icon={TrendingUp} value="+23%" label="Growth Rate" delay={400} />
              <AnimatedStatCard icon={BarChart3} value="45" label="Stores" delay={600} />
            </div>
          )}
        </div>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-20 fill-white/5">
            <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" />
          </svg>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT SIDE - Login Form */}
      {/* ============================================================ */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-blue-600 to-blue-700 lg:bg-gray-50">
        <div 
          className={`w-full max-w-md transform transition-all duration-700 
            ${showForm ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <WalmartSpark className="w-16 h-16 mx-auto mb-4" animate={true} />
            <h1 className="text-2xl text-white font-bold">mywalmart.com</h1>
          </div>

          {/* Login Card */}
          <div className="bg-white/95 lg:bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Welcome associates.</h2>
              <p className="text-gray-500 mt-1">From here you can:</p>
            </div>

            {/* Features list */}
            <ul className="text-sm text-gray-600 space-y-2 mb-6 pl-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-walmart-blue rounded-full" />
                Access Analytics Dashboards
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-walmart-blue rounded-full" />
                View Performance Reports
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-walmart-blue rounded-full" />
                Connect with AI Assistant
              </li>
            </ul>

            {/* Tagline */}
            <p className="text-center text-blue-600 font-semibold text-sm mb-6">
              Come on in. We're all here.
            </p>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID:
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-walmart-blue focus:border-transparent transition-all outline-none"
                  placeholder="Enter your User ID"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-walmart-blue focus:border-transparent transition-all outline-none pr-12"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-walmart-blue border-gray-300 rounded focus:ring-walmart-blue"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg animate-shake">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-800 font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'LOGIN'
                )}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-6 text-center text-sm">
              <a href="#" className="text-blue-600 hover:underline">Forgot User ID?</a>
              <span className="mx-2 text-gray-400">|</span>
              <a href="#" className="text-blue-600 hover:underline">Forgot Password?</a>
              <span className="mx-2 text-gray-400">|</span>
              <a href="#" className="text-blue-600 hover:underline">Register</a>
            </div>

            {/* Demo credentials hint */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-xs text-blue-600">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Demo: <strong>admin</strong> / <strong>walmart2024</strong>
              </p>
            </div>
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-white/70 lg:text-gray-500 mt-6">
            © 2024 Walmart Inc. All Rights Reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
