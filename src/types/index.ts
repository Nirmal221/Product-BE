import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';

// Product types
export type ProductType = 'shoes' | 't-shirts' | string;

// Generic product category (can be customized per product type)
export type ProductCategory = string;

// Gender types
export type Gender = 'men' | 'women' | 'unisex' | 'kids';

// Shoe-specific categories (for backward compatibility and type safety)
export type ShoeCategory = 
  | 'sneakers' 
  | 'boots' 
  | 'sandals' 
  | 'heels' 
  | 'flats' 
  | 'athletic' 
  | 'casual' 
  | 'formal' 
  | 'other';

// T-shirt categories
export type TShirtCategory = 
  | 'casual' 
  | 'formal' 
  | 'sports' 
  | 'graphic' 
  | 'polo' 
  | 'v-neck' 
  | 'crew-neck' 
  | 'other';

// Size variant type (size can be number for shoes or string for t-shirts)
export interface SizeVariant {
  size: number | string; // Number for shoes (8, 9, 10) or String for t-shirts (S, M, L, XL)
  stock: number;
}

// Color variant type
export interface ColorVariant {
  color: string;
  sizes: SizeVariant[];
  images?: string[];
}

// Generic Product interface
export interface IProduct extends Document {
  name: string;
  brand: import('mongoose').Types.ObjectId; // Reference to Brand
  productType: import('mongoose').Types.ObjectId; // Reference to ProductType
  description?: string;
  price: number;
  discountPrice?: number;
  category: ProductCategory; // Generic category (can be ShoeCategory, TShirtCategory, etc.)
  gender: Gender;
  images?: string[]; // General images
  variants: ColorVariant[]; // Array of color variants with sizes and stock
  isActive: boolean;
  rating: {
    average: number;
    count: number;
  };
  createdAt: Date;
  updatedAt: Date;
  inStock: boolean; // Virtual field - true if any color-size has stock > 0
  totalStock: number; // Virtual field - sum of all color-size stocks
  updateStock(color: string, size: number | string, quantity: number): Promise<IProduct>;
  getStockBySize(size: number | string): number; // Sum of all colors for a size
}

// Shoe interface (for backward compatibility, extends IProduct)
export interface IShoe extends IProduct {
  productType: 'shoes';
  category: ShoeCategory;
}

// Request/Response types
export interface CustomRequest extends Request {
  // Add custom properties here if needed
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stack?: string;
}

// Query parameters for getAllProducts
export interface ProductQueryParams {
  productType?: string; // ProductType ObjectId as string
  category?: string;
  gender?: Gender;
  brand?: string; // Brand ObjectId as string
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  search?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

// ShoeQueryParams (for backward compatibility)
export interface ShoeQueryParams extends ProductQueryParams {
  category?: ShoeCategory;
}

// Error interface
export interface CustomError extends Error {
  statusCode?: number;
  errors?: string[];
}

// Middleware types
export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Stock update request body (color-size specific)
export interface StockUpdateBody {
  color: string;
  size: number | string; // Can be number (for shoes) or string (for t-shirts)
  quantity: number;
}

// Bulk stock update request body (multiple color-size combinations)
export interface BulkStockUpdateBody {
  variants: Array<{
    color: string;
    sizes: Array<{
      size: number | string; // Can be number (for shoes) or string (for t-shirts)
      quantity: number; // Change in stock (can be positive or negative)
    }>;
  }>;
}

// Stock update by color only (updates all sizes for that color)
export interface ColorStockUpdateBody {
  color: string;
  quantity: number;
}

// Stock update by size only (updates all colors for that size)
export interface SizeStockUpdateBody {
  size: number;
  quantity: number;
}
