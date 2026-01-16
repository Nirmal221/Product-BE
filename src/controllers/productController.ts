import { Request, Response } from 'express';
import Product from '../models/Product.js';
import ProductType from '../models/ProductType.js';
import Brand from '../models/Brand.js';
import { 
  ProductQueryParams, 
  ApiResponse, 
  StockUpdateBody, 
  BulkStockUpdateBody, 
  ColorVariant,
  Gender
} from '../types/index.js';
import mongoose from 'mongoose';

/**
 * Helper function to check if any color-size combination has stock > 0
 * @param variants - Array of color variants
 * @returns true if any variant has stock > 0, false otherwise
 */
function hasStock(variants: ColorVariant[] | undefined | null): boolean {
  if (!variants || !Array.isArray(variants) || variants.length === 0) return false;
  
  for (const variant of variants) {
    if (variant.sizes && Array.isArray(variant.sizes)) {
      for (const sizeVariant of variant.sizes) {
        if (sizeVariant.stock > 0) return true;
      }
    }
  }
  return false;
}

/**
 * Get all products with optional filtering
 */
export const getAllProducts = async (req: Request<{}, ApiResponse, {}, ProductQueryParams>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const {
      productType,
      category,
      gender,
      brand,
      minPrice,
      maxPrice,
      inStock,
      search,
      sort = '-createdAt',
      page = '1',
      limit = '10'
    } = req.query;

    // Build query with proper typing
    interface MongoQuery {
      isActive: boolean;
      productType?: mongoose.Types.ObjectId;
      category?: string;
      gender?: Gender;
      brand?: mongoose.Types.ObjectId;
      price?: { $gte?: number; $lte?: number };
      $text?: { $search: string };
      [key: string]: unknown; // Allow additional MongoDB query operators
    }
    
    const query: MongoQuery = { isActive: true };

    if (productType) {
      // Validate if productType is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(productType)) {
        query.productType = new mongoose.Types.ObjectId(productType);
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid product type ID'
        });
        return;
      }
    }
    if (category) query.category = category;
    if (gender) query.gender = gender;
    if (brand) {
      // Validate if brand is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(brand)) {
        query.brand = new mongoose.Types.ObjectId(brand);
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid brand ID'
        });
        return;
      }
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with population
    let products = await Product.find(query)
      .populate('productType', 'name slug description')
      .populate('brand', 'name slug description logo website')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit) * 2); // Fetch more to account for filtering

    // Filter by inStock if requested
    if (inStock === 'true') {
      products = products.filter(product => hasStock(product.variants));
    }

    // Apply final limit after filtering
    products = products.slice(0, Number(limit));

    // Count total (approximate for inStock filter)
    let total: number;
    if (inStock === 'true') {
      const allProducts = await Product.find(query);
      total = allProducts.filter(product => hasStock(product.variants)).length;
    } else {
      total = await Product.countDocuments(query);
    }
    
    // Convert to plain objects for response
    const productsData = products.map(product => product.toObject());

    res.status(200).json({
      success: true,
      data: productsData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      errors: [errorMessage]
    });
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate('productType', 'name slug description')
      .populate('brand', 'name slug description logo website');

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      errors: [errorMessage]
    });
  }
};

/**
 * Create a new product
 */
export const createProduct = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    console.log(req.body);
    
    // Validate productType if provided as string (ObjectId)
    if (req.body.productType && typeof req.body.productType === 'string') {
      if (!mongoose.Types.ObjectId.isValid(req.body.productType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid product type ID'
        });
        return;
      }
      
      // Validate that the productType exists and is active
      const productType = await ProductType.findById(req.body.productType);
      
      if (!productType) {
        res.status(400).json({
          success: false,
          message: 'Product type not found'
        });
        return;
      }
      
      if (!productType.isActive) {
        res.status(400).json({
          success: false,
          message: 'Product type is not active'
        });
        return;
      }
      
      req.body.productType = new mongoose.Types.ObjectId(req.body.productType);
    }

    // Validate brand if provided as string (ObjectId)
    if (req.body.brand && typeof req.body.brand === 'string') {
      if (!mongoose.Types.ObjectId.isValid(req.body.brand)) {
        res.status(400).json({
          success: false,
          message: 'Invalid brand ID'
        });
        return;
      }
      
      // Validate that the brand exists and is active
      const brand = await Brand.findById(req.body.brand);
      
      if (!brand) {
        res.status(400).json({
          success: false,
          message: 'Brand not found'
        });
        return;
      }
      
      if (!brand.isActive) {
        res.status(400).json({
          success: false,
          message: 'Brand is not active'
        });
        return;
      }
      
      req.body.brand = new mongoose.Types.ObjectId(req.body.brand);
    }

    const product = await Product.create(req.body);
    await product.populate('productType', 'name slug description');
    await product.populate('brand', 'name slug description logo website');
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      errors: [errorMessage]
    });
  }
};

/**
 * Update a product by ID
 */
export const updateProduct = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate productType if provided
    if (req.body.productType && typeof req.body.productType === 'string') {
      if (!mongoose.Types.ObjectId.isValid(req.body.productType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid product type ID'
        });
        return;
      }
      
      // Validate that the productType exists and is active
      const productType = await ProductType.findById(req.body.productType);
      if (!productType || !productType.isActive) {
        res.status(400).json({
          success: false,
          message: 'Product type not found or not active'
        });
        return;
      }
      
      req.body.productType = new mongoose.Types.ObjectId(req.body.productType);
    }

    // Validate brand if provided
    if (req.body.brand && typeof req.body.brand === 'string') {
      if (!mongoose.Types.ObjectId.isValid(req.body.brand)) {
        res.status(400).json({
          success: false,
          message: 'Invalid brand ID'
        });
        return;
      }
      
      // Validate that the brand exists and is active
      const brand = await Brand.findById(req.body.brand);
      if (!brand || !brand.isActive) {
        res.status(400).json({
          success: false,
          message: 'Brand not found or not active'
        });
        return;
      }
      
      req.body.brand = new mongoose.Types.ObjectId(req.body.brand);
    }

    const product = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('productType', 'name slug description')
      .populate('brand', 'name slug description logo website');

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
      return;
    }
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map(err => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      errors: [errorMessage]
    });
  }
};

/**
 * Delete a product by ID (soft delete)
 */
export const deleteProduct = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      errors: [errorMessage]
    });
  }
};

/**
 * Update product stock for a specific color-size combination
 */
export const updateStock = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const { color, size, quantity }: StockUpdateBody = req.body;

    if (!color || typeof color !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Color is required and must be a string'
      });
      return;
    }

    if (typeof size !== 'number' && typeof size !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Size is required and must be a number or string'
      });
      return;
    }

    if (typeof quantity !== 'number') {
      res.status(400).json({
        success: false,
        message: 'Quantity must be a number'
      });
      return;
    }

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    await product.updateStock(color, size, quantity);

    res.status(200).json({
      success: true,
      data: product,
      message: `Stock updated successfully for color "${color}" size ${size}`
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('Insufficient stock') ? 400 : 500;
    res.status(statusCode).json({
      success: false,
      message: errorMessage || 'Error updating stock',
      errors: [errorMessage]
    });
  }
};

/**
 * Update stock for multiple color-size combinations at once
 */
export const updateBulkStock = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const { variants }: BulkStockUpdateBody = req.body;

    if (!variants || !Array.isArray(variants)) {
      res.status(400).json({
        success: false,
        message: 'variants is required and must be an array of color variants with sizes'
      });
      return;
    }

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Update stock for each color-size combination
    const updates: string[] = [];
    const errors: string[] = [];

    for (const variant of variants) {
      if (!variant.color || typeof variant.color !== 'string') {
        errors.push(`Invalid variant: color is required and must be a string`);
        continue;
      }

      if (!variant.sizes || !Array.isArray(variant.sizes)) {
        errors.push(`Invalid variant for color "${variant.color}": sizes must be an array`);
        continue;
      }

      for (const sizeUpdate of variant.sizes) {
        if (typeof sizeUpdate.size !== 'number') {
          errors.push(`Invalid size for color "${variant.color}": must be a number`);
          continue;
        }

        if (typeof sizeUpdate.quantity !== 'number') {
          errors.push(`Invalid quantity for color "${variant.color}" size ${sizeUpdate.size}: must be a number`);
          continue;
        }

        try {
          await product.updateStock(variant.color, sizeUpdate.size, sizeUpdate.quantity);
          updates.push(`${variant.color} size ${sizeUpdate.size}: ${sizeUpdate.quantity > 0 ? '+' : ''}${sizeUpdate.quantity}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Error updating ${variant.color} size ${sizeUpdate.size}: ${errorMessage}`);
        }
      }
    }

    if (errors.length > 0 && updates.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Failed to update stock',
        errors
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
      message: `Stock updated for ${updates.length} color-size combination(s)`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error updating bulk stock',
      errors: [errorMessage]
    });
  }
};
