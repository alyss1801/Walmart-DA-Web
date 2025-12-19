/**
 * React Hooks for Data Fetching
 * Uses API service with fallback to static data
 */

import { useState, useEffect } from 'react';
import apiService from './apiService';
import { retailSalesData, storePerformanceData, ecommerceData } from '../data';

// Generic hook for API fetching with fallback
function useApiData(fetchFn, fallbackData, dependencies = []) {
  const [data, setData] = useState(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const result = await fetchFn();
        if (mounted) {
          setData(result);
          setIsLive(true);
          setError(null);
        }
      } catch (err) {
        console.warn('API unavailable, using fallback data:', err.message);
        if (mounted) {
          setData(fallbackData);
          setIsLive(false);
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return { data, loading, error, isLive };
}

// ============================================================
// RETAIL SALES HOOKS
// ============================================================

export function useRetailKPIs() {
  return useApiData(
    () => apiService.getRetailKPIs(),
    {
      totalRevenue: retailSalesData.totalRevenue,
      totalOrders: retailSalesData.totalOrders,
      avgOrderValue: retailSalesData.avgOrderValue,
      avgRating: retailSalesData.avgRating,
      uniqueCustomers: retailSalesData.uniqueCustomers
    }
  );
}

export function useRevenueByMonth() {
  return useApiData(
    () => apiService.getRevenueByMonth(),
    retailSalesData.revenueByMonth
  );
}

export function useRevenueByCategory() {
  return useApiData(
    () => apiService.getRevenueByCategory(),
    retailSalesData.revenueByCategory
  );
}

export function useRevenueByPayment() {
  return useApiData(
    () => apiService.getRevenueByPayment(),
    retailSalesData.revenueByPayment
  );
}

export function useCustomerDemographics() {
  return useApiData(
    () => apiService.getCustomerDemographics(),
    retailSalesData.customerDemographics
  );
}

// ============================================================
// STORE PERFORMANCE HOOKS
// ============================================================

export function useStoreKPIs() {
  return useApiData(
    () => apiService.getStoreKPIs(),
    {
      totalSales: storePerformanceData.totalWeeklySales,
      totalRecords: storePerformanceData.totalRecords,
      avgWeeklySales: storePerformanceData.avgWeeklySales,
      totalStores: storePerformanceData.totalStores,
      avgTemperature: 60.7,
      avgFuelPrice: 3.36,
      avgCPI: 211.0,
      avgUnemployment: 8.0
    }
  );
}

export function useSalesByStore(limit = 10) {
  return useApiData(
    () => apiService.getSalesByStore(limit),
    storePerformanceData.salesByStore?.slice(0, limit) || []
  );
}

export function useStoreSalesByYear() {
  return useApiData(
    () => apiService.getStoreSalesByYear(),
    storePerformanceData.salesByYear || []
  );
}

export function useEconomicImpact() {
  return useApiData(
    () => apiService.getEconomicImpact(),
    storePerformanceData.economicImpact || []
  );
}

export function useHolidayImpact() {
  return useApiData(
    () => apiService.getHolidayImpact(),
    storePerformanceData.holidayImpact || []
  );
}

// ============================================================
// E-COMMERCE HOOKS
// ============================================================

export function useEcommerceKPIs() {
  return useApiData(
    () => apiService.getEcommerceKPIs(),
    {
      totalProducts: ecommerceData.totalProducts,
      avgListPrice: ecommerceData.avgListPrice,
      avgSalePrice: ecommerceData.avgSalePrice,
      avgDiscountPct: ecommerceData.avgDiscountPct,
      availableProducts: ecommerceData.availableProducts,
      totalBrands: ecommerceData.totalBrands,
      totalCategories: ecommerceData.totalCategories
    }
  );
}

export function useProductsByCategory() {
  return useApiData(
    () => apiService.getProductsByCategory(),
    ecommerceData.productsByCategory || []
  );
}

export function useTopBrands(limit = 10) {
  return useApiData(
    () => apiService.getTopBrands(limit),
    ecommerceData.topBrands?.slice(0, limit) || []
  );
}

export function usePriceDistribution() {
  return useApiData(
    () => apiService.getPriceDistribution(),
    ecommerceData.priceDistribution || []
  );
}

// ============================================================
// CONNECTION STATUS HOOK
// ============================================================

export function useApiHealth() {
  const [status, setStatus] = useState({ connected: false, checking: true });

  useEffect(() => {
    async function checkHealth() {
      try {
        await apiService.healthCheck();
        setStatus({ connected: true, checking: false });
      } catch {
        setStatus({ connected: false, checking: false });
      }
    }
    checkHealth();
  }, []);

  return status;
}
