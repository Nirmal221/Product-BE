export const DB_NAMES = {
  DEFAULT: 'products',
} as const;

export const COLLECTIONS = {
  PRODUCTS: 'products',
  PRODUCT_TYPES: 'productTypes',
  BRANDS: 'brands',
} as const;

export const MODEL_NAMES = {
  PRODUCT: 'Product',
  PRODUCT_TYPE: 'ProductType',
  BRAND: 'Brand',
} as const;

// Product types
export const PRODUCT_TYPES = {
  SHOES: 'shoes',
  TSHIRTS: 't-shirts',
  // Add more product types as needed
} as const;

export type ProductType = typeof PRODUCT_TYPES[keyof typeof PRODUCT_TYPES];


export type DbName = typeof DB_NAMES[keyof typeof DB_NAMES];
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
export type ModelName = typeof MODEL_NAMES[keyof typeof MODEL_NAMES];
