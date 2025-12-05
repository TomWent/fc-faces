import type { VercelRequest, VercelResponse } from '@vercel/node'
import { readFile } from 'fs/promises'
import { join } from 'path'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Check authentication via cookie
  // Vercel provides cookies in req.cookies object
  const authToken = req.cookies?.['fc-faces-auth'] || 
                    (req.headers.cookie?.match(/fc-faces-auth=([^;]+)/)?.[1])
  
  // Verify the token matches what we set during login
  const expectedToken = process.env.AUTH_SECRET || 'fc-faces-secret-token'
  
  if (!authToken || authToken !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Get the image path from the request
  const imagePath = Array.isArray(req.query.path) 
    ? req.query.path.join('/') 
    : req.query.path || ''

  // Security: prevent path traversal
  if (imagePath.includes('..') || imagePath.startsWith('/')) {
    return res.status(400).json({ error: 'Invalid path' })
  }

  try {
    // Read the image file
    const filePath = join(process.cwd(), 'public', 'images', imagePath)
    const imageBuffer = await readFile(filePath)
    
    // Determine content type based on file extension
    const ext = imagePath.split('.').pop()?.toLowerCase()
    const contentType = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'heic': 'image/heic',
      'gif': 'image/gif'
    }[ext || ''] || 'image/jpeg'

    // Set headers and send image
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'private, max-age=3600') // Cache for 1 hour, but private
    return res.send(imageBuffer)
  } catch (error) {
    console.error('Error serving image:', error)
    return res.status(404).json({ error: 'Image not found' })
  }
}

