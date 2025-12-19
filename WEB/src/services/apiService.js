/**
 * API Service for Walmart Analytics Dashboard
 * Fetches real data from DuckDB via FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  async fetch(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  // ============================================================
  // RETAIL SALES API
  // ============================================================
  
  async getRetailKPIs() {
    return this.fetch('/api/retail/kpis');
  }

  async getRevenueByMonth() {
    return this.fetch('/api/retail/revenue-by-month');
  }

  async getRevenueByCategory() {
    return this.fetch('/api/retail/revenue-by-category');
  }

  async getRevenueByPayment() {
    return this.fetch('/api/retail/revenue-by-payment');
  }

  async getCustomerDemographics() {
    return this.fetch('/api/retail/customers/demographics');
  }

  // ============================================================
  // STORE PERFORMANCE API
  // ============================================================

  async getStoreKPIs() {
    return this.fetch('/api/store/kpis');
  }

  async getSalesByStore(limit = 10) {
    return this.fetch(`/api/store/sales-by-store?limit=${limit}`);
  }

  async getStoreSalesByYear() {
    return this.fetch('/api/store/sales-by-year');
  }

  async getEconomicImpact() {
    return this.fetch('/api/store/economic-impact');
  }

  async getHolidayImpact() {
    return this.fetch('/api/store/holiday-impact');
  }

  // ============================================================
  // E-COMMERCE API
  // ============================================================

  async getEcommerceKPIs() {
    return this.fetch('/api/ecommerce/kpis');
  }

  async getProductsByCategory() {
    return this.fetch('/api/ecommerce/products-by-category');
  }

  async getTopBrands(limit = 10) {
    return this.fetch(`/api/ecommerce/top-brands?limit=${limit}`);
  }

  async getPriceDistribution() {
    return this.fetch('/api/ecommerce/price-distribution');
  }

  // ============================================================
  // UTILITY
  // ============================================================

  async healthCheck() {
    return this.fetch('/api/health');
  }

  async getSchemaInfo() {
    return this.fetch('/api/schema-info');
  }
}

export const apiService = new ApiService();
export default apiService;
