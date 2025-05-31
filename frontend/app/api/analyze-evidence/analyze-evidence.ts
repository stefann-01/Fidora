import type { NextApiRequest, NextApiResponse } from 'next'

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3001'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch(`${AI_SERVICE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    res.status(200).json(data)
  } catch (error) {
    console.error('AI service error:', error)
    res.status(500).json({ error: 'Failed to connect to AI service' })
  }
} 