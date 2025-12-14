import React from 'react';
import { ChevronDown } from 'lucide-react';

const FilterSelect = ({ label, value, onChange, options, icon: Icon }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white
                   focus:outline-none focus:ring-2 focus:ring-walmart-blue focus:border-transparent
                   cursor-pointer hover:border-gray-300 transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

export default FilterSelect;
