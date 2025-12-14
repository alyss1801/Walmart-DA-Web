import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  CreditCard, 
  Star,
  PieChart as PieChartIcon,
  Target
} from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import KPICard from '../Dashboard/KPICard';
import ChartCard from '../Dashboard/ChartCard';
import FilterSelect from '../Dashboard/FilterSelect';
import { retailSalesData } from '../../data/walmartData';

const CustomerAnalytics = () => {
  const [segment, setSegment] = useState('all');

  const segmentOptions = [
    { value: 'all', label: 'All Customers' },
    { value: 'high-value', label: 'High Value' },
    { value: 'frequent', label: 'Frequent Buyers' }
  ];

  const COLORS = ['#0071CE', '#FFC220', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
  const GENDER_COLORS = { 'Male': '#0071CE', 'Female': '#EC4899', 'Other': '#8B5CF6' };

  // Prepare radar data for customer profile
  const radarData = retailSalesData.categoryPerformance.map(item => ({
    category: item.category,
    avgSpend: Math.round((item.revenue / item.orders) * 10) / 10,
    rating: Math.round(item.avgRating * 20) // Scale to 0-100
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-walmart-dark">Customer Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Demographics & Behavior Analysis • {retailSalesData.totalOrders.toLocaleString()} Transactions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <FilterSelect 
            value={segment}
            onChange={setSegment}
            options={segmentOptions}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Customers"
          value={retailSalesData.uniqueCustomers.toLocaleString()}
          subtitle="Unique buyers"
          trend="up"
          trendValue="+15.2%"
          icon={Users}
          color="blue"
        />
        <KPICard 
          title="Avg Order Value"
          value={`$${retailSalesData.avgOrderValue.toFixed(2)}`}
          subtitle="Per transaction"
          trend="up"
          trendValue="+5.8%"
          icon={CreditCard}
          color="green"
        />
        <KPICard 
          title="Avg Rating"
          value={retailSalesData.avgRating.toFixed(2)}
          subtitle="Customer satisfaction"
          trend="up"
          trendValue="+0.2"
          icon={Star}
          color="yellow"
        />
        <KPICard 
          title="Orders per Customer"
          value={(retailSalesData.totalOrders / retailSalesData.uniqueCustomers).toFixed(1)}
          subtitle="Average frequency"
          icon={UserCheck}
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution */}
        <ChartCard 
          title="Customer Age Distribution" 
          subtitle="Customers by age group"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={retailSalesData.customerDemographics.ageGroups}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="ageGroup" stroke="#6B7280" fontSize={12} />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                {retailSalesData.customerDemographics.ageGroups.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gender Distribution */}
        <ChartCard 
          title="Gender Distribution" 
          subtitle="Customer base by gender"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={retailSalesData.customerDemographics.genderSplit}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                dataKey="percentage"
                nameKey="gender"
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
              >
                {retailSalesData.customerDemographics.genderSplit.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GENDER_COLORS[entry.gender]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Preferences */}
        <ChartCard 
          title="Payment Method Preferences" 
          subtitle="How customers prefer to pay"
        >
          <div className="space-y-4 pt-4">
            {retailSalesData.paymentMethods.map((method, index) => (
              <div key={method.method}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-700">{method.method}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-600">
                    {((method.revenue / retailSalesData.totalRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(method.revenue / retailSalesData.totalRevenue) * 100}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ${(method.revenue / 1000000).toFixed(2)}M • {method.orders.toLocaleString()} orders
                </p>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Category Preferences by Rating */}
        <ChartCard 
          title="Category Satisfaction" 
          subtitle="Average rating by category"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={retailSalesData.categoryPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                type="number" 
                domain={[3, 5]} 
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => `${value}⭐`}
              />
              <YAxis 
                type="category" 
                dataKey="category" 
                stroke="#6B7280" 
                fontSize={12}
                width={90}
              />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(2)} ⭐`, 'Avg Rating']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="avgRating" radius={[0, 4, 4, 0]}>
                {retailSalesData.categoryPerformance.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.avgRating >= 4 ? '#10B981' : entry.avgRating >= 3.5 ? '#FFC220' : '#F59E0B'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Customer Insights Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-walmart-blue" />
          Customer Insights Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Age Group */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">📊 Largest Age Segment</h4>
            <p className="text-xl font-bold text-walmart-blue">
              {retailSalesData.customerDemographics.ageGroups[0].ageGroup}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {retailSalesData.customerDemographics.ageGroups[0].percentage}% of customers
            </p>
          </div>

          {/* Gender Balance */}
          <div className="bg-pink-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">👥 Gender Balance</h4>
            <p className="text-xl font-bold text-pink-600">Nearly Equal</p>
            <p className="text-sm text-gray-600 mt-1">
              ~33% each gender segment
            </p>
          </div>

          {/* Top Category */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-2">🏆 Top Category</h4>
            <p className="text-xl font-bold text-green-600">
              {retailSalesData.categoryPerformance[0].category}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              ${(retailSalesData.categoryPerformance[0].revenue / 1000000).toFixed(2)}M revenue
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-walmart-blue to-blue-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-4">💡 AI-Powered Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-medium mb-2">Target Segment</h4>
            <p className="text-sm opacity-90">
              Focus marketing efforts on the 31-45 age group, which represents your largest customer segment (35.1%).
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="font-medium mb-2">Category Opportunity</h4>
            <p className="text-sm opacity-90">
              Electronics leads with highest revenue. Consider expanding product variety in this category.
            </p>
          </div>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
        <PieChartIcon className="w-5 h-5 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-blue-600">Data Source: Star Schema 1</p>
          <p className="text-xs text-gray-600">
            FACT_SALES (50,000 rows) joined with DIM_CUSTOMER, DIM_PRODUCT, DIM_CATEGORY, DIM_PAYMENT
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;
