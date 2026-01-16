import express, { Router } from 'express';
import {
  getAllProductTypes,
  getProductTypeById,
  getProductTypeBySlug,
  createProductType,
  updateProductType,
  deleteProductType
} from '../controllers/productTypeController.js';

const router: Router = express.Router();

/**
 * @swagger
 * /api/product-types:
 *   get:
 *     summary: Get all product types
 *     tags: [Product Types]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of product types
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
 *                         $ref: '#/components/schemas/ProductType'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getAllProductTypes);

/**
 * @swagger
 * /api/product-types/slug/{slug}:
 *   get:
 *     summary: Get a product type by slug
 *     tags: [Product Types]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Product type slug (e.g., 't-shirts', 'shoes')
 *     responses:
 *       200:
 *         description: Product type details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProductType'
 *       404:
 *         description: Product type not found
 */
router.get('/slug/:slug', getProductTypeBySlug);

/**
 * @swagger
 * /api/product-types/{id}:
 *   get:
 *     summary: Get a single product type by ID
 *     tags: [Product Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product type ID
 *     responses:
 *       200:
 *         description: Product type details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProductType'
 *       404:
 *         description: Product type not found
 *       400:
 *         description: Invalid product type ID
 */
router.get('/:id', getProductTypeById);

/**
 * @swagger
 * /api/product-types:
 *   post:
 *     summary: Create a new product type
 *     tags: [Product Types]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductTypeRequest'
 *     responses:
 *       201:
 *         description: Product type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProductType'
 *       400:
 *         description: Validation error or duplicate entry
 */
router.post('/', createProductType);

/**
 * @swagger
 * /api/product-types/{id}:
 *   put:
 *     summary: Update a product type by ID
 *     tags: [Product Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductTypeRequest'
 *     responses:
 *       200:
 *         description: Product type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ProductType'
 *       404:
 *         description: Product type not found
 *       400:
 *         description: Validation error or invalid ID
 */
router.put('/:id', updateProductType);

/**
 * @swagger
 * /api/product-types/{id}:
 *   delete:
 *     summary: Delete a product type (soft delete)
 *     tags: [Product Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product type ID
 *     responses:
 *       200:
 *         description: Product type deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Product type not found
 *       400:
 *         description: Invalid product type ID
 */
router.delete('/:id', deleteProductType);

export default router;
