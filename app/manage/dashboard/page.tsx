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
        router.push('/manage/auth')
        return
      }
      const data = await res.json()
      setUser(data.user)
    } catch (error) {
      router.push('/manage/auth')
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, Administrator. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center transition-colors">
            <span className="material-symbols-outlined text-[20px] mr-2">download</span>
            Export Report
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium flex items-center transition-colors shadow-sm shadow-primary/30">
            <span className="material-symbols-outlined text-[20px] mr-2">add</span>
            Add New User
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-500 font-medium">Total Students</span>
            <span className="material-symbols-outlined text-gray-400">school</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-gray-900">{stats?.totalStudents || 1240}</h3>
            <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-xs font-bold flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-0.5">arrow_upward</span>
              2.5%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-500 font-medium">Active Staff</span>
            <span className="material-symbols-outlined text-gray-400">group</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-gray-900">{stats?.totalTeachers || 85}</h3>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">Stable</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-500 font-medium">Attendance Rate</span>
            <span className="material-symbols-outlined text-gray-400">check_circle</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-gray-900">94%</h3>
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-xs font-bold flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-0.5">arrow_downward</span>
              1.2%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <span className="text-gray-500 font-medium">Pending Requests</span>
            <span className="material-symbols-outlined text-gray-400">pending_actions</span>
          </div>
          <div className="flex items-baseline gap-3">
            <h3 className="text-3xl font-bold text-gray-900">12</h3>
            <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs font-bold">Needs Review</span>
          </div>
        </div>
      </div>

      {/* Charts & Graphs Row (Visual only) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Attendance Trends</h3>
            <select className="text-sm border-gray-200 rounded-lg text-gray-500 bg-gray-50 border-none py-1 px-3 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-48 w-full flex items-end justify-between gap-2 px-2">
            {/* Simplified CSS Bar Chart Mockup */}
            <div className="w-full h-full bg-gradient-to-t from-primary/5 to-transparent rounded-xl relative overflow-hidden flex items-end">
              <svg className="absolute inset-0 w-full h-full text-primary" preserveAspectRatio="none">
                <path d="M0,150 C50,150 50,100 100,100 C150,100 150,50 200,50 C250,50 250,80 300,80 C350,80 350,20 400,20 L400,200 L0,200 Z" fill="url(#gradient)" opacity="0.1" />
                <path d="M0,150 C50,150 50,100 100,100 C150,100 150,50 200,50 C250,50 250,80 300,80 C350,80 350,20 400,20" fill="none" stroke="currentColor" strokeWidth="3" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-4 px-2">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900">Fee Collection Status</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-gray-500">This Month</span>
            </div>
          </div>
          <div className="h-48 w-full flex items-end gap-8 justify-center pb-2">
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 bg-gray-100 rounded-t-lg h-32 relative overflow-hidden">
                <div className="absolute bottom-0 w-full bg-primary h-[80%] rounded-t-lg group-hover:bg-primary-hover transition-colors"></div>
              </div>
              <span className="text-xs text-gray-500 font-medium">Paid</span>
            </div>
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 bg-gray-100 rounded-t-lg h-32 relative overflow-hidden">
                <div className="absolute bottom-0 w-full bg-orange-400 h-[30%] rounded-t-lg"></div>
              </div>
              <span className="text-xs text-gray-500 font-medium">Pending</span>
            </div>
            <div className="flex flex-col items-center gap-2 group">
              <div className="w-12 bg-gray-100 rounded-t-lg h-32 relative overflow-hidden">
                <div className="absolute bottom-0 w-full bg-red-400 h-[10%] rounded-t-lg"></div>
              </div>
              <span className="text-xs text-gray-500 font-medium">Overdue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Recent Student Activities</h3>
          <button className="text-sm font-bold text-primary hover:text-primary-hover">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { name: 'Alex Morgan', id: '#STU-2024-001', class: 'Grade 10-A', status: 'Active', color: 'green' },
                { name: 'Sarah Connor', id: '#STU-2024-002', class: 'Grade 11-B', status: 'Pending', color: 'orange' },
                { name: 'James Smith', id: '#STU-2024-003', class: 'Grade 9-C', status: 'Absent', color: 'red' },
              ].map((student, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 overflow-hidden">
                        <span className="material-symbols-outlined text-gray-400 text-lg">person</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{student.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.class}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${student.color === 'green' ? 'bg-green-50 text-green-600 border-green-100' :
                        student.color === 'orange' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                          'bg-red-50 text-red-600 border-red-100'
                      }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-gray-400 hover:text-gray-600">
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
