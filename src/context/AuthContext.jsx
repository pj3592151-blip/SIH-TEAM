import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentRoute, setCurrentRoute] = useState(() => {
    return window.location.pathname || '/'
  })

  // Hydrate session from storage on initial load
  useEffect(() => {
    try {
      const stored = authService.getStoredSession()
      if (stored && stored.isAuthenticated) {
        setSession(stored)
      }
    } catch (e) {
      console.error('Session hydration error:', e)
    } finally {
      setLoading(false)
    }

    // Synchronize browser history / popstate
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Navigation helper
  const navigate = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
    }
    setCurrentRoute(path)
  }

  /**
   * Complete 2FA login.
   * Phase 2: selectedPosition passed through to authService for verification logging.
   * The selectedPosition is NEVER used for authorization — only the DB rank is authoritative.
   */
  const login = async (userId, password, faceVerification, selectedPosition) => {
    const newSession = await authService.completeLogin({
      userId,
      password,
      faceVerification,
      selectedPosition, // Passed for context/logging, NOT for authorization
    })
    setSession(newSession)
    navigate('/')
    return newSession
  }

  // Logout
  const logout = () => {
    authService.clearSession()
    setSession(null)
    navigate('/login')
  }

  const value = {
    session,
    user: session?.user || null,
    isAuthenticated: !!session?.isAuthenticated,
    // Phase 2: expose permissions and access level from authenticated DB record
    permissions: session?.permissions || [],
    accessLevel: session?.accessLevel || 0,
    rank: session?.rank || null,
    selectedPosition: session?.selectedPosition || null,
    positionVerification: session?.positionVerification || null,
    loading,
    currentRoute,
    navigate,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
