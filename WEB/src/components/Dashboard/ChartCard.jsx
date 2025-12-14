import React from 'react';

const ChartCard = ({ title, subtitle, children, filters, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-walmart-dark">{title}</h3>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          
          {/* Filters */}
          {filters && (
            <div className="flex items-center gap-2">
              {filters}
            </div>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
