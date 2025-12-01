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
        <title>Railway trial — entries</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>

      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <header className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Railway Trial — Guest entries</h1>
            <p className="text-slate-300 mt-2">Submit a short message and see the latest 10 entries.</p>
          </header>

          <section className="mb-6 bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-md">
            <form onSubmit={submit} className="space-y-3">
              <label className="block text-sm font-medium">Your message</label>
              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <input
                  maxLength={280}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="What's on your mind? (max 280 chars)"
                  className="flex-1 bg-white/5 border border-white/10 text-slate-100 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-slate-400/50"
                  aria-label="message"
                />
                <button
                  type="submit"
                  disabled={loading || text.trim().length === 0}
                  aria-disabled={loading}
                  className="inline-flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white rounded-md px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending…' : 'Send'}
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg backdrop-blur-md">
            <h2 className="text-xl font-semibold mb-3">Latest entries</h2>
            <div className="space-y-3">
              {entries.length === 0 && (
                <div className="text-slate-400">No entries yet — be the first!</div>
              )}

              {entries.map((entry) => (
                <div key={entry.id} className="p-3 bg-white/3 border border-white/5 rounded-md">
                  <div className="text-slate-100">{entry.text}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(entry.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="mt-6 text-center text-xs text-slate-400">
            Made for a Railway demo — data will be persisted by SQLite when configured.
          </footer>
        </div>
      </main>
    </>
  )
}
