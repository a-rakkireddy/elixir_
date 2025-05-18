import swaggerJsdoc from 'swagger-jsdoc';

// Define version manually to avoid importing from package.json
const version = '1.0.0';

// Define options type explicitly
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Marketplace API Documentation',
      version,
      description: 'API documentation for the Marketplace API that integrates with multiple vendors',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['sku', 'name', 'price', 'inStock', 'vendor'],
          properties: {
            sku: {
              type: 'string',
              description: 'Unique identifier for the product',
            },
            name: {
              type: 'string',
              description: 'Name of the product',
            },
            description: {
              type: 'string',
              description: 'Description of the product',
            },
            price: {
              type: 'number',
              description: 'Price of the product',
            },
            image: {
              type: 'string',
              description: 'URL to the product image',
            },
            category: {
              type: 'string',
              description: 'Category of the product',
            },
            inStock: {
              type: 'boolean',
              description: 'Whether the product is in stock',
            },
            vendor: {
              type: 'string',
              enum: ['ecom', 'voucher'],
              description: 'Vendor of the product',
            },
            type: {
              type: 'string',
              description: 'Type of the product',
            },
          },
        },
        InventoryItem: {
          type: 'object',
          required: ['sku', 'quantity'],
          properties: {
            sku: {
              type: 'string',
              description: 'Product SKU',
            },
            quantity: {
              type: 'number',
              description: 'Quantity of the product',
            },
          },
        },
        InventoryValidationResult: {
          type: 'object',
          required: ['available', 'items', 'totalAmount', 'payableAmount'],
          properties: {
            available: {
              type: 'boolean',
              description: 'Whether all items are available in the requested quantity',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sku: {
                    type: 'string',
                    description: 'Product SKU',
                  },
                  requestedQuantity: {
                    type: 'number',
                    description: 'Requested quantity',
                  },
                  availableQuantity: {
                    type: 'number',
                    description: 'Available quantity',
                  },
                  price: {
                    type: 'number',
                    description: 'Price per unit',
                  },
                  totalPrice: {
                    type: 'number',
                    description: 'Total price for this item',
                  },
                },
              },
            },
            totalAmount: {
              type: 'number',
              description: 'Total amount for all items',
            },
            payableAmount: {
              type: 'number',
              description: 'Payable amount after applying any fees or discounts',
            },
            handlingFee: {
              type: 'number',
              description: 'Handling fee (applicable for ecom vendor)',
            },
          },
        },
        Address: {
          type: 'object',
          properties: {
            line1: {
              type: 'string',
              description: 'Address line 1',
            },
            line2: {
              type: 'string',
              description: 'Address line 2',
            },
            city: {
              type: 'string',
              description: 'City',
            },
            state: {
              type: 'string',
              description: 'State',
            },
            pincode: {
              type: 'string',
              description: 'Pincode',
            },
            latitude: {
              type: 'number',
              description: 'Latitude coordinate',
            },
            longitude: {
              type: 'number',
              description: 'Longitude coordinate',
            },
          },
        },
        OrderData: {
          type: 'object',
          required: ['vendor', 'items'],
          properties: {
            vendor: {
              type: 'string',
              enum: ['ecom', 'voucher'],
              description: 'Vendor type',
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/InventoryItem',
              },
            },
            address: {
              $ref: '#/components/schemas/Address',
            },
            paymentMethod: {
              type: 'string',
              description: 'Payment method',
            },
            customerDetails: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'Customer name',
                },
                email: {
                  type: 'string',
                  description: 'Customer email',
                },
                phone: {
                  type: 'string',
                  description: 'Customer phone',
                },
              },
            },
          },
        },
        OrderResult: {
          type: 'object',
          required: ['orderId', 'status', 'items', 'totalAmount'],
          properties: {
            orderId: {
              type: 'string',
              description: 'Order ID',
            },
            status: {
              type: 'string',
              description: 'Order status',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sku: {
                    type: 'string',
                    description: 'Product SKU',
                  },
                  quantity: {
                    type: 'number',
                    description: 'Quantity',
                  },
                  price: {
                    type: 'number',
                    description: 'Price per unit',
                  },
                  totalPrice: {
                    type: 'number',
                    description: 'Total price for this item',
                  },
                },
              },
            },
            totalAmount: {
              type: 'number',
              description: 'Total amount',
            },
            payableAmount: {
              type: 'number',
              description: 'Payable amount',
            },
            estimatedDelivery: {
              type: 'string',
              description: 'Estimated delivery date/time',
            },
            voucherDetails: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sku: {
                    type: 'string',
                    description: 'Voucher SKU',
                  },
                  code: {
                    type: 'string',
                    description: 'Voucher code',
                  },
                  pin: {
                    type: 'string',
                    description: 'Voucher PIN',
                  },
                  expiryDate: {
                    type: 'string',
                    description: 'Voucher expiry date',
                  },
                },
              },
            },
          },
        },
        TrackingResult: {
          type: 'object',
          required: ['orderId', 'status'],
          properties: {
            orderId: {
              type: 'string',
              description: 'Order ID',
            },
            status: {
              type: 'string',
              description: 'Order status',
            },
            trackingId: {
              type: 'string',
              description: 'Tracking ID',
            },
            trackingUrl: {
              type: 'string',
              description: 'Tracking URL',
            },
            estimatedDelivery: {
              type: 'string',
              description: 'Estimated delivery date/time',
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  sku: {
                    type: 'string',
                    description: 'Product SKU',
                  },
                  status: {
                    type: 'string',
                    description: 'Item status',
                  },
                },
              },
            },
          },
        },
        CancellationResult: {
          type: 'object',
          required: ['orderId', 'status'],
          properties: {
            orderId: {
              type: 'string',
              description: 'Order ID',
            },
            status: {
              type: 'string',
              description: 'Order status after cancellation',
            },
            cancellationReason: {
              type: 'string',
              description: 'Reason for cancellation',
            },
            refundInfo: {
              type: 'object',
              properties: {
                refundId: {
                  type: 'string',
                  description: 'Refund ID',
                },
                amount: {
                  type: 'number',
                  description: 'Refund amount',
                },
                status: {
                  type: 'string',
                  description: 'Refund status',
                },
              },
            },
          },
        },
        Error: {
          type: 'object',
          required: ['status', 'error'],
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'number',
                  example: 400,
                },
                message: {
                  type: 'string',
                  example: 'Bad Request',
                },
                details: {
                  type: 'string',
                  example: 'Invalid vendor specified',
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          required: ['status', 'data'],
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
      },
      parameters: {
        vendorParam: {
          name: 'vendor',
          in: 'query',
          description: 'Vendor type (ecom or voucher)',
          required: true,
          schema: {
            type: 'string',
            enum: ['ecom', 'voucher'],
          },
        },
        orderIdParam: {
          name: 'orderId',
          in: 'path',
          description: 'Order ID',
          required: true,
          schema: {
            type: 'string',
          },
        },
      },
      responses: {
        BadRequest: {
          description: 'Bad Request',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFound: {
          description: 'Resource Not Found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const specs = swaggerJsdoc(options);
