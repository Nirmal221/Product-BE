import { Request, Response } from 'express';
import Brand from '../models/Brand.js';
import { ApiResponse } from '../types/index.js';
import mongoose from 'mongoose';

/**
 * Get all brands with optional filtering
 */
export const getAllBrands = async (req: Request<{}, ApiResponse, {}, { isActive?: string; search?: string }>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { isActive, search } = req.query;
    
    const query: { isActive?: boolean; name?: { $regex: string; $options: string } } = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const brands = await Brand.find(query)
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: brands
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching brands',
      errors: [errorMessage]
    });
  }
};

/**
 * Get a single brand by ID
 */
export const getBrandById = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const brand = await Brand.findById(id);

    if (!brand) {
      res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        message: 'Invalid brand ID'
      });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching brand',
      errors: [errorMessage]
    });
  }
};

/**
 * Get a brand by slug
 */
export const getBrandBySlug = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { slug } = req.params;
    const brand = await Brand.findOne({ slug });

    if (!brand) {
      res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: brand
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error fetching brand',
      errors: [errorMessage]
    });
  }
};

/**
 * Create a new brand
 */
export const createBrand = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { name, slug, description, logo, website, isActive } = req.body;

    // Validate required fields
    if (!name) {
      res.status(400).json({
        success: false,
        message: 'Brand name is required'
      });
      return;
    }

    const brand = await Brand.create({
      name,
      slug,
      description,
      logo,
      website,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      data: brand,
      message: 'Brand created successfully'
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
        message: 'Brand with this name or slug already exists'
      });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error creating brand',
      errors: [errorMessage]
    });
  }
};

/**
 * Update a brand by ID
 */
export const updateBrand = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, description, logo, website, isActive } = req.body;

    const updateData: { 
      name?: string; 
      slug?: string; 
      description?: string; 
      logo?: string;
      website?: string;
      isActive?: boolean 
    } = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (logo !== undefined) updateData.logo = logo;
    if (website !== undefined) updateData.website = website;
    if (isActive !== undefined) updateData.isActive = isActive;

    const brand = await Brand.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!brand) {
      res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: brand,
      message: 'Brand updated successfully'
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        message: 'Invalid brand ID'
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
        message: 'Brand with this name or slug already exists'
      });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error updating brand',
      errors: [errorMessage]
    });
  }
};

/**
 * Delete a brand by ID (soft delete)
 */
export const deleteBrand = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!brand) {
      res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({
        success: false,
        message: 'Invalid brand ID'
      });
      return;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error deleting brand',
      errors: [errorMessage]
    });
  }
};
