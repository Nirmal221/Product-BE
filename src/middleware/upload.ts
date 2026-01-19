import multer from 'multer';

/**
 * Configure multer for file uploads
 * Files are stored in memory (memoryStorage) for direct upload to Cloudinary
 */
const storage = multer.memoryStorage();

/**
 * File filter to accept only image files
 */
const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  // Allowed image MIME types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG images are allowed.'));
  }
};

/**
 * Multer configuration
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 10 // Max 10 files at once
  }
});

/**
 * Single file upload middleware
 * @type {import('express').RequestHandler}
 */
export const uploadSingle = upload.single('image') as unknown as import('express').RequestHandler;

/**
 * Multiple files upload middleware
 * @type {import('express').RequestHandler}
 */
export const uploadMultiple = upload.array('images', 10) as unknown as import('express').RequestHandler; // Max 10 images

export default upload;
