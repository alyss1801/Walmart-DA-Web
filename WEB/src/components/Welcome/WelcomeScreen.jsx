import React, { useState, useEffect } from 'react';
import { Sparkles, Database, BarChart3, Users, Store, Zap } from 'lucide-react';

// ============================================================
// ANIMATED WALMART SPARK
// ============================================================
const AnimatedSpark = ({ size = 120 }) => {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow effect */}
      <div 
        className="absolute inset-0 bg-walmart-yellow rounded-full blur-3xl opacity-30 animate-pulse"
        style={{ transform: 'scale(1.5)' }}
      />
      
      {/* Rotating rays */}
      <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="50"
            rx="8"
            ry="22"
            fill="#FFC220"
            transform={`rotate(${angle} 50 50) translate(0 -28)`}
            className="animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </svg>
      
      {/* Center circle */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-walmart-yellow rounded-full animate-pulse"
      />
    </div>
  );
};

// ============================================================
// FLOATING ICONS
// ============================================================
const FloatingIcon = ({ Icon, delay, position }) => {
  return (
    <div 
      className="absolute text-white/20 animate-float-slow"
      style={{ 
        ...position, 
        animationDelay: `${delay}s`,
        animationDuration: '6s'
      }}
    >
      <Icon className="w-12 h-12" />
    </div>
  );
};

// ============================================================
// TYPING TEXT EFFECT
// ============================================================
const TypingText = ({ text, delay = 0, onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index <= text.length) {
          setDisplayText(text.slice(0, index));
          index++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, 50);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span>
      {displayText}
      {!isComplete && <span className="animate-blink">|</span>}
    </span>
  );
};

// ============================================================
// STAT COUNTER
// ============================================================
const StatCounter = ({ icon: Icon, value, label, delay }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsVisible(true);
      // Animate count
      const targetNum = parseInt(value.replace(/[^0-9]/g, ''));
      const duration = 1500;
      const steps = 30;
      const increment = targetNum / steps;
      let current = 0;
      
      const interval = setInterval(() => {
        current += increment;
        if (current >= targetNum) {
          setCount(targetNum);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [delay, value]);

  const formatValue = (num) => {
    if (value.includes('B')) return `$${(num / 1000).toFixed(1)}B`;
    if (value.includes('M')) return `$${num}M`;
    if (value.includes('K')) return `${num}K`;
    return num.toLocaleString();
  };

  return (
    <div 
      className={`flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 transform transition-all duration-700
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
    >
      <div className="w-12 h-12 bg-walmart-yellow/20 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-walmart-yellow" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{formatValue(count)}</p>
        <p className="text-xs text-blue-200">{label}</p>
      </div>
    </div>
  );
};

// ============================================================
// MAIN WELCOME SCREEN COMPONENT
// ============================================================
const WelcomeScreen = ({ onComplete, user }) => {
  const [phase, setPhase] = useState(0); // 0: loading, 1: welcome, 2: stats, 3: ready
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Phase transitions
    const timers = [
      setTimeout(() => setPhase(1), 800),   // Show welcome text
      setTimeout(() => setPhase(2), 2000),  // Show stats
      setTimeout(() => setPhase(3), 4000),  // Show click prompt
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleClick = () => {
    if (phase >= 3) {
      setIsExiting(true);
      setTimeout(onComplete, 1000); // Wait for exit animation
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      {/* Split curtain - Left */}
      <div 
        className={`absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 
          transform transition-transform duration-1000 ease-in-out
          ${isExiting ? '-translate-x-full' : 'translate-x-0'}`}
      >
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-60 h-60 bg-walmart-yellow/10 rounded-full blur-3xl" />
        
        {/* Floating icons */}
        <FloatingIcon Icon={Database} delay={0} position={{ top: '15%', left: '20%' }} />
        <FloatingIcon Icon={BarChart3} delay={1} position={{ top: '60%', left: '15%' }} />
        <FloatingIcon Icon={Store} delay={2} position={{ top: '40%', left: '35%' }} />
      </div>

      {/* Split curtain - Right */}
      <div 
        className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-blue-900 via-blue-800 to-blue-700
          transform transition-transform duration-1000 ease-in-out
          ${isExiting ? 'translate-x-full' : 'translate-x-0'}`}
      >
        {/* Decorative elements */}
        <div className="absolute top-40 right-10 w-52 h-52 bg-blue-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-walmart-yellow/10 rounded-full blur-3xl" />
        
        {/* Floating icons */}
        <FloatingIcon Icon={Users} delay={0.5} position={{ top: '25%', right: '25%' }} />
        <FloatingIcon Icon={Zap} delay={1.5} position={{ top: '55%', right: '15%' }} />
        <FloatingIcon Icon={Sparkles} delay={2.5} position={{ top: '75%', right: '30%' }} />
      </div>

      {/* Center content */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center z-10
          transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Animated Spark Logo */}
        <div className={`transform transition-all duration-700 ${phase >= 0 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <AnimatedSpark size={140} />
        </div>

        {/* Welcome text */}
        <div className={`mt-8 text-center transition-all duration-700 ${phase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {phase >= 1 && <TypingText text="Chào mừng bạn!" delay={0} />}
          </h1>
          
          {user && (
            <p className="text-xl text-walmart-yellow font-semibold mb-2 animate-pulse">
              {user.name}
            </p>
          )}
          
          <p className="text-lg text-blue-200 max-w-lg mx-auto leading-relaxed">
            {phase >= 1 && (
              <TypingText 
                text="Đến với hệ thống Dashboard Phân Tích Dữ Liệu Trực Quan của Walmart" 
                delay={800} 
              />
            )}
          </p>
        </div>

        {/* Stats grid */}
        <div className={`grid grid-cols-3 gap-4 mt-10 transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <StatCounter icon={BarChart3} value="12.77M" label="Total Revenue" delay={2200} />
          <StatCounter icon={Store} value="6.88B" label="Store Sales" delay={2500} />
          <StatCounter icon={Users} value="50K" label="Customers" delay={2800} />
        </div>

        {/* Galaxy Schema badge */}
        <div className={`mt-8 flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full
          transition-all duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <Database className="w-4 h-4 text-walmart-yellow" />
          <span className="text-sm text-white">Galaxy Schema • 3 Star Schemas • Real-time Analytics</span>
        </div>

        {/* Click to continue */}
        <div className={`mt-12 transition-all duration-500 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <div className="w-8 h-12 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white rounded-full animate-scroll-down" />
            </div>
            <p className="text-white/70 text-sm tracking-widest uppercase">
              Click để bắt đầu
            </p>
          </div>
        </div>
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Progress bar at bottom */}
      {phase < 3 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div 
            className="h-full bg-walmart-yellow transition-all duration-1000 ease-out"
            style={{ width: `${(phase + 1) * 25}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;
