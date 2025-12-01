import type { NextApiRequest, NextApiResponse } from 'next'
import { getLatestEntries, createEntry, type Entry } from '@/lib/db'

type ErrorResponse = { error: string }
type GetResponse = { entries: Entry[] }
type PostResponse = { entry: Entry }

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetResponse | PostResponse | ErrorResponse>
) {
  if (req.method === 'GET') {
    try {
      const entries = getLatestEntries(10)
      res.status(200).json({ entries })
    } catch (error) {
      console.error('GET /api/entries error:', error)
      res.status(500).json({ error: 'Failed to fetch entries' })
    }
    return
  }

  if (req.method === 'POST') {
    try {
      const { text } = req.body

      if (typeof text !== 'string') {
        res.status(400).json({ error: 'Text field is required and must be a string' })
        return
      }

      const entry = createEntry(text)
      res.status(201).json({ entry })
    } catch (error) {
      console.error('POST /api/entries error:', error)
      const message = error instanceof Error ? error.message : 'Failed to create entry'
      res.status(500).json({ error: message })
    }
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}
