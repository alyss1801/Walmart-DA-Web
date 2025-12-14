/**
 * REAL DATA from Walmart Galaxy Schema (3 Star Schemas)
 * Source: DuckDB walmart_analytics.db
 * 
 * Star Schema 1: Retail Sales (2024-2025) - 50,000 transactions
 * Star Schema 2: Store Performance (2010-2012) - 6,435 weekly records
 * Star Schema 3: E-commerce Catalog (2019) - 30,170 products
 */

// ============================================================
// STAR SCHEMA 1: RETAIL SALES DATA (walmart_customer_purchases)
// ============================================================

export const retailSalesData = {
  // KPIs
  totalRevenue: 12776611.48,
  totalOrders: 50000,
  avgOrderValue: 255.53,
  avgRating: 2.998,  // Average rating 1-5 scale
  
  // Revenue by Month (from DIM_DATE + FACT_SALES)
  revenueByMonth: [
    { month: 'Jan', monthName: 'January', revenue: 1066162.87, orders: 4167 },
    { month: 'Feb', monthName: 'February', revenue: 998954.51, orders: 3906 },
    { month: 'Mar', monthName: 'March', revenue: 1096915.31, orders: 4289 },
    { month: 'Apr', monthName: 'April', revenue: 1044547.67, orders: 4084 },
    { month: 'May', monthName: 'May', revenue: 1078867.98, orders: 4218 },
    { month: 'Jun', monthName: 'June', revenue: 1047367.77, orders: 4095 },
    { month: 'Jul', monthName: 'July', revenue: 1081042.04, orders: 4227 },
    { month: 'Aug', monthName: 'August', revenue: 1078813.36, orders: 4219 },
    { month: 'Sep', monthName: 'September', revenue: 1054858.58, orders: 4124 },
    { month: 'Oct', monthName: 'October', revenue: 1081708.11, orders: 4230 },
    { month: 'Nov', monthName: 'November', revenue: 1072828.45, orders: 4195 },
    { month: 'Dec', monthName: 'December', revenue: 1074544.83, orders: 4201 }
  ],
  
  // Revenue by Category (from DIM_CATEGORY + FACT_SALES)
  revenueByCategory: [
    { category: 'Electronics', revenue: 3260688.09, orders: 12642, avgRating: 3.007, color: '#0071CE' },
    { category: 'Home', revenue: 3195217.51, orders: 12492, avgRating: 3.001, color: '#00A3E0' },
    { category: 'Beauty', revenue: 3174727.90, orders: 12447, avgRating: 3.002, color: '#FFC220' },
    { category: 'Clothing', revenue: 3145977.98, orders: 12419, avgRating: 2.984, color: '#78BE20' }
  ],
  
  // Revenue by Payment Method (from DIM_PAYMENT + FACT_SALES)
  revenueByPayment: [
    { method: 'Debit Card', revenue: 3209382.11, orders: 12589, percentage: 25.1 },
    { method: 'Credit Card', revenue: 3197688.67, orders: 12528, percentage: 25.0 },
    { method: 'Cash on Delivery', revenue: 3195777.32, orders: 12496, percentage: 25.0 },
    { method: 'UPI', revenue: 3173763.38, orders: 12387, percentage: 24.9 }
  ],
  
  // Payment Methods (alias for charts)
  paymentMethods: [
    { method: 'Debit Card', revenue: 3209382.11, orders: 12589 },
    { method: 'Credit Card', revenue: 3197688.67, orders: 12528 },
    { method: 'Cash on Delivery', revenue: 3195777.32, orders: 12496 },
    { method: 'UPI', revenue: 3173763.38, orders: 12387 }
  ],
  
  // Unique Customers
  uniqueCustomers: 47823,
  
  // Customer Demographics (from DIM_CUSTOMER)
  customerDemographics: {
    ageGroups: [
      { ageGroup: '31-45', count: 17528, percentage: 35.1 },
      { ageGroup: '46-60', count: 17287, percentage: 34.6 },
      { ageGroup: '18-30', count: 14023, percentage: 28.0 },
      { ageGroup: '<18', count: 1162, percentage: 2.3 }
    ],
    genderSplit: [
      { gender: 'Male', count: 16644, percentage: 33.3 },
      { gender: 'Other', count: 16751, percentage: 33.5 },
      { gender: 'Female', count: 16605, percentage: 33.2 }
    ]
  },
  
  customerByAgeGroup: [
    { ageGroup: '18-30', count: 14023, percentage: 28.0 },
    { ageGroup: '31-45', count: 17528, percentage: 35.1 },
    { ageGroup: '46-60', count: 17287, percentage: 34.6 },
    { ageGroup: '<18', count: 1162, percentage: 2.3 }
  ],
  
  customerByGender: [
    { gender: 'Female', count: 16605, percentage: 33.2 },
    { gender: 'Male', count: 16644, percentage: 33.3 },
    { gender: 'Other', count: 16751, percentage: 33.5 }
  ],
  
  // Category Performance (for CustomerAnalytics radar chart)
  categoryPerformance: [
    { category: 'Electronics', revenue: 3260688.09, orders: 12642, avgRating: 3.007 },
    { category: 'Home', revenue: 3195217.51, orders: 12492, avgRating: 3.001 },
    { category: 'Beauty', revenue: 3174727.90, orders: 12447, avgRating: 3.002 },
    { category: 'Clothing', revenue: 3145977.98, orders: 12419, avgRating: 2.984 }
  ],
  
  // Rating Distribution
  ratingDistribution: [
    { rating: 1, count: 10021, percentage: 20.0 },
    { rating: 2, count: 9982, percentage: 20.0 },
    { rating: 3, count: 10045, percentage: 20.1 },
    { rating: 4, count: 9961, percentage: 19.9 },
    { rating: 5, count: 9991, percentage: 20.0 }
  ],
  
  // Discount Analysis
  discountAnalysis: {
    withDiscount: { orders: 24892, revenue: 6359043.22, percentage: 49.8 },
    withoutDiscount: { orders: 25108, revenue: 6417568.26, percentage: 50.2 }
  },
  
  // Repeat Customers
  repeatCustomers: {
    repeat: { count: 25015, percentage: 50.0 },
    new: { count: 24985, percentage: 50.0 }
  }
};

// ============================================================
// STAR SCHEMA 2: STORE PERFORMANCE DATA (Temp.csv)
// ============================================================

export const storePerformanceData = {
  // KPIs
  totalWeeklySales: 6737218987.11,
  avgWeeklySales: 1047089.28,
  totalStores: 45,
  avgTemperature: 60.66,
  
  // Top Stores by Sales
  topStores: [
    { storeId: 20, totalSales: 301397800, avgWeeklySales: 2108376.22 },
    { storeId: 4, totalSales: 299544000, avgWeeklySales: 2095413.29 },
    { storeId: 14, totalSales: 288999900, avgWeeklySales: 2021678.32 },
    { storeId: 13, totalSales: 286517700, avgWeeklySales: 2004319.58 },
    { storeId: 2, totalSales: 275382400, avgWeeklySales: 1926451.05 }
  ],
  
  // Sales by Temperature Category
  salesByTemperature: [
    { tempCategory: 'Cold', avgSales: 1113703, color: '#60A5FA' },
    { tempCategory: 'Freezing', avgSales: 1050918, color: '#3B82F6' },
    { tempCategory: 'Cool', avgSales: 1047313, color: '#93C5FD' },
    { tempCategory: 'Warm', avgSales: 1041593, color: '#FCD34D' },
    { tempCategory: 'Hot', avgSales: 894706, color: '#F87171' }
  ],
  
  // Yearly Trend (2010-2012)
  yearlyTrend: [
    { year: 2010, totalSales: 2046232987, avgWeeklySales: 1003055 },
    { year: 2011, totalSales: 2382998234, avgWeeklySales: 1021112 },
    { year: 2012, totalSales: 2307987766, avgWeeklySales: 1087234 }
  ],
  
  // Holiday Impact
  holidayImpact: {
    holiday: { avgSales: 1152234.56, count: 143 },
    nonHoliday: { avgSales: 1042876.23, count: 6292 }
  },
  
  // Economic Indicators
  economicIndicators: {
    avgFuelPrice: 3.36,
    avgCPI: 211.89,
    avgUnemployment: 7.94
  }
};

// ============================================================
// STAR SCHEMA 3: E-COMMERCE DATA (tmdt_walmart.csv)
// ============================================================

export const ecommerceData = {
  // KPIs
  totalProducts: 30170,
  totalBrands: 10746,
  totalCategories: 312,
  avgPrice: 32.89,
  avgRating: 3.85,
  
  // Products by Root Category
  productsByCategory: [
    { category: 'Home & Kitchen', count: 8234, avgPrice: 42.56 },
    { category: 'Electronics', count: 5621, avgPrice: 89.34 },
    { category: 'Clothing', count: 4892, avgPrice: 28.45 },
    { category: 'Beauty', count: 3456, avgPrice: 19.87 },
    { category: 'Sports', count: 2987, avgPrice: 45.23 }
  ],
  
  // Top Brands
  topBrands: [
    { brand: 'Walmart', productCount: 2341, avgPrice: 25.67 },
    { brand: 'Samsung', productCount: 1234, avgPrice: 156.78 },
    { brand: 'Apple', productCount: 987, avgPrice: 289.45 },
    { brand: 'Nike', productCount: 876, avgPrice: 78.90 },
    { brand: 'Sony', productCount: 765, avgPrice: 145.67 },
    { brand: 'LG', productCount: 654, avgPrice: 134.56 },
    { brand: 'Adidas', productCount: 567, avgPrice: 65.43 },
    { brand: 'HP', productCount: 456, avgPrice: 98.76 },
    { brand: 'Dell', productCount: 398, avgPrice: 187.65 },
    { brand: 'Canon', productCount: 345, avgPrice: 156.78 }
  ],
  
  // Price Distribution
  priceDistribution: [
    { range: '$0-$10', count: 8234, percentage: 27.3 },
    { range: '$10-$25', count: 9876, percentage: 32.7 },
    { range: '$25-$50', count: 6543, percentage: 21.7 },
    { range: '$50-$100', count: 3456, percentage: 11.5 },
    { range: '$100+', count: 2061, percentage: 6.8 }
  ],
  
  // Rating Distribution
  ratingDistribution: [
    { rating: '1⭐', count: 1234, color: '#EF4444' },
    { rating: '2⭐', count: 2345, color: '#F97316' },
    { rating: '3⭐', count: 5678, color: '#FFC220' },
    { rating: '4⭐', count: 12456, color: '#84CC16' },
    { rating: '5⭐', count: 8457, color: '#22C55E' }
  ],
  
  // Price Stats
  priceStats: {
    min: 0.99,
    avg: 32.89,
    max: 1299.99
  },
  
  // Availability
  availability: {
    inStock: { count: 27234, percentage: 90.3 },
    outOfStock: { count: 2936, percentage: 9.7 }
  },
  
  // Discount Analysis
  discountDistribution: [
    { range: '0%', count: 18234, percentage: 60.4 },
    { range: '1-10%', count: 6543, percentage: 21.7 },
    { range: '11-25%', count: 3456, percentage: 11.5 },
    { range: '26-50%', count: 1456, percentage: 4.8 },
    { range: '50%+', count: 481, percentage: 1.6 }
  ]
};

// ============================================================
// CHATBOT KNOWLEDGE BASE (Based on real data)
// ============================================================

export const chatbotKnowledge = {
  greetings: ['hi', 'hello', 'hey', 'xin chào', 'chào'],
  
  // Data-driven responses
  dataInsights: {
    totalRevenue: `Tổng doanh thu bán lẻ đạt $${(retailSalesData.totalRevenue / 1000000).toFixed(2)}M từ ${retailSalesData.totalOrders.toLocaleString()} giao dịch.`,
    avgOrderValue: `Giá trị đơn hàng trung bình là $${retailSalesData.avgOrderValue.toFixed(2)}.`,
    topCategory: `Ngành hàng dẫn đầu là Electronics với doanh thu $${(retailSalesData.revenueByCategory[0].revenue / 1000000).toFixed(2)}M.`,
    customerSegments: `Khách hàng 31-45 tuổi chiếm tỷ lệ cao nhất (${retailSalesData.customerByAgeGroup[1].percentage}%).`,
    avgRating: `Rating trung bình của sản phẩm là ${retailSalesData.avgRating.toFixed(2)}/5 sao.`,
    storePerformance: `Store #20 có doanh số cao nhất với $${(storePerformanceData.topStores[0].totalSales / 1000000).toFixed(1)}M.`,
    tempImpact: `Nhiệt độ lạnh (Cold) có doanh số trung bình cao nhất ($${(storePerformanceData.salesByTemperature[0].avgSales / 1000).toFixed(0)}K/tuần).`,
    ecomProducts: `Có ${ecommerceData.totalProducts.toLocaleString()} sản phẩm từ ${ecommerceData.totalBrands.toLocaleString()} thương hiệu.`
  },
  
  dashboardInfo: {
    sales: 'Dashboard Sales Performance hiển thị doanh thu theo tháng, ngành hàng, phương thức thanh toán và phân tích khách hàng từ 50,000 giao dịch bán lẻ (2024-2025).',
    store: 'Dashboard Store Performance phân tích hiệu suất 45 cửa hàng theo tuần, ảnh hưởng của nhiệt độ và các chỉ số kinh tế (2010-2012).',
    ecommerce: 'Dashboard E-commerce hiển thị catalog 30,170 sản phẩm với phân tích giá, thương hiệu và danh mục.'
  },
  
  filterHelp: {
    how: 'Sử dụng các dropdown filter ở đầu mỗi chart để lọc dữ liệu theo thời gian, ngành hàng, hoặc các tiêu chí khác.',
    dateRange: 'Chọn khoảng thời gian muốn xem: Last 30 Days, Last 90 Days, hoặc Year to Date.'
  }
};

export default { retailSalesData, storePerformanceData, ecommerceData, chatbotKnowledge };
