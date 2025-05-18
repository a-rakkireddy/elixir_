import { 
  IVendor, 
  Product, 
  InventoryItem, 
  InventoryValidationResult, 
  OrderData, 
  OrderResult,
  OrderTrackingResult,
  OrderCancellationResult
} from '../interfaces/vendor.interface';
import { httpClient } from '../utils/http.util';
import { encrypt, decrypt } from '../utils/encryption.util';
import {
  VOUCHER_PRODUCTS,
  generateInventoryValidationResult,
  generateOrderResult,
  generateOrderTrackingResult,
  generateOrderCancellationResult,
  getExpiryDate
} from '../mocks/voucher.mock';

/**
 * Voucher Vendor Service implementation
 * Although named "VoucherVendorService", this also uses the Ecom API endpoints
 * but with different credentials
 */
export class VoucherVendorService implements IVendor {
  private baseUrl: string = 'http://staging.joinelixir.club/api/v1/marketplace/';
  private merchantId: string = 'voucher_merchant_123';
  private accessKey: string = 'voucher_access_key_123';
  private jwtToken: string = '';
  private tokenExpiry: number = 0; // Token expiry timestamp
  
  /**
   * Constructor
   */
  constructor() {}
  
  /**
   * Authorize with the Ecom API (using voucher credentials)
   * @returns JWT token
   */
  async authorize(): Promise<string> {
    try {
      // Check if token is still valid (within 15 minute window)
      const now = Date.now();
      if (this.jwtToken && this.tokenExpiry > now) {
        return this.jwtToken;
      }
      
      // Make real API call to get JWT token
      const response = await httpClient.get(`${this.baseUrl}generate-jwt/${this.merchantId}`);
      
      if (response.data.is_success && response.data.data.token) {
        this.jwtToken = response.data.data.token;
        // Set token expiry to 15 minutes from now
        this.tokenExpiry = now + (15 * 60 * 1000);
        return this.jwtToken;
      } else {
        throw new Error('Failed to get JWT token');
      }
    } catch (error) {
      console.error('Voucher authorization error:', error);
      throw new Error('Failed to authorize with Ecom API for voucher vendor');
    }
  }
  
  /**
   * Get products (brands) from Voucher API
   * @param query Search query (not used in Voucher API)
   * @param filters Optional filters
   * @returns List of products
   */
  async getProducts(query: string, filters?: any): Promise<Product[]> {
    try {
      // For this assignment, we'll use mock data instead of making actual API calls
      console.log(`Searching for vouchers with query: ${query} and filters:`, filters);
      
      // Use the imported mock products
      let filteredProducts = [...VOUCHER_PRODUCTS];
      
      // Filter products based on query
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(lowerQuery)
        );
      }
      
      // Apply additional filters if provided
      if (filters) {
        if (filters.BrandProductCode) {
          filteredProducts = filteredProducts.filter(product => 
            product.sku === filters.BrandProductCode
          );
        }
        
        if (filters.category) {
          filteredProducts = filteredProducts.filter(product => 
            product.category?.includes(filters.category)
          );
        }
      }
      
      return filteredProducts;
    } catch (error) {
      console.error('Voucher getProducts error:', error);
      throw new Error('Failed to get products from Voucher API');
    }
  }
  
  /**
   * Validate inventory items with Voucher API
   * @param items List of items to validate
   * @returns Inventory validation result
   */
  async validateInventory(items: InventoryItem[]): Promise<InventoryValidationResult> {
    try {
      // Ensure we have a valid token for authorization
      if (!this.jwtToken) {
        await this.authorize();
      }
      
      // For this assignment, we'll use mock data instead of making actual API calls
      console.log(`Validating voucher inventory for items:`, items);
      
      // Use the imported mock function to generate inventory validation result
      return generateInventoryValidationResult(items);
    } catch (error) {
      console.error('Voucher validateInventory error:', error);
      throw new Error('Failed to validate inventory with Voucher API');
    }
  }
  
  /**
   * Place an order with Ecom API (using voucher credentials)
   * @param orderData Order data
   * @returns Order result
   */
  async placeOrder(orderData: OrderData): Promise<OrderResult> {
    try {
      // Ensure we have a valid token for authorization
      if (!this.jwtToken) {
        await this.authorize();
      }
      
      // Check location serviceability if address is provided
      if (orderData.address) {
        const isServiceable = await this.checkLocationServiceability(orderData.address.city);
        
        if (!isServiceable) {
          throw new Error('Location is not serviceable');
        }
      }
      
      // Generate mock order ID (in real implementation, this would come from creating the order)
      const mockOrderId = `voucher_order_${Date.now()}`;
      
      // Real API call to confirm the order
      try {
        const response = await httpClient.post(
          `${this.baseUrl}orders/${mockOrderId}/confirm`,
          {
            transaction_id: orderData.transactionId || `txn_${Date.now()}`
          },
          {
            headers: {
              'Authorization': `Bearer ${this.jwtToken}`
            }
          }
        );
        
        if (response.data.is_success) {
          return {
            orderId: response.data.data.order_id,
            status: response.data.data.status,
            estimatedDelivery: undefined, // Not provided in confirm response
            trackingLink: undefined // Not provided in confirm response
          };
        } else {
          throw new Error('Failed to confirm order');
        }
      } catch (error) {
        console.error('Error confirming order:', error);
        // Fallback to mock response if API call fails
        return generateOrderResult(orderData);
      }
    } catch (error) {
      console.error('Voucher placeOrder error:', error);
      throw new Error('Failed to place order with Voucher API');
    }
  }
  
  /**
   * Track an order with Ecom API (using voucher credentials)
   * @param orderId Order ID
   * @returns Order tracking result
   */
  async trackOrder(orderId: string): Promise<OrderTrackingResult> {
    try {
      // Ensure we have a valid token for authorization
      if (!this.jwtToken) {
        await this.authorize();
      }
      
      // Real API call to track the order
      try {
        const response = await httpClient.get(
          `${this.baseUrl}orders/${orderId}/track`,
          {
            headers: {
              'Authorization': `Bearer ${this.jwtToken}`
            }
          }
        );
        
        if (response.data.is_success) {
          const trackData = response.data.data;
          
          return {
            orderId: trackData.merchant_order_id,
            vendorOrderId: trackData.tata_1mg_order_id,
            status: trackData.status,
            estimatedDelivery: trackData.estimated_delivery,
            trackingLink: trackData.tracking_link,
            items: trackData.items?.map((item: any) => ({
              sku: item.sku,
              name: item.name,
              quantity: item.quantity
            }))
          };
        } else {
          throw new Error('Failed to track order');
        }
      } catch (error) {
        console.error('Error tracking order:', error);
        // Fallback to mock response if API call fails
        return generateOrderTrackingResult(orderId);
      }
    } catch (error) {
      console.error('Voucher trackOrder error:', error);
      throw new Error('Failed to track order with Voucher API');
    }
  }
  
  /**
   * Cancel an order with Ecom API (using voucher credentials)
   * @param orderId Order ID
   * @param reason Cancellation reason
   * @returns Order cancellation result
   */
  async cancelOrder(orderId: string, reason: string): Promise<OrderCancellationResult> {
    try {
      // Ensure we have a valid token for authorization
      if (!this.jwtToken) {
        await this.authorize();
      }
      
      // Real API call to cancel the order
      try {
        const response = await httpClient.post(
          `${this.baseUrl}orders/${orderId}/cancel`,
          {
            reason
          },
          {
            headers: {
              'Authorization': `Bearer ${this.jwtToken}`
            }
          }
        );
        
        if (response.data.is_success) {
          const cancelData = response.data.data;
          
          return {
            orderId: cancelData.order_id,
            status: cancelData.status,
            cancellationReason: reason,
            refundInfo: {
              refundId: undefined, // Not provided in response
              amount: 0, // Not provided in response
              status: 'PENDING' // Default status
            }
          };
        } else {
          throw new Error('Failed to cancel order');
        }
      } catch (error) {
        console.error('Error cancelling order:', error);
        // Fallback to mock response if API call fails
        return generateOrderCancellationResult(orderId, reason);
      }
    } catch (error) {
      console.error('Voucher cancelOrder error:', error);
      throw new Error('Failed to cancel order with Voucher API');
    }
  }
  
  /**
   * Check if a location is serviceable
   * @param city City name
   * @returns True if city is serviceable
   */
  private async checkLocationServiceability(city: string): Promise<boolean> {
    if (!city) {
      return false;
    }
    
    try {
      // Real API call to check city serviceability
      try {
        const response = await httpClient.get(`${this.baseUrl}city-serviceable`, {
          headers: {
            'X-Access-Key': this.accessKey
          },
          params: {
            city
          }
        });
        
        if (response.data.is_success) {
          return response.data.data?.serviceable === true;
        } else {
          throw new Error('Failed to check city serviceability');
        }
      } catch (error) {
        console.error('Error checking city serviceability:', error);
        // Fallback to mock check if API call fails
        
        // List of serviceable cities (mock data)
        const serviceableCities = [
          'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata',
          'pune', 'ahmedabad', 'jaipur', 'lucknow', 'surat', 'kanpur',
          'new delhi'
        ];
        
        // Check if city is in the list of serviceable cities
        return serviceableCities.includes(city.toLowerCase());
      }
    } catch (error) {
      console.error('Voucher checkLocationServiceability error:', error);
      return false;
    }
  }
}
