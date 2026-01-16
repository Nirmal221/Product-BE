import { Request, Response } from 'express';
import ProductType from '../models/ProductType.js';
import { ApiResponse } from '../types/index.js';
import mongoose from 'mongoose';

/**
 * Get all product types with optional filtering
 */
export const getAllProductTypes = async (req: Request<{}, ApiResponse, {}, { isActive?: string }>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { isActive } = req.query;
    
    const query: { isActive?: boolean } = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const productTypes = await ProductType.find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: productTypes
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching product types',
      errors: [errorMessage]
    });
  }
};

/**
 * Get a single product type by ID
 */
export const getProductTypeById = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const productType = await ProductType.findById(id);

    if (!productType) {
      res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: productType
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        message: 'Invalid product type ID'
      });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching product type',
      errors: [errorMessage]
    });
  }
};

/**
 * Get a product type by slug
 */
export const getProductTypeBySlug = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { slug } = req.params;
    const productType = await ProductType.findOne({ slug });

    if (!productType) {
      res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: productType
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching product type',
      errors: [errorMessage]
    });
  }
};

/**
 * Create a new product type
 */
export const createProductType = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { name, slug, description, isActive } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Product type name is required'
      });
      return;
    }

    const productType = await ProductType.create({
      name,
      slug,
      description,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      data: productType,
      message: 'Product type created successfully'
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
    if (error instanceof mongoose.Error && (error as any).code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Product type with this name or slug already exists'
      });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error creating product type',
      errors: [errorMessage]
    });
  }
};

/**
 * Update a product type by ID
 */
export const updateProductType = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, isActive } = req.body;

    const updateData: { name?: string; slug?: string; description?: string; isActive?: boolean } = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const productType = await ProductType.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!productType) {
      res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: productType,
      message: 'Product type updated successfully'
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        message: 'Invalid product type ID'
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
    if (error instanceof mongoose.Error && (error as any).code === 11000) {
      res.status(400).json({
        success: false,
        message: 'Product type with this name or slug already exists'
      });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error updating product type',
      errors: [errorMessage]
    });
  }
};

/**
 * Delete a product type by ID (soft delete)
 */
export const deleteProductType = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const productType = await ProductType.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!productType) {
      res.status(404).json({
        success: false,
        message: 'Product type not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product type deleted successfully'
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        message: 'Invalid product type ID'
      });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error deleting product type',
      errors: [errorMessage]
    });
  }
};
