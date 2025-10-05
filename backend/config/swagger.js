const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Textile Factory Inventory API',
      version: '1.0.0',
      description: 'API for managing textile factory inventory, products, and stock movements',
      contact: {
        name: 'API Support',
        email: 'support@textilefactory.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Product: {
          type: 'object',
          required: ['product_code', 'cloth_type', 'fabric_type', 'color', 'size_set'],
          properties: {
            id: {
              type: 'integer',
              description: 'Auto-generated product ID'
            },
            product_code: {
              type: 'string',
              description: 'Unique product code',
              example: '22011'
            },
            cloth_type: {
              type: 'string',
              enum: ['DRESS', 'BLOUSE', 'SKIRT', 'TOP', 'PANTS'],
              description: 'Type of clothing'
            },
            fabric_type: {
              type: 'string',
              enum: ['COTTON', 'SILK', 'DENIM', 'LINEN', 'POLYESTER', 'WOOL'],
              description: 'Type of fabric'
            },
            color: {
              type: 'string',
              description: 'Product color',
              example: 'Blue'
            },
            size_set: {
              type: 'string',
              enum: ['STANDARD', 'PLUS'],
              description: 'Size set category'
            },
            unit_price: {
              type: 'number',
              format: 'float',
              description: 'Price per set',
              example: 29.99
            },
            description: {
              type: 'string',
              description: 'Product description'
            }
          }
        },
        Inventory: {
          type: 'object',
          properties: {
            product_id: {
              type: 'integer',
              description: 'Product ID'
            },
            stock_quantity: {
              type: 'integer',
              description: 'Current stock quantity',
              example: 50
            },
            low_stock_threshold: {
              type: 'integer',
              description: 'Low stock alert threshold',
              example: 10
            }
          }
        },
        StockMovement: {
          type: 'object',
          required: ['product_id', 'movement_type', 'quantity', 'reason'],
          properties: {
            product_id: {
              type: 'integer',
              description: 'Product ID'
            },
            movement_type: {
              type: 'string',
              enum: ['IN', 'OUT'],
              description: 'Type of movement'
            },
            quantity: {
              type: 'integer',
              description: 'Number of sets',
              example: 25
            },
            reason: {
              type: 'string',
              enum: ['PURCHASE', 'SALE', 'DAMAGE', 'RETURN', 'ADJUSTMENT'],
              description: 'Reason for movement'
            },
            notes: {
              type: 'string',
              description: 'Additional notes'
            },
            created_by: {
              type: 'string',
              description: 'User who created the movement',
              example: 'admin'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type'
            },
            message: {
              type: 'string',
              description: 'Error description'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            }
          }
        }
      },
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer'
        }
      }
    }
  },
  apis: ['./routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Textile Inventory API Docs'
  }));
};