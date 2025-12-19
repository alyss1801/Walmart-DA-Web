import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { Filter, ChevronDown, Users, ShoppingCart, DollarSign, TrendingUp, Lightbulb, CheckCircle, AlertTriangle } from 'lucide-react';
import { retailSalesData } from '../../data';
import ChartAIHelper from '../Charts/ChartAIHelper';

// ============================================================
// COLOR PALETTE
// ============================================================
const COLORS = {
  primary: '#768CCE',
  background: '#9EB7D4',
  
  // Age group colors
  ageGroup: {
    '<18': '#75B760',
    '18-30': '#768CCE',
    '31-45': '#45A2FF',
    '46-60': '#E66FB5'
  },
  
  // Customer type colors
  customerType: {
    'New Customer': '#1E90FF',
    'Returning Customer': '#11218B'
  },
  
  // Payment method colors
  paymentMethod: {
    'Cash on Delivery': '#1E90FF',
    'Credit Card': '#11218B',
    'Debit Card': '#E87131',
    'UPI': '#6E007A'
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
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs hover:bg-gray-50 min-w-[80px]"
      >
        <Filter className="w-3 h-3 text-gray-500" />
        <span className="text-gray-700">{displayValue}</span>
        <ChevronDown className="w-3 h-3 text-gray-500 ml-auto" />
      </button>
      
      {isOpen && (
        <>
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
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
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
};

// ============================================================
// KPI CARD COMPONENT
// ============================================================
const KPICard = ({ title, value, icon: Icon }) => (
  <div className="bg-white rounded-[15px] border border-black p-3 flex flex-col items-center justify-center">
    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
      {Icon && <Icon className="w-4 h-4" />}
      <span>{title}</span>
    </div>
    <p className="text-2xl font-bold text-black" style={{ fontFamily: "'DIN', 'Segoe UI', sans-serif" }}>
      {value}
    </p>
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================
const CustomerSegmentation = () => {
  // ============================================================
  // GLOBAL FILTERS
  // ============================================================
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  // ============================================================
  // CHART-SPECIFIC FILTERS
  // ============================================================
  const [ageGroupFilter, setAgeGroupFilter] = useState(['<18', '18-30', '31-45', '46-60']);
  const [categoryFilter, setCategoryFilter] = useState(['Electronics', 'Home', 'Beauty', 'Clothing']);
  const [paymentFilter, setPaymentFilter] = useState(['Cash on Delivery', 'Credit Card', 'Debit Card', 'UPI']);
  const [chart2MonthFilter, setChart2MonthFilter] = useState('all'); // Filter for Chart 2

  // ============================================================
  // SIMULATED DATA (Based on retailSalesData structure)
  // ============================================================
  
  // Customer demographics from retailSalesData
  const customerByAgeGroup = retailSalesData.customerByAgeGroup || [
    { ageGroup: '<18', count: 1162, percentage: 2.3 },
    { ageGroup: '18-30', count: 14023, percentage: 28.0 },
    { ageGroup: '31-45', count: 17528, percentage: 35.1 },
    { ageGroup: '46-60', count: 17287, percentage: 34.6 }
  ];

  // Returned customer rate by age group
  const returnedCustomerData = useMemo(() => {
    return [
      { ageGroup: '<18', rate: 0.42, color: COLORS.ageGroup['<18'] },
      { ageGroup: '31-45', rate: 0.48, color: COLORS.ageGroup['31-45'] },
      { ageGroup: '46-60', rate: 0.45, color: COLORS.ageGroup['46-60'] },
      { ageGroup: '18-30', rate: 0.51, color: COLORS.ageGroup['18-30'] }
    ].filter(d => ageGroupFilter.includes(d.ageGroup));
  }, [ageGroupFilter]);

  // Monthly customers and AOV
  const monthlyCustomerData = useMemo(() => {
    const allData = retailSalesData.revenueByMonth.map((m, i) => ({
      month: i + 1,
      monthName: m.month,
      totalCustomers: Math.round(m.orders * 0.85), // ~85% unique customers per month
      aov: retailSalesData.avgOrderValue + (Math.random() - 0.5) * 10 // Slight variation
    }));
    
    // Apply quarter/half filter
    if (chart2MonthFilter === 'Q1') return allData.filter(d => d.month >= 1 && d.month <= 3);
    if (chart2MonthFilter === 'Q2') return allData.filter(d => d.month >= 4 && d.month <= 6);
    if (chart2MonthFilter === 'H1') return allData.filter(d => d.month >= 1 && d.month <= 6);
    return allData;
  }, [chart2MonthFilter]);

  // Revenue by age group
  const revenueByAgeGroup = useMemo(() => {
    const totalRevenue = retailSalesData.totalRevenue;
    return [
      { ageGroup: '31-45', revenue: totalRevenue * 0.351, color: COLORS.ageGroup['31-45'] },
      { ageGroup: '46-60', revenue: totalRevenue * 0.346, color: COLORS.ageGroup['46-60'] },
      { ageGroup: '18-30', revenue: totalRevenue * 0.280, color: COLORS.ageGroup['18-30'] },
      { ageGroup: '<18', revenue: totalRevenue * 0.023, color: COLORS.ageGroup['<18'] }
    ].filter(d => ageGroupFilter.includes(d.ageGroup));
  }, [ageGroupFilter]);

  // Revenue by category and customer type
  const categoryCustomerTypeData = useMemo(() => {
    const categories = ['Electronics', 'Home', 'Beauty', 'Clothing'];
    return categories
      .filter(c => categoryFilter.includes(c))
      .map(category => ({
        category,
        newCustomer: 45 + Math.random() * 10,
        returningCustomer: 45 + Math.random() * 10
      }));
  }, [categoryFilter]);

  // Revenue by age group and payment method
  const agePaymentData = useMemo(() => {
    const ageGroups = ['31-45', '46-60', '18-30', '<18'];
    return ageGroups
      .filter(ag => ageGroupFilter.includes(ag))
      .map(ageGroup => ({
        ageGroup,
        'Cash on Delivery': 20 + Math.random() * 10,
        'Credit Card': 25 + Math.random() * 10,
        'Debit Card': 25 + Math.random() * 10,
        'UPI': 20 + Math.random() * 10
      }));
  }, [ageGroupFilter]);

  // ============================================================
  // KPI CALCULATIONS
  // ============================================================
  const kpis = useMemo(() => ({
    totalRevenue: retailSalesData.totalRevenue,
    totalOrders: retailSalesData.totalOrders,
    totalCustomers: retailSalesData.uniqueCustomers,
    aov: retailSalesData.avgOrderValue
  }), []);

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: COLORS.background }}>
      
      {/* ============================================================ */}
      {/* HEADER ROW: Title + KPIs + Filters */}
      {/* ============================================================ */}
      <div className="flex items-center gap-4 mb-4">
        {/* Title */}
        <div 
          className="rounded-[15px] px-6 py-4 border border-black flex-shrink-0"
          style={{ backgroundColor: COLORS.primary, minWidth: '380px' }}
        >
          <h1 className="text-white text-xl font-bold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            Customer Segmentation & Behavior
          </h1>
        </div>

        {/* KPI Cards */}
        <div className="flex gap-3 flex-1">
          <KPICard title="Total Reven..." value={formatCurrency(kpis.totalRevenue)} icon={DollarSign} />
          <KPICard title="Total Orders" value={`${(kpis.totalOrders / 1000).toFixed(0)}K`} icon={ShoppingCart} />
          <KPICard title="Total Custom..." value={`${(kpis.totalCustomers / 1000).toFixed(0)}K`} icon={Users} />
          <KPICard title="AOV" value={kpis.aov.toFixed(2)} icon={TrendingUp} />
        </div>

        {/* Global Filters */}
        <div className="flex gap-2">
          <div className="bg-white rounded-[10px] p-2 border border-gray-200">
            <p className="text-[10px] text-gray-500 mb-1">Year Filter</p>
            <select 
              value={yearFilter} 
              onChange={(e) => setYearFilter(e.target.value)}
              className="text-xs border-none outline-none bg-transparent"
            >
              <option value="all">All</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>
          <div className="bg-white rounded-[10px] p-2 border border-gray-200">
            <p className="text-[10px] text-gray-500 mb-1">Month Filter</p>
            <select 
              value={monthFilter} 
              onChange={(e) => setMonthFilter(e.target.value)}
              className="text-xs border-none outline-none bg-transparent"
            >
              <option value="all">All</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MAIN CONTENT GRID */}
      {/* ============================================================ */}
      <div className="grid grid-cols-12 gap-4">
        
        {/* ------------------------------------------------------------ */}
        {/* ROW 1: Chart 1 (Returned Customer Rate) + Chart 2 (Monthly) */}
        {/* ------------------------------------------------------------ */}
        
        {/* Chart 1: Returned Customer Rate by Age group */}
        <div className="col-span-7 bg-white rounded-[20px] p-4 border border-gray-200 relative">
          <ChartAIHelper
            chartTitle="Returned Customer Rate by Age Group"
            chartData={returnedCustomerData}
            chartInsights="Bar chart showing repeat purchase rate by age group. Higher rate = better customer loyalty. 18-30 has highest rate (51%)."
          />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
              Returned Customer Rate by Age group
            </h3>
            <DropdownFilter
              value={ageGroupFilter}
              onChange={setAgeGroupFilter}
              multi={true}
              options={[
                { value: '<18', label: '<18' },
                { value: '18-30', label: '18-30' },
                { value: '31-45', label: '31-45' },
                { value: '46-60', label: '46-60' }
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={returnedCustomerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="ageGroup" fontSize={10} label={{ value: 'age_group', position: 'insideBottom', offset: -5, fontSize: 10 }} />
              <YAxis fontSize={10} domain={[0, 0.6]} tickFormatter={(v) => v.toFixed(1)} label={{ value: 'Repeat Rate', angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <Tooltip formatter={(v) => [v.toFixed(2), 'Repeat Rate']} />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {returnedCustomerData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Total Customers and AOV by month */}
        <div className="col-span-5 bg-white rounded-[20px] p-4 border border-gray-200 relative">
          <ChartAIHelper
            chartTitle="Total Customers and AOV by Month"
            chartData={monthlyCustomerData}
            chartInsights="Combo chart with bars (customers) and line (AOV). Tracks monthly shopping trends. AOV ~$257."
          />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
              Total Customers and AOV by month
            </h3>
            <DropdownFilter
              value={chart2MonthFilter}
              onChange={setChart2MonthFilter}
              options={[
                { value: 'all', label: 'All Months' },
                { value: 'Q1', label: 'Q1 (Jan-Mar)' },
                { value: 'Q2', label: 'Q2 (Apr-Jun)' },
                { value: 'H1', label: 'H1 (Jan-Jun)' }
              ]}
            />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={monthlyCustomerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" fontSize={10} label={{ value: 'month', position: 'insideBottom', offset: -5, fontSize: 10 }} />
              <YAxis yAxisId="left" fontSize={10} tickFormatter={(v) => `${(v/1000).toFixed(0)}K`} label={{ value: 'Total Customers', angle: -90, position: 'insideLeft', fontSize: 9 }} />
              <YAxis yAxisId="right" orientation="right" fontSize={10} domain={[250, 265]} label={{ value: 'AOV', angle: 90, position: 'insideRight', fontSize: 9 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar yAxisId="left" dataKey="totalCustomers" fill="#9172D1" name="Total Customers" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="aov" stroke="#85C1E9" strokeWidth={2} name="AOV" dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* ROW 2: Chart 3 + Chart 4 + Chart 5 */}
        {/* ------------------------------------------------------------ */}
        
        {/* Chart 3: Total Revenue by Age group (Horizontal Bar) */}
        <div className="col-span-3 bg-white rounded-[20px] p-4 border border-gray-200 relative">
          <ChartAIHelper
            chartTitle="Total Revenue by Age Group"
            chartData={revenueByAgeGroup}
            chartInsights="Horizontal bar showing revenue contribution by age. 31-45 leads (35.1%), followed by 46-60 (34.6%)."
            position="top-left"
          />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
              Total Revenue by Age group
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueByAgeGroup} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" fontSize={9} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} label={{ value: 'Total Revenue', position: 'insideBottom', offset: -5, fontSize: 9 }} />
              <YAxis type="category" dataKey="ageGroup" fontSize={10} width={50} label={{ value: 'age_group', angle: -90, position: 'insideLeft', fontSize: 9 }} />
              <Tooltip formatter={(v) => [`$${formatCurrency(v)}`, 'Revenue']} />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {revenueByAgeGroup.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4: Total Revenue by Category and Customer Type (100% Stacked) */}
        <div className="col-span-4 bg-white rounded-[20px] p-4 border border-gray-200 relative">
          <ChartAIHelper
            chartTitle="Revenue by Category and Customer Type"
            chartData={categoryCustomerTypeData}
            chartInsights="100% stacked bar showing New vs Returning customer revenue split by category. ~50/50 split across categories."
          />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
              Total Revenue by Category and Customer Type
            </h3>
            <DropdownFilter
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
          <div className="flex items-center gap-4 mb-2 text-[10px]">
            <span className="font-medium">Customer T...</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.customerType['New Customer'] }} />
              <span>New Customer</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.customerType['Returning Customer'] }} />
              <span>Returning Customer</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryCustomerTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" fontSize={9} domain={[0, 100]} tickFormatter={(v) => `${v}%`} label={{ value: 'Total Revenue', position: 'insideBottom', offset: -5, fontSize: 9 }} />
              <YAxis type="category" dataKey="category" fontSize={9} width={70} label={{ value: 'category_name', angle: -90, position: 'insideLeft', fontSize: 8 }} />
              <Tooltip formatter={(v) => [`${v.toFixed(1)}%`, '']} />
              <Bar dataKey="newCustomer" stackId="a" fill={COLORS.customerType['New Customer']} name="New Customer" />
              <Bar dataKey="returningCustomer" stackId="a" fill={COLORS.customerType['Returning Customer']} name="Returning Customer" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 5: Total Revenue by Age group and Payment method (100% Stacked Column) */}
        <div className="col-span-5 bg-white rounded-[20px] p-4 border border-gray-200 relative">
          <ChartAIHelper
            chartTitle="Revenue by Age Group and Payment Method"
            chartData={agePaymentData}
            chartInsights="100% stacked column showing payment preferences by age. Credit/Debit cards dominate (~50% combined)."
          />
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
              Total Revenue by Age group and Payment method
            </h3>
            <DropdownFilter
              value={paymentFilter}
              onChange={setPaymentFilter}
              multi={true}
              options={[
                { value: 'Cash on Delivery', label: 'COD' },
                { value: 'Credit Card', label: 'Credit' },
                { value: 'Debit Card', label: 'Debit' },
                { value: 'UPI', label: 'UPI' }
              ]}
            />
          </div>
          <div className="flex items-center gap-3 mb-2 text-[10px] flex-wrap">
            <span className="font-medium">payment_meth...</span>
            {Object.entries(COLORS.paymentMethod).map(([method, color]) => (
              <div key={method} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                <span>{method}</span>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={agePaymentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="ageGroup" fontSize={10} label={{ value: 'age_group', position: 'insideBottom', offset: -5, fontSize: 9 }} />
              <YAxis fontSize={9} domain={[0, 100]} tickFormatter={(v) => `${v}%`} label={{ value: 'Total Revenue', angle: -90, position: 'insideLeft', fontSize: 9 }} />
              <Tooltip formatter={(v) => [`${v.toFixed(1)}%`, '']} />
              {paymentFilter.includes('Cash on Delivery') && <Bar dataKey="Cash on Delivery" stackId="a" fill={COLORS.paymentMethod['Cash on Delivery']} />}
              {paymentFilter.includes('Credit Card') && <Bar dataKey="Credit Card" stackId="a" fill={COLORS.paymentMethod['Credit Card']} />}
              {paymentFilter.includes('Debit Card') && <Bar dataKey="Debit Card" stackId="a" fill={COLORS.paymentMethod['Debit Card']} />}
              {paymentFilter.includes('UPI') && <Bar dataKey="UPI" stackId="a" fill={COLORS.paymentMethod['UPI']} />}
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ============================================================ */}
      {/* INSIGHTS PANEL */}
      {/* ============================================================ */}
      <div className="mt-4 bg-white rounded-[20px] p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <h3 className="text-sm font-semibold" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            Customer Insights
          </h3>
        </div>
        
        <div className="grid grid-cols-4 gap-3 text-xs">
          {/* Insight 1 */}
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Top Segment</span>
            </div>
            <p className="text-green-700">
              <strong>31-45 age group</strong> contributes <strong>35.1%</strong> of customers and highest revenue share
            </p>
          </div>

          {/* Insight 2 */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">Retention Leader</span>
            </div>
            <p className="text-blue-700">
              <strong>18-30</strong> has highest repeat rate at <strong>51%</strong>, best for loyalty programs
            </p>
          </div>

          {/* Insight 3 */}
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-purple-800">Payment Preference</span>
            </div>
            <p className="text-purple-700">
              <strong>Credit & Debit cards</strong> dominate (~50% combined) across all age groups
            </p>
          </div>

          {/* Insight 4 */}
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <span className="font-medium text-orange-800">Growth Opportunity</span>
            </div>
            <p className="text-orange-700">
              <strong>&lt;18 segment</strong> only 2.3% - potential for youth-focused marketing
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 px-4 py-2 bg-white rounded-lg border text-xs text-gray-500">
        <span className="font-medium text-[#768CCE]">Data Source:</span> Star Schema 1 (FACT_SALES + DIM_CUSTOMER + DIM_PAYMENT) | 
        <span className="ml-2">50,000 transactions • {retailSalesData.uniqueCustomers?.toLocaleString() || '50,000'} customers</span>
      </div>
    </div>
  );
};

export default CustomerSegmentation;
