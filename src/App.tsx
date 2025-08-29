import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import RulesManagement from './components/RulesManagement'
import CreateRule from './components/CreateRule'
import ActionsManagement from './components/ActionsManagement'
import CreateAction from './components/CreateAction'
import Analytics from './components/Analytics'
import Activities from './components/Activities'
import Help from './components/Help'
import apiService from './services/api'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Validate existing token on app load
    const validateToken = async () => {
      const token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')
      
      if (token && userData) {
        try {
          // Validate token with backend
          const response = await apiService.validateToken()
          if (response.success) {
            // Get current user data to ensure it's up to date
            const userResponse = await apiService.getCurrentUser()
            if (userResponse.success && userResponse.data) {
              setIsAuthenticated(true)
              setUser(userResponse.data)
              localStorage.setItem('userData', JSON.stringify(userResponse.data))
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

  const handleLogin = (userData: any, token: string) => {
    setIsAuthenticated(true)
    setUser(userData)
    localStorage.setItem('authToken', token)
    localStorage.setItem('userData', JSON.stringify(userData))
  }

  const handleLogout = async () => {
    try {
      // Call logout endpoint to invalidate token on backend
      await apiService.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Always clear local state regardless of API call result
      setIsAuthenticated(false)
      setUser(null)
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
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
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      <main className="pt-16">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rules" element={<RulesManagement />} />
          <Route path="/rules/create" element={<CreateRule />} />
          <Route path="/actions" element={<ActionsManagement />} />
          <Route path="/actions/create" element={<CreateAction />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/help" element={<Help />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
