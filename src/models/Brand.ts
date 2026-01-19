import mongoose from 'mongoose';
import { Document } from 'mongoose';
import { getDb } from '../config/database.js';
import { MODEL_NAMES } from '../constants/index.js';

/**
 * Brand Interface
 */
export interface IBrand extends Document {
  name: string;
  slug: string; // URL-friendly identifier (e.g., 'nike', 'adidas')
  description?: string;
  logo?: string; // URL to brand logo
  website?: string; // Brand website URL
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new mongoose.Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, 'Brand name is required'],
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
    logo: {
      type: String,
      trim: true,
      maxlength: [500, 'Logo URL cannot exceed 500 characters']
    },
    website: {
      type: String,
      trim: true,
      maxlength: [500, 'Website URL cannot exceed 500 characters'],
      validate: {
        validator: function(v: string): boolean {
          if (!v) return true; // Optional field
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Website must be a valid URL starting with http:// or https://'
      }
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
brandSchema.index({ name: 1 });
brandSchema.index({ slug: 1 }, { unique: true });
brandSchema.index({ isActive: 1 });
brandSchema.index({ createdAt: -1 });

// Pre-save hook to generate slug from name if not provided
brandSchema.pre('save', function(next) {
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
const Brand = getDb<IBrand>(MODEL_NAMES.BRAND, brandSchema);

export default Brand;
