import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, subtitle, trend, trendValue, icon: Icon, color = 'blue' }) => {
  const isPositive = trend === 'up';
  
  const colorClasses = {
    blue: 'bg-blue-50 text-walmart-blue',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-walmart-dark mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trendValue && (
        <div className="flex items-center gap-1.5 mt-3">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trendValue}
          </span>
          <span className="text-xs text-gray-400">vs last period</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
