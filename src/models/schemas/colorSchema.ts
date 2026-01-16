import mongoose, { Schema } from 'mongoose';
import { SizeVariant, ColorVariant } from '../../types/index.js';

/**
 * Size schema for product variants
 * Size can be a number (for shoes: 8, 9, 10) or string (for t-shirts: S, M, L, XL)
 */
const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: mongoose.Schema.Types.Mixed, // Can be Number (for shoes) or String (for t-shirts: S, M, L, etc.)
      required: [true, 'Size is required'],
      validate: {
        validator: function(v: number | string): boolean {
          // Allow numbers (1-50) or strings (S, M, L, XL, etc.)
          if (typeof v === 'number') {
            return v >= 1 && v <= 50;
          }
          if (typeof v === 'string') {
            return v.trim().length > 0 && v.length <= 10;
          }
          return false;
        },
        message: 'Size must be a number (1-50) or a non-empty string (max 10 characters)'
      }
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative']
    },
  },
  { _id: false }
);

/**
 * Color schema for product variants
 * Each color variant contains multiple sizes with stock information
 */
const colorSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true
    },
    sizes: {
      type: [sizeSchema],
      required: [true, 'Sizes array is required'],
      validate: {
        validator: function(v: SizeVariant[]): boolean {
          if (!v || v.length === 0) return false;
          // Check for duplicate sizes
          const sizes = v.map((s: SizeVariant) => s.size);
          return sizes.length === new Set(sizes).size;
        },
        message: 'At least one size variant is required and sizes must be unique within a color'
      }
    },
    images: {
      type: [String], // color-specific images
      default: []
    },
  },
  { _id: false }
);

export { colorSchema, sizeSchema };
