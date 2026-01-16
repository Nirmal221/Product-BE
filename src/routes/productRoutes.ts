import express, { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  updateBulkStock
} from '../controllers/productController.js';

const router: Router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with optional filtering
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: productType
 *         schema:
 *           type: string
 *         description: Filter by product type (ObjectId)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [men, women, unisex, kids]
 *         description: Filter by gender
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filter by brand (ObjectId)
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by stock availability
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Text search across name, description, and brand
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort field (default: -createdAt)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Invalid product ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     description: |
 *       Create a new product. Both productType and brand must be valid ObjectId references to existing models.
 *       
 *       **Important:** 
 *       - You must create a ProductType first using `/api/product-types` endpoint
 *       - You must create a Brand first using `/api/brands` endpoint
 *       - Use the ProductType's `_id` as the `productType` value
 *       - Use the Brand's `_id` as the `brand` value
 *       - Both productType and brand must exist and be active
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *           example:
 *             name: "Cotton T-Shirt"
 *             brand: "507f1f77bcf86cd799439012"
 *             productType: "507f1f77bcf86cd799439011"
 *             category: "casual"
 *             gender: "unisex"
 *             description: "Comfortable 100% cotton t-shirt"
 *             price: 29.99
 *             discountPrice: 24.99
 *             variants:
 *               - color: "black"
 *                 sizes:
 *                   - size: "S"
 *                     stock: 20
 *                   - size: "M"
 *                     stock: 25
 *                   - size: "L"
 *                     stock: 15
 *                 images:
 *                   - "black-tshirt-1.jpg"
 *               - color: "white"
 *                 sizes:
 *                   - size: "S"
 *                     stock: 18
 *                   - size: "M"
 *                     stock: 22
 *             images:
 *               - "product-main-1.jpg"
 *               - "product-main-2.jpg"
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *             example:
 *               success: true
 *               message: "Product created successfully"
 *               data:
 *                 _id: "507f1f77bcf86cd799439011"
 *                 name: "Cotton T-Shirt"
 *                 brand:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "Nike"
 *                   slug: "nike"
 *                   description: "Just Do It"
 *                 productType:
 *                   _id: "507f1f77bcf86cd799439012"
 *                   name: "T-Shirts"
 *                   slug: "t-shirts"
 *                   description: "Comfortable cotton t-shirts"
 *                 category: "casual"
 *                 gender: "unisex"
 *                 price: 29.99
 *                 variants: []
 *                 inStock: true
 *                 totalStock: 100
 *                 createdAt: "2024-01-12T10:00:00.000Z"
 *       400:
 *         description: Validation error or invalid product type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validationError:
 *                 value:
 *                   success: false
 *                   message: "Validation error"
 *                   errors:
 *                     - "Product type must exist and be active"
 *                     - "At least one color variant is required"
 *               invalidProductType:
 *                 value:
 *                   success: false
 *                   message: "Invalid product type ID"
 */
router.post('/', createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 *       400:
 *         description: Validation error or invalid ID
 */
router.put('/:id', updateProduct);

/**
 * @swagger
 * /api/products/{id}/stock:
 *   patch:
 *     summary: Update stock for a specific color-size combination
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStockRequest'
 *     responses:
 *       200:
 *         description: Stock updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid input or insufficient stock
 *       404:
 *         description: Product not found
 */
router.patch('/:id/stock', updateStock);

/**
 * @swagger
 * /api/products/{id}/stock/bulk:
 *   patch:
 *     summary: Update stock for multiple color-size combinations at once
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkStockUpdateRequest'
 *     responses:
 *       200:
 *         description: Stock updated for multiple combinations
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid input or failed updates
 *       404:
 *         description: Product not found
 */
router.patch('/:id/stock/bulk', updateBulkStock);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (soft delete)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Product not found
 *       400:
 *         description: Invalid product ID
 */
router.delete('/:id', deleteProduct);

export default router;
