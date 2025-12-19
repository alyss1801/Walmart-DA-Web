import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Area
} from 'recharts';
import { Filter, ChevronDown, DollarSign, TrendingUp, Fuel, Activity, Lightbulb, CheckCircle, AlertTriangle, Store } from 'lucide-react';
import ChartAIHelper from '../Charts/ChartAIHelper';

// ============================================================
// COLOR PALETTE - Optimized for this dashboard
// ============================================================
const COLORS = {
  primary: '#4A90D9',
  background: '#87CEEB',
  cardBg: '#FFFFFF',
  
  // Temperature category colors (optimized)
  temperature: {
    'Cold': '#1E90FF',      // Dodger Blue
    'Cool': '#3CB371',      // Medium Sea Green  
    'Warm': '#FFA500',      // Orange
    'Hot': '#FF6347',       // Tomato
    'Freezing': '#9370DB'   // Medium Purple
  },
  
  // Chart colors
  sales: '#4A90D9',
  salesBar: ['#FF7F50', '#87CEEB', '#98D8C8', '#3CB371', '#FFD700'],
  unemployment: '#87CEEB',
  cpi: '#FF69B4',
  fuelPrice: '#DC143C',
  
  // Store efficiency gradient
  storeGradient: ['#2E8B57', '#3CB371', '#66CDAA', '#90EE90', '#98FB98', '#B0E0B6', '#C1E8C1', '#D2F0D2', '#E3F8E3', '#F0FFF0']
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const formatCurrency = (value) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
};

const formatNumber = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toFixed(0);
};

// ============================================================
// DROPDOWN FILTER COMPONENT
// ============================================================
const DropdownFilter = ({ label, options, value, onChange, multi = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const displayValue = multi 
    ? (value.length === options.length ? 'All' : `${value.length} selected`)
    : options.find(o => o.value === value)?.label || value;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs hover:bg-gray-50 min-w-[100px]"
      >
        <Filter className="w-3 h-3 text-gray-500" />
        <span className="text-gray-700">{displayValue}</span>
        <ChevronDown className="w-3 h-3 text-gray-500 ml-auto" />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
            {multi && (
              <button
                onClick={() => onChange(value.length === options.length ? [] : options.map(o => o.value))}
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
                  <input type="checkbox" checked={value.includes(option.value)} readOnly className="w-3 h-3" />
                )}
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const StoreSalesPerformance = () => {
  // ============================================================
  // GLOBAL FILTERS
  // ============================================================
  const [yearFilter, setYearFilter] = useState('all');
  
  // ============================================================
  // INDIVIDUAL CHART FILTERS
  // ============================================================
  const [tempCategoryFilter, setTempCategoryFilter] = useState(['Cold', 'Cool', 'Warm', 'Hot', 'Freezing']);
  const [timeRangeFilter, setTimeRangeFilter] = useState('all');
  const [storeCountFilter, setStoreCountFilter] = useState(10);
  const [cpiCategoryFilter, setCpiCategoryFilter] = useState(['High (> 210)', 'Low (< 200)', 'Mid-High (205-210)', 'Mid-Low (200-205)']);

  // ============================================================
  // SIMULATED DATA - Based on FACT_STORE_PERFORMANCE
  // ============================================================
  
  // Sales by Temperature Category
  const salesByTempData = useMemo(() => {
    const data = [
      { temp: 'Cold', sales: 2442000000, count: 1249, cpi: 211.2, percent: 35.85 },
      { temp: 'Warm', sales: 1800000000, count: 1153, cpi: 210.8, percent: 26.73 },
      { temp: 'Cool', sales: 1490000000, count: 1095, cpi: 210.5, percent: 22.15 },
      { temp: 'Freezing', sales: 654000000, count: 456, cpi: 211.1, percent: 8.03 },
      { temp: 'Hot', sales: 495000000, count: 484, cpi: 210.3, percent: 7.24 }
    ];
    return data.filter(d => tempCategoryFilter.includes(d.temp));
  }, [tempCategoryFilter]);

  // Unemployment vs Weekly Sales by Date (143 weeks)
  const unemploymentSalesData = useMemo(() => {
    const generateWeeklyData = () => {
      const data = [];
      const startDate = new Date('2010-02-05');
      
      for (let week = 0; week < 143; week++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7);
        
        // Unemployment trend: starts high (~390), decreases over time to ~325
        const unemployment = 390 - (week * 0.45) + (Math.sin(week * 0.1) * 15);
        
        // Weekly sales: starts ~42M, peaks mid-2011 (~55M), then decreases to ~46M
        const salesBase = 42 + (Math.sin((week - 40) * 0.04) * 13);
        const weeklySales = Math.max(35, salesBase + (Math.random() - 0.5) * 8);
        
        data.push({
          date: currentDate.toISOString().split('T')[0],
          year: currentDate.getFullYear(),
          month: currentDate.getMonth() + 1,
          week: week + 1,
          unemployment: Math.round(unemployment * 10) / 10,
          weeklySales: Math.round(weeklySales * 100000) / 100 // in millions
        });
      }
      return data;
    };
    
    let data = generateWeeklyData();
    
    // Apply year filter
    if (yearFilter !== 'all') {
      data = data.filter(d => d.year === parseInt(yearFilter));
    }
    
    // Apply time range filter
    if (timeRangeFilter === 'Q1') data = data.filter(d => d.month >= 1 && d.month <= 3);
    else if (timeRangeFilter === 'Q2') data = data.filter(d => d.month >= 4 && d.month <= 6);
    else if (timeRangeFilter === 'H1') data = data.filter(d => d.month >= 1 && d.month <= 6);
    else if (timeRangeFilter === 'H2') data = data.filter(d => d.month >= 7 && d.month <= 12);
    
    return data;
  }, [yearFilter, timeRangeFilter]);

  // Top Stores by Efficiency (Sales)
  const topStoresData = useMemo(() => {
    const stores = [
      { store: 'Store 4', sales: 650000000 },
      { store: 'Store 20', sales: 620000000 },
      { store: 'Store 13', sales: 610000000 },
      { store: 'Store 2', sales: 600000000 },
      { store: 'Store 14', sales: 590000000 },
      { store: 'Store 10', sales: 530000000 },
      { store: 'Store 27', sales: 500000000 },
      { store: 'Store 6', sales: 490000000 },
      { store: 'Store 1', sales: 480000000 },
      { store: 'Store 39', sales: 450000000 },
      { store: 'Store 31', sales: 440000000 },
      { store: 'Store 19', sales: 430000000 }
    ];
    return stores.slice(0, storeCountFilter);
  }, [storeCountFilter]);

  // Store Performance at Different CPI Levels
  const storeCPIData = useMemo(() => {
    const data = [
      { store: 'Store 1', 'High (> 210)': 222402808, 'Low (< 200)': 0, 'Mid-High (205-210)': 0, 'Mid-Low (200-205)': 0 },
      { store: 'Store 10', 'High (> 210)': 0, 'Low (< 200)': 271617713, 'Mid-High (205-210)': 0, 'Mid-Low (200-205)': 0 },
      { store: 'Store 13', 'High (> 210)': 0, 'Low (< 200)': 286517703, 'Mid-High (205-210)': 0, 'Mid-Low (200-205)': 0 },
      { store: 'Store 14', 'High (> 210)': 0, 'Low (< 200)': 288999911, 'Mid-High (205-210)': 0, 'Mid-Low (200-205)': 0 },
      { store: 'Store 2', 'High (> 210)': 273501688, 'Low (< 200)': 0, 'Mid-High (205-210)': 1880752, 'Mid-Low (200-205)': 0 },
      { store: 'Store 20', 'High (> 210)': 120980046, 'Low (< 200)': 0, 'Mid-High (205-210)': 87170878, 'Mid-Low (200-205)': 93246868 },
      { store: 'Store 27', 'High (> 210)': 0, 'Low (< 200)': 253855916, 'Mid-High (205-210)': 0, 'Mid-Low (200-205)': 0 },
      { store: 'Store 39', 'High (> 210)': 183685500, 'Low (< 200)': 0, 'Mid-High (205-210)': 23760042, 'Mid-Low (200-205)': 0 },
      { store: 'Store 4', 'High (> 210)': 0, 'Low (< 200)': 299543953, 'Mid-High (205-210)': 0, 'Mid-Low (200-205)': 0 },
      { store: 'Store 6', 'High (> 210)': 223756130, 'Low (< 200)': 0, 'Mid-High (205-210)': 0, 'Mid-Low (200-205)': 0 }
    ];
    return data;
  }, [cpiCategoryFilter]);

  // Fuel Price Trend
  const fuelPriceData = useMemo(() => {
    const data = [];
    const startDate = new Date('2010-02-05');
    
    for (let week = 0; week < 143; week++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + week * 7);
      
      // Fuel price trend: starts ~2.8, fluctuates up to ~3.8, then settles around 3.3
      const basePrice = 2.8 + (week * 0.008) + (Math.sin(week * 0.08) * 0.4);
      const fuelPrice = Math.min(4.0, Math.max(2.57, basePrice + (Math.random() - 0.5) * 0.2));
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        year: currentDate.getFullYear(),
        fuelPrice: Math.round(fuelPrice * 100) / 100
      });
    }
    
    if (yearFilter !== 'all') {
      return data.filter(d => d.year === parseInt(yearFilter));
    }
    return data;
  }, [yearFilter]);

  // Sales by Temperature for Pie Chart
  const temperaturePieData = useMemo(() => {
    return [
      { name: 'Cold', value: 2442000000, percent: 35.85, color: COLORS.temperature['Cold'] },
      { name: 'Warm', value: 1800000000, percent: 26.73, color: COLORS.temperature['Warm'] },
      { name: 'Cool', value: 1490000000, percent: 22.15, color: COLORS.temperature['Cool'] },
      { name: 'Freezing', value: 654000000, percent: 8.03, color: COLORS.temperature['Freezing'] },
      { name: 'Hot', value: 495000000, percent: 7.24, color: COLORS.temperature['Hot'] }
    ].filter(d => tempCategoryFilter.includes(d.name));
  }, [tempCategoryFilter]);

  // ============================================================
  // KPI CALCULATIONS
  // ============================================================
  const kpis = useMemo(() => ({
    avgWeeklySales: 1050000, // $1.05M
    efficiencyRatio: 48.44,
    avgFuelPrice: 3.36,
    totalRecords: 21000000 // 21M
  }), []);

  // ============================================================
  // CUSTOM TOOLTIP COMPONENTS
  // ============================================================
  const SalesbyTempTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg text-xs">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>
              {p.name}: {p.name === 'CPI' ? p.value.toFixed(1) : formatCurrency(p.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="p-4 min-h-screen" style={{ backgroundColor: '#B8D4E8' }}>
      
      {/* ============================================================ */}
      {/* HEADER */}
      {/* ============================================================ */}
      <div className="mb-4 rounded-xl p-4 text-white text-center" style={{ backgroundColor: '#4A90D9' }}>
        <h1 className="text-xl font-bold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
          Store Sales Performance Analysis: Impact of Economic Factors
        </h1>
        <p className="text-sm opacity-90 mt-1">Walmart 2010-2012 | 45 Stores | 143 Weeks</p>
      </div>

      {/* ============================================================ */}
      {/* KPI CARDS + GLOBAL FILTER */}
      {/* ============================================================ */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {/* KPI 1: Avg Weekly Sales */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-gray-500">Avg Weekly Sales</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(kpis.avgWeeklySales)}</p>
        </div>

        {/* KPI 2: Efficiency Ratio */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-green-500" />
            <span className="text-xs text-gray-500">Efficiency Ratio</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{kpis.efficiencyRatio}</p>
        </div>

        {/* KPI 3: Avg Fuel Price */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Fuel className="w-5 h-5 text-red-500" />
            <span className="text-xs text-gray-500">Avg Fuel Price</span>
          </div>
          <p className="text-2xl font-bold text-red-600">${kpis.avgFuelPrice}</p>
        </div>

        {/* KPI 4: Total Records */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Store className="w-5 h-5 text-purple-500" />
            <span className="text-xs text-gray-500">Total Records</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{formatNumber(kpis.totalRecords)}</p>
        </div>

        {/* Year Filter */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col justify-center">
          <span className="text-xs text-gray-500 mb-2">Year Filter</span>
          <DropdownFilter
            value={yearFilter}
            onChange={setYearFilter}
            options={[
              { value: 'all', label: 'All Years' },
              { value: '2010', label: '2010' },
              { value: '2011', label: '2011' },
              { value: '2012', label: '2012' }
            ]}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 1: Chart 1 + Chart 5 (Fuel Price) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        
        {/* Chart 1: Sales by Temperature Category (Combo Chart) */}
        <div className="col-span-7 bg-white rounded-xl p-4 border border-gray-200 shadow-sm relative">
          <ChartAIHelper
            chartTitle="Sales & CPI by Temperature Category"
            chartData={salesByTempData}
            chartInsights="Combo chart showing weekly sales (bars) and CPI (line) by temperature. Cold weather drives highest sales (35.85%)."
          />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Sales & CPI by Temperature Category</h3>
            <DropdownFilter
              value={tempCategoryFilter}
              onChange={setTempCategoryFilter}
              multi={true}
              options={[
                { value: 'Cold', label: 'Cold' },
                { value: 'Cool', label: 'Cool' },
                { value: 'Warm', label: 'Warm' },
                { value: 'Hot', label: 'Hot' },
                { value: 'Freezing', label: 'Freezing' }
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={salesByTempData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="temp" fontSize={10} />
              <YAxis yAxisId="left" fontSize={9} tickFormatter={(v) => formatCurrency(v)} />
              <YAxis yAxisId="right" orientation="right" fontSize={9} domain={[209, 212]} />
              <Tooltip content={<SalesbyTempTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar yAxisId="left" dataKey="sales" name="Weekly Sales" radius={[4, 4, 0, 0]}>
                {salesByTempData.map((entry, i) => (
                  <Cell key={i} fill={COLORS.temperature[entry.temp]} />
                ))}
              </Bar>
              <Bar yAxisId="left" dataKey="count" name="Record Count" fill="#FFB347" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="cpi" name="CPI" stroke="#FF69B4" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 5: Fuel Price Trend */}
        <div className="col-span-5 bg-white rounded-xl p-4 border border-gray-200 shadow-sm relative">
          <ChartAIHelper
            chartTitle="Fuel Price Trend Over Time"
            chartData={fuelPriceData}
            chartInsights="Line chart showing fuel price from $2.57 to $4.00 (55% increase) over 143 weeks (2010-2012)."
          />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Fuel Price Trend Over Time</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={fuelPriceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" fontSize={8} tickFormatter={(v) => v.substring(0, 7)} interval={20} />
              <YAxis fontSize={9} domain={[2.5, 4.2]} tickFormatter={(v) => `$${v.toFixed(1)}`} />
              <Tooltip formatter={(v) => [`$${v.toFixed(2)}`, 'Fuel Price']} labelFormatter={(l) => `Date: ${l}`} />
              <Line type="monotone" dataKey="fuelPrice" stroke={COLORS.fuelPrice} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 2: Chart 2 (Unemployment vs Sales) + Chart 6 (Pie) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        
        {/* Chart 2: Unemployment vs Weekly Sales */}
        <div className="col-span-7 bg-white rounded-xl p-4 border border-gray-200 shadow-sm relative">
          <ChartAIHelper
            chartTitle="Unemployment Rate vs Weekly Sales Over Time"
            chartData={unemploymentSalesData}
            chartInsights="Area chart (unemployment) + line (sales). Negative correlation: as unemployment decreased 16.7%, sales peaked at $55M/week."
          />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Unemployment Rate vs Weekly Sales Over Time</h3>
            <DropdownFilter
              value={timeRangeFilter}
              onChange={setTimeRangeFilter}
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'Q1', label: 'Q1 (Jan-Mar)' },
                { value: 'Q2', label: 'Q2 (Apr-Jun)' },
                { value: 'H1', label: 'H1 (Jan-Jun)' },
                { value: 'H2', label: 'H2 (Jul-Dec)' }
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={unemploymentSalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" fontSize={8} tickFormatter={(v) => v.substring(0, 7)} interval={Math.floor(unemploymentSalesData.length / 6)} />
              <YAxis yAxisId="left" fontSize={9} domain={[200, 420]} label={{ value: 'Unemployment', angle: -90, position: 'insideLeft', fontSize: 8 }} />
              <YAxis yAxisId="right" orientation="right" fontSize={9} domain={[30, 70]} tickFormatter={(v) => `${v}M`} label={{ value: 'Sales (M)', angle: 90, position: 'insideRight', fontSize: 8 }} />
              <Tooltip 
                formatter={(v, name) => [name === 'weeklySales' ? `$${v.toFixed(1)}M` : v.toFixed(1), name === 'weeklySales' ? 'Weekly Sales' : 'Unemployment']}
                labelFormatter={(l) => `Date: ${l}`}
              />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Area yAxisId="left" type="monotone" dataKey="unemployment" name="Unemployment" fill="#87CEEB" fillOpacity={0.6} stroke="#4A90D9" strokeWidth={1} />
              <Line yAxisId="right" type="monotone" dataKey="weeklySales" name="Weekly Sales" stroke="#DC143C" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 6: Sales by Temperature (Pie) */}
        <div className="col-span-5 bg-white rounded-xl p-4 border border-gray-200 shadow-sm relative">
          <ChartAIHelper
            chartTitle="Sales Distribution by Temperature"
            chartData={temperaturePieData}
            chartInsights="Pie chart showing sales share: Cold (35.85%), Warm (26.73%), Cool (22.15%), Freezing (8.03%), Hot (7.24%)."
          />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Sales Distribution by Temperature</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={temperaturePieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${percent.toFixed(1)}%)`}
                labelLine={{ strokeWidth: 1 }}
              >
                {temperaturePieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 3: Chart 3 (Top Stores) + Chart 4 (CPI Matrix) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        
        {/* Chart 3: Top Stores by Sales */}
        <div className="col-span-5 bg-white rounded-xl p-4 border border-gray-200 shadow-sm relative">
          <ChartAIHelper
            chartTitle="Top Performing Stores by Sales"
            chartData={topStoresData}
            chartInsights="Horizontal bar ranking stores. Store 4 leads ($650M), Store 20 ($620M), Store 13 ($610M). 45 total stores."
            position="top-left"
          />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Top Performing Stores by Sales</h3>
            <DropdownFilter
              value={storeCountFilter}
              onChange={setStoreCountFilter}
              options={[
                { value: 5, label: 'Top 5' },
                { value: 10, label: 'Top 10' },
                { value: 12, label: 'Top 12' }
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topStoresData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" fontSize={9} tickFormatter={(v) => formatCurrency(v)} />
              <YAxis type="category" dataKey="store" fontSize={9} width={60} />
              <Tooltip formatter={(v) => [`$${formatCurrency(v)}`, 'Total Sales']} />
              <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                {topStoresData.map((entry, i) => (
                  <Cell key={i} fill={COLORS.storeGradient[i % 10]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4: Store Performance by CPI Level (Table/Matrix) */}
        <div className="col-span-7 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Store Performance at Different CPI Levels</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left font-semibold">Store</th>
                  <th className="p-2 text-right font-semibold text-blue-600">High (&gt;210)</th>
                  <th className="p-2 text-right font-semibold text-green-600">Low (&lt;200)</th>
                  <th className="p-2 text-right font-semibold text-yellow-600">Mid-High</th>
                  <th className="p-2 text-right font-semibold text-purple-600">Mid-Low</th>
                  <th className="p-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {storeCPIData.map((row, i) => {
                  const total = row['High (> 210)'] + row['Low (< 200)'] + row['Mid-High (205-210)'] + row['Mid-Low (200-205)'];
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-2 font-medium">{row.store}</td>
                      <td className="p-2 text-right" style={{ backgroundColor: row['High (> 210)'] > 0 ? '#DBEAFE' : 'transparent' }}>
                        {row['High (> 210)'] > 0 ? formatCurrency(row['High (> 210)']) : '-'}
                      </td>
                      <td className="p-2 text-right" style={{ backgroundColor: row['Low (< 200)'] > 0 ? '#D1FAE5' : 'transparent' }}>
                        {row['Low (< 200)'] > 0 ? formatCurrency(row['Low (< 200)']) : '-'}
                      </td>
                      <td className="p-2 text-right" style={{ backgroundColor: row['Mid-High (205-210)'] > 0 ? '#FEF3C7' : 'transparent' }}>
                        {row['Mid-High (205-210)'] > 0 ? formatCurrency(row['Mid-High (205-210)']) : '-'}
                      </td>
                      <td className="p-2 text-right" style={{ backgroundColor: row['Mid-Low (200-205)'] > 0 ? '#EDE9FE' : 'transparent' }}>
                        {row['Mid-Low (200-205)'] > 0 ? formatCurrency(row['Mid-Low (200-205)']) : '-'}
                      </td>
                      <td className="p-2 text-right font-semibold">{formatCurrency(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* INSIGHTS PANEL */}
      {/* ============================================================ */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="text-sm font-bold text-gray-800">Economic Factors Impact Analysis</h3>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {/* Temperature Impact */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-800">Temperature Impact</span>
            </div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Cold weather</strong> drives highest sales (35.85%)</li>
              <li>• Hot weather shows lowest performance (7.24%)</li>
              <li>• 393% gap between Cold vs Hot periods</li>
              <li>• Seasonal inventory planning recommended</li>
            </ul>
          </div>

          {/* Unemployment Correlation */}
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-800">Unemployment vs Sales</span>
            </div>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• <strong>Negative correlation</strong> observed</li>
              <li>• Unemployment ↓ from 390 → 325 (16.7%)</li>
              <li>• Sales peaked mid-2011 at $55M/week</li>
              <li>• Economic recovery = Sales growth</li>
            </ul>
          </div>

          {/* CPI Analysis */}
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-800">CPI Influence</span>
            </div>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• CPI range: 210.0 - 212.1 (stable)</li>
              <li>• <strong>Minimal impact</strong> on sales distribution</li>
              <li>• Stores perform consistently across CPI levels</li>
              <li>• Price inflation not major factor 2010-2012</li>
            </ul>
          </div>

          {/* Store Performance */}
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-semibold text-orange-800">Key Findings</span>
            </div>
            <ul className="text-xs text-orange-700 space-y-1">
              <li>• Store 4 leads with $650M total sales</li>
              <li>• Fuel price: $2.57 → $4.00 (55% increase)</li>
              <li>• Total revenue: <strong>$6.88 Billion</strong></li>
              <li>• 45 stores, 143 weeks analyzed</li>
            </ul>
          </div>
        </div>

        {/* Relationship Summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="text-xs font-bold text-gray-700 mb-2">📊 Mối Quan Hệ CPI - Unemployment - Revenue</h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Phân tích 143 tuần (2010-2012):</strong> Tỷ lệ thất nghiệp có <span className="text-red-600 font-semibold">tương quan âm mạnh</span> với doanh thu - 
            khi unemployment giảm từ 8.1% xuống 7.7%, weekly sales tăng từ $42M lên đỉnh $55M. 
            CPI dao động hẹp (210-212) và <span className="text-blue-600 font-semibold">không ảnh hưởng đáng kể</span> đến hành vi mua sắm. 
            Yếu tố <span className="text-green-600 font-semibold">nhiệt độ là driver chính</span> - thời tiết lạnh (Cold/Freezing) chiếm 43.88% tổng doanh thu, 
            gợi ý nhu cầu mua sắm tăng trong mùa đông do chuẩn bị cho kỳ nghỉ lễ và thời tiết khắc nghiệt.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreSalesPerformance;
