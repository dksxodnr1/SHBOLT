'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  isLoggedIn: boolean
  login: (id: string) => void
  logout: () => void
  userId: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const storedUserId = localStorage.getItem('userId')
    setIsLoggedIn(loggedIn)
    setUserId(storedUserId)
  }, [])

  const login = (id: string) => {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userId', id)
    setIsLoggedIn(true)
    setUserId(id)
  }

  const logout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userId')
    setIsLoggedIn(false)
    setUserId(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, userId }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

