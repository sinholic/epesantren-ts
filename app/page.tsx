'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useBranding } from '@/components/providers/BrandingProvider'

/**
 * Renders the application's login page and manages client-side authentication flow.
 *
 * On mount, checks the current authentication state and redirects authenticated users
 * to a role-specific dashboard (ADMIN → /manage/dashboard, STUDENT → /student/dashboard,
 * TEACHER → /teacher/dashboard). Presents a username/password form that submits credentials
 * to /api/auth/login, shows server-provided error messages, and redirects to a server-provided
 * `redirectPath` or `/manage/dashboard` on successful login.
 *
 * @returns The JSX element for the login page.
 */
export default function LoginPage() {
  const branding = useBranding()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    // Load rememberMe preference from localStorage
    const savedRememberMe = localStorage.getItem('rememberMe')
    if (savedRememberMe === 'true') {
      setRememberMe(true)
    }

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          const roleType = data.user?.roleType

          if (roleType === 'ADMIN') {
            router.replace('/manage/dashboard')
          } else if (roleType === 'STUDENT') {
            router.replace('/student/dashboard')
          } else if (roleType === 'TEACHER') {
            router.replace('/teacher/dashboard')
          } else {
            router.replace('/manage/dashboard')
          }
        } else {
          setCheckingAuth(false)
        }
      } catch (error) {
        setCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, rememberMe }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }

      // Redirect based on role
      if (data.redirectPath) {
        router.replace(data.redirectPath)
      } else {
        router.replace('/manage/dashboard')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen w-full flex-row overflow-hidden bg-background-light dark:bg-background-dark text-[#131118] dark:text-white transition-colors duration-200 font-sans">
      <div className="w-full lg:w-[30%] flex flex-col bg-white dark:bg-background-dark relative z-20 order-1 lg:order-1 border-r border-gray-100 dark:border-gray-800 shadow-xl lg:shadow-none">
        <div className="absolute top-0 left-0 p-6 lg:p-8 w-full">
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.schoolName}
                className="h-8 w-8 object-contain rounded-lg"
              />
            ) : (
              <div className="h-8 w-8 text-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl font-bold">package_2</span>
              </div>
            )}
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{branding.appName}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-10 xl:px-12 py-12">
          <form className="flex flex-col gap-5 w-full max-w-sm mx-auto" onSubmit={handleSubmit}>
            <div className="text-center mb-4 lg:hidden">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back!</h1>
              <p className="text-gray-500 text-sm">Sign in to continue to {branding.appName}</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#131118] dark:text-gray-200 text-sm font-semibold" htmlFor="loginName">Username</label>
              <input
                className="form-input w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-[#131118] dark:text-white h-11 px-4 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                id="loginName"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[#131118] dark:text-gray-200 text-sm font-semibold" htmlFor="password">Password</label>
              </div>
              <div className="relative group">
                <input
                  className="form-input w-full rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-[#131118] dark:text-white h-11 pl-4 pr-12 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-primary transition-colors flex items-center justify-center focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center mt-1">
              <label className="flex items-center space-x-2 cursor-pointer" htmlFor="rememberMe">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  aria-label="Remember me on this device"
                  className="form-checkbox rounded text-primary focus:ring-primary border-gray-300 h-4 w-4"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setRememberMe(checked)
                    localStorage.setItem('rememberMe', checked ? 'true' : 'false')
                  }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-semibold h-11 rounded-md mt-4 shadow-md shadow-primary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Signing in...' : 'Sign in'}</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/ppdb/auth" className="text-sm text-primary hover:text-primary-hover underline font-medium">
              Login PPDB (Peserta Didik Baru)
            </a>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[70%] relative bg-[#efe9fc] p-12 items-center justify-center order-2 lg:order-2 overflow-hidden">
        <div className="relative z-10 w-64 h-64 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
          <span className="material-symbols-outlined text-primary text-[120px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 48" }}>
            deployed_code
          </span>
        </div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, #5e19e6 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
      </div>
    </div>
  )
}