import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Settings, 
  FileText,
  Sparkles,
  TrendingUp,
  UserCircle,
  Store,
  LogOut
} from 'lucide-react';

const Sidebar = ({ currentDashboard, setCurrentDashboard, user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { 
      name: 'Revenue Trend', 
      icon: TrendingUp, 
      path: '/',
      description: 'Revenue Analysis Dashboard'
    },
    { 
      name: 'Customer Segmentation', 
      icon: UserCircle, 
      path: '/segmentation',
      description: 'Segmentation & Behavior'
    },
    { 
      name: 'Store Performance', 
      icon: Store, 
      path: '/store-performance',
      description: 'Economic Factors Impact'
    },
  ];

  const bottomItems = [
    { name: 'Reports', icon: FileText, path: '/reports' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img 
            src="/alyss_full_logo_v1.png" 
            alt="Alyss AI" 
            className="h-12 w-auto rounded-lg"
          />
          <div>
            <span className="text-sm font-semibold text-walmart-blue flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-walmart-yellow" />
              Powered by Alyss AI
            </span>
          </div>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-walmart-blue flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">@{user.userId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Dashboards
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setCurrentDashboard(item.name)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${active 
                  ? 'bg-blue-50 text-walmart-blue border-l-4 border-walmart-blue' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-walmart-blue' : 'text-gray-500'}`} />
              <div className="flex-1">
                <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.name}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-gray-200 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${active 
                  ? 'bg-blue-50 text-walmart-blue' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-walmart-blue' : 'text-gray-500'}`} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
        
        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        )}
      </div>

      {/* Galaxy Schema Badge */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-walmart-blue to-blue-600 rounded-lg p-3 text-white">
          <p className="text-xs font-semibold">Galaxy Schema</p>
          <p className="text-xs opacity-80 mt-1">3 Independent Star Schemas</p>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 bg-white/20 rounded text-xs">50K Sales</span>
            <span className="px-2 py-0.5 bg-white/20 rounded text-xs">45 Stores</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
