// Google Sheets API 통합 서비스
// 모든 주문 관리 기능을 위한 통합 API

const GOOGLE_APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

class OrderManagementAPI {
  constructor(scriptUrl) {
    this.scriptUrl = scriptUrl;
  }

  // ==================== ORDER MANAGEMENT ====================

  /**
   * 새 주문 생성
   */
  async createOrder(orderData) {
    return this._post({
      action: 'create_order',
      ...orderData
    });
  }

  /**
   * 주문 상태 업데이트
   */
  async updateOrderStatus(orderId, status, options = {}) {
    return this._post({
      action: 'update_order_status',
      orderId,
      status,
      trackingNumber: options.trackingNumber,
      notifyCustomer: options.notifyCustomer !== false,
      email: options.email
    });
  }

  /**
   * 송장번호 업데이트
   */
  async updateTracking(orderId, trackingNumber, email) {
    return this._post({
      action: 'update_tracking',
      orderId,
      trackingNumber,
      email
    });
  }

  /**
   * 여러 주문 상태 일괄 업데이트
   */
  async batchUpdateStatus(orderIds, status) {
    return this._post({
      action: 'batch_update_status',
      orderIds,
      status
    });
  }

  /**
   * 모든 주문 조회
   */
  async getOrders() {
    return this._get({ action: 'orders' });
  }

  /**
   * 특정 주문 조회
   */
  async getOrder(orderId) {
    return this._get({ action: 'order', orderId });
  }

  // ==================== FACTORY INTEGRATION ====================

  /**
   * 공장에 발주 전송
   */
  async sendToFactory(orderData) {
    return this._post({
      action: 'send_to_factory',
      ...orderData
    });
  }

  /**
   * 발주 목록 조회
   */
  async getPurchaseOrders() {
    return this._get({ action: 'purchase_orders' });
  }

  // ==================== PRODUCT MANAGEMENT ====================

  /**
   * 제품 동기화
   */
  async syncProducts(products) {
    return this._post({
      action: 'sync_products',
      products
    });
  }

  /**
   * 제품 목록 조회
   */
  async getProducts() {
    return this._get({ action: 'products' });
  }

  // ==================== INVENTORY MANAGEMENT ====================

  /**
   * 재고 업데이트
   */
  async updateInventory(componentId, quantity, operation = 'subtract', additionalData = {}) {
    return this._post({
      action: 'update_inventory',
      componentId,
      quantity,
      operation,
      ...additionalData
    });
  }

  /**
   * 재고 목록 조회
   */
  async getInventory() {
    return this._get({ action: 'inventory' });
  }

  // ==================== RETURN MANAGEMENT ====================

  /**
   * 반품 생성
   */
  async createReturn(returnData) {
    return this._post({
      action: 'create_return',
      ...returnData
    });
  }

  /**
   * 반품 목록 조회
   */
  async getReturns() {
    return this._get({ action: 'returns' });
  }

  // ==================== INVOICE GENERATION ====================

  /**
   * 인보이스 생성
   */
  async generateInvoice(orderId) {
    return this._post({
      action: 'generate_invoice',
      orderId
    });
  }

  // ==================== HELPER METHODS ====================

  async _get(params) {
    const url = new URL(this.scriptUrl);
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    try {
      const response = await fetch(url.toString());
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API GET Error:', error);
      throw new Error(`API 요청 실패: ${error.message}`);
    }
  }

  async _post(data) {
    try {
      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        redirect: 'follow'
      });

      const result = await response.json();
      
      if (result.result === 'error') {
        throw new Error(result.message || 'Unknown error');
      }

      return result;
    } catch (error) {
      console.error('API POST Error:', error);
      throw new Error(`API 요청 실패: ${error.message}`);
    }
  }
}

// 싱글톤 인스턴스 생성
const orderAPI = new OrderManagementAPI(GOOGLE_APPS_SCRIPT_URL);

export default orderAPI;

// 개별 함수들도 export (편의성)
export const {
  createOrder,
  updateOrderStatus,
  updateTracking,
  batchUpdateStatus,
  getOrders,
  getOrder,
  sendToFactory,
  getPurchaseOrders,
  syncProducts,
  getProducts,
  updateInventory,
  getInventory,
  createReturn,
  getReturns,
  generateInvoice
} = orderAPI;
