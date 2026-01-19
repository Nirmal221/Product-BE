import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cloudinary Configuration Interface
 */
interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

/**
 * Initialize Cloudinary with environment variables
 */
const cloudinaryConfig: CloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'de74gcchm',
  api_key: process.env.CLOUDINARY_API_KEY || '614993495448451',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'xeJ4P5TF-8E7xWgUXzyM92A7NIE'
};

cloudinary.config(cloudinaryConfig);

/**
 * Upload result interface
 */
export interface UploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Upload options interface
 */
export interface UploadOptions {
  folder?: string; // Folder path in Cloudinary (e.g., 'products', 'brands')
  public_id?: string; // Custom public ID
  overwrite?: boolean; // Overwrite existing image
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  transformation?: Record<string, unknown>; // Image transformations
  tags?: string[]; // Tags for organization
}

/**
 * Upload a single image to Cloudinary
 * @param filePath - Path to the file (local file path or base64 string or URL)
 * @param options - Upload options
 * @returns Upload result with public_id and URLs
 */
export const uploadImage = async (
  filePath: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    const {
      folder = 'products',
      public_id,
      overwrite = false,
      resource_type = 'image',
      transformation,
      tags = []
    } = options;

    const uploadOptions: Record<string, unknown> = {
      folder,
      overwrite,
      resource_type,
      tags
    };

    if (public_id) {
      uploadOptions.public_id = public_id;
    }

    if (transformation) {
      uploadOptions.transformation = transformation;
    }

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to upload image to Cloudinary: ${errorMessage}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param filePaths - Array of file paths
 * @param options - Upload options
 * @returns Array of upload results
 */
export const uploadMultipleImages = async (
  filePaths: string[],
  options: UploadOptions = {}
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = filePaths.map((filePath, index) => {
      const uploadOptions = {
        ...options,
        public_id: options.public_id ? `${options.public_id}_${index}` : undefined
      };
      return uploadImage(filePath, uploadOptions);
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to upload multiple images: ${errorMessage}`);
  }
};

/**
 * Delete an image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @param resourceType - Resource type (default: 'image')
 * @returns Deletion result
 */
export const deleteImage = async (
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ result: string }> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Failed to delete image: ${result.result}`);
    }

    return { result: result.result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to delete image from Cloudinary: ${errorMessage}`);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of public IDs to delete
 * @param resourceType - Resource type (default: 'image')
 * @returns Deletion result
 */
export const deleteMultipleImages = async (
  publicIds: string[],
  resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<{ deleted: Record<string, string> }> => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType
    });

    return { deleted: result.deleted || {} };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to delete multiple images: ${errorMessage}`);
  }
};

/**
 * Get image URL with transformations
 * @param publicId - Public ID of the image
 * @param transformations - Cloudinary transformation options
 * @returns Transformed image URL
 */
export const getImageUrl = (
  publicId: string,
  transformations: Record<string, unknown> = {}
): string => {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations
  });
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID or null
 */
export const extractPublicId = (url: string): string | null => {
  try {
    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{version}/{public_id}.{format}
    const match = url.match(/\/(?:v\d+\/)?([^\/]+)\.(jpg|jpeg|png|gif|webp|svg)$/i);
    if (match && match[1]) {
      // Remove version prefix if present
      return match[1].replace(/^v\d+-/, '');
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Upload image from base64 string
 * @param base64String - Base64 encoded image string (with or without data URI prefix)
 * @param options - Upload options
 * @returns Upload result
 */
export const uploadImageFromBase64 = async (
  base64String: string,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  try {
    // Ensure base64 string has data URI prefix if not present
    let dataUri = base64String;
    if (!base64String.startsWith('data:')) {
      dataUri = `data:image/jpeg;base64,${base64String}`;
    }

    return await uploadImage(dataUri, options);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to upload base64 image: ${errorMessage}`);
  }
};

/**
 * Check if Cloudinary is configured
 * @returns true if Cloudinary is properly configured
 */
export const isCloudinaryConfigured = (): boolean => {
  return !!(
    cloudinaryConfig.cloud_name &&
    cloudinaryConfig.api_key &&
    cloudinaryConfig.api_secret
  );
};

export default {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  getImageUrl,
  extractPublicId,
  uploadImageFromBase64,
  isCloudinaryConfigured
};
