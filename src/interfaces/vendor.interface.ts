/**
 * Base vendor interface that all vendor implementations must follow
 */
export interface IVendor {
  /**
   * Authorize with the vendor API and return a token
   */
  authorize(): Promise<string>;
  
  /**
   * Get products from the vendor
   * @param query Search query
   * @param filters Optional filters
   */
  getProducts(query: string, filters?: any): Promise<Product[]>;
  
  /**
   * Validate inventory items
   * @param items List of items to validate
   */
  validateInventory(items: InventoryItem[]): Promise<InventoryValidationResult>;
  
  /**
   * Place an order with the vendor
   * @param orderData Order data
   */
  placeOrder(orderData: OrderData): Promise<OrderResult>;
  
  /**
   * Track an order
   * @param orderId Order ID
   */
  trackOrder(orderId: string): Promise<OrderTrackingResult>;
  
  /**
   * Cancel an order
   * @param orderId Order ID
   * @param reason Cancellation reason
   */
  cancelOrder(orderId: string, reason: string): Promise<OrderCancellationResult>;
}

/**
 * Unified product interface
 */
export interface Product {
  sku: string; // Using sku instead of id for consistency with API docs
  name: string;
  description?: string;
  price: number;
  discountedPrice?: number;
  image?: string;
  category?: string;
  inStock?: boolean;
  type?: string;
  vendor?: string;
  rxRequired?: boolean;
  stockAvailable?: boolean;
  additionalInfo?: Record<string, any>;
}

/**
 * Inventory item for validation
 */
export interface InventoryItem {
  sku: string;
  quantity: number;
}

/**
 * Result of inventory validation
 */
export interface InventoryValidationResult {
  available: boolean;
  items: Array<{
    sku: string;
    requestedQuantity: number;
    availableQuantity: number;
    price: number;
    discountedPrice?: number;
  }>;
  totalAmount: number;
  additionalCharges?: Array<{
    type: string;
    amount: number;
    description?: string;
  }>;
  payableAmount: number;
  eta?: string;
}

/**
 * Order data for placing an order
 */
export interface OrderData {
  items: Array<{
    sku: string;
    quantity: number;
  }>;
  transactionId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

/**
 * Result of order placement
 */
export interface OrderResult {
  orderId: string;
  status: string;
  estimatedDelivery?: string;
  trackingLink?: string;
  additionalInfo?: Record<string, any>;
}

/**
 * Result of order tracking
 */
export interface OrderTrackingResult {
  orderId: string;
  vendorOrderId?: string;
  status: string;
  estimatedDelivery?: string;
  trackingLink?: string;
  items?: Array<{
    sku: string;
    name: string;
    quantity: number;
  }>;
}

/**
 * Result of order cancellation
 */
export interface OrderCancellationResult {
  orderId: string;
  status: string;
  cancellationReason: string;
  refundInfo?: {
    refundId?: string;
    amount: number;
    status: string;
  };
}
