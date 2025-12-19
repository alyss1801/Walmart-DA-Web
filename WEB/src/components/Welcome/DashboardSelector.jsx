import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Store, 
  ArrowRight,
  Sparkles,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// ============================================================
// DASHBOARD CARD COMPONENT
// ============================================================
const DashboardCard = ({ dashboard, index, onSelect, isHovered, setHovered }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300 + index * 200);
    return () => clearTimeout(timer);
  }, [index]);

  const icons = {
    revenue: TrendingUp,
    customer: Users,
    store: Store
  };
  
  const Icon = icons[dashboard.icon];
  
  return (
    <div
      className={`relative group cursor-pointer transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
        ${isHovered === index ? 'scale-105 z-10' : isHovered !== null ? 'scale-95 opacity-70' : ''}`}
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      onClick={() => onSelect(dashboard)}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Glow effect */}
      <div 
        className={`absolute -inset-1 bg-gradient-to-r ${dashboard.gradient} rounded-2xl blur-lg opacity-0 
          group-hover:opacity-75 transition-opacity duration-500`}
      />
      
      {/* Card content */}
      <div className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20
        hover:border-white/40 transition-all duration-300 overflow-hidden`}>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        
        {/* Icon */}
        <div className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${dashboard.gradient} 
          flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
          
          {/* Floating sparkle */}
          <Sparkles 
            className={`absolute -top-1 -right-1 w-4 h-4 text-walmart-yellow 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse`}
          />
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 relative">
          {dashboard.title}
        </h3>
        
        {/* Description */}
        <p className="text-blue-200 text-sm mb-4 relative leading-relaxed">
          {dashboard.description}
        </p>
        
        {/* Stats preview */}
        <div className="flex items-center gap-3 mb-4 relative">
          {dashboard.stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-1 text-xs text-white/70">
              <stat.icon className="w-3 h-3" />
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        
        {/* CTA */}
        <div className={`flex items-center gap-2 text-sm font-medium relative
          ${isHovered === index ? 'text-walmart-yellow' : 'text-white/70'} transition-colors`}>
          <span>Khám phá ngay</span>
          <ArrowRight className={`w-4 h-4 transform transition-transform duration-300
            ${isHovered === index ? 'translate-x-2' : ''}`} />
        </div>
        
        {/* Hover border animation */}
        <div className={`absolute inset-0 rounded-2xl border-2 border-transparent
          ${isHovered === index ? 'border-walmart-yellow' : ''} transition-colors duration-300`} />
      </div>
    </div>
  );
};

// ============================================================
// MAIN DASHBOARD SELECTOR COMPONENT
// ============================================================
const DashboardSelector = ({ onComplete }) => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content with delay for entrance animation
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const dashboards = [
    {
      id: 'revenue',
      icon: 'revenue',
      title: 'Revenue Trend Analysis',
      description: 'Phân tích xu hướng doanh thu, tác động thời tiết và mùa vụ đến kinh doanh.',
      gradient: 'from-blue-500 to-cyan-500',
      path: '/',
      stats: [
        { icon: BarChart3, label: '$12.77M' },
        { icon: Activity, label: '50K orders' }
      ]
    },
    {
      id: 'customer',
      icon: 'customer',
      title: 'Customer Segmentation',
      description: 'Khám phá hành vi khách hàng, phân khúc độ tuổi và phương thức thanh toán.',
      gradient: 'from-purple-500 to-pink-500',
      path: '/segmentation',
      stats: [
        { icon: Users, label: '50K customers' },
        { icon: PieChart, label: '4 segments' }
      ]
    },
    {
      id: 'store',
      icon: 'store',
      title: 'Store Performance',
      description: 'Đánh giá hiệu suất 45 cửa hàng, phân tích yếu tố kinh tế CPI & Unemployment.',
      gradient: 'from-orange-500 to-red-500',
      path: '/store-performance',
      stats: [
        { icon: Store, label: '45 stores' },
        { icon: TrendingUp, label: '$6.74B' }
      ]
    }
  ];

  const handleSelect = (dashboard) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(dashboard.path);
      onComplete();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[99] overflow-hidden">
      {/* Animated background */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900
        transition-opacity duration-500 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Animated orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" 
          style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] 
          bg-walmart-yellow/5 rounded-full blur-3xl" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Content */}
      <div className={`relative h-full flex flex-col items-center justify-center px-8
        transition-all duration-500 ${isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}>
        
        {/* Header */}
        <div className={`text-center mb-12 transform transition-all duration-700
          ${showContent ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'}`}>
          
          {/* Walmart spark icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full 
            bg-walmart-yellow/20 mb-6 animate-pulse">
            <Sparkles className="w-8 h-8 text-walmart-yellow" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Chọn Dashboard của bạn
          </h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Khám phá dữ liệu Walmart với 3 góc nhìn phân tích chuyên sâu
          </p>
        </div>

        {/* Dashboard cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {dashboards.map((dashboard, index) => (
            <DashboardCard
              key={dashboard.id}
              dashboard={dashboard}
              index={index}
              onSelect={handleSelect}
              isHovered={hoveredCard}
              setHovered={setHoveredCard}
            />
          ))}
        </div>

        {/* Footer hint */}
        <div className={`mt-12 text-center transform transition-all duration-700 delay-700
          ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <p className="text-white/50 text-sm">
            💡 Bạn có thể chuyển đổi giữa các dashboard bất kỳ lúc nào từ sidebar
          </p>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardSelector;
