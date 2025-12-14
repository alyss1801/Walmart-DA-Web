import React, { useState } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Star,
  Calendar
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import KPICard from '../Dashboard/KPICard';
import ChartCard from '../Dashboard/ChartCard';
import FilterSelect from '../Dashboard/FilterSelect';
import { retailSalesData } from '../../data/walmartData';

const COLORS = ['#0071CE', '#00A3E0', '#FFC220', '#78BE20'];

const SalesPerformance = () => {
  const [timeRange, setTimeRange] = useState('year');
  const [category, setCategory] = useState('all');

  const timeOptions = [
    { value: 'year', label: 'Year to Date' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '30days', label: 'Last 30 Days' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'home', label: 'Home' },
    { value: 'beauty', label: 'Beauty' },
    { value: 'clothing', label: 'Clothing' }
  ];

  // Filter data based on time range
  const getFilteredMonthData = () => {
    if (timeRange === '30days') return retailSalesData.revenueByMonth.slice(-1);
    if (timeRange === '90days') return retailSalesData.revenueByMonth.slice(-3);
    return retailSalesData.revenueByMonth;
  };

  const filteredMonthData = getFilteredMonthData();

  // Calculate totals for filtered data
  const filteredRevenue = filteredMonthData.reduce((sum, m) => sum + m.revenue, 0);
  const filteredOrders = filteredMonthData.reduce((sum, m) => sum + m.orders, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-walmart-dark">Sales Performance</h1>
          <p className="text-sm text-gray-500 mt-1">
            Retail Sales Analysis • 50,000 Transactions • 2024-2025
          </p>
        </div>
        
        {/* Global Filters */}
        <div className="flex items-center gap-3">
          <FilterSelect 
            value={timeRange}
            onChange={setTimeRange}
            options={timeOptions}
          />
          <FilterSelect 
            value={category}
            onChange={setCategory}
            options={categoryOptions}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Revenue"
          value={`$${(filteredRevenue / 1000000).toFixed(2)}M`}
          subtitle="vs Last Period"
          trend="up"
          trendValue="+12.5%"
          icon={DollarSign}
          color="blue"
        />
        <KPICard 
          title="Total Orders"
          value={filteredOrders.toLocaleString()}
          subtitle="Transactions"
          trend="up"
          trendValue="+8.3%"
          icon={ShoppingCart}
          color="green"
        />
        <KPICard 
          title="Avg Order Value"
          value={`$${retailSalesData.avgOrderValue.toFixed(2)}`}
          subtitle="Per Transaction"
          trend="up"
          trendValue="+4.2%"
          icon={TrendingUp}
          color="yellow"
        />
        <KPICard 
          title="Avg Rating"
          value={`${retailSalesData.avgRating.toFixed(1)} ⭐`}
          subtitle="Customer Satisfaction"
          trend="up"
          trendValue="+0.3"
          icon={Star}
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <ChartCard 
          title="Revenue Trend" 
          subtitle="Monthly revenue & orders"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredMonthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `$${(value / 1000000).toFixed(2)}M` : value.toLocaleString(),
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0071CE" 
                strokeWidth={3}
                dot={{ fill: '#0071CE', strokeWidth: 2 }}
                name="Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#FFC220" 
                strokeWidth={2}
                dot={{ fill: '#FFC220', strokeWidth: 2 }}
                name="Orders"
                yAxisId={0}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category Performance */}
        <ChartCard 
          title="Category Performance" 
          subtitle="Revenue by product category"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={retailSalesData.revenueByCategory} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number" 
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
              />
              <YAxis type="category" dataKey="category" stroke="#6B7280" fontSize={12} width={80} />
              <Tooltip 
                formatter={(value) => [`$${(value / 1000000).toFixed(2)}M`, 'Revenue']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {retailSalesData.revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <ChartCard 
          title="Payment Methods" 
          subtitle="Distribution by payment type"
        >
          <div className="flex items-center">
            <ResponsiveContainer width="60%" height={250}>
              <PieChart>
                <Pie
                  data={retailSalesData.revenueByPayment}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="percentage"
                  nameKey="method"
                  label={({ method, percentage }) => `${percentage}%`}
                >
                  {retailSalesData.revenueByPayment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `$${(props.payload.revenue / 1000000).toFixed(2)}M (${value}%)`,
                    props.payload.method
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="flex-1 space-y-3">
              {retailSalesData.revenueByPayment.map((item, index) => (
                <div key={item.method} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{item.method}</span>
                  <span className="text-sm font-medium text-walmart-dark ml-auto">
                    {item.orders.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Rating by Category */}
        <ChartCard 
          title="Average Rating by Category" 
          subtitle="Customer satisfaction (1-5 stars)"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={retailSalesData.revenueByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="category" stroke="#6B7280" fontSize={12} />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12} 
                domain={[0, 5]}
                ticks={[0, 1, 2, 3, 4, 5]}
              />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(2)} ⭐`, 'Avg Rating']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="avgRating" fill="#FFC220" radius={[4, 4, 0, 0]}>
                {retailSalesData.revenueByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Data Source Info */}
      <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
        <Calendar className="w-5 h-5 text-walmart-blue" />
        <div>
          <p className="text-sm font-medium text-walmart-blue">Data Source: Star Schema 1</p>
          <p className="text-xs text-gray-600">
            FACT_SALES (50,000 rows) joined with DIM_CUSTOMER, DIM_PRODUCT, DIM_DATE, DIM_PAYMENT, DIM_CATEGORY
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesPerformance;
