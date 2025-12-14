import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Tag, 
  DollarSign, 
  Star,
  Package,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import KPICard from '../Dashboard/KPICard';
import ChartCard from '../Dashboard/ChartCard';
import FilterSelect from '../Dashboard/FilterSelect';
import { ecommerceData } from '../../data/walmartData';

const EcommerceDashboard = () => {
  const [view, setView] = useState('all');

  const viewOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'top-rated', label: 'Top Rated (4.5+)' },
    { value: 'discounted', label: 'Discounted Items' }
  ];

  const COLORS = ['#0071CE', '#FFC220', '#10B981', '#8B5CF6', '#F59E0B'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{payload[0].value.toLocaleString()} products</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-walmart-dark">E-commerce Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Product Catalog Analysis • {ecommerceData.totalProducts.toLocaleString()} Products
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <FilterSelect 
            value={view}
            onChange={setView}
            options={viewOptions}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Products"
          value={ecommerceData.totalProducts.toLocaleString()}
          subtitle="In catalog"
          trend="up"
          trendValue="+12.5%"
          icon={Package}
          color="blue"
        />
        <KPICard 
          title="Total Brands"
          value={ecommerceData.totalBrands.toLocaleString()}
          subtitle="Active brands"
          trend="up"
          trendValue="+8.2%"
          icon={Tag}
          color="green"
        />
        <KPICard 
          title="Avg Product Price"
          value={`$${ecommerceData.avgPrice.toFixed(2)}`}
          subtitle="Across all products"
          icon={DollarSign}
          color="yellow"
        />
        <KPICard 
          title="Avg Rating"
          value={ecommerceData.avgRating.toFixed(2)}
          subtitle="Customer rating"
          trend="up"
          trendValue="+0.3"
          icon={Star}
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products by Category */}
        <ChartCard 
          title="Products by Category" 
          subtitle="Distribution of product catalog"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ecommerceData.productsByCategory}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                dataKey="count"
                nameKey="category"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
              >
                {ecommerceData.productsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Brands by Products */}
        <ChartCard 
          title="Top 10 Brands by Product Count" 
          subtitle="Most active brands in catalog"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ecommerceData.topBrands} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="brand" 
                stroke="#6B7280" 
                fontSize={10}
                width={100}
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                formatter={(value) => [value, 'Products']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="productCount" fill="#0071CE" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Distribution */}
        <ChartCard 
          title="Price Distribution" 
          subtitle="Products by price range"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ecommerceData.priceDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="range" stroke="#6B7280" fontSize={11} />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
              />
              <Tooltip 
                formatter={(value) => [value.toLocaleString(), 'Products']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="count" fill="#FFC220" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Rating Distribution */}
        <ChartCard 
          title="Rating Distribution" 
          subtitle="Products by customer rating"
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ecommerceData.ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="rating" stroke="#6B7280" fontSize={12} />
              <YAxis 
                stroke="#6B7280" 
                fontSize={12}
                tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
              />
              <Tooltip 
                formatter={(value) => [value.toLocaleString(), 'Products']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {ecommerceData.ratingDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Price Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Min Price</h3>
            <span className="text-green-500 bg-green-100 px-2 py-1 rounded-full text-xs">Lowest</span>
          </div>
          <p className="text-3xl font-bold text-walmart-blue mt-2">
            ${ecommerceData.priceStats.min.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Budget-friendly option</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Average Price</h3>
            <span className="text-blue-500 bg-blue-100 px-2 py-1 rounded-full text-xs">Median</span>
          </div>
          <p className="text-3xl font-bold text-walmart-blue mt-2">
            ${ecommerceData.priceStats.avg.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Typical product price</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Max Price</h3>
            <span className="text-yellow-500 bg-yellow-100 px-2 py-1 rounded-full text-xs">Premium</span>
          </div>
          <p className="text-3xl font-bold text-walmart-blue mt-2">
            ${ecommerceData.priceStats.max.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Premium product</p>
        </div>
      </div>

      {/* Data Source Info */}
      <div className="bg-purple-50 rounded-lg p-4 flex items-center gap-3">
        <ShoppingBag className="w-5 h-5 text-purple-600" />
        <div>
          <p className="text-sm font-medium text-purple-600">Data Source: Star Schema 3</p>
          <p className="text-xs text-gray-600">
            FACT_PRODUCT_CATALOG (30,170 rows) joined with DIM_PRODUCT_API, DIM_BRAND, DIM_CATEGORY_API
          </p>
        </div>
      </div>
    </div>
  );
};

export default EcommerceDashboard;
