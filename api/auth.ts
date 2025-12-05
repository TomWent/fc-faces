import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { authenticated } = req.body
  
  if (authenticated) {
    const authToken = process.env.AUTH_SECRET || 'fc-faces-secret-token'
    // Set cookie with HttpOnly, Secure (for HTTPS), SameSite protection
    // Max-Age of 86400 seconds = 24 hours
    const isProduction = process.env.NODE_ENV === 'production'
    res.setHeader('Set-Cookie', 
      `fc-faces-auth=${authToken}; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Strict; Path=/; Max-Age=86400`
    )
    return res.json({ success: true })
  }
  
  return res.status(400).json({ error: 'Invalid request' })
}

