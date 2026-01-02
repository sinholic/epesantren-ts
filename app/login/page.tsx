'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UnifiedLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Redirect based on role
      if (data.redirect) {
        router.push(data.redirect)
      } else {
        // Fallback redirect based on role
        switch (data.role) {
          case 'admin':
            router.push('/manage/dashboard')
            break
          case 'student':
            router.push('/student/dashboard')
            break
          case 'teacher':
            router.push('/teacher/dashboard')
            break
          default:
            router.push('/')
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ePesantren</h1>
          <p className="text-gray-600">Login ke Sistem</p>
          <p className="text-sm text-gray-500 mt-2">
            Masukkan username (Email/NIS/NIP) dan password Anda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Email, NIS, atau NIP"
            />
            <p className="mt-1 text-xs text-gray-500">
              Admin: Email | Siswa: NIS | Guru: NIP
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <a href="/ppdb/auth" className="block text-sm text-orange-600 hover:text-orange-800">
            Login PPDB →
          </a>
          <a href="/" className="block text-sm text-blue-600 hover:text-blue-800">
            ← Kembali ke Portal
          </a>
        </div>
      </div>
    </div>
  )
}
