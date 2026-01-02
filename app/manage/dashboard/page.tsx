'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'

interface DashboardStats {
  totalStudents: number
  totalPayments: number
  totalTeachers: number
  recentActivities: any[]
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetchUser()
    fetchDashboard()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (!res.ok) {
        router.push('/login')
        return
      }
      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      router.push('/login')
    }
  }

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <AdminLayout>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Siswa</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.totalStudents || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Pembayaran</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.totalPayments || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Guru</h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.totalTeachers || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terkini</h2>
          </div>
          <div className="p-6">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <ul className="space-y-4">
                {stats.recentActivities.map((activity, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {activity}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Tidak ada aktivitas terkini</p>
            )}
          </div>
        </div>
    </AdminLayout>
  )
}
