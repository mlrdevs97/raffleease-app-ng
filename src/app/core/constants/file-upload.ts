/**
 * File upload constants and configuration
 * These values should match the server-side configuration in application.yml
 */
export const FileUploadLimits = {
  // Maximum file size in bytes (25MB)
  MAX_FILE_SIZE: 25 * 1024 * 1024,
  
  // Maximum total request size in bytes (100MB)
  MAX_REQUEST_SIZE: 100 * 1024 * 1024,
  
  // Maximum number of images per raffle
  MAX_IMAGES_PER_RAFFLE: 10,
  
  // Maximum file size for display (string format)
  MAX_FILE_SIZE_DISPLAY: '25MB',
  
  // Maximum total size for display (string format)
  MAX_REQUEST_SIZE_DISPLAY: '100MB',
  
  // Supported image MIME types
  SUPPORTED_IMAGE_TYPES: [
    'image/png',
    'image/jpeg', 
    'image/jpg',
    'image/gif',
    'image/webp'
  ] as const,
  
  // File extensions for input accept attribute
  ACCEPTED_EXTENSIONS: 'image/png,.png,image/jpeg,.jpg,.jpeg,image/gif,.gif,image/webp,.webp'
} as const;

export type SupportedImageType = typeof FileUploadLimits.SUPPORTED_IMAGE_TYPES[number]; 