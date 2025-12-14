import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Store, 
  ShoppingBag, 
  Users, 
  Settings, 
  FileText,
  Sparkles
} from 'lucide-react';

const Sidebar = ({ currentDashboard, setCurrentDashboard }) => {
  const location = useLocation();

  const navItems = [
    { 
      name: 'Sales Performance', 
      icon: BarChart3, 
      path: '/sales',
      description: 'Retail Sales 2024-2025'
    },
    { 
      name: 'Store Performance', 
      icon: Store, 
      path: '/store',
      description: 'Store Analytics 2010-2012'
    },
    { 
      name: 'E-commerce', 
      icon: ShoppingBag, 
      path: '/ecommerce',
      description: 'Product Catalog 2019'
    },
    { 
      name: 'Customer Analytics', 
      icon: Users, 
      path: '/customer',
      description: 'Demographics & Behavior'
    },
  ];

  const bottomItems = [
    { name: 'Settings', icon: Settings, path: '/settings' },
    { name: 'Reports', icon: FileText, path: '/reports' },
  ];

  const isActive = (path) => {
    if (path === '/sales' && location.pathname === '/') return true;
    return location.pathname === path;
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img 
            src="/picture/alyss_full_logo_transparent.png" 
            alt="Alyss AI" 
            className="h-10 w-auto"
          />
          <div>
            <span className="text-sm font-semibold text-walmart-blue flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-walmart-yellow" />
              Powered by Alyss AI
            </span>
          </div>
        </div>
      </div>

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
          return (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Icon className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
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
