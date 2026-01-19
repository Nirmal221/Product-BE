import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { getDb } from '../config/database.js';
import { MODEL_NAMES } from '../constants/index.js';

/**
 * Product Type Interface
 */
export interface IProductType extends Document {
  name: string;
  slug: string; // URL-friendly identifier (e.g., 't-shirts', 'shoes')
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productTypeSchema = new mongoose.Schema<IProductType>(
  {
    name: {
      type: String,
      required: [true, 'Product type name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
productTypeSchema.index({ name: 1 });
productTypeSchema.index({ slug: 1 }, { unique: true });
productTypeSchema.index({ isActive: 1 });
productTypeSchema.index({ createdAt: -1 });

// Pre-save hook to generate slug from name if not provided
productTypeSchema.pre('save', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Create model
const ProductType = getDb<IProductType>(MODEL_NAMES.PRODUCT_TYPE, productTypeSchema);

export default ProductType;
