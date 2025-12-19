import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Settings, 
  FileText,
  Sparkles,
  TrendingUp,
  UserCircle,
  Store,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';

const Sidebar = ({ currentDashboard, setCurrentDashboard, user, onLogout, isCollapsed, setIsCollapsed }) => {
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
    <aside className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative`}>
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all"
        title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img 
            src="/alyss_full_logo_v1.png" 
            alt="Alyss AI" 
            className={`${isCollapsed ? 'h-8 w-8' : 'h-12'} w-auto rounded-lg transition-all duration-300`}
          />
          {!isCollapsed && (
            <div>
              <span className="text-sm font-semibold text-walmart-blue flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-walmart-yellow" />
                Powered by Alyss AI
              </span>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-b border-gray-200 bg-gray-50 transition-all duration-300`}>
          <div className="flex items-center gap-3">
            <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-walmart-blue flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
              <span className={`text-white font-bold ${isCollapsed ? 'text-xs' : 'text-sm'}`}>
                {user.name?.charAt(0) || 'U'}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">@{user.userId}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-hidden">
        {!isCollapsed && (
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Dashboards
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setCurrentDashboard(item.name)}
              title={isCollapsed ? item.name : ''}
              className={`flex items-center gap-3 ${isCollapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'} rounded-lg transition-all duration-200
                ${active 
                  ? `bg-blue-50 text-walmart-blue ${isCollapsed ? '' : 'border-l-4 border-walmart-blue'}` 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-walmart-blue' : 'text-gray-500'}`} />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>
                    {item.name}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {item.description}
                  </p>
                </div>
              )}
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
              title={isCollapsed ? item.name : ''}
              className={`flex items-center gap-3 ${isCollapsed ? 'px-2 py-2 justify-center' : 'px-3 py-2'} rounded-lg transition-colors
                ${active 
                  ? 'bg-blue-50 text-walmart-blue' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-walmart-blue' : 'text-gray-500'}`} />
              {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
        
        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            title={isCollapsed ? 'Logout' : ''}
            className={`flex items-center gap-3 ${isCollapsed ? 'px-2 py-2 justify-center' : 'px-3 py-2'} rounded-lg text-red-600 hover:bg-red-50 transition-colors w-full`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        )}
      </div>

      {/* Galaxy Schema Badge */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t border-gray-200`}>
        {isCollapsed ? (
          <div className="w-full aspect-square bg-gradient-to-r from-walmart-blue to-blue-600 rounded-lg flex items-center justify-center" title="Galaxy Schema">
            <Database className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="bg-gradient-to-r from-walmart-blue to-blue-600 rounded-lg p-3 text-white">
            <p className="text-xs font-semibold">Galaxy Schema</p>
            <p className="text-xs opacity-80 mt-1">3 Independent Star Schemas</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs">50K Sales</span>
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs">45 Stores</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
