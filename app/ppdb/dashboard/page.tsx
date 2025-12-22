'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PPDBDashboardPage() {
  const router = useRouter()
  const [participant, setParticipant] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchParticipant()
  }, [])

  const fetchParticipant = async () => {
    try {
      const res = await fetch('/api/ppdb/auth/me')
      if (!res.ok) {
        router.push('/ppdb/auth')
        return
      }
      const data = await res.json()
      setParticipant(data.participant)
    } catch (error) {
      router.push('/ppdb/auth')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/ppdb/auth/logout', { method: 'POST' })
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">ePesantren - Portal PPDB</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{participant?.namaPeserta || participant?.nisn}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Selamat Datang, {participant?.namaPeserta || 'Peserta'}!</h2>
          <p className="text-gray-600">NISN: {participant?.nisn}</p>
          <p className="text-gray-600">No. Pendaftaran: {participant?.noPendaftaran}</p>
          <p className="text-gray-600">Status: {participant?.ppdbStatus || 'Pending'}</p>
        </div>
      </main>
    </div>
  )
}
