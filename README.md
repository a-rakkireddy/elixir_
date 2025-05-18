# Marketplace Integration API

A unified API for integrating with multiple marketplace vendors (ecom and voucher) using a common interface.

## Project Overview

This project implements a backend for a Marketplace API that supports multiple vendors. Each vendor has its own logic for authorization, product search, and order placement, but the client application experiences a unified interface regardless of the vendor.

## API Architecture Understanding

As per my understanding, the two vendor APIs serve different purposes in the marketplace ecosystem:

- **Ecom APIs**: These should be used for core e-commerce functionality including product ordering, authorization, order tracking, and cancellation. They handle physical products with delivery requirements and logistics.

- **Voucher APIs**: These should be used as gift card solutions for specific brands and their products that are limited to particular stores. They represent digital vouchers/coupons rather than physical products, focusing on brand-specific redemption options.

This architecture allows the marketplace to offer both physical products (via Ecom) and digital gift cards (via Voucher) through a single unified interface, while maintaining the distinct business logic required for each.

## Key Features

- Vendor-based product search
- Inventory validation
- Order placement with vendor-specific logic
- Order tracking and cancellation
- Address serviceability check
- API authentication with JWT
- Real Ecom API integration (implemented in dev branch)

## Development Progress

The project is being developed in phases:

1. **Phase 1 (Complete)**: Core API structure with mock data implementations
   - Unified vendor interface
   - Mock implementations for both vendors
   - All API endpoints working with dummy data

2. **Phase 2 (In Progress - Dev Branch)**: Real API Integration
   - JWT token authentication integration with Ecom API
   - Real API calls for order confirmation
   - Real API calls for order tracking
   - Real API calls for order cancellation 
   - City serviceability validation

3. **Phase 3 (Planned)**: Full API Integration
   - Complete integration with all vendor APIs
   - Comprehensive error handling
   - Caching and performance optimizations

  Couldn't do this because of the time consraints, but i gave it my best shot.

## Tech Stack

- Node.js
- TypeScript
- Express
- Axios for HTTP requests
- Crypto for encryption/decryption

## Project Structure

```
marketplace-api/
├── src/
│   ├── config/                 # Configuration files
│   │   └── swagger.ts          # API documentation
│   ├── controllers/            # API route controllers
│   │   └── marketplace.controller.ts
│   ├── interfaces/             # TypeScript interfaces
│   │   └── vendor.interface.ts
│   ├── middleware/             # Express middleware
│   ├── models/                 # Data models (in-memory for this project)
│   ├── routes/                 # API routes
│   │   └── marketplace.routes.ts
│   ├── services/               # Business logic
│   │   ├── ecom.service.ts     # Ecom vendor implementation
│   │   └── voucher.service.ts  # Voucher vendor implementation
│   ├── mocks/                  # Mock data for development
│   │   ├── ecom.mock.ts        # Mock implementations for Ecom vendor
│   │   └── voucher.mock.ts     # Mock implementations for Voucher vendor
│   ├── utils/                  # Utility functions
│   │   ├── http.util.ts        # HTTP request utilities
│   │   ├── encryption.util.ts  # Encryption/decryption for Voucher API
│   │   └── response.util.ts    # Standardized API responses
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
├── .env                        # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Code Implementation Details

### Vendor Interface

The project defines a common interface that all vendor implementations must follow:

```typescript
export interface IVendor {
  authorize(): Promise<string>;
  getProducts(query: string, filters?: any): Promise<Product[]>;
  validateInventory(items: InventoryItem[]): Promise<InventoryValidationResult>;
  placeOrder(orderData: OrderData): Promise<OrderResult>;
  trackOrder(orderId: string): Promise<OrderTrackingResult>;
  cancelOrder(orderId: string, reason: string): Promise<OrderCancellationResult>;
}
```

### Real API Integration (Dev Branch)

In the dev branch, we've implemented real API integrations for the Ecom vendor:

- **Authentication**: Integrated with `/generate-jwt/:merchant_id` endpoint to get JWT tokens with 15-minute expiry
- **Order Management**: 
  - Order confirmation using `/orders/:order_id/confirm`
  - Order tracking using `/orders/:merchant_order_id/track`
  - Order cancellation using `/orders/:order_id/cancel`
- **Location Serviceability**: Implemented real API calls to `/city-serviceable` endpoint

The integration includes proper error handling and fallbacks to mock data when the API calls fail.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
ECOM_MERCHANT_ID=merchant_123
ECOM_ACCESS_KEY=access_key_123
```

### Running the Application

-> npm install
-> npm run build
-> npm run dev

U can test the endpoints in swagger, the swagger url appears in the console after running "npm run dev" command.


### Branch Management

- **main**: Stable version with mock implementations
- **dev**: Development branch with real API integrations

To test the real API integration:

```bash
git checkout dev
npm install
npm run dev
```

## API Endpoints

### Get Products

Retrieves products from the specified vendor.

- **Endpoint:** `GET /api/v1/marketplace/products`
- **Query Parameters:**
  - `vendor` (required): The vendor to retrieve products from (`ecom` or `voucher`)
  - `query` (optional): Search term for products
  - Additional filter parameters specific to each vendor

**Example Request:**
```
GET /api/v1/marketplace/products?vendor=ecom&query=telma
```

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "340679",
        "name": "Telma 40 Tablet",
        "price": 222.1,
        "discountedPrice": null,
        "type": "drug",
        "image": "https://onemg.gumlet.io/a_ignore,w_380,h_380,c_fit,q_auto,f_auto/exeejvtktce67qrqtcfh.png",
        "vendor": "ecom"
      }
    ]
  }
}
```

### Validate Inventory

Validates the availability of products in the inventory.

- **Endpoint:** `POST /api/v1/marketplace/validate-inventory`
- **Request Body:**
```json
{
  "vendor": "ecom",
  "items": [
    {
      "sku": "340679",
      "quantity": 2
    }
  ]
}
```

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "available": true,
    "items": [
      {
        "sku": "340679",
        "requestedQuantity": 2,
        "availableQuantity": 10,
        "price": 157,
        "discountedPrice": 53.38
      }
    ],
    "totalAmount": 106.76,
    "additionalCharges": [
      {
        "type": "handling_fee",
        "amount": 99
      }
    ],
    "payableAmount": 205.76
  }
}
```

### Place Order

Places an order with the specified vendor.

- **Endpoint:** `POST /api/v1/marketplace/order`
- **Request Body:**
```json
{
  "vendor": "ecom",
  "orderData": {
    "items": [
      {
        "sku": "340679",
        "quantity": 2
      }
    ],
    "transactionId": "txn_123456"
  },
  "address": {
    "street": "123 Main St",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001",
    "latitude": 28.6139,
    "longitude": 77.2090
  }
}
```

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "orderId": "order_123",
    "status": "CONFIRMED",
    "estimatedDelivery": "2024-05-20"
  }
}
```

### Track Order

Tracks the status of an order.

- **Endpoint:** `GET /api/v1/marketplace/order/:orderId/track`
- **Query Parameters:**
  - `vendor` (required): The vendor to track the order with (`ecom` or `voucher`)

**Example Request:**
```
GET /api/v1/marketplace/order/order_123/track?vendor=ecom
```

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "orderId": "merchant_order_123",
    "vendorOrderId": "1MG-order_123",
    "status": "CONFIRMED",
    "estimatedDelivery": "2024-05-20",
    "trackingLink": "https://mock.1mg.com/track/merchant_order_123",
    "items": [
      {
        "sku": "340679",
        "name": "Telma 40 Tablet",
        "quantity": 1
      }
    ]
  }
}
```

### Cancel Order

Cancels an order.

- **Endpoint:** `POST /api/v1/marketplace/order/:orderId/cancel`
- **Request Body:**
```json
{
  "vendor": "ecom",
  "reason": "Customer requested cancellation"
}
```

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "orderId": "order_123",
    "status": "CANCELLED",
    "cancellationReason": "Customer requested cancellation",
    "refundInfo": {
      "amount": 0,
      "status": "PENDING"
    }
  }
}
```

## Error Handling

All API endpoints follow standard HTTP status codes and return errors in a consistent format:

```json
{
  "status": "error",
  "error": {
    "code": 400,
    "message": "Invalid request parameters"
  }
}
```

## Implementation Notes

### Vendor Integration

The project uses a common interface (`IVendor`) that both vendor implementations (`EcomVendorService` and `VoucherVendorService`) implement. This allows the controller to work with any vendor through a unified API.

### Encryption for Voucher API

The Voucher API requires AES-256-CBC encryption/decryption for all data exchange. The `encryption.util.ts` file provides utility functions for this purpose.

### Mock Data

For simplicity, some parts of the implementation use mock data instead of making actual API calls. In a production environment, these would be replaced with real API calls.

## Future Improvements

- Add unit and integration tests
- Implement caching for frequently accessed data
- Add authentication and authorization
- Implement logging and monitoring
- Add Swagger/OpenAPI documentation
