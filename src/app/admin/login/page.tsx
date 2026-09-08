'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setAdminToken } from '@/lib/session'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Inloggning misslyckades')
        return
      }

      setAdminToken(data.token)
      router.push('/admin')
    } catch {
      setError('Nätverksfel — försök igen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-zinc-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-black mb-1">Admin-inloggning</h1>
        <p className="text-zinc-500 text-sm mb-8">Filmklubben</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-zinc-300">Lösenord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ange lösenord"
              className="mt-1.5 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
              autoFocus
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold"
          >
            {loading ? 'Loggar in…' : 'Logga in'}
          </Button>
        </form>

        <p className="mt-6 text-center">
          <a href="/" className="text-zinc-600 hover:text-zinc-400 text-sm transition-colors">
            ← Tillbaka till filmerna
          </a>
        </p>
      </div>
    </main>
  )
}
