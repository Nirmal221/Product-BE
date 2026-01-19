import express, { Router } from 'express';
import { uploadImageToCloudinary } from '../controllers/imageController.js';
import { uploadSingle } from '../middleware/upload.js';

const router: Router = express.Router();

/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     summary: Upload an image file to Cloudinary
 *     description: |
 *       Uploads an image file from form-data to Cloudinary and returns the Cloudinary URLs.
 *       
 *       **Important:**
 *       - Use `multipart/form-data` content type
 *       - Field name for the file must be `"image"`
 *       - Supported formats: JPEG, PNG, GIF, WebP, SVG
 *       - Maximum file size: 10MB
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (JPEG, PNG, GIF, WebP, SVG - Max 10MB)
 *               folder:
 *                 type: string
 *                 description: Cloudinary folder path (optional, default: 'products')
 *                 example: 'products'
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags for organization (optional)
 *                 example: 'product,featured'
 *     responses:
 *       200:
 *         description: Image uploaded successfully to Cloudinary
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ImageUploadResponse'
 *             example:
 *               success: true
 *               message: "Image uploaded successfully to Cloudinary"
 *               data:
 *                 publicId: "products/image-123"
 *                 url: "http://res.cloudinary.com/de74gcchm/image/upload/v123/products/image-123.jpg"
 *                 secureUrl: "https://res.cloudinary.com/de74gcchm/image/upload/v123/products/image-123.jpg"
 *                 width: 1920
 *                 height: 1080
 *                 format: "jpg"
 *                 bytes: 245678
 *       400:
 *         description: No file uploaded or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No image file uploaded. Please upload an image file using form-data with field name \"image\""
 *       500:
 *         description: Upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Error uploading image to Cloudinary"
 *               errors:
 *                 - "Failed to upload image to Cloudinary: Invalid image format"
 */
router.post('/upload', uploadSingle, uploadImageToCloudinary);

export default router;
