import React from "react"
import { createContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const currentUser = data.session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        }
      } catch (err) {
        console.error("Init auth error:", err)
      } finally {
        setLoading(false) // 🔥 BẮT BUỘC
      }
    }

    initAuth()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
          const currentUser = session?.user ?? null
          setUser(currentUser)

          if (currentUser) {
            await fetchProfile(currentUser.id)
          } else {
            setProfile(null)
          }
        } catch (err) {
          console.error("Auth change error:", err)
        } finally {
          setLoading(false) // 🔥 BẮT BUỘC
        }
      })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error("Fetch profile error:", err)
      setProfile(null) // 🔥 không để state bẩn
    }
  }

  const signUp = (email, password, userData) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    })

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)

      if (error) throw error
      await fetchProfile(user.id)
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile
      }}
    >
      {children} {/* ❌ KHÔNG CHẶN RENDER */}
    </AuthContext.Provider>
  )
}
