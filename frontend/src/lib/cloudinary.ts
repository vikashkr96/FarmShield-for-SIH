/**
 * Cloudinary Media Pipeline for FarmShield
 * Works across Web, Mobile, and Backend with shared Cloudinary credentials
 */

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dly88888',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'farmshield_preset',
  maxFileSizeInBytes: 10 * 1024 * 1024, // 10 MB limit matching Flutter App
  supportedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
};

/**
 * Validates a file before uploading (matching Flutter CloudinaryService)
 */
export function validateMediaFile(file: File | Blob, fileName?: string): { valid: boolean; error?: string } {
  const name = fileName || (file instanceof File ? file.name : 'upload.jpg');
  
  if (file.size === 0) {
    return { valid: false, error: 'The selected file is empty.' };
  }

  if (file.size > CLOUDINARY_CONFIG.maxFileSizeInBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds the maximum allowed 10 MB limit.`,
    };
  }

  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (!CLOUDINARY_CONFIG.supportedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file format (.${ext}). Please select a valid JPG, PNG, WebP, or PDF.`,
    };
  }

  return { valid: true };
}

/**
 * Direct unsigned upload to Cloudinary CDN
 */
export async function uploadToCloudinary(
  file: File | Blob,
  folder: string = 'farmshield_media',
  customFileName?: string
): Promise<CloudinaryUploadResult> {
  const fileName = customFileName || (file instanceof File ? file.name : 'media_upload.jpg');
  const validation = validateMediaFile(file, fileName);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `Upload failed with status ${response.status}`;
    throw new Error(`Cloudinary upload failed: ${message}`);
  }

  const data = await response.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    format: data.format,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
  };
}

/**
 * Extracts public_id from Cloudinary URL (matching Flutter CloudinaryService)
 */
export function extractPublicIdFromUrl(url?: string | null): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;

  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split('/');
    const uploadIndex = segments.indexOf('upload');
    if (uploadIndex === -1 || uploadIndex >= segments.length - 1) return null;

    const relevant = segments.slice(uploadIndex + 1).filter((s) => !/^v\d+$/.test(s));
    if (relevant.length === 0) return null;

    const fullWithExt = relevant.join('/');
    const dotIndex = fullWithExt.lastIndexOf('.');
    return dotIndex !== -1 ? fullWithExt.substring(0, dotIndex) : fullWithExt;
  } catch {
    return null;
  }
}

/**
 * Generates Cloudinary optimized image URL with auto format and compression
 */
export function getOptimizedImageUrl(
  url?: string | null,
  options: { width?: number; height?: number; crop?: string } = {}
): string {
  if (!url) return '/images/cows-pasture.jpg';
  if (!url.includes('cloudinary.com')) return url;

  const transforms = ['f_auto', 'q_auto'];
  if (options.width) transforms.push(`w_${options.width}`);
  if (options.height) transforms.push(`h_${options.height}`);
  if (options.crop) transforms.push(`c_${options.crop}`);

  return url.replace('/upload/', `/upload/${transforms.join(',')}/`);
}
