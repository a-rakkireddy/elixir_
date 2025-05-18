****# Marketplace API Project Overview

## Project Purpose
This project implements a unified marketplace API that integrates with two different vendor types:
1. **Ecom Vendor**: Sells physical products that require delivery
2. **Voucher Vendor**: Sells digital gift vouchers/cards that are delivered electronically

## Key Requirements

### API Endpoints
The marketplace API exposes the following endpoints:
- `GET /api/v1/marketplace/products?vendor=ecom|voucher` - Get products from a specific vendor
- `POST /api/v1/marketplace/validate-inventory` - Validate inventory before placing an order
- `POST /api/v1/marketplace/order` - Place an order with a specific vendor
- `GET /api/v1/marketplace/order/:orderId/track?vendor=ecom|voucher` - Track an order
- `POST /api/v1/marketplace/order/:orderId/cancel` - Cancel an order

### Vendor Integration
The API integrates with two different vendor APIs, each with its own authentication and data formats:

#### Ecom Vendor
- **Authentication**: JWT-based authentication
- **Features**:
  - Product catalog retrieval
  - Inventory validation
  - Order placement with delivery address
  - Order tracking with delivery status
  - Order cancellation with refund processing
- **Special Requirements**:
  - Location serviceability validation using city and coordinates
  - Handling fees applied to orders

#### Voucher Vendor
- **Authentication**: Token-based authentication
- **Features**:
  - Gift voucher catalog retrieval
  - Voucher availability validation
  - Voucher purchase and code generation
  - Order status checking
  - Order cancellation
- **Special Requirements**:
  - Encrypted data transmission
  - PIN and voucher code generation

### Implementation Approach
For this project, we've implemented:
1. **Mock Data**: Instead of making actual API calls, we use mock data for development and testing
2. **Service Layer**: Separate service implementations for each vendor type
3. **Common Interface**: Both vendor implementations follow a common interface
4. **Error Handling**: Proper error handling and validation throughout the API

## Technical Stack
- **Language**: TypeScript
- **Framework**: Express.js
- **Architecture**: Service-oriented with dependency injection
- **Security**: CORS support, authorization tokens, data encryption

## Future Enhancements
- Replace mock implementations with actual API integrations
- Add comprehensive logging and monitoring
- Implement caching for better performance
- Add user authentication for the marketplace API
