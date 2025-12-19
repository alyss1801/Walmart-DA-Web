/**
 * Walmart Analytics Data - LIVE from DuckDB
 * ==========================================
 * Auto-generated from: scripts/export_to_web.py
 * Source: database/walmart_analytics.db
 * 
 * This file imports real data exported from DuckDB.
 * To refresh: run `python scripts/export_to_web.py`
 */

import retailSalesJson from './retail_sales.json';
import storePerformanceJson from './store_performance.json';
import ecommerceJson from './ecommerce.json';

// ============================================================
// STAR SCHEMA 1: RETAIL SALES DATA
// ============================================================
export const retailSalesData = {
  // KPIs
  totalRevenue: retailSalesJson.totalRevenue,
  totalOrders: retailSalesJson.totalOrders,
  avgOrderValue: retailSalesJson.avgOrderValue,
  avgRating: retailSalesJson.avgRating,
  uniqueCustomers: retailSalesJson.uniqueCustomers,
  
  // Charts data
  revenueByMonth: retailSalesJson.revenueByMonth,
  revenueByCategory: retailSalesJson.revenueByCategory,
  revenueByPayment: retailSalesJson.revenueByPayment,
  paymentMethods: retailSalesJson.paymentMethods,
  
  // Customer Analytics
  customerDemographics: retailSalesJson.customerDemographics,
  customerByAgeGroup: retailSalesJson.customerByAgeGroup,
  customerByGender: retailSalesJson.customerByGender,
  categoryPerformance: retailSalesJson.categoryPerformance,
  ratingDistribution: retailSalesJson.ratingDistribution,
  topCities: retailSalesJson.topCities,
  
  // Metadata
  generatedAt: retailSalesJson.generatedAt,
  source: retailSalesJson.source
};


// ============================================================
// STAR SCHEMA 2: STORE PERFORMANCE DATA
// ============================================================
export const storePerformanceData = {
  // KPIs
  totalWeeklySales: storePerformanceJson.totalWeeklySales,
  totalRecords: storePerformanceJson.totalRecords,
  avgWeeklySales: storePerformanceJson.avgWeeklySales,
  totalStores: storePerformanceJson.totalStores,
  avgTemperature: storePerformanceJson.avgTemperature,
  avgFuelPrice: storePerformanceJson.avgFuelPrice,
  avgCPI: storePerformanceJson.avgCPI,
  avgUnemployment: storePerformanceJson.avgUnemployment,
  
  // Charts data
  salesByStore: storePerformanceJson.salesByStore,
  salesByYear: storePerformanceJson.salesByYear,
  salesByMonth: storePerformanceJson.salesByMonth,
  temperatureImpact: storePerformanceJson.temperatureImpact,
  holidayImpact: storePerformanceJson.holidayImpact,
  economicTrend: storePerformanceJson.economicTrend,
  
  // Metadata
  generatedAt: storePerformanceJson.generatedAt,
  source: storePerformanceJson.source
};


// ============================================================
// STAR SCHEMA 3: E-COMMERCE DATA
// ============================================================
export const ecommerceData = {
  // KPIs
  totalProducts: ecommerceJson.totalProducts,
  avgListPrice: ecommerceJson.avgListPrice,
  avgSalePrice: ecommerceJson.avgSalePrice,
  avgDiscountPct: ecommerceJson.avgDiscountPct,
  availableProducts: ecommerceJson.availableProducts,
  totalBrands: ecommerceJson.totalBrands,
  totalCategories: ecommerceJson.totalCategories,
  
  // Charts data
  productsByCategory: ecommerceJson.productsByCategory,
  topBrands: ecommerceJson.topBrands,
  priceDistribution: ecommerceJson.priceDistribution,
  discountDistribution: ecommerceJson.discountDistribution,
  availabilityByCategory: ecommerceJson.availabilityByCategory,
  
  // Metadata
  generatedAt: ecommerceJson.generatedAt,
  source: ecommerceJson.source
};


// ============================================================
// DATA INFO (for display in UI)
// ============================================================
export const dataInfo = {
  lastUpdated: retailSalesJson.generatedAt,
  source: 'DuckDB walmart_analytics.db',
  schemas: {
    retailSales: {
      name: 'Retail Sales',
      records: retailSalesJson.totalOrders,
      period: '2024-2025'
    },
    storePerformance: {
      name: 'Store Performance',
      records: storePerformanceJson.totalRecords,
      period: '2010-2012'
    },
    ecommerce: {
      name: 'E-commerce Catalog',
      records: ecommerceJson.totalProducts,
      period: '2019'
    }
  }
};


// Default export for backward compatibility
export default {
  retailSalesData,
  storePerformanceData,
  ecommerceData,
  dataInfo
};


// ============================================================
// CHATBOT KNOWLEDGE BASE - Updated for 3 Dashboards
// ============================================================
export const chatbotKnowledge = {
  overview: {
    projectName: "Walmart Galaxy Schema Data Warehouse",
    description: "Analytics platform với 3 Star Schemas và 3 Dashboards phân tích",
    dashboards: [
      "Revenue Trend Analysis - Xu hướng doanh thu, tác động thời tiết",
      "Customer Segmentation - Phân khúc khách hàng, hành vi mua sắm",
      "Store Performance - Hiệu suất cửa hàng, yếu tố kinh tế"
    ],
    dataSource: "DuckDB walmart_analytics.db"
  },
  
  // Dashboard 1: Revenue Trend Analysis
  dashboard1_RevenueTrend: {
    name: "Revenue Trend Analysis",
    period: "2024-2025",
    factTable: "FACT_SALES",
    dimensions: ["DIM_DATE", "DIM_CUSTOMER", "DIM_PRODUCT", "DIM_PAYMENT", "DIM_CATEGORY"],
    kpis: {
      totalRevenue: retailSalesJson.totalRevenue,
      totalOrders: retailSalesJson.totalOrders,
      avgOrderValue: retailSalesJson.avgOrderValue,
      avgRating: retailSalesJson.avgRating,
      uniqueCustomers: retailSalesJson.uniqueCustomers
    },
    insights: {
      weatherImpact: {
        cold: "35.85% doanh thu - cao nhất",
        warm: "26.73%",
        cool: "22.15%",
        freezing: "8.03%",
        hot: "7.24% - thấp nhất",
        gap: "393% chênh lệch giữa Cold và Hot"
      },
      holidayEffect: "6-8% tăng doanh thu trong tuần lễ hội",
      topCategory: "Electronics dẫn đầu với ~$3.26M",
      monthlyAvg: "~$1M/tháng"
    },
    charts: ["Monthly Revenue & Orders", "Temperature Impact", "Holiday vs Non-Holiday", "Weekday vs Weekend", "Revenue by Category"]
  },
  
  // Dashboard 2: Customer Segmentation
  dashboard2_CustomerSegmentation: {
    name: "Customer Segmentation & Behavior",
    period: "2024-2025",
    factTable: "FACT_SALES",
    dimensions: ["DIM_CUSTOMER", "DIM_PAYMENT", "DIM_CATEGORY"],
    kpis: {
      totalCustomers: retailSalesJson.uniqueCustomers,
      totalRevenue: retailSalesJson.totalRevenue,
      totalOrders: retailSalesJson.totalOrders,
      avgOrderValue: retailSalesJson.avgOrderValue
    },
    ageGroups: {
      "31-45": { percentage: 35.1, rank: 1, description: "Nhóm lớn nhất, AOV cao nhất" },
      "46-60": { percentage: 34.6, rank: 2, description: "Nhóm ổn định" },
      "18-30": { percentage: 28.0, rank: 3, description: "Tỷ lệ quay lại cao nhất (51%)" },
      "<18": { percentage: 2.3, rank: 4, description: "Nhóm nhỏ nhất" }
    },
    customerTypes: {
      returning: "~55% doanh thu",
      new: "~45% doanh thu"
    },
    paymentMethods: {
      distribution: "~25% mỗi phương thức",
      methods: ["Cash on Delivery", "Credit Card", "Debit Card", "UPI"],
      trend: "UPI đang tăng trưởng"
    },
    insights: {
      repeatRate: "18-30 có tỷ lệ quay lại cao nhất (51%)",
      highestAOV: "31-45 có AOV cao nhất",
      paymentBalance: "Phân bố đều, không phương thức nào chiếm ưu thế"
    },
    charts: ["Return Rate by Age", "Customers & AOV by Month", "Revenue by Age", "Revenue by Category & Type", "Revenue by Age & Payment"]
  },
  
  // Dashboard 3: Store Performance
  dashboard3_StorePerformance: {
    name: "Store Sales Performance - Economic Factors",
    period: "2010-2012 (143 tuần)",
    factTable: "FACT_STORE_PERFORMANCE",
    dimensions: ["DIM_DATE_STORE", "DIM_STORE", "DIM_TEMP_CATEGORY"],
    kpis: {
      totalRevenue: "$6.88 Billion",
      totalStores: 45,
      totalWeeks: 143,
      avgWeeklySales: "$1.05M",
      efficiencyRatio: 48.44
    },
    economicIndicators: {
      cpi: { avg: 210.96, range: "210.0 - 212.1", impact: "Ổn định, ít ảnh hưởng" },
      unemployment: { avg: "7.9%", range: "7.7% - 8.1%", trend: "Giảm từ 390→325", impact: "Tương quan ÂM mạnh với doanh số" },
      fuelPrice: { avg: "$3.36", range: "$2.57 - $4.00", trend: "Tăng 55%", impact: "Ít ảnh hưởng trực tiếp" }
    },
    temperatureImpact: {
      cold: "35.85% - cao nhất",
      warm: "26.73%",
      cool: "22.15%",
      freezing: "8.03%",
      hot: "7.24% - thấp nhất",
      insight: "Nhiệt độ là driver chính, Cold+Freezing chiếm 43.88%"
    },
    topStores: [
      { name: "Store 4", sales: "$650M" },
      { name: "Store 20", sales: "$620M" },
      { name: "Store 13", sales: "$610M" },
      { name: "Store 2", sales: "$600M" },
      { name: "Store 14", sales: "$590M" }
    ],
    keyRelationship: {
      description: "Mối quan hệ CPI - Unemployment - Revenue",
      findings: [
        "Unemployment có TƯƠNG QUAN ÂM mạnh với doanh thu",
        "Khi unemployment giảm từ 8.1%→7.7%, weekly sales tăng từ $42M→$55M peak",
        "CPI dao động hẹp (210-212), KHÔNG ảnh hưởng đáng kể đến hành vi mua sắm",
        "NHIỆT ĐỘ là driver chính - thời tiết lạnh = doanh số cao",
        "Mùa đông có doanh số cao do chuẩn bị kỳ nghỉ lễ và thời tiết khắc nghiệt"
      ]
    },
    charts: ["Sales & CPI by Temperature", "Unemployment vs Weekly Sales", "Top Stores", "Store Performance by CPI Level", "Fuel Price Trend", "Sales Distribution by Temperature"]
  },
  
  // Legacy data for backward compatibility
  starSchema1_RetailSales: {
    name: "Retail Sales Analytics",
    factTable: "FACT_SALES",
    dimensions: ["DIM_DATE", "DIM_CUSTOMER", "DIM_PRODUCT", "DIM_PAYMENT", "DIM_CATEGORY"],
    totalTransactions: retailSalesJson.totalOrders,
    totalRevenue: retailSalesJson.totalRevenue,
    avgOrderValue: retailSalesJson.avgOrderValue,
    avgRating: retailSalesJson.avgRating,
    uniqueCustomers: retailSalesJson.uniqueCustomers,
    categories: retailSalesJson.revenueByCategory?.map(c => c.category) || [],
    paymentMethods: retailSalesJson.paymentMethods?.map(p => p.method) || [],
    timePeriod: "2024-2025"
  },
  
  starSchema2_StorePerformance: {
    name: "Store Performance Analytics",
    factTable: "FACT_STORE_PERFORMANCE",
    dimensions: ["DIM_DATE_STORE", "DIM_STORE", "DIM_TEMPERATURE"],
    totalRecords: storePerformanceJson.totalRecords,
    totalStores: storePerformanceJson.totalStores,
    totalWeeklySales: storePerformanceJson.totalWeeklySales,
    avgWeeklySales: storePerformanceJson.avgWeeklySales,
    economicIndicators: {
      avgCPI: storePerformanceJson.avgCPI,
      avgFuelPrice: storePerformanceJson.avgFuelPrice,
      avgUnemployment: storePerformanceJson.avgUnemployment,
      avgTemperature: storePerformanceJson.avgTemperature
    },
    timePeriod: "2010-2012"
  },
  
  starSchema3_Ecommerce: {
    name: "E-commerce Product Catalog",
    factTable: "FACT_ECOMMERCE_SALES",
    dimensions: ["DIM_ECOMMERCE_PRODUCT", "DIM_ECOMMERCE_CATEGORY", "DIM_ECOMMERCE_BRAND"],
    totalProducts: ecommerceJson.totalProducts,
    totalBrands: ecommerceJson.totalBrands,
    totalCategories: ecommerceJson.totalCategories,
    avgListPrice: ecommerceJson.avgListPrice,
    avgSalePrice: ecommerceJson.avgSalePrice,
    avgDiscountPct: ecommerceJson.avgDiscountPct,
    availableProducts: ecommerceJson.availableProducts,
    timePeriod: "2019"
  }
};
