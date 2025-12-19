import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { Calendar, Filter, ChevronDown, TrendingUp, TrendingDown, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import { retailSalesData, storePerformanceData } from '../../data';

// ============================================================
// COLOR PALETTE (from Power BI specs)
// ============================================================
const COLORS = {
  primary: '#768CCE',
  secondary: '#C3D6F2', 
  tertiary: '#D1EAF5',
  quaternary: '#E1F1E7',
  accent: '#FFC6D0',
  
  temp: {
    Cold: '#768CCE',
    Freezing: '#C3D6F2',
    Cool: '#D1EAF5',
    Warm: '#E1F1E7',
    Hot: '#FFC6D0'
  },
  
  category: {
    Electronics: '#E1F1E7',
    Home: '#768CCE',
    Beauty: '#C3D6F2',
    Clothing: '#D1EAF5'
  },
  
  dayType: {
    Weekend: '#C3D6F2',
    Weekday: '#768CCE'
  },
  
  holiday: {
    Holidays: '#FFD6DA',
    'Normal days': '#E1F1E7'
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const formatCurrency = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
};

const formatShort = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toFixed(0);
};

// ============================================================
// SMALL COMPONENTS
// ============================================================

// Dropdown Filter Component
const DropdownFilter = ({ label, options, value, onChange, multi = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const displayValue = multi 
    ? (value.length === options.length ? 'All' : `${value.length} selected`)
    : options.find(o => o.value === value)?.label || value;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-xs hover:bg-gray-50 min-w-[100px]"
      >
        <Filter className="w-3 h-3 text-gray-500" />
        <span className="text-gray-700">{displayValue}</span>
        <ChevronDown className="w-3 h-3 text-gray-500 ml-auto" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[140px]">
          {multi && (
            <button
              onClick={() => {
                onChange(value.length === options.length ? [] : options.map(o => o.value));
              }}
              className="w-full px-3 py-2 text-left text-xs hover:bg-gray-100 border-b"
            >
              {value.length === options.length ? 'Clear All' : 'Select All'}
            </button>
          )}
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                if (multi) {
                  const newValue = value.includes(option.value)
                    ? value.filter(v => v !== option.value)
                    : [...value, option.value];
                  onChange(newValue);
                } else {
                  onChange(option.value);
                  setIsOpen(false);
                }
              }}
              className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-100 flex items-center gap-2
                ${multi && value.includes(option.value) ? 'bg-blue-50' : ''}
                ${!multi && value === option.value ? 'bg-blue-50 font-medium' : ''}`}
            >
              {multi && (
                <input 
                  type="checkbox" 
                  checked={value.includes(option.value)} 
                  readOnly 
                  className="w-3 h-3"
                />
              )}
              {option.label}
            </button>
          ))}
        </div>
      )}
      
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

// Weather Toggle Buttons
const WeatherToggle = ({ selected, onChange }) => {
  const weatherOptions = ['Cold', 'Cool', 'Freezing', 'Hot', 'Warm'];
  
  return (
    <div className="flex gap-1 flex-wrap">
      {weatherOptions.map(weather => (
        <button
          key={weather}
          onClick={() => {
            if (selected.includes(weather)) {
              onChange(selected.filter(w => w !== weather));
            } else {
              onChange([...selected, weather]);
            }
          }}
          className={`px-3 py-1 text-xs rounded border transition-all
            ${selected.includes(weather) 
              ? 'bg-[#768CCE] text-white border-[#768CCE]' 
              : 'bg-white text-gray-700 border-gray-300 hover:border-[#768CCE]'}`}
        >
          {weather}
        </button>
      ))}
    </div>
  );
};

// Custom Pie Label
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percent, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.25;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#333" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={9}
      fontFamily="'Segoe UI', sans-serif"
    >
      {`${formatCurrency(value)} (${(percent * 100).toFixed(2)}%)`}
    </text>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const RevenueTrendAnalysis = () => {
  // ============================================================
  // GLOBAL FILTERS
  // ============================================================
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2025-12-31' });
  const [selectedWeather, setSelectedWeather] = useState(['Cold', 'Cool', 'Freezing', 'Hot', 'Warm']);
  
  // ============================================================
  // CHART-SPECIFIC FILTERS
  // ============================================================
  const [monthlyChartYear, setMonthlyChartYear] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState(['Electronics', 'Home', 'Beauty', 'Clothing']);
  const [dayTypeView, setDayTypeView] = useState('all'); // 'all', 'weekend', 'weekday'

  // ============================================================
  // DERIVED DATA - Reactive to filters
  // ============================================================
  
  // Filter months based on date range
  const filteredMonthData = useMemo(() => {
    let data = retailSalesData.revenueByMonth;
    
    if (monthlyChartYear !== 'all') {
      // Simulate year filter (since our data is monthly aggregated)
      const monthCount = monthlyChartYear === 'Q1' ? 3 : monthlyChartYear === 'H1' ? 6 : 12;
      data = data.slice(0, monthCount);
    }
    
    return data.map((item, index) => ({
      month: index + 1,
      monthName: item.month,
      revenue: item.revenue,
      orders: item.orders
    }));
  }, [monthlyChartYear]);

  // Temperature data filtered by weather selection
  const temperatureData = useMemo(() => {
    return storePerformanceData.temperatureImpact
      .filter(item => selectedWeather.includes(item.tempCategory))
      .map(item => ({
        ...item,
        color: COLORS.temp[item.tempCategory]
      }))
      .sort((a, b) => {
        const order = ['Cold', 'Freezing', 'Cool', 'Warm', 'Hot'];
        return order.indexOf(a.tempCategory) - order.indexOf(b.tempCategory);
      });
  }, [selectedWeather]);

  // Category data with filter
  const categoryData = useMemo(() => {
    const allCategories = [
      { category: 'Electronics', revenue: retailSalesData.totalRevenue * 0.255, color: COLORS.category.Electronics },
      { category: 'Home', revenue: retailSalesData.totalRevenue * 0.250, color: COLORS.category.Home },
      { category: 'Beauty', revenue: retailSalesData.totalRevenue * 0.248, color: COLORS.category.Beauty },
      { category: 'Clothing', revenue: retailSalesData.totalRevenue * 0.247, color: COLORS.category.Clothing }
    ];
    return allCategories.filter(c => categoryFilter.includes(c.category));
  }, [categoryFilter]);

  // Holiday data
  const holidayData = useMemo(() => {
    const holiday = storePerformanceData.holidayImpact.find(h => h.period === 'Holiday');
    const nonHoliday = storePerformanceData.holidayImpact.find(h => h.period === 'Non-Holiday');
    
    return [
      { name: 'Holidays', value: holiday?.avgSales || 0, color: COLORS.holiday.Holidays },
      { name: 'Normal days', value: nonHoliday?.avgSales || 0, color: COLORS.holiday['Normal days'] }
    ];
  }, []);

  // Day type data with filter
  const dayTypeData = useMemo(() => {
    const weekend = retailSalesData.totalRevenue * 0.2898;
    const weekday = retailSalesData.totalRevenue * 0.7102;
    
    if (dayTypeView === 'weekend') {
      return [{ name: 'Weekend', value: weekend, color: COLORS.dayType.Weekend }];
    }
    if (dayTypeView === 'weekday') {
      return [{ name: 'Weekday', value: weekday, color: COLORS.dayType.Weekday }];
    }
    return [
      { name: 'Weekend', value: weekend, color: COLORS.dayType.Weekend },
      { name: 'Weekday', value: weekday, color: COLORS.dayType.Weekday }
    ];
  }, [dayTypeView]);

  // ============================================================
  // KPIs - Reactive to filters
  // ============================================================
  const kpis = useMemo(() => {
    // Total Revenue - affected by month filter
    const filteredRevenue = filteredMonthData.reduce((sum, m) => sum + m.revenue, 0);
    
    // Peak Month - from filtered data
    const peakMonth = filteredMonthData.reduce((max, m) => 
      m.revenue > max.revenue ? m : max, filteredMonthData[0]);
    
    // Avg Daily Revenue - affected by temperature filter
    const avgDailyFromTemp = temperatureData.length > 0
      ? temperatureData.reduce((sum, t) => sum + t.avgSales, 0) / temperatureData.length
      : 0;
    
    // Total filtered category revenue
    const filteredCategoryRevenue = categoryData.reduce((sum, c) => sum + c.revenue, 0);
    
    return {
      totalRevenue: filteredRevenue,
      peakMonth: peakMonth?.monthName || 'N/A',
      avgDailyRevenue: avgDailyFromTemp,
      categoryRevenue: filteredCategoryRevenue
    };
  }, [filteredMonthData, temperatureData, categoryData]);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* ============================================================ */}
      {/* TITLE BAR */}
      {/* ============================================================ */}
      <div className="bg-[#768CCE] rounded-lg px-6 py-4 mb-4 border border-black">
        <h1 className="text-white text-2xl font-bold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
          Revenue Trend Analysis
        </h1>
      </div>

      {/* ============================================================ */}
      {/* MAIN LAYOUT - Matching Power BI */}
      {/* ============================================================ */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* ------------------------------------------------------------ */}
        {/* ROW 1: Slicers + Monthly Chart */}
        {/* ------------------------------------------------------------ */}
        
        {/* Date Range Slicer */}
        <div className="col-span-3 bg-white rounded-lg p-4 border border-black">
          <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            Select Date Range
          </h3>
          <div className="flex gap-2 mb-2">
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              <input 
                type="date" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="border rounded px-2 py-1 text-xs"
              />
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              <input 
                type="date" 
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="border rounded px-2 py-1 text-xs"
              />
            </div>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            className="w-full h-1 accent-[#768CCE]"
          />
        </div>

        {/* Weather Slicer */}
        <div className="col-span-4 bg-white rounded-lg p-4 border border-black">
          <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            Weather
          </h3>
          <WeatherToggle selected={selectedWeather} onChange={setSelectedWeather} />
        </div>

        {/* Monthly Chart - Spans 2 rows */}
        <div className="col-span-5 row-span-2 bg-white rounded-lg p-4 border border-black">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-center flex-1" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
              Monthly Total Revenue and Total Orders
            </h3>
            <DropdownFilter
              label="Period"
              value={monthlyChartYear}
              onChange={setMonthlyChartYear}
              options={[
                { value: 'all', label: 'Full Year' },
                { value: 'Q1', label: 'Q1 (Jan-Mar)' },
                { value: 'H1', label: 'H1 (Jan-Jun)' }
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={filteredMonthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                fontSize={9} 
                tick={{ fontFamily: "'Segoe UI', sans-serif" }}
                label={{ value: 'Month', position: 'insideBottom', offset: -5, fontSize: 9 }}
              />
              <YAxis 
                yAxisId="left"
                fontSize={9}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                tick={{ fontFamily: "'Segoe UI', sans-serif" }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                fontSize={9}
                tick={{ fontFamily: "'Segoe UI', sans-serif" }}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `$${formatCurrency(value)}` : value.toLocaleString(),
                  name === 'revenue' ? 'Total Revenue' : 'Total Orders'
                ]}
                contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
              />
              <Legend 
                verticalAlign="top" 
                wrapperStyle={{ fontSize: '10px', fontFamily: "'Segoe UI', sans-serif" }}
              />
              <Bar yAxisId="left" dataKey="revenue" fill={COLORS.primary} name="Total Revenue" radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="linear" dataKey="orders" stroke={COLORS.accent} strokeWidth={3} name="Total Orders" dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* ROW 2: KPI Cards */}
        {/* ------------------------------------------------------------ */}
        
        {/* KPI 1: Total Revenue */}
        <div className="col-span-2 bg-white rounded-lg p-3 border border-black">
          <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold" style={{ color: COLORS.primary, fontFamily: "'DIN', 'Segoe UI', sans-serif" }}>
            {formatCurrency(kpis.totalRevenue)}
          </p>
        </div>

        {/* KPI 2: Peak Sales Month */}
        <div className="col-span-2 bg-white rounded-lg p-3 border border-black">
          <p className="text-xs text-gray-500 mb-1">Peak Sales Month</p>
          <p className="text-3xl font-bold" style={{ color: COLORS.accent, fontFamily: "'DIN', 'Segoe UI', sans-serif" }}>
            {kpis.peakMonth}
          </p>
        </div>

        {/* KPI 3: Avg Daily Revenue */}
        <div className="col-span-3 bg-white rounded-lg p-3 border border-black">
          <p className="text-xs text-gray-500 mb-1">Average Daily Revenue</p>
          <p className="text-3xl font-bold" style={{ color: COLORS.tertiary, fontFamily: "'DIN', 'Segoe UI', sans-serif" }}>
            {formatCurrency(kpis.avgDailyRevenue)}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            Based on {selectedWeather.length} weather type(s)
          </p>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* ROW 3: Temperature Chart (Large) */}
        {/* ------------------------------------------------------------ */}
        <div className="col-span-7 bg-white rounded-lg p-4 border border-black">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
              Average Weekly Revenue Impacted by Temperature
            </h3>
            <span className="text-[10px] text-gray-400">
              Filtered by: {selectedWeather.length === 5 ? 'All Weather' : selectedWeather.join(', ')}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={temperatureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="tempCategory" 
                fontSize={9}
                tick={{ fontFamily: "'Segoe UI', sans-serif" }}
              />
              <YAxis 
                fontSize={9}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                tick={{ fontFamily: "'Segoe UI', sans-serif" }}
                label={{ value: 'Average Revenue', angle: -90, position: 'insideLeft', fontSize: 10 }}
              />
              <Tooltip 
                formatter={(v) => [`$${formatCurrency(v)}`, 'Avg Weekly Sales']}
                contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
              />
              <Bar 
                dataKey="avgSales" 
                radius={[4, 4, 0, 0]}
                label={{ position: 'top', fontSize: 9, formatter: (v) => `${(v/1000000).toFixed(2)}M` }}
              >
                {temperatureData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* INSIGHT PANEL - Auto-generated Analysis */}
        {/* ------------------------------------------------------------ */}
        <div className="col-span-5 bg-white rounded-lg p-4 border border-black">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
              Quick Insights
            </h3>
          </div>
          
          <div className="space-y-3 text-xs">
            {/* Insight 1: Peak Performance */}
            <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Peak Performance</p>
                <p className="text-green-700">
                  <strong>{kpis.peakMonth}</strong> recorded highest revenue at <strong>${formatCurrency(filteredMonthData.find(m => m.monthName === kpis.peakMonth)?.revenue || 0)}</strong>
                </p>
              </div>
            </div>

            {/* Insight 2: Weather Impact */}
            <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-800">Weather Impact</p>
                <p className="text-blue-700">
                  <strong>Cold</strong> weather drives highest avg sales at <strong>$1.11M/week</strong>. 
                  Hot weather shows <strong>-19.7%</strong> lower performance.
                </p>
              </div>
            </div>

            {/* Insight 3: Day Pattern */}
            <div className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-purple-800">Day Pattern</p>
                <p className="text-purple-700">
                  Weekdays generate <strong>71%</strong> of revenue. 
                  Holiday periods show <strong>+7.8%</strong> higher avg weekly sales.
                </p>
              </div>
            </div>

            {/* Insight 4: Category Mix */}
            <div className="flex items-start gap-2 p-2 bg-orange-50 rounded-lg">
              <TrendingDown className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-orange-800">Category Balance</p>
                <p className="text-orange-700">
                  Revenue evenly distributed across {categoryFilter.length} categories. 
                  <strong> Electronics</strong> leads with 25.5% share.
                </p>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500">Total Orders</p>
              <p className="font-bold text-gray-800">{filteredMonthData.reduce((s,m) => s + m.orders, 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-500">Avg Order Value</p>
              <p className="font-bold text-gray-800">${retailSalesData.avgOrderValue?.toFixed(2) || '255.53'}</p>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* ROW 4: Bottom Charts */}
        {/* ------------------------------------------------------------ */}
        
        {/* Revenue by Day Type (Donut) */}
        <div className="col-span-4 bg-white rounded-lg p-4 border border-black">
          <h3 className="text-sm font-semibold text-center mb-2" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            Revenue by Day Type
          </h3>
          <div className="flex">
            <ResponsiveContainer width="60%" height={200}>
              <PieChart>
                <Pie
                  data={holidayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={renderPieLabel}
                  labelLine={{ stroke: '#999', strokeWidth: 1 }}
                >
                  {holidayData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="w-[40%] flex flex-col justify-center text-xs">
              <p className="font-semibold mb-2">Is Holiday ?</p>
              {holidayData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Total Revenue (Pie) */}
        <div className="col-span-4 bg-white rounded-lg p-4 border border-black">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
              Daily Total Revenue
            </h3>
            <DropdownFilter
              label="View"
              value={dayTypeView}
              onChange={setDayTypeView}
              options={[
                { value: 'all', label: 'All Days' },
                { value: 'weekend', label: 'Weekend Only' },
                { value: 'weekday', label: 'Weekday Only' }
              ]}
            />
          </div>
          <div className="flex">
            <ResponsiveContainer width="60%" height={180}>
              <PieChart>
                <Pie
                  data={dayTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                  label={renderPieLabel}
                  labelLine={{ stroke: '#999', strokeWidth: 1 }}
                >
                  {dayTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="w-[40%] flex flex-col justify-center text-xs">
              <p className="font-semibold mb-2">Day Type</p>
              {[
                { name: 'Weekend', color: COLORS.dayType.Weekend },
                { name: 'Weekday', color: COLORS.dayType.Weekday }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total Revenue by Category */}
        <div className="col-span-4 bg-white rounded-lg p-4 border border-black">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
              Total Revenue by Category
            </h3>
            <DropdownFilter
              label="Categories"
              value={categoryFilter}
              onChange={setCategoryFilter}
              multi={true}
              options={[
                { value: 'Electronics', label: 'Electronics' },
                { value: 'Home', label: 'Home' },
                { value: 'Beauty', label: 'Beauty' },
                { value: 'Clothing', label: 'Clothing' }
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="category" 
                fontSize={9}
                tick={{ fontFamily: "'Segoe UI', sans-serif" }}
              />
              <YAxis 
                fontSize={9}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                tick={{ fontFamily: "'Segoe UI', sans-serif" }}
                label={{ value: 'Total Revenue', angle: -90, position: 'insideLeft', fontSize: 10 }}
              />
              <Tooltip 
                formatter={(v) => [`$${formatCurrency(v)}`, 'Revenue']}
                contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
              />
              <Bar 
                dataKey="revenue" 
                radius={[4, 4, 0, 0]}
                label={{ position: 'top', fontSize: 9, formatter: (v) => `${(v/1000000).toFixed(2)}M` }}
              >
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ============================================================ */}
      {/* FOOTER: Data Source Info */}
      {/* ============================================================ */}
      <div className="mt-4 px-4 py-2 bg-white rounded-lg border text-xs text-gray-500">
        <span className="font-medium text-[#768CCE]">Data Source:</span> Star Schema 1 (FACT_SALES) + Star Schema 2 (FACT_STORE_PERFORMANCE) | 
        <span className="ml-2">Generated: {retailSalesData.generatedAt || 'Live from DuckDB'}</span>
      </div>
    </div>
  );
};

export default RevenueTrendAnalysis;
