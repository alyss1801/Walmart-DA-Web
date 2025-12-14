import React from 'react';
import { Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white h-16 px-6 flex items-center justify-between border-b border-gray-200 shadow-sm">
      {/* Logo & Title */}
      <div className="flex items-center gap-4">
        <img 
          src="/picture/walmart_logo.png" 
          alt="Walmart" 
          className="h-10 w-auto"
        />
        <h1 className="text-xl font-semibold text-walmart-dark">
          Walmart Retail Analytics Dashboard
        </h1>
      </div>

      {/* Right Side - Notifications & User */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <button className="w-9 h-9 bg-walmart-blue rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
          <User className="w-5 h-5 text-white" />
        </button>
      </div>
    </header>
  );
};

export default Header;
