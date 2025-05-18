import { Request, Response, NextFunction } from 'express';
import { EcomVendorService } from '../services/ecom.service';
import { VoucherVendorService } from '../services/voucher.service';
import { IVendor } from '../interfaces/vendor.interface';
import { successResponse, errorResponse } from '../utils/response.util';

/**
 * Marketplace Controller
 * Handles unified API endpoints for multiple vendors
 */
export class MarketplaceController {
  /**
   * Get the appropriate vendor service based on vendor parameter
   * @param vendor Vendor name ('ecom' or 'voucher')
   * @returns Vendor service instance
   */
  private getVendorService(vendor: string): IVendor {
    switch (vendor.toLowerCase()) {
      case 'ecom':
        // In a real app, these would come from environment variables
        return new EcomVendorService('merchant_123', 'access_key_123');
      case 'voucher':
        return new VoucherVendorService();
      default:
        throw new Error(`Unsupported vendor: ${vendor}`);
    }
  }
  
  /**
   * Get products from a vendor
   * @route GET /api/v1/marketplace/products
   */
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { vendor, query = '', ...filters } = req.query;
      
      if (!vendor) {
        return errorResponse(res, 400, 'Vendor parameter is required');
      }
      
      const vendorService = this.getVendorService(vendor as string);
      const products = await vendorService.getProducts(query as string, filters);
      
      return successResponse(res, 200, { products });
    } catch (error: any) {
      console.error('Error in getProducts:', error);
      return errorResponse(res, 500, error.message);
    }
  }
  
  /**
   * Validate inventory items
   * @route POST /api/v1/marketplace/validate-inventory
   */
  async validateInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const { vendor, items } = req.body;
      
      if (!vendor || !items || !Array.isArray(items)) {
        return errorResponse(res, 400, 'Vendor and items array are required');
      }
      
      const vendorService = this.getVendorService(vendor);
      const result = await vendorService.validateInventory(items);
      
      return successResponse(res, 200, result);
    } catch (error: any) {
      console.error('Error in validateInventory:', error);
      return errorResponse(res, 500, error.message);
    }
  }
  
  /**
   * Place an order
   * @route POST /api/v1/marketplace/order
   */
  async placeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { vendor, orderData, address } = req.body;
      
      if (!vendor || !orderData || !orderData.items) {
        return errorResponse(res, 400, 'Vendor and orderData with items are required');
      }
      
      // Check address serviceability if address is provided
      if (address) {
        const isServiceable = this.checkAddressServiceability(address);
        
        if (!isServiceable) {
          return errorResponse(res, 400, 'Address is not serviceable');
        }
      }
      
      // Include address in orderData
      const completeOrderData = {
        ...orderData,
        address
      };
      
      const vendorService = this.getVendorService(vendor);
      const result = await vendorService.placeOrder(completeOrderData);
      
      return successResponse(res, 200, result);
    } catch (error: any) {
      console.error('Error in placeOrder:', error);
      return errorResponse(res, 500, error.message);
    }
  }
  
  /**
   * Track an order
   * @route GET /api/v1/marketplace/order/:orderId/track
   */
  async trackOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const { vendor } = req.query;
      
      if (!vendor) {
        return errorResponse(res, 400, 'Vendor parameter is required');
      }
      
      if (!orderId) {
        return errorResponse(res, 400, 'Order ID is required');
      }
      
      const vendorService = this.getVendorService(vendor as string);
      const result = await vendorService.trackOrder(orderId);
      
      return successResponse(res, 200, result);
    } catch (error: any) {
      console.error('Error in trackOrder:', error);
      return errorResponse(res, 500, error.message);
    }
  }
  
  /**
   * Cancel an order
   * @route POST /api/v1/marketplace/order/:orderId/cancel
   */
  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const { vendor, reason } = req.body;
      
      if (!vendor) {
        return errorResponse(res, 400, 'Vendor parameter is required');
      }
      
      if (!orderId) {
        return errorResponse(res, 400, 'Order ID is required');
      }
      
      if (!reason) {
        return errorResponse(res, 400, 'Cancellation reason is required');
      }
      
      const vendorService = this.getVendorService(vendor);
      const result = await vendorService.cancelOrder(orderId, reason);
      
      return successResponse(res, 200, result);
    } catch (error: any) {
      console.error('Error in cancelOrder:', error);
      return errorResponse(res, 500, error.message);
    }
  }
  
  /**
   * Check if an address is serviceable
   * @param address Address to check
   * @returns True if address is serviceable
   */
  private checkAddressServiceability(address: any): boolean {
    // In a real implementation, this would check if the address is serviceable
    // based on lat-long or other criteria
    
    // For this assignment, we'll just return true for most addresses
    // You could implement more complex logic here
    
    // Mock implementation: only serviceable if city is one of these
    const serviceableCities = ['Mumbai', 'Delhi', 'Bangalore', 'New Delhi', 'Hyderabad', 'Chennai'];
    
    if (!address.city) {
      return false;
    }
    
    return serviceableCities.some(city => 
      address.city.toLowerCase().includes(city.toLowerCase())
    );
  }
}
