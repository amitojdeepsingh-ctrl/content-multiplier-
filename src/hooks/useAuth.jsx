// hooks/useAuth.js
// FIXED VERSION - No navigation, just auth logic
// Replace your entire hooks/useAuth.js with this file

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessToken, setAccessToken] = useState(null)

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
        setAccessToken(session?.access_token || null)

        if (session?.user) {
          // Load profile
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(data)
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setLoading(false)
      }

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user || null)
        setAccessToken(session?.access_token || null)
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(data)
        } else {
          setProfile(null)
          setAccessToken(null)
        }
      })

      return () => {
        subscription?.unsubscribe()
      }
    }

    initAuth()
  }, [])

  // Sign up function (NO navigation - let the page handle it)
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/dashboard',
      },
    })

    if (error) throw error

    // Profile is auto-created via trigger
    return data
  }

  // Sign in function (NO navigation - let the page handle it)
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    return data
  }

  // Sign out function (NO navigation - let the page handle it)
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
  }

  // Update profile function — uses Netlify function to bypass RLS
  const updateProfile = async (updates) => {
    if (!user) throw new Error('Not authenticated')

    // Get the current session token
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Not authenticated')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch('/.netlify/functions/save-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updates),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to save profile')

      setProfile(data.profile)
      return data.profile
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        throw new Error('Save timed out — check your connection and try again')
      }
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, accessToken, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
