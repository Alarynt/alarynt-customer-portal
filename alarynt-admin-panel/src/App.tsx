import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AdminLogin from './components/AdminLogin'
import AdminDashboard from './components/AdminDashboard'
import AdminHeader from './components/AdminHeader'
import CustomerOverview from './components/CustomerOverview'
import CustomerDetail from './components/CustomerDetail'
import SystemMetrics from './components/SystemMetrics'
import adminApiService, { AdminUser } from './services/api'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Validate existing token on app load
    const validateToken = async () => {
      const token = localStorage.getItem('adminAuthToken')
      const adminData = localStorage.getItem('adminUserData')
      
      if (token && adminData) {
        try {
          // Validate token with backend
          const response = await adminApiService.validateToken()
          if (response.success) {
            // Get current admin data to ensure it's up to date
            const adminResponse = await adminApiService.getCurrentAdmin()
            if (adminResponse.success && adminResponse.data) {
              setIsAuthenticated(true)
              setAdmin(adminResponse.data)
              localStorage.setItem('adminUserData', JSON.stringify(adminResponse.data))
            }
          } else {
            // Token invalid, clear storage
            handleLogout()
          }
        } catch (error) {
          console.error('Token validation failed:', error)
          handleLogout()
        }
      }
      setIsLoading(false)
    }

    validateToken()
  }, [])

  const handleLogin = (adminData: any, token: string) => {
    setIsAuthenticated(true)
    setAdmin(adminData)
    localStorage.setItem('adminAuthToken', token)
    localStorage.setItem('adminUserData', JSON.stringify(adminData))
  }

  const handleLogout = async () => {
    try {
      // Call logout endpoint to invalidate token on backend
      await adminApiService.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local state regardless of API call result
      setIsAuthenticated(false)
      setAdmin(null)
      localStorage.removeItem('adminAuthToken')
      localStorage.removeItem('adminUserData')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader admin={admin} onLogout={handleLogout} />
      <main className="pt-16">
        <Routes>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/customers" element={<CustomerOverview />} />
          <Route path="/customers/:customerId" element={<CustomerDetail />} />
          <Route path="/system" element={<SystemMetrics />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App