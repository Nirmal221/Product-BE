import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Products Backend API',
    version: '1.0.0',
    description: 'A RESTful API for managing products (shoes, t-shirts, etc.) inventory with MongoDB and TypeScript',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Development server',
    },
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  components: {
    schemas: {
      SizeVariant: {
        type: 'object',
        required: ['size', 'stock'],
        properties: {
          size: {
            oneOf: [
              {
                type: 'number',
                description: 'Numeric size (for shoes: 8, 9, 10, etc.)',
                minimum: 1,
                maximum: 50,
                example: 8,
              },
              {
                type: 'string',
                description: 'String size (for t-shirts: S, M, L, XL, etc.)',
                example: 'M',
              }
            ],
            description: 'Product size - can be a number (for shoes) or string (for t-shirts)',
          },
          stock: {
            type: 'number',
            description: 'Stock quantity for this size',
            minimum: 0,
            example: 10,
          },
        },
      },
      ColorVariant: {
        type: 'object',
        required: ['color', 'sizes'],
        properties: {
          color: {
            type: 'string',
            description: 'Color name',
            example: 'black',
          },
          sizes: {
            type: 'array',
            description: 'Array of size variants with stock',
            items: {
              $ref: '#/components/schemas/SizeVariant',
            },
          },
          images: {
            type: 'array',
            description: 'Color-specific images',
            items: {
              type: 'string',
            },
            example: ['black-1.jpg', 'black-2.jpg'],
          },
        },
      },
      Product: {
        type: 'object',
        required: ['name', 'brand', 'productType', 'price', 'variants'],
        properties: {
          _id: {
            type: 'string',
            description: 'Product ID',
            example: '507f1f77bcf86cd799439011',
          },
          name: {
            type: 'string',
            description: 'Product name',
            example: 'Nike Air Max',
          },
          brand: {
            type: 'string',
            description: 'Brand ObjectId reference (must reference an existing Brand)',
            example: '507f1f77bcf86cd799439012',
            pattern: '^[0-9a-fA-F]{24}$',
          },
          productType: {
            type: 'string',
            description: 'Product type ObjectId reference (must reference an existing ProductType)',
            example: '507f1f77bcf86cd799439011',
            pattern: '^[0-9a-fA-F]{24}$',
          },
          description: {
            type: 'string',
            description: 'Product description',
            example: 'Comfortable running shoes',
          },
          price: {
            type: 'number',
            description: 'Price in USD',
            minimum: 0,
            example: 129.99,
          },
          discountPrice: {
            type: 'number',
            description: 'Discounted price in USD',
            minimum: 0,
            example: 99.99,
          },
          category: {
            type: 'string',
            description: 'Product category (varies by product type)',
            example: 'sneakers',
          },
          gender: {
            type: 'string',
            enum: ['men', 'women', 'unisex', 'kids'],
            description: 'Target gender',
            example: 'unisex',
          },
          images: {
            type: 'array',
            description: 'General product images',
            items: {
              type: 'string',
            },
            example: ['product-1.jpg', 'product-2.jpg'],
          },
          variants: {
            type: 'array',
            description: 'Array of color variants with sizes and stock',
            items: {
              $ref: '#/components/schemas/ColorVariant',
            },
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the product is active',
            example: true,
          },
          rating: {
            type: 'object',
            properties: {
              average: {
                type: 'number',
                minimum: 0,
                maximum: 5,
                example: 4.5,
              },
              count: {
                type: 'number',
                minimum: 0,
                example: 120,
              },
            },
          },
          inStock: {
            type: 'boolean',
            description: 'Virtual field - true if any color-size has stock > 0',
            example: true,
          },
          totalStock: {
            type: 'number',
            description: 'Virtual field - sum of all color-size stocks',
            example: 25,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-12T10:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-12T10:00:00.000Z',
          },
        },
      },
      CreateProductRequest: {
        type: 'object',
        required: ['name', 'brand', 'productType', 'category', 'price', 'variants'],
        properties: {
          name: {
            type: 'string',
            description: 'Product name',
            example: 'Cotton T-Shirt',
            maxLength: 200,
          },
          brand: {
            type: 'string',
            description: 'Brand ObjectId reference (must reference an existing and active Brand)',
            example: '507f1f77bcf86cd799439012',
            pattern: '^[0-9a-fA-F]{24}$',
          },
          productType: {
            type: 'string',
            description: 'Product type ObjectId reference (must reference an existing and active ProductType)',
            example: '507f1f77bcf86cd799439011',
            pattern: '^[0-9a-fA-F]{24}$',
          },
          category: {
            type: 'string',
            description: 'Product category (e.g., casual, graphic, polo for t-shirts)',
            example: 'casual',
            required: true,
          },
          gender: {
            type: 'string',
            enum: ['men', 'women', 'unisex', 'kids'],
            description: 'Target gender',
            example: 'unisex',
            default: 'unisex',
          },
          description: {
            type: 'string',
            description: 'Product description',
            example: 'Comfortable 100% cotton t-shirt',
            maxLength: 1000,
          },
          price: {
            type: 'number',
            description: 'Price in USD',
            minimum: 0,
            example: 29.99,
          },
          discountPrice: {
            type: 'number',
            description: 'Discounted price in USD',
            minimum: 0,
            example: 24.99,
          },
          variants: {
            type: 'array',
            description: 'Array of color variants with sizes and stock',
            minItems: 1,
            items: {
              $ref: '#/components/schemas/ColorVariant',
            },
            example: [
              {
                color: 'black',
                sizes: [
                  { size: 'S', stock: 20 },
                  { size: 'M', stock: 25 },
                  { size: 'L', stock: 15 }
                ],
                images: ['black-tshirt-1.jpg']
              },
              {
                color: 'white',
                sizes: [
                  { size: 'S', stock: 18 },
                  { size: 'M', stock: 22 },
                  { size: 'L', stock: 12 }
                ]
              }
            ],
          },
          images: {
            type: 'array',
            description: 'General product images',
            items: {
              type: 'string',
            },
            example: ['product-main-1.jpg', 'product-main-2.jpg'],
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the product is active',
            example: true,
            default: true,
          },
        },
      },
      UpdateStockRequest: {
        type: 'object',
        required: ['color', 'size', 'quantity'],
        properties: {
          color: {
            type: 'string',
            example: 'black',
          },
          size: {
            oneOf: [
              { type: 'number', example: 8 },
              { type: 'string', example: 'M' }
            ],
            description: 'Size - number for shoes (8, 9, 10) or string for t-shirts (S, M, L, XL)',
            example: 8,
          },
          quantity: {
            type: 'number',
            description: 'Change in stock (can be positive or negative)',
            example: -5,
          },
        },
      },
      BulkStockUpdateRequest: {
        type: 'object',
        required: ['variants'],
        properties: {
          variants: {
            type: 'array',
            description: 'Array of color variants with size updates',
            items: {
              type: 'object',
              required: ['color', 'sizes'],
              properties: {
                color: {
                  type: 'string',
                  example: 'black',
                },
                sizes: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['size', 'quantity'],
                    properties: {
                      size: {
                        oneOf: [
                          { type: 'number', example: 8 },
                          { type: 'string', example: 'M' }
                        ],
                        description: 'Size - number for shoes or string for t-shirts',
                        example: 8,
                      },
                      quantity: {
                        type: 'number',
                        description: 'Change in stock (can be positive or negative)',
                        example: -5,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
          errors: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Array of error messages',
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                example: 1,
              },
              limit: {
                type: 'number',
                example: 10,
              },
              total: {
                type: 'number',
                example: 100,
              },
              pages: {
                type: 'number',
                example: 10,
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            example: 'Error message',
          },
          errors: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      },
      ProductType: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          _id: {
            type: 'string',
            description: 'Product type ID',
            example: '507f1f77bcf86cd799439011',
          },
          name: {
            type: 'string',
            description: 'Product type name',
            example: 'T-Shirts',
            maxLength: 100,
          },
          slug: {
            type: 'string',
            description: 'URL-friendly identifier',
            example: 't-shirts',
            pattern: '^[a-z0-9-]+$',
          },
          description: {
            type: 'string',
            description: 'Product type description',
            example: 'Comfortable cotton t-shirts',
            maxLength: 500,
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the product type is active',
            example: true,
            default: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-12T10:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-12T10:00:00.000Z',
          },
        },
      },
      CreateProductTypeRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            description: 'Product type name',
            example: 'T-Shirts',
            maxLength: 100,
          },
          slug: {
            type: 'string',
            description: 'URL-friendly identifier (auto-generated from name if not provided)',
            example: 't-shirts',
            pattern: '^[a-z0-9-]+$',
          },
          description: {
            type: 'string',
            description: 'Product type description',
            example: 'Comfortable cotton t-shirts',
            maxLength: 500,
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the product type is active',
            example: true,
            default: true,
          },
        },
      },
      UpdateProductTypeRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Product type name',
            example: 'T-Shirts',
            maxLength: 100,
          },
          slug: {
            type: 'string',
            description: 'URL-friendly identifier',
            example: 't-shirts',
            pattern: '^[a-z0-9-]+$',
          },
          description: {
            type: 'string',
            description: 'Product type description',
            example: 'Comfortable cotton t-shirts',
            maxLength: 500,
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the product type is active',
            example: true,
          },
        },
      },
      Brand: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          _id: {
            type: 'string',
            description: 'Brand ID',
            example: '507f1f77bcf86cd799439012',
          },
          name: {
            type: 'string',
            description: 'Brand name',
            example: 'Nike',
            maxLength: 100,
          },
          slug: {
            type: 'string',
            description: 'URL-friendly identifier',
            example: 'nike',
            pattern: '^[a-z0-9-]+$',
          },
          description: {
            type: 'string',
            description: 'Brand description',
            example: 'Just Do It',
            maxLength: 500,
          },
          logo: {
            type: 'string',
            description: 'URL to brand logo',
            example: 'https://example.com/nike-logo.png',
            maxLength: 500,
          },
          website: {
            type: 'string',
            description: 'Brand website URL',
            example: 'https://www.nike.com',
            maxLength: 500,
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the brand is active',
            example: true,
            default: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-12T10:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-12T10:00:00.000Z',
          },
        },
      },
      CreateBrandRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: {
            type: 'string',
            description: 'Brand name',
            example: 'Nike',
            maxLength: 100,
          },
          slug: {
            type: 'string',
            description: 'URL-friendly identifier (auto-generated from name if not provided)',
            example: 'nike',
            pattern: '^[a-z0-9-]+$',
          },
          description: {
            type: 'string',
            description: 'Brand description',
            example: 'Just Do It',
            maxLength: 500,
          },
          logo: {
            type: 'string',
            description: 'URL to brand logo',
            example: 'https://example.com/nike-logo.png',
            maxLength: 500,
          },
          website: {
            type: 'string',
            description: 'Brand website URL (must start with http:// or https://)',
            example: 'https://www.nike.com',
            maxLength: 500,
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the brand is active',
            example: true,
            default: true,
          },
        },
      },
      UpdateBrandRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Brand name',
            example: 'Nike',
            maxLength: 100,
          },
          slug: {
            type: 'string',
            description: 'URL-friendly identifier',
            example: 'nike',
            pattern: '^[a-z0-9-]+$',
          },
          description: {
            type: 'string',
            description: 'Brand description',
            example: 'Just Do It',
            maxLength: 500,
          },
          logo: {
            type: 'string',
            description: 'URL to brand logo',
            example: 'https://example.com/nike-logo.png',
            maxLength: 500,
          },
          website: {
            type: 'string',
            description: 'Brand website URL (must start with http:// or https://)',
            example: 'https://www.nike.com',
            maxLength: 500,
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the brand is active',
            example: true,
          },
        },
      },
      ImageUploadResponse: {
        type: 'object',
        properties: {
          publicId: {
            type: 'string',
            description: 'Cloudinary public ID',
            example: 'products/image-123',
          },
          url: {
            type: 'string',
            description: 'Cloudinary URL (HTTP)',
            example: 'http://res.cloudinary.com/de74gcchm/image/upload/v123/products/image-123.jpg',
          },
          secureUrl: {
            type: 'string',
            description: 'Cloudinary secure URL (HTTPS) - Use this in your application',
            example: 'https://res.cloudinary.com/de74gcchm/image/upload/v123/products/image-123.jpg',
          },
          width: {
            type: 'number',
            description: 'Image width in pixels',
            example: 1920,
          },
          height: {
            type: 'number',
            description: 'Image height in pixels',
            example: 1080,
          },
          format: {
            type: 'string',
            description: 'Image format',
            example: 'jpg',
          },
          bytes: {
            type: 'number',
            description: 'File size in bytes',
            example: 245678,
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints',
    },
    {
      name: 'Products',
      description: 'Product management endpoints (shoes, t-shirts, etc.)',
    },
    {
      name: 'Product Types',
      description: 'Product type management endpoints',
    },
    {
      name: 'Brands',
      description: 'Brand management endpoints',
    },
    {
      name: 'Images',
      description: 'Image upload endpoints using Cloudinary',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/index.ts'], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);
