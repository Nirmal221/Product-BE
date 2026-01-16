import mongoose, { Schema, Model, Types } from 'mongoose';
import { IProduct, ProductCategory, Gender, ColorVariant } from '../types/index.js';
import { getDb } from '../config/database.js';
import { MODEL_NAMES } from '../constants/index.js';
import { colorSchema } from './schemas/colorSchema.js';

const ratingSchema = new Schema({
  average: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  count: {
    type: Number,
    default: 0,
    min: 0
  }
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters']
    },
    brand: {
      type: Schema.Types.ObjectId,
      required: [true, 'Brand is required'],
      index: true
    },
    productType: {
      type: Schema.Types.ObjectId,
      required: [true, 'Product type is required'],
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex', 'kids'] as Gender[],
      default: 'unisex' as Gender
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    discountPrice: Number,
    variants: {
      type: [colorSchema],
      required: [true, 'Variants are required'],
      validate: {
        validator: function(v: ColorVariant[]): boolean {
          return v && v.length > 0;
        },
        message: 'At least one color variant is required'
      }
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: ratingSchema,
      default: () => ({ average: 0, count: 0 })
    },
    images: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ brand: 1 });
productSchema.index({ productType: 1 });
productSchema.index({ category: 1 });
productSchema.index({ gender: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ productType: 1, category: 1 }); // Compound index for filtering

// Virtual for checking if product is in stock (any color-size has stock > 0)
productSchema.virtual('inStock').get(function(this: IProduct) {
  if (!this.variants || this.variants.length === 0) return false;
  
  for (const variant of this.variants) {
    if (variant.sizes && variant.sizes.length > 0) {
      for (const sizeVariant of variant.sizes) {
        if (sizeVariant.stock > 0) return true;
      }
    }
  }
  return false;
});

// Virtual for total stock across all colors and sizes
productSchema.virtual('totalStock').get(function(this: IProduct) {
  if (!this.variants || this.variants.length === 0) return 0;
  
  let total = 0;
  for (const variant of this.variants) {
    if (variant.sizes && variant.sizes.length > 0) {
      for (const sizeVariant of variant.sizes) {
        total += sizeVariant.stock || 0;
      }
    }
  }
  return total;
});

// Instance method to get total stock for a specific size (sum across all colors)
productSchema.methods.getStockBySize = function(this: IProduct, size: number | string): number {
  if (!this.variants || this.variants.length === 0) return 0;
  
  let total = 0;
  for (const variant of this.variants) {
    if (variant.sizes && variant.sizes.length > 0) {
      const sizeVariant = variant.sizes.find(s => s.size === size);
      if (sizeVariant) {
        total += sizeVariant.stock || 0;
      }
    }
  }
  return total;
};

// Instance method to update stock for a specific color-size combination
productSchema.methods.updateStock = async function(this: IProduct, color: string, size: number | string, quantity: number): Promise<IProduct> {
  if (!this.variants) {
    this.variants = [];
  }
  
  // Find or create color variant
  let colorVariant = this.variants.find(v => v.color === color);
  if (!colorVariant) {
    colorVariant = {
      color,
      sizes: []
    };
    this.variants.push(colorVariant);
  }
  
  // Find or create size variant
  let sizeVariant = colorVariant.sizes.find(s => s.size === size);
  if (!sizeVariant) {
    sizeVariant = {
      size,
      stock: 0
    };
    colorVariant.sizes.push(sizeVariant);
  }
  
  const currentStock = sizeVariant.stock || 0;
  const newStock = currentStock + quantity;
  
  if (newStock < 0) {
    throw new Error(`Insufficient stock for color "${color}" size ${size}. Available: ${currentStock}, Requested: ${quantity}`);
  }
  
  sizeVariant.stock = newStock;
  
  return this.save();
};

// Static method to find products by type
productSchema.statics.findByType = function(productTypeId: string | Types.ObjectId) {
  return this.find({ productType: productTypeId, isActive: true });
};

// Static method to find products by category
productSchema.statics.findByCategory = function(category: ProductCategory) {
  return this.find({ category, isActive: true });
};

// Static method to find products in price range
productSchema.statics.findByPriceRange = function(minPrice: number, maxPrice: number) {
  return this.find({
    price: { $gte: minPrice, $lte: maxPrice },
    isActive: true
  });
};

// Define the model interface
interface ProductModel extends Model<IProduct> {
  findByType(productTypeId: string | Types.ObjectId): mongoose.Query<IProduct[], IProduct>;
  findByCategory(category: ProductCategory): mongoose.Query<IProduct[], IProduct>;
  findByPriceRange(minPrice: number, maxPrice: number): mongoose.Query<IProduct[], IProduct>;
}

// Create model using constant for model name
const Product = getDb<IProduct>(MODEL_NAMES.PRODUCT, productSchema) as ProductModel;

export default Product;
