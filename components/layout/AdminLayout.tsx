'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useBranding } from '@/components/providers/BrandingProvider'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const branding = useBranding()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
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
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/manage/dashboard', icon: 'dashboard' },
    { name: 'Students', href: '/manage/students', icon: 'school' },
    { name: 'Staff', href: '/manage/staff', icon: 'group' },
    { name: 'Finances', href: '/manage/finances', icon: 'payments' },
    { name: 'Schedule', href: '/manage/schedule', icon: 'calendar_month' },
    { name: 'Reports', href: '/manage/reports', icon: 'bar_chart' },
    { name: 'Settings', href: '/manage/settings', icon: 'settings' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans flex text-[#131118]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex-shrink-0 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-gray-50">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.schoolName}
              className="h-8 w-8 object-contain rounded-lg mr-3"
            />
          ) : (
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center mr-3">
              <span className="material-symbols-outlined text-white text-xl">school</span>
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900 font-display leading-none">{branding.appName}</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide mt-0.5">{branding.schoolName}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-200 group ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <span className={`material-symbols-outlined mr-3 text-[22px] ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center px-2 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold mr-3">
              {user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName || 'Admin User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@school.edu'}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 bg-white border-b border-gray-100 sticky top-0 z-40 bg-opacity-90 backdrop-blur-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-display">Overview</h2>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
              </span>
              <input
                type="text"
                placeholder="Search students, staff, or records..."
                className="block w-80 pl-10 pr-3 py-2.5 border-none rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button className="h-10 w-10 relative flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors">
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
              </button>
              <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors">
                <span className="material-symbols-outlined text-[22px]">help</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
