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
import { 
  ECOM_PRODUCTS, 
  generateInventoryValidationResult, 
  generateOrderResult, 
  generateOrderTrackingResult, 
  generateOrderCancellationResult 
} from '../mocks/ecom.mock';

/**
 * Ecom Vendor Service implementation
 * Integrates with the Ecom Marketplace API
 */
export class EcomVendorService implements IVendor {
  private baseUrl: string = 'http://staging.joinelixir.club/api/v1/marketplace/';
  private merchantId: string;
  private accessKey: string;
  private jwtToken: string = '';
  private tokenExpiry: number = 0; // Token expiry timestamp
  
  /**
   * Constructor
   * @param merchantId Merchant ID for Ecom API
   * @param accessKey Access Key for non-order specific APIs
   */
  constructor(merchantId: string, accessKey: string) {
    this.merchantId = merchantId;
    this.accessKey = accessKey;
  }
  
  /**
   * Authorize with the Ecom API
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
      console.error('Ecom authorization error:', error);
      throw new Error('Failed to authorize with Ecom API');
    }
  }
  
  /**
   * Get products from Ecom API
   * @param query Search query
   * @param filters Optional filters
   * @returns List of products
   */
  async getProducts(query: string, filters?: any): Promise<Product[]> {
    try {
      // For this assignment, we'll use mock data instead of making actual API calls
      console.log(`Searching for products with query: ${query} and filters:`, filters);
      
      // Use the imported mock products
      let filteredProducts = [...ECOM_PRODUCTS];
      
      // Filter products based on query
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(lowerQuery)
        );
      }
      
      // Apply additional filters if provided
      if (filters) {
        // Apply any specific filters based on the provided filters object
        if (filters.sku) {
          filteredProducts = filteredProducts.filter(product => 
            product.sku === filters.sku
          );
        }
        
        if (filters.category) {
          filteredProducts = filteredProducts.filter(product => 
            product.category === filters.category
          );
        }
      }
      
      return filteredProducts;
    } catch (error) {
      console.error('Ecom getProducts error:', error);
      throw new Error('Failed to get products from Ecom API');
    }
  }
  
  /**
   * Validate inventory items with Ecom API
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
      console.log(`Validating inventory for items:`, items);
      
      // Use the imported mock function to generate inventory validation result
      return generateInventoryValidationResult(items);
    } catch (error) {
      console.error('Ecom validateInventory error:', error);
      throw new Error('Failed to validate inventory with Ecom API');
    }
  }
  
  /**
   * Place an order with Ecom API
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
        const isServiceable = await this.checkLocationServiceability(
          orderData.address.city,
          orderData.address.latitude,
          orderData.address.longitude
        );
        
        if (!isServiceable) {
          throw new Error('Location is not serviceable');
        }
      }
      
      // Generate mock order ID (in real implementation, this would come from creating the order)
      const mockOrderId = `order_${Date.now()}`;
      
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
        console.log(response.data);
        
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
        return generateOrderResult();
      }
    } catch (error) {
      console.error('Ecom placeOrder error:', error);
      throw new Error('Failed to place order with Ecom API');
    }
  }
  
  /**
   * Track an order with Ecom API
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
      console.error('Ecom trackOrder error:', error);
      throw new Error('Failed to track order with Ecom API');
    }
  }
  
  /**
   * Cancel an order with Ecom API
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
      console.error('Ecom cancelOrder error:', error);
      throw new Error('Failed to cancel order with Ecom API');
    }
  }
  
  /**
   * Check if a location is serviceable based on city and/or coordinates
   * @param city City name
   * @param latitude Latitude coordinate
   * @param longitude Longitude coordinate
   * @returns True if location is serviceable
   */
  private async checkLocationServiceability(city?: string, latitude?: number, longitude?: number): Promise<boolean> {
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
        if (city) {
          return serviceableCities.includes(city.toLowerCase());
        }
      }
      
      return false;
    } catch (error) {
      console.error('Ecom checkLocationServiceability error:', error);
      return false;
    }
  }
  
  /**
   * Extract price from string
   * @param priceStr Price string (e.g., "₹222.1")
   * @returns Price as number
   */
  private extractPrice(priceStr?: string): number | undefined {
    if (!priceStr) {
      return undefined;
    }
    
    // Remove currency symbol and parse as float
    return parseFloat(priceStr.replace(/[^\d.-]/g, ''));
  }
  
  /**
   * Calculate total amount from validated items
   * @param items Validated items
   * @returns Total amount
   */
  private calculateTotalAmount(items: Array<{ price: number, discountedPrice?: number, requestedQuantity: number }>): number {
    return items.reduce((total, item) => {
      const itemPrice = item.discountedPrice !== undefined ? item.discountedPrice : item.price;
      return total + (itemPrice * item.requestedQuantity);
    }, 0);
  }
}
