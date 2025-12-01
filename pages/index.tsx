import Head from 'next/head'
import { useState, useEffect } from 'react'

interface Entry {
  id: number
  text: string
  created_at: string
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLatest()
  }, [])

  async function fetchLatest() {
    try {
      const res = await fetch('/api/entries')
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setEntries(data.entries)
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to load entries')
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() })
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }
      
      await fetchLatest()
      setText('')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit entry'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Railway Guestbook</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="description" content="A modern guestbook powered by Next.js and SQLite" />
      </Head>

      <div className="min-h-screen py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Heading */}
          <h1 className="text-6xl font-bold text-center mb-12 text-slate-100">
            Guestbook
          </h1>

          {/* Input Form */}
          <div className="mb-16">
            <form onSubmit={submit} className="max-w-2xl mx-auto">
              {error && (
                <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-center">
                  {error}
                </div>
              )}
              <div className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 rounded-full px-4 py-3 bg-white/5 inset-ring inset-ring-white/15 hover:bg-white/10 focus-within:bg-white/10 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="size-5 fill-slate-500" aria-hidden="true">
                  <path fillRule="evenodd" d="M2 5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5Zm2-1a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H4Zm1 3.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5Zm0 2a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5Z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  maxLength={280}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Leave a message..."
                  className="bg-transparent text-white outline-none placeholder:text-slate-500 text-sm"
                  aria-label="Your message"
                />
                <button
                  type="submit"
                  disabled={loading || text.trim().length === 0}
                  className="flex-shrink-0 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-full px-5 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>

          {/* Messages List */}
          <div className="space-y-8">
            {entries.length === 0 ? (
              <p className="text-center text-slate-500 text-lg">
                No messages yet. Be the first!
              </p>
            ) : (
              entries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="text-center">
                  <blockquote className="text-xl text-slate-200 italic mb-1">
                    "{entry.text}"
                  </blockquote>
                  <p className="text-xs text-slate-500 opacity-70">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
