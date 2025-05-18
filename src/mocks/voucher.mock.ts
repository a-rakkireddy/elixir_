/**
 * Mock data for Voucher Vendor API
 */

import { 
  Product, 
  InventoryValidationResult, 
  OrderResult, 
  OrderTrackingResult, 
  OrderCancellationResult,
  InventoryItem
} from '../interfaces/vendor.interface';

/**
 * Mock products for Voucher vendor
 */
export const VOUCHER_PRODUCTS: Product[] = [
  {
    sku: 'Bata4xfRrUnT46Uv4iol',
    name: 'Bata Gift Voucher',
    description: 'Gift voucher for Bata stores',
    price: 100,
    image: 'https://cdn.gyftr.com/comm_engine/stag/images/brands/1593693691875_u3qtc3vzkc4s2qqr.png',
    category: 'Fashion',
    inStock: true,
    vendor: 'voucher',
    type: 'VOUCHER'
  },
  {
    sku: 'Baskin_RobinshStD6pXnAIEG2wi2',
    name: 'Baskin Robbins Gift Voucher',
    description: 'Gift voucher for Baskin Robbins stores',
    price: 100,
    image: 'https://cdn.gyftr.com/comm_engine/stag/images/brands/1593693691875_baskin.png',
    category: 'Food & Beverages',
    inStock: true,
    vendor: 'voucher',
    type: 'VOUCHER'
  },
  {
    sku: 'BenettonRwJ6cqVWqPPML1BH',
    name: 'Benetton Gift Voucher',
    description: 'Gift voucher for Benetton stores',
    price: 500,
    image: 'https://cdn.gyftr.com/comm_engine/stag/images/brands/1593693691875_benetton.png',
    category: 'Fashion',
    inStock: true,
    vendor: 'voucher',
    type: 'VOUCHER'
  },
  {
    sku: 'WestsidemFqa2lBrMls187j0',
    name: 'Westside Gift Voucher',
    description: 'Gift voucher for Westside stores',
    price: 1000,
    image: 'https://cdn.gyftr.com/comm_engine/stag/images/brands/1593693691875_westside.png',
    category: 'Fashion',
    inStock: false,
    vendor: 'voucher',
    type: 'VOUCHER'
  }
];

/**
 * Generate a mock expiry date (1 year from now)
 */
export const getExpiryDate = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
};

/**
 * Mock inventory validation result for Voucher vendor
 */
export const generateInventoryValidationResult = (items: InventoryItem[]): InventoryValidationResult => {
  const validatedItems: { sku: string; requestedQuantity: number; availableQuantity: number; price: number; }[] = [];
  let totalAmount = 0;
  
  items.forEach(item => {
    const product = VOUCHER_PRODUCTS.find(p => p.sku === item.sku);
    if (product) {
      const available = product.inStock !== undefined ? product.inStock : true;
      const availableQuantity = available ? Math.max(1, item.quantity) : 0;
      
      validatedItems.push({
        sku: item.sku,
        requestedQuantity: item.quantity,
        availableQuantity: availableQuantity,
        price: product.price
      });
      
      totalAmount += product.price * availableQuantity;
    } else {
      validatedItems.push({
        sku: item.sku,
        requestedQuantity: item.quantity,
        availableQuantity: 0,
        price: 0
      });
    }
  });
  
  return {
    available: validatedItems.every(item => item.availableQuantity >= item.requestedQuantity),
    items: validatedItems,
    additionalCharges: [],
    totalAmount,
    payableAmount: totalAmount // Total amount is the same as payable amount
  };
};

/**
 * Generate a mock voucher code
 */
export const generateVoucherCode = (brandProductCode: string, denomination: string, index: number): string => {
  return `MOCK-${brandProductCode}-${denomination}-${index}`;
};

/**
 * Generate a mock voucher PIN
 */
export const generateVoucherPin = (): string => {
  return `PIN${Math.floor(1000 + Math.random() * 9000)}`;
};

/**
 * Generate mock voucher details for an order
 */
export const generateVoucherDetails = (
  brandProductCode: string, 
  denomination: string, 
  quantity: number, 
  externalOrderId: string
): any => {
  const voucherCodes = [];
  
  for (let i = 1; i <= quantity; i++) {
    voucherCodes.push({
      VoucherCode: generateVoucherCode(brandProductCode, denomination, i),
      VoucherPin: generateVoucherPin(),
      ExpiryDate: getExpiryDate()
    });
  }
  
  return {
    BrandProductCode: brandProductCode,
    Denomination: denomination,
    Quantity: quantity,
    ExternalOrderId: externalOrderId,
    VoucherCodes: voucherCodes
  };
};

/**
 * Generate a mock order result for Voucher vendor
 */
export const generateOrderResult = (orderData: any): OrderResult => {
  const externalOrderId = `voucher_order_${Date.now()}`;
  
  // Process each item to generate voucher details
  const voucherResults = orderData.items.map((item: any) => {
    const product = VOUCHER_PRODUCTS.find(p => p.sku === item.sku);
    const denomination = product ? product.price.toString() : '100';
    
    return generateVoucherDetails(item.sku, denomination, item.quantity, externalOrderId);
  });
  
  return {
    orderId: externalOrderId,
    status: 'CONFIRMED',
    additionalInfo: {
      vouchers: voucherResults
    }
  };
};

/**
 * Generate a mock order tracking result for Voucher vendor
 */
export const generateOrderTrackingResult = (orderId: string): OrderTrackingResult => {
  return {
    orderId,
    status: 'DELIVERED',
    items: []
  };
};

/**
 * Generate a mock order cancellation result for Voucher vendor
 */
export const generateOrderCancellationResult = (orderId: string, reason: string): OrderCancellationResult => {
  return {
    orderId,
    status: 'CANCELLED',
    cancellationReason: reason,
    refundInfo: {
      amount: 0,
      status: 'NOT_APPLICABLE'
    }
  };
};
