import React, { useState } from 'react';
import { 
  Store, 
  Thermometer, 
  DollarSign, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import KPICard from '../Dashboard/KPICard';
import ChartCard from '../Dashboard/ChartCard';
import FilterSelect from '../Dashboard/FilterSelect';
import { storePerformanceData } from '../../data/walmartData';

const StorePerformance = () => {
  const [year, setYear] = useState('all');

  const yearOptions = [
    { value: 'all', label: 'All Years (2010-2012)' },
    { value: '2010', label: '2010' },
    { value: '2011', label: '2011' },
    { value: '2012', label: '2012' }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-walmart-dark">Store Performance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Weekly Store Analytics • 45 Stores • 2010-2012
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <FilterSelect 
            value={year}
            onChange={setYear}
            options={yearOptions}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Weekly Sales"
          value={`$${(storePerformanceData.totalWeeklySales / 1000000000).toFixed(2)}B`}
          subtitle="6,435 weeks of data"
          trend="up"
          trendValue="+15.2%"
          icon={DollarSign}
          color="blue"
        />
        <KPICard 
          title="Avg Weekly Sales"
          value={`$${(storePerformanceData.avgWeeklySales / 1000000).toFixed(2)}M`}
          subtitle="Per Store Per Week"
          trend="up"
          trendValue="+8.4%"
          icon={TrendingUp}
          color="green"
        />
        <KPICard 
          title="Total Stores"
          value={storePerformanceData.totalStores}
          subtitle="Active Locations"
          icon={Store}
          color="yellow"
        />
        <KPICard 
          title="Avg Temperature"
          value={`${storePerformanceData.avgTemperature.toFixed(1)}°F`}
          subtitle="Across All Records"
          icon={Thermometer}
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Stores */}
        <ChartCard 
          title="Top 5 Stores by Total Sales" 
          subtitle="Highest performing locations"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={storePerformanceData.topStores} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number"
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
              />
              <YAxis 
                type="category" 
                dataKey="storeId" 
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => `Store #${value}`}
                width={70}
              />
              <Tooltip 
                formatter={(value) => [`$${(value / 1000000).toFixed(1)}M`, 'Total Sales']}
                labelFormatter={(value) => `Store #${value}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="totalSales" fill="#0071CE" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Sales by Temperature */}
        <ChartCard 
          title="Sales by Temperature Category" 
          subtitle="Weather impact on sales"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={storePerformanceData.salesByTemperature}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="tempCategory" stroke="#6B7280" fontSize={12} />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                formatter={(value) => [`$${(value / 1000).toFixed(0)}K`, 'Avg Weekly Sales']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="avgSales" radius={[4, 4, 0, 0]}>
                {storePerformanceData.salesByTemperature.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yearly Trend */}
        <ChartCard 
          title="Yearly Sales Trend" 
          subtitle="2010-2012 comparison"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={storePerformanceData.yearlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="year" stroke="#6B7280" fontSize={12} />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000000000).toFixed(1)}B`}
              />
              <Tooltip 
                formatter={(value) => [`$${(value / 1000000000).toFixed(2)}B`, 'Total Sales']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="totalSales" fill="#0071CE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Holiday Impact */}
        <ChartCard 
          title="Holiday vs Non-Holiday Sales" 
          subtitle="Impact of holidays on weekly sales"
        >
          <div className="space-y-6 pt-4">
            {/* Holiday */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Holiday Weeks</span>
                <span className="text-sm font-bold text-walmart-blue">
                  ${(storePerformanceData.holidayImpact.holiday.avgSales / 1000000).toFixed(2)}M avg
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-walmart-yellow rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {storePerformanceData.holidayImpact.holiday.count} holiday weeks
              </p>
            </div>
            
            {/* Non-Holiday */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Non-Holiday Weeks</span>
                <span className="text-sm font-bold text-gray-600">
                  ${(storePerformanceData.holidayImpact.nonHoliday.avgSales / 1000000).toFixed(2)}M avg
                </span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gray-400 rounded-full"
                  style={{ width: `${(storePerformanceData.holidayImpact.nonHoliday.avgSales / storePerformanceData.holidayImpact.holiday.avgSales) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {storePerformanceData.holidayImpact.nonHoliday.count.toLocaleString()} regular weeks
              </p>
            </div>

            {/* Insight */}
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>📊 Insight:</strong> Holiday weeks show{' '}
                <strong>
                  +{((storePerformanceData.holidayImpact.holiday.avgSales / storePerformanceData.holidayImpact.nonHoliday.avgSales - 1) * 100).toFixed(1)}%
                </strong>{' '}
                higher average sales compared to regular weeks.
              </p>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Economic Indicators */}
      <ChartCard 
        title="Economic Indicators Summary" 
        subtitle="Average economic metrics during 2010-2012"
      >
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-walmart-blue">
              ${storePerformanceData.economicIndicators.avgFuelPrice.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Avg Fuel Price</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {storePerformanceData.economicIndicators.avgCPI.toFixed(1)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Avg CPI</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {storePerformanceData.economicIndicators.avgUnemployment.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Avg Unemployment</p>
          </div>
        </div>
      </ChartCard>

      {/* Data Source Info */}
      <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
        <Calendar className="w-5 h-5 text-green-600" />
        <div>
          <p className="text-sm font-medium text-green-600">Data Source: Star Schema 2</p>
          <p className="text-xs text-gray-600">
            FACT_STORE_PERFORMANCE (6,435 rows) joined with DIM_STORE, DIM_DATE_STORE, DIM_TEMPERATURE
          </p>
        </div>
      </div>
    </div>
  );
};

export default StorePerformance;
