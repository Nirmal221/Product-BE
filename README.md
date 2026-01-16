# Products Backend API

A Node.js backend API built with **TypeScript** for managing products (shoes, t-shirts, etc.) inventory with MongoDB integration.

## Features

- ✅ **TypeScript** for type safety and better developer experience
- ✅ MongoDB database integration with Mongoose
- ✅ **Generic product management** - Supports multiple product types (shoes, t-shirts, etc.)
- ✅ RESTful API endpoints for products management
- ✅ **Swagger/OpenAPI documentation** - Interactive API documentation
- ✅ Advanced filtering and search capabilities
- ✅ Pagination support
- ✅ Error handling middleware
- ✅ Security headers with Helmet
- ✅ CORS enabled
- ✅ Request logging with Morgan

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- Yarn or npm

## Installation

1. Install dependencies:
```bash
yarn install
# or
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection string:

**Option 1: Full connection string (recommended)**
```env
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/products

# For MongoDB Atlas (Cluster: ShoesDb):
MONGODB_URI=mongodb+srv://username:password@ShoesDb.mongodb.net/products?retryWrites=true&w=majority
```

**Option 2: Separate base URI and database name**
```env
MONGODB_BASE_URI=mongodb+srv://username:password@ShoesDb.mongodb.net
DB_NAME=products
```

**Note:** The default database is `products` to support all product types. You can change it to any database name you want by updating the `MONGODB_URI` or `DB_NAME` in your `.env` file.

## Running the Application

### Development Mode
```bash
yarn dev
# or
npm run dev
```
This uses `nodemon` with `tsx` to automatically restart the server when files change. The server will watch for changes in the `src` directory and restart automatically.

### Production Mode
First, build the TypeScript code:
```bash
yarn build
# or
npm run build
```

Then start the server:
```bash
yarn start
# or
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

### API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
```
http://localhost:3000/api-docs
```

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality to test endpoints
- Example requests and responses

## API Endpoints

### Health Check
- `GET /health` - Check server status

### Products

- `GET /api/products` - Get all products (with filtering, pagination, and search)
  - Query parameters:
    - `productType` - Filter by product type (shoes, t-shirts, etc.)
    - `category` - Filter by category (varies by product type)
    - `gender` - Filter by gender (men, women, unisex, kids)
    - `brand` - Filter by brand (case-insensitive)
    - `minPrice` - Minimum price filter
    - `maxPrice` - Maximum price filter
    - `inStock` - Filter by stock availability (true/false)
    - `search` - Text search across name, description, and brand
    - `sort` - Sort field (default: -createdAt)
    - `page` - Page number (default: 1)
    - `limit` - Items per page (default: 10)

- `GET /api/products/:id` - Get a single product by ID

- `POST /api/products` - Create a new product
  ```json
  {
    "name": "Nike Air Max",
    "brand": "Nike",
    "description": "Comfortable running shoes",
    "price": 129.99,
    "sizes": [7, 8, 9, 10, 11],
    "colors": ["black", "white"],
    "category": "sneakers",
    "gender": "unisex",
    "images": ["url1", "url2"],
    "colorSizeStock": {
      "black": {
        "8": 15,
        "9": 10,
        "10": 5
      },
      "white": {
        "8": 12,
        "9": 8
      }
    }
  }
  ```

- `PUT /api/shoes/:id` - Update a shoe by ID

- `PATCH /api/shoes/:id/stock` - Update shoe stock for a specific color-size combination
  ```json
  {
    "color": "black",
    "size": 8,
    "quantity": -5
  }
  ```

- `PATCH /api/shoes/:id/stock/bulk` - Update stock for multiple color-size combinations at once
  ```json
  {
    "colorSizeStock": {
      "black": {
        "8": 10,
        "9": 5
      },
      "white": {
        "8": 15,
        "9": -2
      }
    }
  }
  ```

- `GET /api/shoes/:id/stock/:color` - Get total stock for a specific color (sum across all sizes)

- `GET /api/shoes/:id/stock/:color/:size` - Get stock for a specific color-size combination

- `DELETE /api/shoes/:id` - Delete a shoe (soft delete)

## Product Model Schema

```javascript
{
  name: String (required),
  brand: String (required),
  productType: String (required, enum: shoes, t-shirts), // Product type identifier
  description: String,
  price: Number (required, min: 0),
  discountPrice: Number,
  category: String (required), // Category varies by product type
  gender: String (enum: men, women, unisex, kids),
  images: [String], // General product images
  variants: Array<ColorVariant> (required), // Array of color variants with sizes and stock
  isActive: Boolean (default: true),
  rating: {
    average: Number (0-5),
    count: Number
  },
  createdAt: Date,
  updatedAt: Date,
  // Virtual fields:
  inStock: Boolean, // true if any color-size has stock > 0
  totalStock: Number // sum of all color-size stocks
}
```

### Product Types

The API supports multiple product types:
- **shoes** - Footwear products
- **t-shirts** - T-shirt products
- Add more types as needed

### Color-Size Stock

The product model supports **color-size stock tracking**. Each product can have different stock quantities for each color-size combination.

**Example for Shoes:**
```json
{
  "name": "Nike Air Max",
  "brand": "Nike",
  "productType": "shoes",
  "category": "sneakers",
  "variants": [
    {
      "color": "black",
      "sizes": [
        { "size": 8, "stock": 15 },
        { "size": 9, "stock": 10 }
      ]
    },
    {
      "color": "white",
      "sizes": [
        { "size": 8, "stock": 12 },
        { "size": 9, "stock": 8 }
      ]
    }
  ]
}
```

**Example for T-Shirts:**
```json
{
  "name": "Cotton T-Shirt",
  "brand": "Nike",
  "productType": "t-shirts",
  "category": "casual",
  "variants": [
    {
      "color": "black",
      "sizes": [
        { "size": "S", "stock": 20 },
        { "size": "M", "stock": 25 },
        { "size": "L", "stock": 15 }
      ]
    }
  ]
}
```

This allows you to:
- Track inventory separately for each color-size combination
- Update stock for specific color-size combinations
- Query products by type (shoes, t-shirts, etc.)
- Get total stock across all colors and sizes (via `totalStock` virtual field)

## Project Structure

```
shoes-BE/
├── src/
│   ├── config/
│   │   └── database.ts          # MongoDB connection configuration
│   ├── controllers/
│   │   └── shoeController.ts    # Shoe business logic
│   ├── middleware/
│   │   └── errorHandler.ts      # Error handling middleware
│   ├── models/
│   │   └── Shoe.ts              # Shoe Mongoose model
│   ├── routes/
│   │   └── shoeRoutes.ts         # Shoe API routes
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── index.ts                 # Application entry point
├── dist/                        # Compiled JavaScript (generated)
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore file
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## Example API Usage

### Get all products with filters
```bash
# Get all shoes
GET http://localhost:3000/api/products?productType=shoes&category=sneakers&minPrice=50&maxPrice=200&page=1&limit=10

# Get all t-shirts
GET http://localhost:3000/api/products?productType=t-shirts&category=casual

# Get all products
GET http://localhost:3000/api/products?minPrice=50&maxPrice=200&page=1&limit=10
```

### Search products
```bash
GET http://localhost:3000/api/products?search=nike
```

### Create a new product (Shoes)
```bash
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "name": "Adidas Ultraboost",
  "brand": "Adidas",
  "productType": "shoes",
  "price": 180.00,
  "category": "athletic",
  "variants": [
    {
      "color": "black",
      "sizes": [
        { "size": 8, "stock": 15 },
        { "size": 9, "stock": 10 }
      ]
    },
    {
      "color": "white",
      "sizes": [
        { "size": 8, "stock": 12 },
        { "size": 9, "stock": 8 }
      ]
    }
  ]
}
```

### Create a new product (T-Shirts)
```bash
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "name": "Cotton T-Shirt",
  "brand": "Nike",
  "productType": "t-shirts",
  "price": 29.99,
  "category": "casual",
  "variants": [
    {
      "color": "black",
      "sizes": [
        { "size": "S", "stock": 20 },
        { "size": "M", "stock": 25 },
        { "size": "L", "stock": 15 }
      ]
    }
  ]
}
```

### Update stock for a specific color-size combination
```bash
PATCH http://localhost:3000/api/products/:id/stock
Content-Type: application/json

{
  "color": "black",
  "size": 8,
  "quantity": -5
}
```

### Update stock for multiple color-size combinations
```bash
PATCH http://localhost:3000/api/products/:id/stock/bulk
Content-Type: application/json

{
  "variants": [
    {
      "color": "black",
      "sizes": [
        { "size": 8, "quantity": 10 },
        { "size": 9, "quantity": 5 }
      ]
    },
    {
      "color": "white",
      "sizes": [
        { "size": 8, "quantity": 15 },
        { "size": 9, "quantity": -2 }
      ]
    }
  ]
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error details"]
}
```

## TypeScript

This project is written in TypeScript for:
- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete and IntelliSense
- **Self-Documenting Code**: Types serve as documentation
- **Refactoring Safety**: Easier to refactor with confidence

The project uses:
- `tsx` for development (runs TypeScript directly)
- `tsc` for production builds (compiles to JavaScript in `dist/` folder)

## Security

- Helmet.js for security headers
- Input validation with Mongoose
- Environment variables for sensitive data
- CORS enabled for cross-origin requests
- TypeScript for type-safe code

## License

ISC
