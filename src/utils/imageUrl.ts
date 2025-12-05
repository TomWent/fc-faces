/**
 * Converts a public image path to a protected API endpoint URL
 * In development mode, falls back to original path since API routes aren't available
 * @param imagePath - The original image path (e.g., "/images/fabian-rehring.png")
 * @returns Protected API URL in production, or original path in development
 */
export function getProtectedImageUrl(imagePath: string): string {
  // In development mode (Vite dev server), API routes aren't available
  // Use original image paths. In production (Vercel), use protected API
  const isDevelopment = import.meta.env.DEV
  
  if (isDevelopment) {
    // Return original path for development
    return imagePath
  }
  
  // Production: use protected API endpoint
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
  // Remove 'images/' prefix since API handles it
  const filename = cleanPath.replace('images/', '')
  return `/api/images/${filename}`
}

