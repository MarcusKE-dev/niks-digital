import imageCompression from 'browser-image-compression'

export const PRESETS = {
  HERO_BANNER: {
    maxWidth: 1200,
    maxHeight: 500,
    maxSizeMB: 0.5,
    quality: 0.85,
  },
  CATEGORY_PHOTO: {
    maxWidth: 600,
    maxHeight: 400,
    maxSizeMB: 0.2,
    quality: 0.8,
  },
  PRODUCT_THUMBNAIL: {
    maxWidth: 800,
    maxHeight: 800,
    maxSizeMB: 0.3,
    quality: 0.8,
  },
  PRODUCT_GALLERY: {
    maxWidth: 800,
    maxHeight: 800,
    maxSizeMB: 0.3,
    quality: 0.8,
  },
}

export async function compressImage(
  file: File,
  preset: keyof typeof PRESETS
): Promise<File> {
  const { maxWidth, maxHeight, maxSizeMB, quality } = PRESETS[preset]
  const options = {
    maxSizeMB,
    maxWidthOrHeight: Math.max(maxWidth, maxHeight),
    useWebWorker: true,
    initialQuality: quality,
  }
  try {
    return await imageCompression(file, options)
  } catch (err) {
    console.error('Compression failed:', err)
    return file
  }
}
