/**
 * Data Analytics Service for AI ChatBot
 * =====================================
 * Provides real-time data querying capabilities for the AI assistant
 * to answer dynamic questions based on actual warehouse data.
 */

import retailSalesJson from '../data/retail_sales.json';
import storePerformanceJson from '../data/store_performance.json';
import ecommerceJson from '../data/ecommerce.json';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const formatCurrency = (value) => {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
};

const formatPercent = (value) => `${(value * 100).toFixed(1)}%`;

const formatNumber = (value) => value.toLocaleString('en-US');

// ============================================================
// RETAIL SALES ANALYTICS
// ============================================================

export const retailAnalytics = {
  // KPIs
  getTotalRevenue: () => retailSalesJson.totalRevenue,
  getTotalOrders: () => retailSalesJson.totalOrders,
  getAvgOrderValue: () => retailSalesJson.avgOrderValue,
  getAvgRating: () => retailSalesJson.avgRating,
  getUniqueCustomers: () => retailSalesJson.uniqueCustomers,
  
  // Revenue Analysis
  getRevenueByMonth: () => retailSalesJson.revenueByMonth,
  
  getTopMonth: () => {
    const months = retailSalesJson.revenueByMonth;
    return months.reduce((max, m) => m.revenue > max.revenue ? m : max, months[0]);
  },
  
  getLowestMonth: () => {
    const months = retailSalesJson.revenueByMonth;
    return months.reduce((min, m) => m.revenue < min.revenue ? m : min, months[0]);
  },
  
  getMonthlyGrowth: () => {
    const months = retailSalesJson.revenueByMonth;
    const growthData = [];
    for (let i = 1; i < months.length; i++) {
      const growth = ((months[i].revenue - months[i-1].revenue) / months[i-1].revenue) * 100;
      growthData.push({
        month: months[i].month,
        growth: growth.toFixed(2),
        trend: growth > 0 ? 'increase' : 'decrease'
      });
    }
    return growthData;
  },
  
  // Category Analysis
  getRevenueByCategory: () => retailSalesJson.revenueByCategory,
  
  getTopCategory: () => {
    const categories = retailSalesJson.revenueByCategory;
    if (!categories || categories.length === 0) return null;
    return categories.reduce((max, c) => (c.revenue || 0) > (max.revenue || 0) ? c : max, categories[0]);
  },
  
  // Payment Analysis
  getPaymentMethods: () => retailSalesJson.paymentMethods || retailSalesJson.revenueByPayment,
  
  getTopPaymentMethod: () => {
    const payments = retailSalesJson.paymentMethods || retailSalesJson.revenueByPayment;
    if (!payments || payments.length === 0) return null;
    return payments.reduce((max, p) => (p.revenue || p.orders) > (max.revenue || max.orders) ? p : max, payments[0]);
  },
  
  // Customer Demographics
  getCustomerByAgeGroup: () => retailSalesJson.customerByAgeGroup,
  
  getCustomerDemographics: () => retailSalesJson.customerDemographics,
  
  getTopAgeGroup: () => {
    const ageGroups = retailSalesJson.customerByAgeGroup;
    if (!ageGroups || ageGroups.length === 0) return null;
    return ageGroups.reduce((max, a) => (a.customers || a.count) > (max.customers || max.count) ? a : max, ageGroups[0]);
  },
  
  // City Analysis
  getTopCities: () => retailSalesJson.topCities,
  
  getTopCity: () => {
    const cities = retailSalesJson.topCities;
    if (!cities || cities.length === 0) return null;
    return cities[0];
  },
  
  // Rating Analysis
  getRatingDistribution: () => retailSalesJson.ratingDistribution,
  
  // Category Performance
  getCategoryPerformance: () => retailSalesJson.categoryPerformance
};

// ============================================================
// STORE PERFORMANCE ANALYTICS
// ============================================================

export const storeAnalytics = {
  // KPIs
  getTotalWeeklySales: () => storePerformanceJson.totalWeeklySales,
  getTotalRecords: () => storePerformanceJson.totalRecords,
  getAvgWeeklySales: () => storePerformanceJson.avgWeeklySales,
  getTotalStores: () => storePerformanceJson.totalStores,
  
  // Economic Indicators
  getAvgCPI: () => storePerformanceJson.avgCPI,
  getAvgUnemployment: () => storePerformanceJson.avgUnemployment,
  getAvgFuelPrice: () => storePerformanceJson.avgFuelPrice,
  getAvgTemperature: () => storePerformanceJson.avgTemperature,
  
  // Store Rankings
  getSalesByStore: () => storePerformanceJson.salesByStore,
  
  getTopStores: (n = 5) => {
    const stores = storePerformanceJson.salesByStore;
    return stores.slice(0, n);
  },
  
  getBottomStores: (n = 5) => {
    const stores = storePerformanceJson.salesByStore;
    return stores.slice(-n).reverse();
  },
  
  getStoreByName: (name) => {
    const stores = storePerformanceJson.salesByStore;
    return stores.find(s => s.store.toLowerCase().includes(name.toLowerCase()));
  },
  
  getStoreRanking: (storeName) => {
    const stores = storePerformanceJson.salesByStore;
    const index = stores.findIndex(s => s.store.toLowerCase().includes(storeName.toLowerCase()));
    return index >= 0 ? index + 1 : null;
  },
  
  // Sales by Time
  getSalesByYear: () => storePerformanceJson.salesByYear,
  getSalesByMonth: () => storePerformanceJson.salesByMonth,
  
  getTopYear: () => {
    const years = storePerformanceJson.salesByYear;
    if (!years || years.length === 0) return null;
    return years.reduce((max, y) => y.totalSales > max.totalSales ? y : max, years[0]);
  },
  
  // Temperature Impact
  getTemperatureImpact: () => storePerformanceJson.temperatureImpact,
  
  getTopTemperatureCategory: () => {
    const temps = storePerformanceJson.temperatureImpact;
    if (!temps || temps.length === 0) return null;
    return temps.reduce((max, t) => t.totalSales > max.totalSales ? t : max, temps[0]);
  },
  
  // Holiday Impact
  getHolidayImpact: () => storePerformanceJson.holidayImpact,
  
  // Economic Trends
  getEconomicTrend: () => storePerformanceJson.economicTrend,
  
  getCPIRange: () => {
    const trend = storePerformanceJson.economicTrend;
    if (!trend || trend.length === 0) return null;
    const cpis = trend.map(t => t.cpi);
    return {
      min: Math.min(...cpis),
      max: Math.max(...cpis),
      avg: cpis.reduce((a, b) => a + b, 0) / cpis.length
    };
  },
  
  getUnemploymentRange: () => {
    const trend = storePerformanceJson.economicTrend;
    if (!trend || trend.length === 0) return null;
    const unemployments = trend.map(t => t.unemployment);
    return {
      min: Math.min(...unemployments),
      max: Math.max(...unemployments),
      avg: unemployments.reduce((a, b) => a + b, 0) / unemployments.length
    };
  }
};

// ============================================================
// E-COMMERCE ANALYTICS
// ============================================================

export const ecommerceAnalytics = {
  // KPIs
  getTotalProducts: () => ecommerceJson.totalProducts,
  getAvgListPrice: () => ecommerceJson.avgListPrice,
  getAvgSalePrice: () => ecommerceJson.avgSalePrice,
  getAvgDiscountPct: () => ecommerceJson.avgDiscountPct,
  getAvailableProducts: () => ecommerceJson.availableProducts,
  getTotalBrands: () => ecommerceJson.totalBrands,
  getTotalCategories: () => ecommerceJson.totalCategories,
  
  // Product Analysis
  getProductsByCategory: () => ecommerceJson.productsByCategory,
  
  getTopCategory: () => {
    const categories = ecommerceJson.productsByCategory;
    if (!categories || categories.length === 0) return null;
    return categories.reduce((max, c) => c.count > max.count ? c : max, categories[0]);
  },
  
  // Brand Analysis
  getTopBrands: (n = 10) => {
    const brands = ecommerceJson.topBrands;
    return brands ? brands.slice(0, n) : [];
  },
  
  getTopBrand: () => {
    const brands = ecommerceJson.topBrands;
    if (!brands || brands.length === 0) return null;
    return brands[0];
  },
  
  // Price Analysis
  getPriceDistribution: () => ecommerceJson.priceDistribution,
  
  getDiscountDistribution: () => ecommerceJson.discountDistribution,
  
  // Availability
  getAvailabilityByCategory: () => ecommerceJson.availabilityByCategory,
  
  getAvailabilityRate: () => {
    const total = ecommerceJson.totalProducts;
    const available = ecommerceJson.availableProducts;
    return (available / total * 100).toFixed(1);
  }
};

// ============================================================
// CROSS-SCHEMA ANALYTICS
// ============================================================

export const crossAnalytics = {
  // Compare revenues across schemas
  getRevenueComparison: () => ({
    retailSales: {
      name: 'Retail Sales (2024-2025)',
      revenue: retailSalesJson.totalRevenue,
      formatted: formatCurrency(retailSalesJson.totalRevenue)
    },
    storePerformance: {
      name: 'Store Performance (2010-2012)',
      revenue: storePerformanceJson.totalWeeklySales,
      formatted: formatCurrency(storePerformanceJson.totalWeeklySales)
    }
  }),
  
  // Summary stats
  getOverallStats: () => ({
    totalRevenue: retailSalesJson.totalRevenue + storePerformanceJson.totalWeeklySales,
    totalTransactions: retailSalesJson.totalOrders,
    totalStores: storePerformanceJson.totalStores,
    totalProducts: ecommerceJson.totalProducts,
    totalBrands: ecommerceJson.totalBrands,
    uniqueCustomers: retailSalesJson.uniqueCustomers
  }),
  
  // Get all KPIs
  getAllKPIs: () => ({
    retail: {
      totalRevenue: formatCurrency(retailSalesJson.totalRevenue),
      totalOrders: formatNumber(retailSalesJson.totalOrders),
      avgOrderValue: formatCurrency(retailSalesJson.avgOrderValue),
      avgRating: retailSalesJson.avgRating.toFixed(2),
      uniqueCustomers: formatNumber(retailSalesJson.uniqueCustomers)
    },
    store: {
      totalSales: formatCurrency(storePerformanceJson.totalWeeklySales),
      totalStores: storePerformanceJson.totalStores,
      avgWeeklySales: formatCurrency(storePerformanceJson.avgWeeklySales),
      avgCPI: storePerformanceJson.avgCPI.toFixed(2),
      avgUnemployment: `${storePerformanceJson.avgUnemployment}%`
    },
    ecommerce: {
      totalProducts: formatNumber(ecommerceJson.totalProducts),
      totalBrands: ecommerceJson.totalBrands,
      avgListPrice: formatCurrency(ecommerceJson.avgListPrice),
      avgSalePrice: formatCurrency(ecommerceJson.avgSalePrice),
      avgDiscount: `${ecommerceJson.avgDiscountPct}%`
    }
  })
};

// ============================================================
// NATURAL LANGUAGE QUERY PROCESSOR
// ============================================================

export const queryProcessor = {
  /**
   * Process a natural language query and return relevant data
   * @param {string} query - The user's question
   * @returns {object} - Structured data response
   */
  processQuery: (query) => {
    const q = query.toLowerCase();
    
    // Revenue queries
    if (q.includes('tổng doanh thu') || q.includes('total revenue') || q.includes('doanh thu')) {
      if (q.includes('store') || q.includes('cửa hàng')) {
        return {
          type: 'store_revenue',
          data: storePerformanceJson.totalWeeklySales,
          formatted: formatCurrency(storePerformanceJson.totalWeeklySales),
          context: 'Store Performance (2010-2012)'
        };
      }
      return {
        type: 'retail_revenue',
        data: retailSalesJson.totalRevenue,
        formatted: formatCurrency(retailSalesJson.totalRevenue),
        context: 'Retail Sales (2024-2025)'
      };
    }
    
    // Store queries
    if (q.includes('store') || q.includes('cửa hàng')) {
      if (q.includes('top') || q.includes('best') || q.includes('tốt nhất') || q.includes('cao nhất')) {
        const topStores = storePerformanceJson.salesByStore.slice(0, 5);
        return {
          type: 'top_stores',
          data: topStores,
          formatted: topStores.map((s, i) => `${i + 1}. ${s.store}: ${formatCurrency(s.totalSales)}`).join('\n'),
          context: 'Top 5 Stores by Total Sales'
        };
      }
      if (q.includes('bao nhiêu') || q.includes('how many') || q.includes('số lượng')) {
        return {
          type: 'store_count',
          data: storePerformanceJson.totalStores,
          formatted: `${storePerformanceJson.totalStores} stores`,
          context: 'Total number of Walmart stores'
        };
      }
    }
    
    // Customer queries
    if (q.includes('khách hàng') || q.includes('customer')) {
      if (q.includes('bao nhiêu') || q.includes('how many') || q.includes('số lượng')) {
        return {
          type: 'customer_count',
          data: retailSalesJson.uniqueCustomers,
          formatted: formatNumber(retailSalesJson.uniqueCustomers),
          context: 'Unique customers in retail sales'
        };
      }
      if (q.includes('độ tuổi') || q.includes('age') || q.includes('tuổi')) {
        const ageGroups = retailSalesJson.customerByAgeGroup;
        return {
          type: 'customer_age',
          data: ageGroups,
          formatted: ageGroups ? ageGroups.map(a => `${a.ageGroup}: ${formatNumber(a.customers || a.count)} khách`).join('\n') : 'No age data available',
          context: 'Customer distribution by age group'
        };
      }
    }
    
    // Month queries
    if (q.includes('tháng') || q.includes('month')) {
      if (q.includes('cao nhất') || q.includes('highest') || q.includes('best') || q.includes('top')) {
        const topMonth = retailAnalytics.getTopMonth();
        return {
          type: 'top_month',
          data: topMonth,
          formatted: `${topMonth.monthName}: ${formatCurrency(topMonth.revenue)} (${formatNumber(topMonth.orders)} orders)`,
          context: 'Best performing month'
        };
      }
      if (q.includes('thấp nhất') || q.includes('lowest') || q.includes('worst')) {
        const lowMonth = retailAnalytics.getLowestMonth();
        return {
          type: 'low_month',
          data: lowMonth,
          formatted: `${lowMonth.monthName}: ${formatCurrency(lowMonth.revenue)} (${formatNumber(lowMonth.orders)} orders)`,
          context: 'Lowest performing month'
        };
      }
      // Return all months
      const months = retailSalesJson.revenueByMonth;
      return {
        type: 'monthly_revenue',
        data: months,
        formatted: months.map(m => `${m.month}: ${formatCurrency(m.revenue)}`).join('\n'),
        context: 'Monthly revenue breakdown'
      };
    }
    
    // Payment method queries
    if (q.includes('payment') || q.includes('thanh toán') || q.includes('phương thức')) {
      const payments = retailSalesJson.revenueByPayment || retailSalesJson.paymentMethods;
      return {
        type: 'payment_methods',
        data: payments,
        formatted: payments.map(p => `${p.method}: ${formatCurrency(p.revenue)} (${p.percentage || (p.orders / retailSalesJson.totalOrders * 100).toFixed(1)}%)`).join('\n'),
        context: 'Payment method distribution'
      };
    }
    
    // Temperature/Weather queries
    if (q.includes('nhiệt độ') || q.includes('temperature') || q.includes('thời tiết') || q.includes('weather')) {
      const temps = storePerformanceJson.temperatureImpact;
      return {
        type: 'temperature_impact',
        data: temps,
        formatted: temps.map(t => `${t.tempCategory}: ${formatCurrency(t.totalSales)} (${t.percentage}%)`).join('\n'),
        context: 'Sales by temperature category'
      };
    }
    
    // Unemployment queries
    if (q.includes('unemployment') || q.includes('thất nghiệp')) {
      return {
        type: 'unemployment',
        data: storePerformanceJson.avgUnemployment,
        formatted: `${storePerformanceJson.avgUnemployment}%`,
        context: 'Average unemployment rate (2010-2012)',
        insight: 'Unemployment has strong NEGATIVE correlation with sales - when unemployment drops, sales increase'
      };
    }
    
    // CPI queries
    if (q.includes('cpi') || q.includes('consumer price')) {
      return {
        type: 'cpi',
        data: storePerformanceJson.avgCPI,
        formatted: storePerformanceJson.avgCPI.toFixed(2),
        context: 'Average CPI (Consumer Price Index)',
        insight: 'CPI remains stable (210-212 range) and has minimal impact on purchasing behavior'
      };
    }
    
    // Product queries
    if (q.includes('sản phẩm') || q.includes('product')) {
      if (q.includes('bao nhiêu') || q.includes('how many') || q.includes('số lượng')) {
        return {
          type: 'product_count',
          data: ecommerceJson.totalProducts,
          formatted: formatNumber(ecommerceJson.totalProducts),
          context: 'Total products in e-commerce catalog'
        };
      }
    }
    
    // Brand queries
    if (q.includes('brand') || q.includes('thương hiệu')) {
      const brands = ecommerceJson.topBrands;
      return {
        type: 'top_brands',
        data: brands ? brands.slice(0, 10) : [],
        formatted: brands ? brands.slice(0, 10).map((b, i) => `${i + 1}. ${b.brand}: ${b.count} products`).join('\n') : 'No brand data available',
        context: 'Top 10 brands by product count'
      };
    }
    
    // Rating queries
    if (q.includes('rating') || q.includes('đánh giá')) {
      return {
        type: 'rating',
        data: retailSalesJson.avgRating,
        formatted: `${retailSalesJson.avgRating.toFixed(2)}/5.0`,
        context: 'Average customer rating'
      };
    }
    
    // Holiday queries
    if (q.includes('holiday') || q.includes('lễ') || q.includes('ngày lễ')) {
      const holidays = storePerformanceJson.holidayImpact;
      return {
        type: 'holiday_impact',
        data: holidays,
        formatted: holidays.map(h => `${h.isHoliday ? 'Holiday' : 'Non-Holiday'}: ${formatCurrency(h.totalSales)} (Avg: ${formatCurrency(h.avgSales)})`).join('\n'),
        context: 'Holiday vs Non-Holiday sales comparison'
      };
    }
    
    // Order/transaction queries
    if (q.includes('order') || q.includes('đơn hàng') || q.includes('transaction') || q.includes('giao dịch')) {
      return {
        type: 'orders',
        data: retailSalesJson.totalOrders,
        formatted: formatNumber(retailSalesJson.totalOrders),
        context: 'Total orders/transactions'
      };
    }
    
    // AOV queries
    if (q.includes('aov') || q.includes('average order') || q.includes('giá trị đơn hàng')) {
      return {
        type: 'aov',
        data: retailSalesJson.avgOrderValue,
        formatted: formatCurrency(retailSalesJson.avgOrderValue),
        context: 'Average Order Value'
      };
    }
    
    // Default: return summary
    return {
      type: 'summary',
      data: crossAnalytics.getAllKPIs(),
      formatted: 'Tôi cần thêm thông tin để trả lời câu hỏi của bạn. Bạn có thể hỏi về doanh thu, cửa hàng, khách hàng, sản phẩm, thanh toán, thời tiết...',
      context: 'General query - need more specifics'
    };
  }
};

// ============================================================
// GENERATE DYNAMIC CONTEXT FOR AI
// ============================================================

export const generateDataContext = () => {
  // Calculate derived metrics
  const monthlyGrowth = retailAnalytics.getMonthlyGrowth();
  const topMonth = retailAnalytics.getTopMonth();
  const lowestMonth = retailAnalytics.getLowestMonth();
  const topStores = storePerformanceJson.salesByStore.slice(0, 10);
  const bottomStores = storePerformanceJson.salesByStore.slice(-5);
  
  // Calculate correlations and insights
  const revenueRange = {
    highest: topMonth?.revenue,
    lowest: lowestMonth?.revenue,
    variance: topMonth && lowestMonth ? ((topMonth.revenue - lowestMonth.revenue) / lowestMonth.revenue * 100).toFixed(1) : 0
  };
  
  const context = {
    timestamp: new Date().toISOString(),
    
    // ==========================================
    // RETAIL SALES (2024-2025) - FULL DATA
    // ==========================================
    retailSales: {
      // KPIs
      totalRevenue: retailSalesJson.totalRevenue,
      totalRevenueFormatted: formatCurrency(retailSalesJson.totalRevenue),
      totalOrders: retailSalesJson.totalOrders,
      avgOrderValue: retailSalesJson.avgOrderValue,
      avgRating: retailSalesJson.avgRating,
      uniqueCustomers: retailSalesJson.uniqueCustomers,
      
      // Monthly breakdown - FULL DATA
      revenueByMonth: retailSalesJson.revenueByMonth,
      monthlyAnalysis: {
        topMonth: topMonth,
        lowestMonth: lowestMonth,
        revenueVariance: `${revenueRange.variance}%`,
        monthlyGrowth: monthlyGrowth,
        avgMonthlyRevenue: retailSalesJson.totalRevenue / 12
      },
      
      // Payment methods - FULL DATA
      paymentMethods: retailSalesJson.revenueByPayment,
      
      // Customer demographics - FULL DATA
      customerByAgeGroup: retailSalesJson.customerByAgeGroup,
      customerDemographics: retailSalesJson.customerDemographics,
      
      // Categories - FULL DATA
      revenueByCategory: retailSalesJson.revenueByCategory,
      categoryPerformance: retailSalesJson.categoryPerformance,
      
      // Geographic - FULL DATA
      topCities: retailSalesJson.topCities,
      
      // Ratings
      ratingDistribution: retailSalesJson.ratingDistribution
    },
    
    // ==========================================
    // STORE PERFORMANCE (2010-2012) - FULL DATA
    // ==========================================
    storePerformance: {
      // KPIs
      totalWeeklySales: storePerformanceJson.totalWeeklySales,
      totalSalesFormatted: formatCurrency(storePerformanceJson.totalWeeklySales),
      totalRecords: storePerformanceJson.totalRecords,
      totalStores: storePerformanceJson.totalStores,
      avgWeeklySales: storePerformanceJson.avgWeeklySales,
      
      // Economic indicators
      economicIndicators: {
        avgCPI: storePerformanceJson.avgCPI,
        avgUnemployment: storePerformanceJson.avgUnemployment,
        avgFuelPrice: storePerformanceJson.avgFuelPrice,
        avgTemperature: storePerformanceJson.avgTemperature
      },
      
      // Store rankings - FULL DATA
      allStoresSorted: storePerformanceJson.salesByStore,
      topStores: topStores,
      bottomStores: bottomStores,
      storePerformanceGap: {
        topStore: topStores[0],
        bottomStore: bottomStores[bottomStores.length - 1],
        gapMultiplier: topStores[0] && bottomStores[bottomStores.length - 1] 
          ? (topStores[0].totalSales / bottomStores[bottomStores.length - 1].totalSales).toFixed(2)
          : 'N/A'
      },
      
      // Time analysis - FULL DATA
      salesByYear: storePerformanceJson.salesByYear,
      salesByMonth: storePerformanceJson.salesByMonth,
      
      // Weather impact - FULL DATA
      temperatureImpact: storePerformanceJson.temperatureImpact,
      holidayImpact: storePerformanceJson.holidayImpact,
      
      // Economic trends - FULL DATA
      economicTrend: storePerformanceJson.economicTrend
    },
    
    // ==========================================
    // E-COMMERCE (2019) - FULL DATA
    // ==========================================
    ecommerce: {
      // KPIs
      totalProducts: ecommerceJson.totalProducts,
      totalBrands: ecommerceJson.totalBrands,
      totalCategories: ecommerceJson.totalCategories,
      avgListPrice: ecommerceJson.avgListPrice,
      avgSalePrice: ecommerceJson.avgSalePrice,
      avgDiscountPct: ecommerceJson.avgDiscountPct,
      availableProducts: ecommerceJson.availableProducts,
      
      // Product distribution - FULL DATA
      productsByCategory: ecommerceJson.productsByCategory,
      topBrands: ecommerceJson.topBrands,
      priceDistribution: ecommerceJson.priceDistribution,
      discountDistribution: ecommerceJson.discountDistribution,
      availabilityByCategory: ecommerceJson.availabilityByCategory
    },
    
    // ==========================================
    // PRE-COMPUTED INSIGHTS FOR COMPLEX QUERIES
    // ==========================================
    insights: {
      // Cross-schema comparisons
      revenueComparison: {
        retailVsStore: {
          retail2024: retailSalesJson.totalRevenue,
          store2010_2012: storePerformanceJson.totalWeeklySales,
          storeIsLargerBy: `${(storePerformanceJson.totalWeeklySales / retailSalesJson.totalRevenue).toFixed(0)}x`
        }
      },
      
      // Weather impact analysis
      weatherAnalysis: {
        coldWeatherSales: storePerformanceJson.temperatureImpact?.find(t => t.tempCategory === 'Cold'),
        hotWeatherSales: storePerformanceJson.temperatureImpact?.find(t => t.tempCategory === 'Hot'),
        weatherImpactConclusion: "Cold weather drives 35.85% of sales, Hot only 7.24% - 393% difference"
      },
      
      // Economic correlations
      economicCorrelations: {
        unemploymentImpact: "NEGATIVE correlation - when unemployment decreases, sales increase",
        cpiImpact: "STABLE CPI (171 avg) - minimal impact on purchasing behavior",
        fuelPriceImpact: "55% increase over period but limited direct sales impact"
      },
      
      // Customer insights
      customerInsights: {
        dominantAgeGroup: "31-45 (35.1% of customers)",
        highestReturnRate: "18-30 age group (51% return rate)",
        paymentPreference: "Evenly distributed ~25% each method",
        returningCustomerValue: "Returning customers contribute ~55% of revenue"
      },
      
      // Seasonal patterns
      seasonalPatterns: {
        peakMonths: ["March", "October", "July"],
        lowMonths: ["February"],
        holidayEffect: "6-8% revenue increase during holiday weeks",
        weekdayVsWeekend: "Weekday sales slightly higher than weekend"
      },
      
      // Store performance insights
      storeInsights: {
        topPerformers: "Store 20, 4, 14 - each >$285M",
        performanceGap: "Top store revenue is ~3-4x bottom store",
        regionalPattern: "All stores in USA region"
      }
    },
    
    // ==========================================
    // SAMPLE COMPLEX QUERY ANSWERS
    // ==========================================
    sampleAnswers: {
      "Mối quan hệ unemployment và doanh số": "Khi unemployment giảm từ 8.1% xuống 7.7%, weekly sales tăng từ $42M lên peak $55M. Tương quan ÂM mạnh.",
      "So sánh doanh thu các nguồn": `Retail (2024-2025): ${formatCurrency(retailSalesJson.totalRevenue)} vs Store (2010-2012): ${formatCurrency(storePerformanceJson.totalWeeklySales)}`,
      "Top store và bottom store": `Top: ${topStores[0]?.store} (${formatCurrency(topStores[0]?.totalSales)}), Bottom: ${bottomStores[bottomStores.length-1]?.store}`,
      "Thời tiết ảnh hưởng thế nào": "Cold weather = 35.85% doanh số (cao nhất), Hot = 7.24% (thấp nhất). Chênh lệch 393%."
    }
  };
  
  return JSON.stringify(context, null, 2);
};

// ============================================================
// ADVANCED QUERY FUNCTIONS FOR COMPLEX QUESTIONS
// ============================================================

export const advancedAnalytics = {
  // Compare metrics across time periods
  compareMonths: (month1, month2) => {
    const months = retailSalesJson.revenueByMonth;
    const m1 = months.find(m => m.month.toLowerCase() === month1.toLowerCase());
    const m2 = months.find(m => m.month.toLowerCase() === month2.toLowerCase());
    if (!m1 || !m2) return null;
    return {
      month1: m1,
      month2: m2,
      difference: m1.revenue - m2.revenue,
      percentDiff: ((m1.revenue - m2.revenue) / m2.revenue * 100).toFixed(2)
    };
  },
  
  // Get stores in a revenue range
  getStoresInRange: (minRevenue, maxRevenue) => {
    return storePerformanceJson.salesByStore.filter(
      s => s.totalSales >= minRevenue && s.totalSales <= maxRevenue
    );
  },
  
  // Calculate revenue by temperature
  getRevenueByTemperature: () => {
    const temps = storePerformanceJson.temperatureImpact;
    const total = temps.reduce((sum, t) => sum + t.totalSales, 0);
    return temps.map(t => ({
      ...t,
      percentageOfTotal: (t.totalSales / total * 100).toFixed(2)
    }));
  },
  
  // Get economic correlation data
  getEconomicCorrelation: () => {
    const trend = storePerformanceJson.economicTrend;
    if (!trend) return null;
    return {
      cpiRange: {
        min: Math.min(...trend.map(t => t.cpi)),
        max: Math.max(...trend.map(t => t.cpi)),
        avg: (trend.reduce((s, t) => s + t.cpi, 0) / trend.length).toFixed(2)
      },
      unemploymentRange: {
        min: Math.min(...trend.map(t => t.unemployment)),
        max: Math.max(...trend.map(t => t.unemployment)),
        avg: (trend.reduce((s, t) => s + t.unemployment, 0) / trend.length).toFixed(2)
      },
      salesRange: {
        min: formatCurrency(Math.min(...trend.map(t => t.weeklySales))),
        max: formatCurrency(Math.max(...trend.map(t => t.weeklySales)))
      }
    };
  },
  
  // Customer segment analysis
  getCustomerSegmentInsights: () => {
    const ageGroups = retailSalesJson.customerByAgeGroup;
    if (!ageGroups) return null;
    const total = ageGroups.reduce((s, a) => s + (a.customers || a.count || 0), 0);
    return ageGroups.map(a => ({
      ...a,
      percentage: ((a.customers || a.count || 0) / total * 100).toFixed(1)
    }));
  }
};

export default {
  retailAnalytics,
  storeAnalytics,
  ecommerceAnalytics,
  crossAnalytics,
  queryProcessor,
  generateDataContext,
  advancedAnalytics
};
