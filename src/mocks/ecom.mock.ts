/**
 * Mock data for Ecom Vendor API
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
 * Mock products for Ecom vendor
 */
export const ECOM_PRODUCTS: Product[] = [
  {
    sku: '340679',
    name: 'Telma 40 Tablet',
    description: 'Strip of 30 tablets',
    price: 222.1,
    image: 'https://onemg.gumlet.io/a_ignore,w_380,h_380,c_fit,q_auto,f_auto/exeejvtktce67qrqtcfh.png',
    category: 'Prescription',
    inStock: true,
    vendor: 'ecom',
    type: 'drug'
  },
  {
    sku: '340680',
    name: 'Telma H 40 Tablet',
    description: 'Strip of 15 tablets',
    price: 193.5,
    image: 'https://onemg.gumlet.io/a_ignore,w_380,h_380,c_fit,q_auto,f_auto/cropped/dwpegmqvlf7qmvkwvkbq.jpg',
    category: 'Prescription',
    inStock: true,
    vendor: 'ecom',
    type: 'drug'
  },
  {
    sku: '440123',
    name: 'Dolo 650 Tablet',
    description: 'Strip of 15 tablets',
    price: 30.8,
    image: 'https://onemg.gumlet.io/a_ignore,w_380,h_380,c_fit,q_auto,f_auto/cropped/ztpbpahvlgp0hzlwwwim.jpg',
    category: 'Over the Counter',
    inStock: true,
    vendor: 'ecom',
    type: 'otc'
  },
  {
    sku: '440124',
    name: 'Crocin Advance Tablet',
    description: 'Strip of 20 tablets',
    price: 40.5,
    image: 'https://onemg.gumlet.io/a_ignore,w_380,h_380,c_fit,q_auto,f_auto/cropped/s5c9xofnsup5r3p9kzej.jpg',
    category: 'Over the Counter',
    inStock: true,
    vendor: 'ecom',
    type: 'otc'
  },
  {
    sku: '550789',
    name: 'Limcee Vitamin C Tablet',
    description: 'Strip of 15 tablets',
    price: 25.6,
    image: 'https://onemg.gumlet.io/a_ignore,w_380,h_380,c_fit,q_auto,f_auto/cropped/qz1ne6w3xvnrdxpqfied.jpg',
    category: 'Over the Counter',
    inStock: false,
    vendor: 'ecom',
    type: 'otc'
  }
];

/**
 * Mock inventory validation result for Ecom vendor
 */
export const generateInventoryValidationResult = (items: InventoryItem[]): InventoryValidationResult => {
  const validatedItems: { sku: string; requestedQuantity: number; availableQuantity: number; price: number; }[] = [];
  let totalAmount = 0;
  
  items.forEach(item => {
    const product = ECOM_PRODUCTS.find(p => p.sku === item.sku);
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
  
  // Add handling fee
  const handlingFee = 99;
  totalAmount += handlingFee;
  
  return {
    available: validatedItems.every(item => item.availableQuantity >= item.requestedQuantity),
    items: validatedItems,
    additionalCharges: [
      {
        type: 'handling_fee',
        amount: handlingFee,
        description: 'Handling Fee'
      }
    ],
    totalAmount,
    payableAmount: totalAmount // Total amount is the same as payable amount
  };
};

/**
 * Generate a mock order result for Ecom vendor
 */
export const generateOrderResult = (): OrderResult => {
  return {
    orderId: `order_${Date.now()}`,
    status: 'CONFIRMED',
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
  };
};

/**
 * Generate a mock order tracking result for Ecom vendor
 */
export const generateOrderTrackingResult = (orderId: string): OrderTrackingResult => {
  const vendorOrderId = `1MG-${orderId.replace('order_', '')}`;
  
  return {
    orderId,
    vendorOrderId,
    status: 'DELIVERED',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
    trackingLink: `https://mock.1mg.com/track/${orderId}`,
    items: [
      {
        sku: '340679',
        name: 'Telma 40 Tablet',
        quantity: 1
      }
    ]
  };
};

/**
 * Generate a mock order cancellation result for Ecom vendor
 */
export const generateOrderCancellationResult = (orderId: string, reason: string): OrderCancellationResult => {
  return {
    orderId,
    status: 'CANCELLED',
    cancellationReason: reason,
    refundInfo: {
      refundId: `refund_${Date.now()}`,
      amount: 415.5,
      status: 'PENDING'
    }
  };
};
