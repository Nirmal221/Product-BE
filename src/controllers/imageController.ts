import { Request, Response } from 'express';
import { uploadImageFromBase64 } from '../services/cloudinary.js';
import { ApiResponse } from '../types/index.js';

/**
 * Upload an image to Cloudinary from file (form-data)
 * @param req - Express request object with file in req.file
 * @param res - Express response object
 */
export const uploadImageToCloudinary = async (req: Request, res: Response<ApiResponse>): Promise<void> => {
  try {
    // Check if file is uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please upload an image file using form-data with field name "image"'
      });
      return;
    }

    const { folder, tags } = req.body;

    // Convert buffer to base64
    const base64String = req.file.buffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64String}`;

    // Prepare upload options
    const uploadOptions: {
      folder?: string;
      tags?: string[];
    } = {};

    if (folder) {
      uploadOptions.folder = folder;
    }

    if (tags) {
      // Support both array and comma-separated string
      uploadOptions.tags = Array.isArray(tags) 
        ? tags 
        : (tags as string).split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
    }

    // Upload image using Cloudinary service
    const result = await uploadImageFromBase64(dataUri, uploadOptions);

    res.status(200).json({
      success: true,
      data: {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      },
      message: 'Image uploaded successfully to Cloudinary'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: 'Error uploading image to Cloudinary',
      errors: [errorMessage]
    });
  }
};
