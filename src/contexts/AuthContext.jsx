import { createContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import React from "react"
export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await fetchProfile(currentUser.id)
      }

      setLoading(false)
    }

    initAuth()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange(async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
      })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (!error) setProfile(data)
    else console.error("Fetch profile error:", error)
  }

  const signUp = async (email, password, userData) => {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    })
  }

  const signIn = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates) => {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)

    if (!error) await fetchProfile(user.id)
    return { error }
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
      {!loading && children}
    </AuthContext.Provider>
  )
}
